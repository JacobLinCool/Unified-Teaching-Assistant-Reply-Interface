import type {
	EmailExportedHandler,
	ExecutionContext,
	ExportedHandlerFetchHandler,
	ForwardableEmailMessage,
} from "@cloudflare/workers-types";
import debug from "debug";
import { Kysely } from "kysely";
import { Case, Database, up } from "./db";
import type { Hook, Middleware, Module, UTARIConfig, UTARIEnv } from "./types";
import { extract_case_id } from "./utils";

export class UTARI {
	protected log = debug("utari:core");
	public modules: Module[] = [];
	public db: Kysely<Database>;
	public config: UTARIConfig;
	private system_email = "";
	private message_id = "";
	private subject = "";
	private sender = "";
	private case_id?: string;
	private ctx?: ExecutionContext;

	constructor(config: UTARIConfig) {
		this.db = config.db;
		this.config = config;
		this.log.log = console.log.bind(console);
		this.log.enabled = true;
	}

	private async _handle(message: ForwardableEmailMessage, env: UTARIEnv, ctx: ExecutionContext) {
		this.system_email = env.SYSTEM_EMAIL;
		this.ctx = ctx;
		if (!this.system_email) {
			throw new Error("SYSTEM_EMAIL is not set");
		}

		this.log("message", message);

		await this.init_modules();

		try {
			await this.run_middlewares("pre-test", message);
			this.run_hooks("on-pre-test-passed", message);
		} catch (err) {
			if (err instanceof Error) {
				this.run_hooks("on-pre-test-failed", message, err);
			}
			return;
		}

		const parsed = await this.run_middleware("parse-email", message);
		this.log("parsed", parsed);
		this.message_id = parsed.messageId;
		this.subject = parsed.subject || "";
		this.sender = parsed.from.address;

		let case_id = extract_case_id(parsed.to[0].address);
		this.case_id = case_id;
		if (!case_id) {
			try {
				case_id = await this.run_middleware("gen-case-id", parsed);
				this.case_id = case_id;
				if (!case_id) {
					throw new Error("No Case ID Generated");
				}

				this.run_hooks("on-new-case", parsed, case_id);
			} catch (err) {
				if (err instanceof Error) {
					await this.run_hooks("on-case-id-gen-failed", parsed, err);
				}
				return;
			}

			let case_record: Case = {
				id: case_id,
				customer_email: parsed.from.address,
				status: null,
				assignee_id: null,
			};
			await this.db.insertInto("case").values(case_record).execute();
			await this.db
				.insertInto("email")
				.values({
					id: parsed.messageId,
					case_id,
					from: parsed.from.address,
					to: parsed.to[0].address,
					subject: parsed.subject || "",
					body: parsed.text || "",
					date: new Date().toISOString(),
				})
				.execute();

			this.run_hooks("on-case-recorded", parsed, case_record);

			const assignee_id = await this.run_middleware("auto-assign", parsed);
			if (assignee_id) {
				await this.db
					.updateTable("case")
					.set({ assignee_id })
					.where("id", "=", case_id)
					.execute();
				case_record.assignee_id = assignee_id;

				this.run_hooks("on-auto-assigned", parsed, case_record);
				this.run_hooks("on-case-assigned", parsed, case_record);
			} else {
				this.run_hooks("on-wild-case", parsed, case_record);
			}
		} else {
			let case_record = await this.db
				.selectFrom("case")
				.where("id", "=", case_id)
				.leftJoin("support", "case.assignee_id", "support.id")
				.select([
					"case.id",
					"case.customer_email",
					"case.status",
					"case.assignee_id",
					"support.address",
				])
				.executeTakeFirst();
			if (!case_record) {
				throw new Error("Case record not found");
			}

			this.run_hooks("on-existing-case", parsed, case_record);

			await this.db
				.insertInto("email")
				.values({
					id: parsed.messageId,
					case_id,
					from: parsed.from.address,
					to: parsed.to[0].address,
					subject: parsed.subject || "",
					body: parsed.text || "",
					date: new Date().toISOString(),
				})
				.execute();

			const support = await this.db
				.selectFrom("support")
				.where("address", "=", parsed.from.address)
				.select(["id"])
				.executeTakeFirst();

			if (!support) {
				this.run_hooks("on-customer-reply", parsed, case_record);
				return;
			}

			const is_command = parsed.text?.startsWith("order:");
			if (is_command) {
				const command = parsed.text?.slice(6).trim() || "";
				this.run_hooks("on-command", parsed, case_record, command);
				return;
			}

			if (case_record?.address) {
				if (case_record.address !== parsed.from.address) {
					this.run_hooks("on-wrong-assignee", parsed, case_record);
					return;
				}

				this.run_hooks("on-support-reply", parsed, case_record);
				return;
			}

			await this.db
				.updateTable("case")
				.set({ assignee_id: support.id })
				.where("id", "=", case_id)
				.execute();
			case_record.assignee_id = support.id;

			this.run_hooks("on-case-assigned", parsed, case_record);
			this.run_hooks("on-reply-assigned", parsed, case_record);
			this.run_hooks("on-support-reply", parsed, case_record);
		}
	}

	public handle(): EmailExportedHandler<UTARIEnv> {
		return this._handle.bind(this);
	}

	public web(): ExportedHandlerFetchHandler<UTARIEnv> {
		const handler: ExportedHandlerFetchHandler<UTARIEnv> = async (req, env, ctx) => {
			const { pathname } = new URL(req.url);
			if (pathname === "/") {
				return Response.redirect(
					"https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface",
					302,
				);
			} else if (pathname === "/setup") {
				try {
					await this.migrate();
					return new Response("Setup complete");
				} catch {
					return new Response("Setup failed", { status: 500 });
				}
			} else {
				return new Response("Not found", { status: 404 });
			}
		};

		return handler;
	}

	/**
	 * Migrate the database to the latest version.
	 * This should only be called once.
	 */
	public async migrate(): Promise<void> {
		// Kyseley migrator triggers not authorized error

		try {
			await up(this.db);
			this.log("migration complete");
		} catch (err) {
			this.log("migration failed", err);
			throw err;
		}
	}

	/**
	 * Register modules.
	 */
	public use(...modules: Module[]): this {
		this.modules.push(...modules);
		return this;
	}

	private async init_modules() {
		this.log("init");

		const reply = (body: string, format: "plain" | "html" = "plain") =>
			this._send.bind(this)([this.sender], body, format, true, this.case_id);
		const send = (to: string[], body: string, format: "plain" | "html" = "plain") =>
			this._send.bind(this)(to, body, format, false, this.case_id);

		const tasks = this.modules.map((module) => module.init?.({ utari: this, reply, send }));
		await Promise.all(tasks);
		this.log("init complete");
	}

	private async _send(
		to: string[],
		body: string,
		format: "plain" | "html",
		reply: boolean,
		case_id?: string,
	) {
		this.log("reply", to, body, case_id);

		const [system_name, system_domain] = this.system_email.split("@");

		const req = new Request("https://api.mailchannels.net/tx/v1/send", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				personalizations: to.map((it) => ({ to: [{ email: it }] })),
				from: {
					email: case_id
						? `${system_name}+${case_id}@${system_domain}`
						: this.system_email,
					name: "UTARI",
				},
				headers: {
					"In-Reply-To": reply ? this.message_id : undefined,
				},
				subject:
					reply && this.subject.startsWith("Re:") ? this.subject : `Re: ${this.subject}`,
				content: [
					{
						type: `text/${format}`,
						value: body,
					},
				],
			}),
		});

		const res = await fetch(req);
		if (!res.ok) {
			throw new Error(`Failed to send email: ${res.status} ${await res.text()}`);
		}

		this.log("reply sent");
	}

	/**
	 * Hooks will be run in parallel.
	 */
	private async run_hooks<H extends keyof Hook>(hook: H, ...args: Parameters<Hook[H]>) {
		const tasks = this.modules.map(
			(module) =>
				module[hook]
					// @ts-expect-error We don't know the actual type of the arguments
					?.bind(module)(...args)
					.catch((err: Error) => {
						this.log(`Error in "${hook}" hook of "${module.name}"`, err);
					}),
		);

		const p = Promise.all(tasks);
		this.ctx?.waitUntil(p);
		await p;
	}

	/**
	 * Run the first middleware that matches.
	 */
	private async run_middleware<M extends keyof Middleware>(
		middleware: M,
		...args: Parameters<Middleware[M]>
	): Promise<ReturnType<Middleware[M]>> {
		const m = this.modules.find((it) => it[middleware] !== undefined);
		if (m === undefined) {
			throw new Error(`No middleware for "${middleware}"`);
		}

		// @ts-expect-error We don't know the actual type of the arguments
		return await m[middleware]?.bind(m)(...args);
	}

	/**
	 * Run all middlewares that match in series.
	 */
	private async run_middlewares<M extends keyof Middleware>(
		middleware: M,
		...args: Parameters<Middleware[M]>
	): Promise<ReturnType<Middleware[M]>[]> {
		const results: ReturnType<Middleware[M]>[] = [];
		for (const m of this.modules) {
			if (m[middleware] === undefined) {
				continue;
			}

			// @ts-expect-error We don't know the actual type of the arguments
			results.push(await m[middleware]?.bind(m)(...args));
		}
		return results;
	}
}

import type { ExportedHandler } from "@cloudflare/workers-types";
import { SystemMessage } from "@utari/system-message";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import {
	BasePreTest,
	Database,
	NoAutoAssign,
	NotifySupport,
	ParseEmail,
	RandomCaseID,
	ReplyToCustomer,
	UTARI,
} from "utari";

export interface Env {
	D1: D1Database;
	SYSTEM_EMAIL: string;
}

export default {
	email: async (msg, env, ctx) => {
		const dialect = new D1Dialect({ database: env.D1 });
		const db = new Kysely<Database>({ dialect });
		return new UTARI({ db })
			.use(new BasePreTest())
			.use(new RandomCaseID())
			.use(new ParseEmail())
			.use(new NotifySupport())
			.use(new ReplyToCustomer())
			.use(new NoAutoAssign())
			.use(
				new SystemMessage({
					"on-pre-test-failed": (email, error) =>
						`你傳送的郵件已被拒絕。\n\n錯誤訊息：${error.message}`,
					"on-new-case": (email, id) => `你傳送的郵件已被接受，案件編號為 ${id}`,
					"on-command": (email, id, command) => `你使用了指令 "${command}"`,
					"on-support-reply": (email, record) => `你回覆了案件 ${record.id}`,
				}),
			)
			.handle()(msg, env, ctx);
	},
	fetch: async (req, env, ctx) => {
		const dialect = new D1Dialect({ database: env.D1 });
		const db = new Kysely<Database>({ dialect });
		return new UTARI({ db }).web()(req, env, ctx);
	},
} satisfies ExportedHandler<Env>;

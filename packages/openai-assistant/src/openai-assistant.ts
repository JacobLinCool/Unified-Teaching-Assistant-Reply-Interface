import debug from "debug";
import type { OpenAI } from "openai";
import { Case, NotifySupport, ParsedEmail } from "utari";

export interface OpenAIAssistantConfig {
	api_key: string;
	model: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming["model"];
	override?: Omit<
		OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
		"messages" | "model"
	>;
	message?: (
		email: ParsedEmail,
		record: Case,
	) => OpenAI.Chat.Completions.ChatCompletionMessageParam[];
}

export class OpenAIAssistant extends NotifySupport {
	public name = "openai-assistant";
	private config: OpenAIAssistantConfig;
	private log: debug.Debugger = debug("utari:openai-assistant");

	public constructor(config: OpenAIAssistantConfig) {
		super();
		this.config = config;
		this.log.enabled = true;
	}

	"on-wild-case" = async (email: ParsedEmail, record: Case) => {
		if (!this.ctx) {
			return;
		}

		const supports = await this.ctx.utari.db
			.selectFrom("support")
			.select(["support.address"])
			.execute();

		const addresses = supports.map((support) => support.address);

		const is_html = !!email.html;

		await this.ctx.send(
			addresses,
			await this.generate(email, record),
			is_html ? "html" : "plain",
		);
	};

	"on-auto-assigned" = async (email: ParsedEmail, record: Case) => {
		if (!this.ctx) {
			return;
		}

		const assignee = await this.ctx.utari.db
			.selectFrom("support")
			.select(["support.address"])
			.where("support.id", "=", record.assignee_id)
			.executeTakeFirst();
		if (!assignee) {
			throw new Error("Assignee not found");
		}

		const is_html = !!email.html;

		await this.ctx.send(
			[assignee.address],
			await this.generate(email, record),

			is_html ? "html" : "plain",
		);
	};

	"on-customer-reply" = async (email: ParsedEmail, record: Case) => {
		if (!this.ctx) {
			return;
		}

		const assignee = await this.ctx.utari.db
			.selectFrom("support")
			.select(["support.address"])
			.where("support.id", "=", record.assignee_id)
			.executeTakeFirst();
		if (!assignee) {
			return;
		}

		const is_html = !!email.html;

		await this.ctx.send(
			[assignee.address],
			await this.generate(email, record),
			is_html ? "html" : "plain",
		);
	};

	protected async generate(email: ParsedEmail, record: Case) {
		const payload = {
			model: this.config.model,
			messages: (this.config.message ?? this.default_message)(email, record),
			max_tokens: 1000,
			...this.config.override,
		};
		this.log("Payload:", payload);

		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.config.api_key}`,
			},
			body: JSON.stringify(payload),
		});
		const json = await res.json<OpenAI.Chat.Completions.ChatCompletion>();
		this.log("Response:", json);

		const is_html = !!email.html;
		const brk = is_html ? "<br/>" : "\n";

		const draft = is_html
			? json.choices[0].message.content?.replace(/\n/g, "<br/>")
			: json.choices[0].message.content;

		return `New case ${record.id} assigned. (from ${email.from.name} <${
			email.from.address
		}>)${brk}${brk}You can directly reply this email or use special command with the "order:" prefix.${brk}${brk}---${brk}${brk}${
			is_html ? email.html : email.text
		}${brk}${brk}---${brk}The suggested draft from ${this.config.model}:${brk}${draft}`;
	}

	private default_message(
		email: ParsedEmail,
		record: Case,
	): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: `As a senior assistant, you received a new case ${record.id} from ${email.from.name} <${email.from.address}>. Please help the customer to solve the problem. If there are any insufficient information, please ask the customer for more details. Be respectful and patient to the customer.`,
			},
			{
				role: "user",
				content: email.text || "[No Content]",
			},
		];

		return messages;
	}
}

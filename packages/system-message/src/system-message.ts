import { Case, Hook, Module, ModuleInitialContext, ParsedEmail } from "utari";

export type SystemMessageConfig = {
	[K in keyof Hook]?: (...args: Parameters<Hook[K]>) => string | null;
};

export class SystemMessage implements Module {
	public name = "system-message";
	private ctx?: ModuleInitialContext;
	private config: SystemMessageConfig;

	public constructor(config: SystemMessageConfig = {}) {
		this.config = config;
	}

	public async init(ctx: ModuleInitialContext): Promise<void> {
		this.ctx = ctx;
	}

	public async "on-recieved"(email: ForwardableEmailMessage, buffer: ArrayBuffer): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-recieved"]?.(email, buffer);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-pre-test-failed"(email: ForwardableEmailMessage, error: Error): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-pre-test-failed"]?.(email, error);
		if (message === null) {
			return;
		}
		await this.ctx.reply(message ?? `Your email was rejected: ${error.message}`);
	}

	public async "on-pre-test-passed"(email: ForwardableEmailMessage): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-pre-test-passed"]?.(email);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-existing-case"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-existing-case"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-new-case"(email: ParsedEmail, case_id: string): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-new-case"]?.(email, case_id);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-case-id-gen-failed"(email: ParsedEmail, error: Error): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-case-id-gen-failed"]?.(email, error);
		if (message === null) {
			return;
		}
		await this.ctx.reply(message ?? `Your email was rejected: ${error.message}`);
	}

	public async "on-case-recorded"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-case-recorded"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-auto-assigned"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-auto-assigned"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-reply-assigned"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-reply-assigned"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-case-assigned"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-case-assigned"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-wild-case"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-wild-case"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-customer-reply"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-customer-reply"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-support-reply"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-support-reply"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-command"(email: ParsedEmail, record: Case, command: string): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-command"]?.(email, record, command);
		if (message) {
			await this.ctx.reply(message);
		}
	}

	public async "on-wrong-assignee"(email: ParsedEmail, record: Case): Promise<void> {
		if (!this.ctx) {
			return;
		}

		const message = this.config["on-wrong-assignee"]?.(email, record);
		if (message) {
			await this.ctx.reply(message);
		}
	}
}

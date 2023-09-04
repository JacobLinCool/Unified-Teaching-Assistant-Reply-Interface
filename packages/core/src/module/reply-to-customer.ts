import type { Email } from "postal-mime";
import type { Case } from "../db";
import type { Module, ModuleInitialContext } from "../types";

export class ReplyToCustomer implements Module {
	name = "reply-to-customer";
	ctx?: ModuleInitialContext;

	public async init(ctx: ModuleInitialContext): Promise<void> {
		this.ctx = ctx;
	}

	"on-support-reply" = async (email: Email, record: Case) => {
		if (!this.ctx) {
			return;
		}
		await this.ctx.send(
			[record.customer_email],
			(email.html ? email.html : email.text) || "",
			email.html ? "html" : "plain",
		);
	};
}

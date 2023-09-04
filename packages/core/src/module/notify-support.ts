import type { Email } from "postal-mime";
import type { Case } from "../db";
import type { Module, ModuleInitialContext } from "../types";

export class NotifySupport implements Module {
	name = "notify-support";
	ctx?: ModuleInitialContext;

	public async init(ctx: ModuleInitialContext): Promise<void> {
		this.ctx = ctx;
	}

	"on-wild-case" = async (email: Email, record: Case) => {
		if (!this.ctx) {
			return;
		}

		const supports = await this.ctx.utari.db
			.selectFrom("support")
			.select(["support.address"])
			.execute();

		const addresses = supports.map((support) => support.address);

		const is_html = !!email.html;
		const brk = is_html ? "<br/>" : "\n";

		await this.ctx.send(
			addresses,
			`New case ${record.id} from ${email.from.name} <${
				email.from.address
			}> arrived. You can directly reply this email or use special command with the "order:" prefix.${brk}${brk}---${brk}${brk}${
				is_html ? email.html : email.text
			}`,
			is_html ? "html" : "plain",
		);
	};

	"on-auto-assigned" = async (email: Email, record: Case) => {
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
		const brk = is_html ? "<br/>" : "\n";

		await this.ctx.send(
			[assignee.address],
			`New case ${record.id} assigned. (from ${email.from.name} <${
				email.from.address
			}>)${brk}${brk}You can directly reply this email or use special command with the "order:" prefix.${brk}${brk}---${brk}${brk}${
				is_html ? email.html : email.text
			}`,
			is_html ? "html" : "plain",
		);
	};

	"on-customer-reply" = async (email: Email, record: Case) => {
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
		const brk = is_html ? "<br/>" : "\n";

		await this.ctx.send(
			[assignee.address],
			`Case ${record.id} has been updated. (from ${email.from.name} <${
				email.from.address
			}>)${brk}${brk}You can directly reply this email or use special command with the "order:" prefix.${brk}${brk}---${brk}${brk}${
				is_html ? email.html : email.text
			}`,
			is_html ? "html" : "plain",
		);
	};
}

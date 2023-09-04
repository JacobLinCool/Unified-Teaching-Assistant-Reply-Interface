import type { Email } from "postal-mime";
import type { Module, ModuleInitialContext } from "../types";

export class RandomAssign implements Module {
	name = "random-assign";
	ctx?: ModuleInitialContext;

	public async init(ctx: ModuleInitialContext): Promise<void> {
		this.ctx = ctx;
	}

	"auto-assign" = async (email: Email) => {
		if (!this.ctx) {
			throw new Error("Context not initialized");
		}

		const supports = await this.ctx.utari.db
			.selectFrom("support")
			.select(["support.id"])
			.execute();

		const random_support = supports[Math.floor(Math.random() * supports.length)];
		return random_support.id;
	};
}

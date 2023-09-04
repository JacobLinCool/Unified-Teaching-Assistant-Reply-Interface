import type { Module, ModuleInitialContext } from "../types";

export interface BasePreTestConfig {
	MAX_EMAIL_SIZE: number;
	EMAIL_ALLOWLIST?: (RegExp | string)[];
}

export class BasePreTest implements Module {
	name = "base-pre-test";
	ctx?: ModuleInitialContext;

	public async init(ctx: ModuleInitialContext): Promise<void> {
		this.ctx = ctx;
	}

	constructor(
		public config: BasePreTestConfig = {
			MAX_EMAIL_SIZE: 1_000_000,
		},
	) {}

	"pre-test" = async (message: ForwardableEmailMessage) => {
		if (!this.ctx) {
			throw new Error("Context not initialized");
		}

		if (message.rawSize > this.config.MAX_EMAIL_SIZE) {
			throw new Error(
				`Email size exceeded maximum size of ${this.config.MAX_EMAIL_SIZE / 1000} KB`,
			);
		}

		if (this.config.EMAIL_ALLOWLIST) {
			const string_matches = this.config.EMAIL_ALLOWLIST.filter(
				(item) => typeof item === "string",
			) as string[];
			const regex_matches = this.config.EMAIL_ALLOWLIST.filter(
				(item) => item instanceof RegExp,
			) as RegExp[];

			const matched =
				string_matches.includes(message.from) ||
				regex_matches.some((regex) => regex.test(message.from));
			if (!matched) {
				throw new Error("Email is sent from an unauthorized address");
			}
		}
	};
}

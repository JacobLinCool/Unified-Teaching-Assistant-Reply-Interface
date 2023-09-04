import type { Module } from "../types";

export interface BasePreTestConfig {
	MAX_EMAIL_SIZE: number;
}

export class BasePreTest implements Module {
	name = "base-pre-test";

	constructor(
		public config: BasePreTestConfig = {
			MAX_EMAIL_SIZE: 1_000_000,
		},
	) {}

	"pre-test" = async (message: ForwardableEmailMessage) => {
		if (message.rawSize > this.config.MAX_EMAIL_SIZE) {
			throw new Error(
				`Email size exceeded maximum size of ${this.config.MAX_EMAIL_SIZE / 1000} KB`,
			);
		}
	};
}

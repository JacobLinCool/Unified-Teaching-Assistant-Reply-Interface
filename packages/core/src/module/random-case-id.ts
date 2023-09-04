import type { Module } from "../types";

export class RandomCaseID implements Module {
	name = "random-case-id";

	"gen-case-id" = async () => {
		// return random case id in UUID v4 format
		return crypto.randomUUID();
	};
}

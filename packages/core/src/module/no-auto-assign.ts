import type { Email } from "postal-mime";
import type { Module } from "../types";

export class NoAutoAssign implements Module {
	name = "no-auto-assign";

	"auto-assign" = async (email: Email) => {
		return null;
	};
}

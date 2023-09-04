import type { Kysely } from "kysely";
import { Email } from "postal-mime";
import type { Case, Database } from "./db";
import type { UTARI } from "./utari";

export interface Middleware {
	"pre-test": (message: ForwardableEmailMessage) => Promise<void>;
	"parse-email": (message: ForwardableEmailMessage) => Promise<Email>;
	"gen-case-id": (email: Email) => Promise<string>;
	"auto-assign": (email: Email) => Promise<string | null>;
}

export interface Hook {
	"on-pre-test-failed": (message: ForwardableEmailMessage, error: Error) => Promise<void>;
	"on-pre-test-passed": (message: ForwardableEmailMessage) => Promise<void>;
	"on-existing-case": (email: Email, record: Case) => Promise<void>;
	"on-new-case": (email: Email, case_id: string) => Promise<void>;
	"on-case-id-gen-failed": (email: Email, error: Error) => Promise<void>;
	"on-case-recorded": (email: Email, record: Case) => Promise<void>;
	"on-auto-assigned": (email: Email, record: Case) => Promise<void>;
	"on-reply-assigned": (email: Email, record: Case) => Promise<void>;
	"on-case-assigned": (email: Email, record: Case) => Promise<void>;
	"on-wild-case": (email: Email, record: Case) => Promise<void>;
	"on-customer-reply": (email: Email, record: Case) => Promise<void>;
	"on-support-reply": (email: Email, record: Case) => Promise<void>;
	"on-command": (email: Email, record: Case, command: string) => Promise<void>;
	"on-wrong-assignee": (email: Email, record: Case) => Promise<void>;
}

export type Module = {
	name: string;
	init?: (ctx: ModuleInitialContext) => Promise<void>;
} & Partial<Middleware> &
	Partial<Hook>;

export interface UTARIConfig {
	db: Kysely<Database>;
	name?: string;
}

export interface UTARIEnv {
	SYSTEM_EMAIL: string;
}

/**
 * Reply to the sender of the email.
 * @throws If error occurs while sending the email.
 */
export type ReplyFn = (body: string, format?: "plain" | "html") => Promise<void>;

/**
 * Send an email to the specified addresses.
 * @throws If error occurs while sending the email.
 */
export type SendFn = (to: string[], body: string, format?: "plain" | "html") => Promise<void>;

export interface ModuleInitialContext {
	utari: UTARI;
	send: SendFn;
	reply: ReplyFn;
}

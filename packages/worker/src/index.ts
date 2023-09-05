import type { ExportedHandler } from "@cloudflare/workers-types";
import { OpenAIAssistant } from "@utari/openai-assistant";
import { SystemMessage } from "@utari/system-message";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { BasePreTest, Database, NoAutoAssign, RandomCaseID, ReplyToCustomer, UTARI } from "utari";
import { EMAIL_ALLOWLIST } from "./regex";
import { SubjectPreTest } from "./title";

export interface Env {
	D1: D1Database;
	SYSTEM_EMAIL: string;
	OPENAI_API_KEY: string;
}

export default {
	email: async (msg, env, ctx) => {
		const dialect = new D1Dialect({ database: env.D1 });
		const db = new Kysely<Database>({ dialect });
		return new UTARI({
			db,
			name: "師範大學程式設計助教系統 UTARI",
		})
			.use(SubjectPreTest)
			.use(
				new BasePreTest({
					MAX_EMAIL_SIZE: 1_000_000,
					EMAIL_ALLOWLIST,
				}),
			)
			.use(new RandomCaseID())
			.use(
				new OpenAIAssistant({
					api_key: env.OPENAI_API_KEY,
					model: "gpt-3.5-turbo",
					message: (email, record) =>
						email.text
							? [
									{
										role: "system",
										content: [
											`你是一位國立臺灣師範大學的程式設計助教，你收到了一封來自同學 ${email.from.name} 的詢問，請以你的專業知識回覆他。`,
											`此課程介紹 C 程式語言之基礎語法，包含輸入/輸出、選擇控制、迴圈控制、陣列、函式、指標、字元、字串與結構型態等與一些基礎 Linux 知識。`,
											`目前才剛開始授課`,
											`如果同學提供的資訊不足讓你判斷出解決方案，請向他詢問更多資訊。`,
											`請依照學生程度給予適當的回覆，不要給予過於複雜的解答，並且盡可能地讓學生自己解決問題。`,
											`請用認可、激勵的語氣鼓勵學生！`,
										].join("\n"),
									},
									{
										role: "user",
										content: email.text,
									},
							  ]
							: [],
				}),
			)
			.use(new ReplyToCustomer())
			.use(new NoAutoAssign())
			.use(
				new SystemMessage({
					"on-pre-test-failed": (email, error) =>
						`你傳送的郵件已被拒絕。\n\n錯誤訊息：${error.message}`,
					"on-new-case": (email, id) => `你傳送的郵件已被接受，案件編號為 ${id}`,
					"on-command": (email, id, command) => `你使用了指令 "${command}"`,
					"on-support-reply": (email, record) => `你回覆了案件 ${record.id}`,
					"on-wrong-assignee": (email, record) => `此案件已指派給 #${record.assignee_id}`,
				}),
			)
			.handle()(msg, env, ctx);
	},
	fetch: async (req, env, ctx) => {
		const dialect = new D1Dialect({ database: env.D1 });
		const db = new Kysely<Database>({ dialect });
		return new UTARI({ db }).web()(req, env, ctx);
	},
} satisfies ExportedHandler<Env>;

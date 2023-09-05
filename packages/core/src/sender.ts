import debug from "debug";
import { SenderParam } from "./types";

const log = debug("utari:sender");
log.enabled = true;

/**
 * Use MailChannels to send emails. Only works inside Cloudflare Workers.
 */
export async function mailchannels_sender(param: SenderParam): Promise<void> {
	log("send", param);

	const payload = {
		personalizations: param.to.map((it) => ({ to: [{ email: it }] })),
		from: {
			email: param.sys.email,
			name: param.sys.name,
		},
		headers: {
			"In-Reply-To": param.reply,
		},
		subject: param.subject,
		content: [
			{
				type: `text/${param.format}`,
				value: param.body,
			},
		],
	};

	let retry = 0;
	while (retry < 2) {
		retry++;
		const req = new Request("https://api.mailchannels.net/tx/v1/send", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const res = await fetch(req);
		if (!res.ok) {
			throw new Error(`Failed to send email: ${res.status} ${await res.text()}`);
		}

		log("send complete");
		break;
	}
}

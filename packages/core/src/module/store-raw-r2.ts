import debug from "debug";
import type { Module } from "../types";

export interface StoreRawR2Config {
	R2: R2Bucket;
	/**
	 * The prefix to use for the R2 path, with trailing slash, without leading slash.
	 * e.g. `raw-email/`
	 */
	PREFIX?: string;
}

export class StoreRawR2 implements Module {
	name = "store-raw-r2";
	log = debug("utari:store-raw-r2");
	config: StoreRawR2Config;

	constructor(config: StoreRawR2Config) {
		this.config = config;
		this.log.enabled = true;
	}

	"on-recieved" = async (message: ForwardableEmailMessage, buffer: ArrayBuffer) => {
		const { R2 } = this.config;

		const id =
			(this.config.PREFIX ?? "raw-email/") +
			(message.headers.get("message-id") || `no-id-${message.from}-${Date.now()}`);
		this.log(`Storing raw message in R2 with id ${id}`);

		const res = await R2.put(id, buffer, {
			httpMetadata: message.headers,
			customMetadata: {
				from: message.from,
				to: message.to,
				subject: message.headers.get("subject") || "",
			},
		});
		if (!res) {
			throw new Error(`Failed to store raw message in R2`);
		}

		this.log(`Stored raw message in R2 with id ${id}`);
	};
}

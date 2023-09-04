import type { Email } from "postal-mime";
import PostalMime from "postal-mime";

export async function default_parser(message: ForwardableEmailMessage): Promise<Email> {
	const buffer = await stream2buffer(message.raw, message.rawSize);

	// @ts-expect-error Bad types
	const parser: PostalMime = new PostalMime.default();
	const parsed = await parser.parse(buffer);

	return parsed;
}

async function stream2buffer(stream: ReadableStream, size: number): Promise<Uint8Array> {
	const result = new Uint8Array(size);
	const reader = stream.getReader();

	let bytes_read = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		result.set(value, bytes_read);
		bytes_read += value.length;
	}

	return result;
}

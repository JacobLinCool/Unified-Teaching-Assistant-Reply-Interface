export function extract_case_id(address: string): string | undefined {
	const match = address.match(/^(.*)\+([a-zA-Z0-9-_]+)@/);
	if (match) {
		return match[2];
	}

	return undefined;
}

export async function stream2buffer(stream: ReadableStream, size: number): Promise<Uint8Array> {
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

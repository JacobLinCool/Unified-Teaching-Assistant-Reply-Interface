export function extract_case_id(address: string): string | undefined {
	const match = address.match(/^(.*)\+([a-zA-Z0-9]+)@/);
	if (match) {
		return match[2];
	}

	return undefined;
}

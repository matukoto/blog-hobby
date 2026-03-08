const SEPARATOR_PATTERN = /[^a-z0-9]+/g;
const DASH_PATTERN = /-+/g;

export function normalizeSlug(input: string): string | null {
	if (input.length === 0) {
		return null;
	}

	const normalized = input
		.toLowerCase()
		.replace(SEPARATOR_PATTERN, '-')
		.replace(DASH_PATTERN, '-')
		.replace(/^-+|-+$/g, '');

	return normalized.length === 0 ? null : normalized;
}

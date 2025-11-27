export const buildJsonLdScript = (schema: unknown): string => {
	return '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>';
};

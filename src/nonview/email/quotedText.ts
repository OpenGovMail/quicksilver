// Strips the quoted-original trail that replyContext.ts appends to a sent
// reply (attribution line + "> " quoted lines, or a forward header), so the
// chat bubble shows only the text the user actually typed.
export function stripQuotedText(text: string): string {
	if (!text) return text;
	const lines = text.split("\n");
	const isBoundary = (l: string) =>
		/^\s*On .+ wrote:\s*$/.test(l) || // reply attribution
		/^\s*-{2,}\s*Forwarded message\s*-{2,}/i.test(l) || // forward header
		/^\s*>/.test(l); // quoted line
	const cut = lines.findIndex(isBoundary);
	if (cut === -1) return text;
	const body = lines.slice(0, cut).join("\n").replace(/\s+$/, "");
	return body.length ? body : text; // never blank a quote-only message
}

// Distinguishes genuinely rich email HTML (newsletters, receipts, templates)
// from trivial HTML that's really just plain text wrapped in tags — e.g. the
// output of plainTextToHtml for a quick reply. Rich HTML gets the full-width
// document render; everything else stays a tight chat bubble.
const RICH = /<(img|table|button|hr|h[1-6])\b/i;
const CHROME = /max-width:\s*600px|linear-gradient\(/i;
export const isRichHtml = (html?: string): boolean =>
  !!html && (RICH.test(html) || CHROME.test(html));

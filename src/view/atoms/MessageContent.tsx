import { Box, Typography } from "@mui/material";
import DOMPurify from "dompurify";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface MessageContentProps {
	content: string;
	contentHtml?: string;
}

// Tags/attributes allowed in rendered email HTML. Anything not on this list
// (script, iframe, object, form, on* handlers, etc.) is stripped by DOMPurify.
// Typed via Parameters<> so we don't depend on DOMPurify's namespace exports,
// which moved between v2 and v3.
const PURIFY_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
	USE_PROFILES: { html: true },
	ALLOWED_ATTR: [
		"href",
		"src",
		"alt",
		"title",
		"name",
		"id",
		"class",
		"style",
		"width",
		"height",
		"border",
		"cellpadding",
		"cellspacing",
		"align",
		"valign",
		"bgcolor",
		"color",
		"colspan",
		"rowspan",
		"target",
		"rel",
	],
	FORBID_TAGS: [
		"script",
		"iframe",
		"object",
		"embed",
		"form",
		"input",
		"button",
		"meta",
		"base",
	],
	FORBID_ATTR: ["srcset", "ping", "formaction"],
	ALLOW_DATA_ATTR: false,
	// Block javascript:/vbscript:/data: URLs in href/src.
	ALLOWED_URI_REGEXP:
		/^(?:(?:https?|mailto|tel|cid):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

// HTML wrapper for the iframe srcdoc. Inline CSS keeps email layouts
// contained — width:100% prevents horizontal scroll, word-wrap handles
// long links, and a content-readable font fallback covers providers that
// drop their own.
const IFRAME_HTML_HEAD = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<base target="_blank">
<style>
  html, body {
    margin: 0; padding: 0;
    max-width: 100%;
    overflow-x: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    background: transparent;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
  /* Emails routinely hardcode pixel widths (width attrs or inline
     style="width:600px") on tables/images/divs. !important is required to
     win over those inline styles and force everything to fit the bubble. */
  * { box-sizing: border-box; }
  img { max-width: 100% !important; height: auto !important; }
  a { color: #1a73e8; word-break: break-all; }
  table { max-width: 100% !important; width: auto !important; }
  td, th { max-width: 100%; word-wrap: break-word; overflow-wrap: anywhere; }
  pre, code { white-space: pre-wrap; word-break: break-word; }
  div, p, span { max-width: 100%; }
  blockquote {
    margin: 0 0 0 0.75em;
    padding-left: 0.75em;
    border-left: 3px solid #d0d0d0;
    color: #555;
  }
</style>
</head>
<body>`;

const IFRAME_HTML_FOOT = `</body></html>`;

const MessageContent: React.FC<MessageContentProps> = ({
	content,
	contentHtml,
}) => {
	const cleanHTML = useMemo(() => {
		if (!contentHtml) return null;
		// DOMPurify v3 types sanitize() as string | TrustedHTML; we never enable
		// RETURN_TRUSTED_TYPE so the runtime result is always a string. Cast via
		// `unknown` rather than `as string` to satisfy strict TS.
		return DOMPurify.sanitize(contentHtml, PURIFY_CONFIG) as unknown as string;
	}, [contentHtml]);

	if (cleanHTML) {
		return <IsolatedHTML html={cleanHTML} />;
	}

	return (
		<Typography
			variant="body2"
			sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
		>
			{content}
		</Typography>
	);
};

// Remembers the last measured height for each srcDoc across remounts. On a
// thread switch the messages swap and every iframe remounts with a fresh
// srcDoc; without this the height would reset to the cold-start fallback and
// flash before regrowing. Keyed by srcDoc so the same email reuses its height.
const heightCache = new Map<string, number>();

// IsolatedHTML renders sanitized email HTML inside a sandboxed iframe. The
// sandbox attribute strips JS, top-level navigation, popups, and form
// submission — defense in depth on top of DOMPurify. The iframe auto-resizes
// to its content height so it visually behaves like inline content.
const IsolatedHTML: React.FC<{ html: string }> = ({ html }) => {
	const ref = useRef<HTMLIFrameElement | null>(null);

	const srcDoc = useMemo(
		() => `${IFRAME_HTML_HEAD}${html}${IFRAME_HTML_FOOT}`,
		[html],
	);

	// Seed from the cache so a known email renders at its real height instantly;
	// 40 is a small neutral floor used only when nothing has been measured yet.
	const [height, setHeight] = useState<number>(
		() => heightCache.get(srcDoc) ?? 40,
	);
	// resize() runs in listeners/timeouts that close over the initial render, so
	// read the latest height from a ref to avoid a stale-closure comparison.
	const heightRef = useRef(height);
	heightRef.current = height;

	useEffect(() => {
		const iframe = ref.current;
		if (!iframe) return;
		const resize = () => {
			const doc = iframe.contentDocument;
			if (!doc) return;
			const h = Math.max(
				doc.documentElement.scrollHeight,
				doc.body?.scrollHeight || 0,
			);
			// Only commit meaningful changes so the ResizeObserver + poll safety-net
			// don't thrash on sub-pixel jitter; cache the result for future remounts.
			if (h > 0 && Math.abs(h - heightRef.current) > 2) {
				heightCache.set(srcDoc, h);
				setHeight(h);
			}
		};

		// If the iframe finished loading before this effect ran (common with
		// srcDoc, which is synchronous), fire once immediately. Otherwise the
		// listener below will catch the load.
		if (iframe.contentDocument?.readyState === "complete") {
			resize();
		}
		iframe.addEventListener("load", resize);

		// Email HTML often references remote images that change height after
		// first paint. ResizeObserver catches those; the polls are a safety net
		// for browsers/edge cases where the observer doesn't fire.
		let observer: ResizeObserver | undefined;
		const tryAttachObserver = () => {
			const doc = iframe.contentDocument;
			if (doc?.body && typeof ResizeObserver !== "undefined" && !observer) {
				observer = new ResizeObserver(resize);
				observer.observe(doc.body);
			}
		};
		tryAttachObserver();
		const timeouts = [100, 400, 1500, 4000].map((ms) =>
			window.setTimeout(() => {
				tryAttachObserver();
				resize();
			}, ms),
		);

		return () => {
			iframe.removeEventListener("load", resize);
			observer?.disconnect();
			timeouts.forEach((t) => window.clearTimeout(t));
		};
	}, [srcDoc]);

	return (
		<Box
			sx={{
				width: "100%",
				// Slight padding so iframe content doesn't kiss the bubble edge.
				my: 0.5,
			}}
		>
			<iframe
				ref={ref}
				title="message body"
				srcDoc={srcDoc}
				// Sandbox notes:
				//   - NO allow-scripts: this is the load-bearing JS-isolation defense.
				//     Never add it; DOMPurify is layer-1, the sandbox is layer-2.
				//   - allow-same-origin is required so the parent can read the iframe's
				//     DOM to auto-size it. Pairing same-origin WITHOUT scripts is safe:
				//     the iframe has no way to execute code or touch parent state.
				//   - allow-popups + allow-popups-to-escape-sandbox lets links open in
				//     a normal new tab (target="_blank" via our injected <base>).
				sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
				referrerPolicy="no-referrer"
				style={{
					width: "100%",
					height: `${height}px`,
					// Ease any late resize (e.g. remote images) instead of snapping.
					transition: "height 120ms ease-out",
					border: 0,
					display: "block",
					backgroundColor: "transparent",
				}}
			/>
		</Box>
	);
};

export default MessageContent;

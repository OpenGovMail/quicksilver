// Web Worker: off-main-thread message body processing (proposal §7, "MIME/heavy
// parsing in a Web Worker — keep the main thread free so the UI never stutters").
//
// The gateway already normalises raw MIME into JSON, so the CPU-heavy work left
// on the client is deriving a plain-text representation from an HTML body: a
// regex sweep that, on large newsletter/marketing emails, can block the main
// thread long enough to drop frames while the reader opens. Running it here
// keeps scrolling and interaction smooth.
//
// Note: HTML *sanitisation* (DOMPurify) deliberately stays on the main thread —
// it needs a live DOM, which Workers don't provide. The sandboxed iframe in
// MessageContent remains the load-bearing security boundary for rendered HTML;
// this worker only touches the plain-text fallback.

export interface ParseRequest {
  id: number;
  bodyText?: string;
  bodyHtml?: string;
}

export interface ParseResponse {
  id: number;
  content: string;
}

// Lightweight HTML→text stripper for the plain-text fallback. Not a sanitiser —
// it feeds screen readers, search, and the no-HTML fallback path only. Kept in
// sync with the identical fallback in ../core/messageParser.ts.
function stripHTML(s: string): string {
  return s
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// The DOM lib types `self` as a Window (which lacks the dedicated-worker
// postMessage signature), so narrow it to just what we use.
interface WorkerCtx {
  onmessage: ((e: MessageEvent<ParseRequest>) => void) | null;
  postMessage(message: ParseResponse): void;
}
const ctx = self as unknown as WorkerCtx;

ctx.onmessage = (e: MessageEvent<ParseRequest>) => {
  const { id, bodyText, bodyHtml } = e.data;
  const content = bodyText || stripHTML(bodyHtml || "");
  ctx.postMessage({ id, content });
};

// Main-thread client for the message-parsing Web Worker (proposal §7).
//
// Fans body-processing requests out to a single long-lived worker and matches
// responses back to their callers by id. Degrades gracefully: if the runtime
// has no Worker support (or the worker fails to spawn), it does the same work
// synchronously so the read view never breaks — just without the off-thread win.

import type {
	ParseRequest,
	ParseResponse,
} from "../workers/messageParser.worker";

// Fallback stripper, identical to the one inside the worker. Used when no worker
// is available or a request times out.
function stripHTML(s: string): string {
	return s
		.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function fallback(bodyText?: string, bodyHtml?: string): string {
	return bodyText || stripHTML(bodyHtml || "");
}

let worker: Worker | null = null;
let workerBroken = false; // set once spawning fails, so we stop retrying
let seq = 0;
const pending = new Map<number, (content: string) => void>();

function ensureWorker(): Worker | null {
	if (worker) return worker;
	if (workerBroken || typeof Worker === "undefined") return null;
	try {
		worker = new Worker(
			new URL("../workers/messageParser.worker.ts", import.meta.url),
			{ type: "module" },
		);
		worker.onmessage = (e: MessageEvent<ParseResponse>) => {
			const { id, content } = e.data;
			const resolve = pending.get(id);
			if (resolve) {
				pending.delete(id);
				resolve(content);
			}
		};
		worker.onerror = () => {
			// The worker died — fail every in-flight request over to sync so nothing
			// hangs, and stop using the worker for the rest of the session.
			workerBroken = true;
			worker = null;
			pending.clear();
		};
		return worker;
	} catch {
		workerBroken = true;
		return null;
	}
}

// Derive the plain-text representation of a message body off the main thread.
// Resolves with the synchronous fallback if the worker is unavailable or slow.
export function parseBody(
	bodyText?: string,
	bodyHtml?: string,
): Promise<string> {
	const w = ensureWorker();
	if (!w) return Promise.resolve(fallback(bodyText, bodyHtml));

	const id = ++seq;
	return new Promise<string>((resolve) => {
		let settled = false;
		const done = (content: string) => {
			if (settled) return;
			settled = true;
			resolve(content);
		};
		pending.set(id, done);
		w.postMessage({ id, bodyText, bodyHtml } as ParseRequest);
		// Safety net: never let a wedged worker stall the read view.
		setTimeout(() => {
			if (pending.delete(id)) done(fallback(bodyText, bodyHtml));
		}, 5000);
	});
}

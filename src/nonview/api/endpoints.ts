// Endpoint functions grouped by resource. Each takes an APIClient and returns
// a typed Promise — keeping the network surface in one place makes mocking and
// future SWR-style caching easy to add.

import type { APIClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  MailboxDelta,
  MailboxListResponse,
  Message,
  MessageListResponse,
  OutgoingMessage,
} from "./types";

const v1 = "/api/v1";

export const auth = {
  login(client: APIClient, req: LoginRequest) {
    return client.postUnauthed<LoginResponse>(`${v1}/auth/login`, req);
  },
  logout(client: APIClient) {
    return client.post<{ status: string }>(`${v1}/auth/logout`);
  },
};

export const mailboxes = {
  list(client: APIClient, signal?: AbortSignal) {
    return client.get<MailboxListResponse>(`${v1}/mailboxes`, signal);
  },
  listMessages(
    client: APIClient,
    mailbox: string,
    opts: { limit?: number; before?: number } = {},
    signal?: AbortSignal,
  ) {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.before) params.set("before", String(opts.before));
    const qs = params.toString();
    const path = `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages${
      qs ? `?${qs}` : ""
    }`;
    return client.get<MessageListResponse>(path, signal);
  },
  // Incremental sync (proposal §6): given the client's cached UIDVALIDITY and
  // the UIDs it already holds, return only what changed. `known` is sent as a
  // comma-separated UID list; the server derives the "since" watermark from it.
  changes(
    client: APIClient,
    mailbox: string,
    opts: { uidvalidity?: number; known?: number[]; limit?: number } = {},
    signal?: AbortSignal,
  ) {
    const params = new URLSearchParams();
    if (opts.uidvalidity) params.set("uidvalidity", String(opts.uidvalidity));
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.known?.length) params.set("known", opts.known.join(","));
    const qs = params.toString();
    const path = `${v1}/mailboxes/${encodeURIComponent(mailbox)}/changes${
      qs ? `?${qs}` : ""
    }`;
    return client.get<MailboxDelta>(path, signal);
  },
};

export const messages = {
  get(client: APIClient, mailbox: string, uid: number, signal?: AbortSignal) {
    return client.get<Message>(
      `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages/${uid}`,
      signal,
    );
  },
  send(client: APIClient, msg: OutgoingMessage) {
    return client.post<{ status: string }>(`${v1}/messages`, msg);
  },
  // Fetches one attachment's bytes as a Blob. `id` is the server-assigned
  // attachment id ("att-1", ...) carried in the message's attachment list. The
  // bytes are identical whether the caller intends to preview or save, so this
  // serves both paths; the browser Content-Disposition is irrelevant once the
  // response is read as a Blob.
  attachment(
    client: APIClient,
    mailbox: string,
    uid: number,
    id: string,
    signal?: AbortSignal,
  ) {
    return client.getBlob(
      `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages/${uid}/attachments/${encodeURIComponent(id)}`,
      signal,
    );
  },
  setFlags(
    client: APIClient,
    mailbox: string,
    uid: number,
    flags: string[],
    add: boolean,
  ) {
    return client.patch<{ status: string }>(
      `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages/${uid}/flags`,
      { flags, add },
    );
  },
  // Moves the message to `trash` (any destination mailbox — also used to
  // restore from Trash back to INBOX).
  remove(client: APIClient, mailbox: string, uid: number, trash?: string) {
    const body = trash ? { trash } : undefined;
    return client.delete<{ status: string }>(
      `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages/${uid}`,
      body,
    );
  },
  // Permanently expunges the message — no trash copy. Irreversible.
  removePermanent(client: APIClient, mailbox: string, uid: number) {
    return client.delete<{ status: string }>(
      `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages/${uid}`,
      { permanent: true },
    );
  },
  // Looks up a message's UID in a mailbox by its Message-ID header. Needed to
  // target a message again after a cross-mailbox move (the move response
  // doesn't carry the destination UID).
  find(
    client: APIClient,
    mailbox: string,
    messageId: string,
    signal?: AbortSignal,
  ) {
    return client.get<{ uid: number }>(
      `${v1}/mailboxes/${encodeURIComponent(mailbox)}/messages/find?message_id=${encodeURIComponent(messageId)}`,
      signal,
    );
  },
};

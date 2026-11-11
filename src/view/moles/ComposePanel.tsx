import { Box } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import type { Address } from "../../nonview/api/types";
import { useData } from "../../nonview/core/DataContext";
import { plainTextToHtml } from "../../nonview/email/plainText";
import { renderTemplate } from "../../nonview/email/renderTemplate";
import {
  defaultValues,
  type EmailTemplate,
  getTemplate,
  type TemplateValues,
} from "../../nonview/email/templates";
import AttachmentList from "./AttachmentList";
import ComposeForm from "./ComposeForm";
import ComposeHeader from "./ComposeHeader";
import type { RecipientInputHandle } from "./RecipientInput";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

type ComposeMode = "plaintext" | "template";

export interface ComposeInitial {
  to?: Address[];
  cc?: Address[];
  subject?: string;
  body?: string;
}

export interface ThreadContext {
  inReplyTo?: string;
  references?: string[];
}

export interface QuotedOriginal {
  text: string;
  html: string;
}

// What was actually sent, handed back so a caller (e.g. ThreadPage) can show
// the message in the open conversation without a round-trip.
export interface SentSummary {
  content: string;
  contentHtml?: string;
  subject: string;
}

interface ComposePanelProps {
  initial?: ComposeInitial;
  threadContext?: ThreadContext;
  /** Original message to quote beneath the reply (formatting preserved). */
  quote?: QuotedOriginal;
  title?: string;
  sendLabel?: string;
  /** Called by the header's close button. */
  onClose: () => void;
  /** Called after a message is sent successfully, with what was sent. */
  onSent: (sent: SentSummary) => void;
  /** Called after a draft is saved; falls back to onSent if omitted. */
  onSavedDraft?: () => void;
}

export const composeSchema = z.object({
  recipients: z.array(z.any()).min(1, "Please enter at least one recipient"),
  subject: z.string(),
  body: z.string(),
  attachments: z.array(z.any()),
  mode: z.enum(["plaintext", "template"]),
  templateId: z.string().nullable(),
  templateValues: z.record(z.string(), z.any()),
});

export type ComposeFormValues = z.infer<typeof composeSchema>;

// The full compose surface (header + form + attachments) with all of its state
// and send/draft logic. Rendered full-page by ComposePage and inside a modal by
// ComposeDialog, so replies and new messages share one implementation.
const ComposePanel = ({
  initial,
  threadContext,
  quote,
  title,
  sendLabel,
  onClose,
  onSent,
  onSavedDraft,
}: ComposePanelProps) => {
  const { contacts, sendEmail, saveDraft } = useData();

  const { register, control, handleSubmit, getValues, setValue } =
    useForm<ComposeFormValues>({
      resolver: zodResolver(composeSchema),
      defaultValues: {
        recipients: initial?.to || [],
        subject: initial?.subject || "",
        body: initial?.body || "",
        attachments: [],
        mode: "plaintext",
        templateId: null,
        templateValues: {},
      },
    });
  const attachments = useWatch({ control, name: "attachments" });

  const recipientInputRef = useRef<RecipientInputHandle | null>(null);
  const contactSuggestions = useMemo(() => contacts || [], [contacts]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setValue("templateId", template.id);
    const defaults = defaultValues(template);
    setValue("templateValues", defaults);
    const currentSubject = getValues("subject");
    if (!currentSubject.trim() && template.subject) {
      const suggested = template.subject(defaultValues(template));
      if (suggested) setValue("subject", suggested);
    }
  };

  const handleAttachFiles = (files: File[]) => {
    const newAttachments = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setValue("attachments", [...getValues("attachments"), ...newAttachments], {
      shouldDirty: true,
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setValue(
      "attachments",
      getValues("attachments").filter((a: any) => a.id !== id),
      { shouldDirty: true },
    );
  };

  // Assemble the outgoing bodies plus a display summary for the thread view.
  //   - textToSend / htmlToSend: what actually goes to the mail API
  //   - content / contentHtml: how the sent message should render in-thread
  // The quoted original (if replying) is appended to what the user wrote, with
  // its HTML preserved so a plain-text reply still quotes real HTML.
  const buildBody = async (data: ComposeFormValues) => {
    if (data.mode === "template" && data.templateId) {
      const { html, text } = await renderTemplate(
        data.templateId,
        data.templateValues,
      );
      return {
        textToSend: quote ? `${text}\n\n${quote.text}` : text,
        htmlToSend: html,
        content: text,
        contentHtml: html,
      };
    }
    const baseHtml = data.body.trim() ? plainTextToHtml(data.body) : "";
    return {
      textToSend: quote ? `${data.body}\n\n${quote.text}` : data.body,
      htmlToSend: quote ? baseHtml + quote.html : baseHtml || undefined,
      // Show just the user's own text as a chat bubble in the thread.
      content: data.body,
      contentHtml: undefined,
    };
  };

  const effectiveSubject = (data: ComposeFormValues) => {
    if (data.subject.trim()) return data.subject;
    if (data.mode === "template" && data.templateId) {
      const t = getTemplate(data.templateId);
      return t?.subject?.(data.templateValues) || data.subject;
    }
    return data.subject;
  };

  const handleSend = () => {
    const flushed = recipientInputRef.current?.flushPending();
    if (flushed) setValue("recipients", flushed);

    return handleSubmit(async (data) => {
      const finalSubject = effectiveSubject(data);
      const built = await buildBody(data);
      await sendEmail({
        to: data.recipients,
        subject: finalSubject,
        body: built.textToSend,
        bodyHtml: built.htmlToSend,
        attachments: data.attachments,
        inReplyTo: threadContext?.inReplyTo,
        references: threadContext?.references,
      });
      onSent({
        content: built.content,
        contentHtml: built.contentHtml,
        subject: finalSubject,
      });
    })();
  };

  const handleSaveDraft = async () => {
    const flushed = recipientInputRef.current?.flushPending();
    if (flushed) setValue("recipients", flushed);
    const data = getValues();
    const finalSubject = effectiveSubject(data);
    const built = await buildBody(data);
    await saveDraft({
      to: data.recipients,
      subject: finalSubject,
      body: built.textToSend,
      attachments: data.attachments,
    });
    (
      onSavedDraft ||
      (() => onSent({ content: built.content, subject: finalSubject }))
    )();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <ComposeHeader
        onSend={handleSend}
        onClose={onClose}
        title={title}
        sendLabel={sendLabel}
      />
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <ComposeForm
          control={control}
          setValue={setValue}
          recipientInputRef={recipientInputRef}
          onAttachFiles={handleAttachFiles}
          onSaveDraft={handleSaveDraft}
          onDiscard={onClose}
          contacts={contactSuggestions}
          onTemplateSelect={handleTemplateSelect}
        />
        <AttachmentList
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          editable
        />
      </Box>
    </Box>
  );
};

export default ComposePanel;

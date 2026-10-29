import { startTransition } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Address } from "../../nonview/api/types";
import AppLayout from "../moles/AppLayout";
import ComposePanel from "../moles/ComposePanel";

const parseRecipients = (toParam: string | null): Address[] => {
  if (!toParam) return [];
  return toParam
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
};

function ComposePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initial = {
    to: parseRecipients(searchParams.get("to")),
    subject: searchParams.get("subject") || "",
    body: searchParams.get("body") || "",
  };

  const goBack = () => {
    // navigate(-1) silently no-ops when compose was opened directly or after a
    // reload (no prior history entry), so fall back to the mail pane.
    if (window.history.length > 1) {
      startTransition(() => navigate(-1));
    } else {
      startTransition(() => navigate("/"));
    }
  };

  const navigateToRootPath = () => {
    startTransition(() => navigate("/"));
  };

  return (
    <AppLayout title="Compose">
      <ComposePanel
        initial={initial}
        onClose={goBack}
        onSent={navigateToRootPath}
        onSavedDraft={navigateToRootPath}
        /* onSent receives a SentSummary; the page just navigates. */
      />
    </AppLayout>
  );
}

export default ComposePage;

import EditIcon from "@mui/icons-material/Edit";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Box, Fab, useMediaQuery, useTheme } from "@mui/material";
import { useDeferredValue, useMemo, useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { useData } from "../../nonview/core/DataContext";
import EmptyState from "../atoms/EmptyState";
import AppLayout from "../moles/AppLayout";
import { useCompose } from "../moles/ComposeProvider";
import ThreadList from "../moles/ThreadList";

function MailPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const matchThread = useMatch("/thread/:threadId");
  const threadId = matchThread?.params?.threadId;

  const {
    emailThreads,
    loading,
    refreshActive,
    realtimeConnected,
    prefetchMessages,
    getThread,
  } = useData();
  const { openCompose } = useCompose();
  const [searchQuery, setSearchQuery] = useState("");
  const deferQuery = useDeferredValue(searchQuery, "");

  const thread = threadId ? getThread(threadId) : undefined;

  const filteredThreads = useMemo(() => {
    if (!deferQuery?.trim?.()) return emailThreads;
    const query = deferQuery?.trim?.()?.toLowerCase?.();
    return emailThreads.filter(
      (thread) =>
        thread.subject.toLowerCase().includes(query) ||
        thread.lastMessage.toLowerCase().includes(query) ||
        thread.participants.some((p) => p.name.toLowerCase().includes(query)),
    );
  }, [emailThreads, deferQuery]);

  const list = (
    <ThreadList
      threads={filteredThreads}
      loading={loading}
      emptyMessage={
        deferQuery ? "No emails match your search" : "No emails yet"
      }
      onRefresh={deferQuery ? undefined : refreshActive}
      live={realtimeConnected}
      onPrefetch={prefetchMessages}
      selectedThreadId={threadId}
    />
  );

  return (
    <AppLayout
      title={
        !isDesktop && matchThread ? thread?.subject || "Thread" : "Quicksilver"
      }
      titleIcon={!isDesktop && matchThread ? null : MailOutlineIcon}
      showSearch={!matchThread || isDesktop}
      onSearch={setSearchQuery}
      actions={
        isDesktop
          ? [{ icon: EditIcon, label: "Compose", onClick: () => openCompose() }]
          : []
      }
    >
      {isDesktop ? (
        // Dark mode paints the whole split on the "deep space" gradient; the
        // sidebar becomes a translucent glass panel over it.
        <Box
          sx={(muiTheme) => ({
            display: "flex",
            height: "100%",
            ...muiTheme.applyStyles("dark", {
              background:
                "radial-gradient(circle at 50% 0%, #1A1A2E 0%, #0E0E0F 100%)",
            }),
          })}
        >
          {/* Sidebar is a frosted glass panel in both schemes (DESIGN.md,
              "The HUD Layer"). */}
          <Box
            sx={(muiTheme) => ({
              width: 360,
              borderRight: 1,
              borderColor: "divider",
              height: "100%",
              flexShrink: 0,
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(20px)",
              ...muiTheme.applyStyles("dark", {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              }),
            })}
          >
            {list}
          </Box>
          {/* Conversation pane: slightly more opaque surface so the two panes
              read as distinct glass layers. */}
          <Box
            sx={(muiTheme) => ({
              flex: 1,
              height: "100%",
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.5)",
              ...muiTheme.applyStyles("dark", {
                background: "rgba(0, 0, 0, 0.2)",
              }),
            })}
          >
            {matchThread ? (
              <Outlet />
            ) : (
              <EmptyState title="Select an email to read" />
            )}
          </Box>
        </Box>
      ) : matchThread ? (
        <Box
          sx={(muiTheme) => ({
            height: "100%",
            background: "rgba(255, 255, 255, 0.5)",
            ...muiTheme.applyStyles("dark", {
              background:
                "radial-gradient(circle at 50% 0%, #1A1A2E 0%, #0E0E0F 100%)",
            }),
          })}
        >
          <Outlet />
        </Box>
      ) : (
        list
      )}
      {!isDesktop && !matchThread && (
        <Fab
          color="primary"
          aria-label="compose"
          onClick={() => openCompose()}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
          }}
        >
          <EditIcon />
        </Fab>
      )}
    </AppLayout>
  );
}

export default MailPage;

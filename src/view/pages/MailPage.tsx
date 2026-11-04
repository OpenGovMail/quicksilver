import EditIcon from "@mui/icons-material/Edit";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Box, Fab, useMediaQuery, useTheme } from "@mui/material";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Outlet, useMatch } from "react-router-dom";
import { type Thread, useData } from "../../nonview/core/DataContext";
import EmptyState from "../atoms/EmptyState";
import AppLayout from "../moles/AppLayout";
import { useCompose } from "../moles/ComposeProvider";
import ThreadList from "../moles/ThreadList";
import { useMiniSearch } from "react-minisearch";

const SIDEBAR_WIDTH_KEY = "quicksilver_sidebar_width";
const SIDEBAR_MIN_WIDTH = 280;
const SIDEBAR_MAX_WIDTH = 560;
const SIDEBAR_DEFAULT_WIDTH = 360;

function clampSidebarWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

function readSidebarWidth(): number {
  const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (!Number.isFinite(stored) || stored <= 0) return SIDEBAR_DEFAULT_WIDTH;
  return clampSidebarWidth(stored);
}

const MINI_SEARCH_OPTIONS = {
  fields: ["subject", "lastMessage", "participants"],

  extractField: (document: Thread, fieldName: string) => {
    if (fieldName === "participants") {
      return (
        document.participants
          ?.map((p) => `${p.name} ${(p as { email?: string }).email ?? ""}`)
          .join(" ") ?? ""
      );
    }
    return (document as Record<string, any>)[fieldName];
  },

  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    boost: { subject: 2 },
  },
};

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

  const { search, searchResults, clearSearch, removeAll, addAll } =
    useMiniSearch<Thread>(emailThreads, MINI_SEARCH_OPTIONS);

  const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const dragStart = useRef({ x: 0, width: SIDEBAR_DEFAULT_WIDTH });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    if (!resizingSidebar) return;

    const handleMove = (event: PointerEvent) => {
      const delta = event.clientX - dragStart.current.x;
      setSidebarWidth(clampSidebarWidth(dragStart.current.width + delta));
    };
    const stopResizing = () => setResizingSidebar(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);
    window.addEventListener("blur", stopResizing);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
      window.removeEventListener("blur", stopResizing);
    };
  }, [resizingSidebar]);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    removeAll();
    if (emailThreads?.length) {
      addAll(emailThreads);
    }
  }, [emailThreads, removeAll, addAll]);

  useEffect(() => {
    const query = deferQuery.trim();
    if (query) {
      startTransition(() => {
        search(query);
      });
    } else {
      startTransition(() => {
        clearSearch();
      });
    }
  }, [deferQuery, search, clearSearch]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStart.current = { x: event.clientX, width: sidebarWidth };
    setResizingSidebar(true);
  };

  const resizeWithKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -16 : 16;
    setSidebarWidth((width) => clampSidebarWidth(width + delta));
  };

  const thread = threadId ? getThread(threadId) : undefined;

  const filteredThreads = useMemo(() => {
    if (!deferQuery.trim()) return emailThreads;
    return searchResults ?? [];
  }, [deferQuery, searchResults, emailThreads]);

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
            cursor: resizingSidebar ? "col-resize" : "default",
            userSelect: resizingSidebar ? "none" : "auto",
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
              width: sidebarWidth,
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
          <Box
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize mail list"
            aria-valuemin={SIDEBAR_MIN_WIDTH}
            aria-valuemax={SIDEBAR_MAX_WIDTH}
            aria-valuenow={Math.round(sidebarWidth)}
            tabIndex={0}
            onPointerDown={startResize}
            onKeyDown={resizeWithKeyboard}
            sx={{
              width: 6,
              flexShrink: 0,
              cursor: "col-resize",
              position: "relative",
              zIndex: 2,
              outline: "none",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 2,
                borderRadius: 1,
                backgroundColor: resizingSidebar ? "#00F2FF" : "transparent",
                boxShadow: resizingSidebar
                  ? "0 0 10px rgba(0, 242, 255, 0.5)"
                  : "none",
                transition: "background-color 0.15s, box-shadow 0.15s",
              },
              "&:hover::after, &:focus-visible::after": {
                backgroundColor: "#00F2FF",
                boxShadow: "0 0 10px rgba(0, 242, 255, 0.5)",
              },
            }}
          />
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

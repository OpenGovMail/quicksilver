import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../atoms/EmptyState";
import ThreadListSkeleton from "../atoms/ThreadListSkeleton";
import ThreadListItem from "./ThreadListItem";

// Approximate height of one ThreadListItem (avatar + three text rows + padding).
// react-virtual uses this only for the initial layout estimate; real heights
// are measured per row via measureElement, so variable-height items are fine.
const ESTIMATED_ROW_HEIGHT = 92;

const ThreadList = ({
  threads,
  loading = false,
  emptyMessage = "No emails found",
  selectedThreadId = null,
  // Gmail-style pager. When onNext/onPrev are provided and total > 0, a
  // "start–end of total" bar with prev/next arrows is shown above the list.
  page = 0,
  total = 0,
  pageSize = 50,
  onNext = undefined,
  onPrev = undefined,
  pageLoading = false,
  // Optional delta-sync trigger. When provided, a refresh button is shown in the
  // pager bar; it fetches only what changed since the last sync (proposal §6).
  onRefresh = undefined,
  // When true, a small "Live" indicator shows that the realtime SSE stream is
  // connected and new mail will push in without a manual refresh (Phase 4).
  live = undefined,
  // Predictive prefetch (proposal §7): (threadId) => Promise. Wired to row
  // hover/focus, plus a top-of-list warm-up during idle time below.
  onPrefetch = undefined,
}) => {
  const navigate = useNavigate();
  const parentRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Jump back to the top of the list whenever the page changes, so a new page
  // starts at its first message rather than wherever the previous one scrolled.
  useEffect(() => {
    if (parentRef.current) parentRef.current.scrollTop = 0;
  }, [page]);

  // Predictive prefetch of the top few threads (proposal §7). The messages at
  // the top of a folder are the ones a user is most likely to open, so warm
  // their bodies into the cache during idle time — off the critical render
  // path, and deduped/cache-guarded inside onPrefetch so it's cheap to repeat.
  useEffect(() => {
    if (!onPrefetch || !threads?.length) return;
    const ids = threads.slice(0, 3).map((t) => t.id);
    const ric =
      window.requestIdleCallback ||
      ((cb) =>
        window.setTimeout(
          () => cb({ didTimeout: false, timeRemaining: () => 0 }),
          200,
        ));
    const cic = window.cancelIdleCallback || window.clearTimeout;
    const handle = ric(() => ids.forEach((id) => void onPrefetch(id)));
    return () => cic(handle);
  }, [threads, onPrefetch]);

  const rowVirtualizer = useVirtualizer({
    count: threads?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    // Render a few extra rows above/below the viewport so fast scrolling
    // doesn't flash blank space.
    overscan: 8,
  });

  if (loading) {
    return <ThreadListSkeleton />;
  }

  if (!threads || threads.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  const handleThreadClick = (threadId) => {
    // Thread IDs are mailbox+uid composites and may contain slashes (e.g.
    // "[Gmail]/Sent Mail:807"). Encode so the route's `:threadId` matches a
    // single path segment; useParams() decodes it back automatically.
    navigate(`/thread/${encodeURIComponent(threadId)}`);
  };

  const items = rowVirtualizer.getVirtualItems();

  // Pager math. start/end are 1-based and reflect the rows actually shown.
  const showPager = !!(onNext || onPrev) && total > 0;
  // The top bar appears for the pager, the refresh button, and/or the live dot.
  const showBar = showPager || !!onRefresh || live !== undefined;
  const start = page * pageSize + 1;
  const end = page * pageSize + threads.length;
  const canPrev = page > 0 && !pageLoading;
  const canNext = end < total && !pageLoading;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // The pane behind the list provides the glass surface in both schemes.
        backgroundColor: "transparent",
      }}
    >
      {showBar && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            px: 2,
            py: 0.5,
            borderBottom: 1,
            borderColor: "divider",
            minHeight: 44,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, mr: "auto" }}
          >
            {onRefresh && (
              <IconButton
                size="small"
                aria-label="Refresh"
                title="Refresh (delta sync)"
                disabled={refreshing}
                onClick={handleRefresh}
              >
                {refreshing ? <CircularProgress size={18} /> : <RefreshIcon />}
              </IconButton>
            )}
            {live !== undefined && (
              <Box
                title={
                  live ? "Live — new mail arrives instantly" : "Reconnecting…"
                }
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: live ? "success.main" : "text.disabled",
                    boxShadow: live ? "0 0 0 3px rgba(46,125,50,0.15)" : "none",
                    transition: "background-color 0.2s",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {live ? "Live" : "Offline"}
                </Typography>
              </Box>
            )}
          </Box>
          {showPager && (
            <>
              {pageLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
              <Typography variant="body2" color="text.secondary">
                {start.toLocaleString()}–{end.toLocaleString()} of{" "}
                {total.toLocaleString()}
              </Typography>
              <IconButton
                size="small"
                aria-label="Newer messages"
                disabled={!canPrev}
                onClick={() => onPrev && onPrev()}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Older messages"
                disabled={!canNext}
                onClick={() => onNext && onNext()}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </Box>
      )}

      {/* The scroll container. Only the rows inside the viewport are mounted,
          so this stays at 60fps even over a large mailbox. */}
      <Box ref={parentRef} sx={{ flex: 1, overflowY: "auto" }}>
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
            width: "100%",
          }}
        >
          {items.map((virtualRow) => {
            const thread = threads[virtualRow.index];
            return (
              <Box
                key={thread.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ThreadListItem
                  thread={thread}
                  isSelected={thread.id === selectedThreadId}
                  onClick={handleThreadClick}
                  onPrefetch={onPrefetch}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default ThreadList;

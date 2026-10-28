import { Box, Skeleton } from "@mui/material";
import type React from "react";

// Skeleton placeholder for the mailbox list (proposal §7, "skeleton loading
// states"). Mirrors ThreadListItem's layout — avatar + three text rows — so the
// list keeps its shape and doesn't reflow when real rows replace it. Shown only
// on a cold load (no cached rows to paint); a warm cache renders instantly and
// never sees this.
const ThreadListSkeletonRow: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      gap: 1.5,
      px: 2,
      py: 1.5,
    }}
  >
    <Skeleton variant="circular" width={44} height={44} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Skeleton variant="text" width="35%" height={20} />
        <Skeleton variant="text" width={48} height={16} />
      </Box>
      <Skeleton variant="text" width="65%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="90%" height={16} />
    </Box>
  </Box>
);

const ThreadListSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <Box aria-busy="true" aria-label="Loading messages">
    {Array.from({ length: rows }).map((_, i) => (
      <ThreadListSkeletonRow key={i} />
    ))}
  </Box>
);

export default ThreadListSkeleton;

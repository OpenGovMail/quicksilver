import { Box, Skeleton } from "@mui/material";
import type React from "react";

// Skeleton placeholder for a message body while it loads over the network
// (proposal §7). Shown only on a cold thread — a cached body paints instantly
// and skips this. Approximates a sender row plus a few lines of body text.
const MessageSkeleton: React.FC = () => (
	<Box sx={{ p: 2 }} aria-busy="true" aria-label="Loading message">
		<Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
			<Skeleton variant="circular" width={36} height={36} />
			<Box sx={{ flex: 1 }}>
				<Skeleton variant="text" width="30%" height={18} />
				<Skeleton variant="text" width="20%" height={14} />
			</Box>
		</Box>
		<Skeleton variant="text" width="95%" height={16} />
		<Skeleton variant="text" width="88%" height={16} />
		<Skeleton variant="text" width="92%" height={16} />
		<Skeleton variant="text" width="60%" height={16} />
		<Skeleton
			variant="rectangular"
			width="100%"
			height={140}
			sx={{ mt: 2, borderRadius: 1 }}
		/>
	</Box>
);

export default MessageSkeleton;

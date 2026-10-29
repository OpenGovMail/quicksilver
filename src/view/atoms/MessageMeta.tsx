import CheckIcon from "@mui/icons-material/Check";
import { Box } from "@mui/material";
import React from "react";
import Timestamp from "./Timestamp";

const MessageMeta = ({ timestamp, isRead, isSent }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        justifyContent: isSent ? "flex-end" : "flex-start",
        mt: 0.5,
        // Metadata is present but secondary (DESIGN.md, Typography).
        opacity: 0.7,
      }}
    >
      <Timestamp date={timestamp} format="time-only" />
      {isSent && (
        <CheckIcon
          sx={{
            fontSize: 14,
            color: isRead ? "primary.main" : "text.secondary",
          }}
        />
      )}
    </Box>
  );
};

export default MessageMeta;

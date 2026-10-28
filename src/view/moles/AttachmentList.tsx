import { Box, Typography } from "@mui/material";
import React from "react";
import AttachmentPreview from "./AttachmentPreview";

const AttachmentList = ({
  attachments = [],
  onRemove = undefined,
  onDownload = undefined,
  onPreview = undefined,
  editable = true,
}) => {
  if (!attachments.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Attachments
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {attachments.map((attachment) => (
          <AttachmentPreview
            key={attachment.id}
            attachment={attachment}
            onRemove={editable ? onRemove : undefined}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AttachmentList;

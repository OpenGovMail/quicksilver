import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, IconButton } from "@mui/material";
import React from "react";
import AttachmentInfo from "../atoms/AttachmentInfo";

// Which MIME types the in-app viewer can render inline (see AttachmentViewer).
export function isPreviewable(mimeType = "") {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

const AttachmentPreview = ({
  attachment,
  onRemove = null,
  onDownload = null,
  onPreview = null,
}) => {
  const canPreview = !!onPreview && isPreviewable(attachment.mimeType);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
      }}
    >
      <InsertDriveFileIcon color="action" />
      <AttachmentInfo name={attachment.name} size={attachment.size} />
      <Box sx={{ flex: 1 }} />
      {canPreview && (
        <IconButton aria-label="preview" onClick={() => onPreview(attachment)}>
          <VisibilityIcon />
        </IconButton>
      )}
      {onDownload && (
        <IconButton
          aria-label="download"
          onClick={() => onDownload(attachment)}
        >
          <DownloadIcon />
        </IconButton>
      )}
      {onRemove && (
        <IconButton aria-label="remove" onClick={() => onRemove(attachment.id)}>
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default AttachmentPreview;

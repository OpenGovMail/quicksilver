import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import {
	Box,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Typography,
} from "@mui/material";
import React from "react";

// In-app attachment preview. Renders images and PDFs inline from a blob object
// URL (fetched with the auth header upstream), so the user can view an
// attachment without saving it first. Non-previewable types never reach here —
// the list only shows a preview button for viewable MIME types.
//
// The object URL is owned by the caller (MessageBubble), which revokes it on
// close; this component only renders whatever `url` it's given.
const AttachmentViewer = ({
	open,
	onClose,
	url = null,
	mimeType = "",
	filename = "attachment",
	loading = false,
	error = null,
	onDownload = null,
}) => {
	const isImage = mimeType.startsWith("image/");
	const isPdf = mimeType === "application/pdf";

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle
				sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}
			>
				<Typography variant="subtitle1" noWrap sx={{ flex: 1, minWidth: 0 }}>
					{filename}
				</Typography>
				{onDownload && (
					<IconButton aria-label="download" onClick={onDownload}>
						<DownloadIcon />
					</IconButton>
				)}
				<IconButton aria-label="close" onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent
				dividers
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: 240,
					backgroundColor: "action.hover",
				}}
			>
				{loading && <CircularProgress />}
				{!loading && error && (
					<Typography color="error" variant="body2">
						{error}
					</Typography>
				)}
				{!loading && !error && url && isImage && (
					<Box
						component="img"
						src={url}
						alt={filename}
						sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
					/>
				)}
				{!loading && !error && url && isPdf && (
					<Box
						component="iframe"
						src={url}
						title={filename}
						sx={{ width: "100%", height: "70vh", border: 0 }}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default AttachmentViewer;

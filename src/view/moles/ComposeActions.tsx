import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, IconButton } from "@mui/material";
import React from "react";

const ComposeActions = ({ onAttach, onSaveDraft, onDiscard }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
      <IconButton aria-label="attach file" onClick={onAttach}>
        <AttachFileIcon />
      </IconButton>
      <Button
        variant="outlined"
        color="primary"
        onClick={onSaveDraft}
        startIcon={<SaveIcon />}
      >
        Save Draft
      </Button>
      <Button
        variant="text"
        onClick={onDiscard}
        startIcon={<DeleteOutlineIcon />}
      >
        Discard
      </Button>
    </Box>
  );
};

export default ComposeActions;

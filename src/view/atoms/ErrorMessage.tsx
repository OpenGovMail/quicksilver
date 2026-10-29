import CloseIcon from "@mui/icons-material/Close";
import { Alert, type AlertColor, IconButton } from "@mui/material";
import React from "react";

const ErrorMessage = ({
  message,
  onDismiss,
  severity = "error",
  variant = null,
}) => {
  if (!message) return null;

  // Support variant prop for backward compatibility
  const alertSeverity = (
    variant === "success" ? "success" : severity
  ) as AlertColor;

  return (
    <Alert
      severity={alertSeverity}
      action={
        onDismiss && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )
      }
    >
      {message}
    </Alert>
  );
};

export default ErrorMessage;

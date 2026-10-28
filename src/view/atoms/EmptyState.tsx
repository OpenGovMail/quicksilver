import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Box, Typography } from "@mui/material";
import React from "react";

const EmptyState = ({
  icon: CustomIcon = null,
  title,
  description = null,
  action = null,
}) => {
  const Icon = CustomIcon || MailOutlineIcon;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        textAlign: "center",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2.5,
          color: "primary.main",
          backgroundColor: "action.selected",
        }}
      >
        <Icon sx={{ fontSize: 40 }} />
      </Box>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 360 }}
        >
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
};

export default EmptyState;

import { Typography } from "@mui/material";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import React from "react";

const Timestamp = ({ date, format: formatType = "relative" }) => {
  const formatTimestamp = () => {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    switch (formatType) {
      case "relative":
        if (isToday(dateObj)) {
          return format(dateObj, "h:mm a");
        }
        if (isYesterday(dateObj)) {
          return "Yesterday";
        }
        return formatDistanceToNow(dateObj, { addSuffix: true });

      case "absolute":
        return format(dateObj, "MMM d, yyyy");

      case "time-only":
        return format(dateObj, "h:mm a");

      default:
        return formatDistanceToNow(dateObj, { addSuffix: true });
    }
  };

  return (
    <Typography variant="caption" color="text.secondary">
      {formatTimestamp()}
    </Typography>
  );
};

export default Timestamp;

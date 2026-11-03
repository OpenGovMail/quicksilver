import { Box } from "@mui/material";
import MessageSkeleton from "../atoms/MessageSkeleton";
import MessageGroup from "./MessageGroup";

const groupMessages = (messages = []) => {
  const groups = [];
  let currentGroup = null;

  messages.forEach((message) => {
    const senderId = message.sender?.id;
    if (!currentGroup || currentGroup.sender?.id !== senderId) {
      currentGroup = { sender: message.sender, messages: [message] };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  });

  return groups;
};

const ThreadView = ({
  thread,
  messages = [],
  loading = false,
  onDownloadAttachment,
  onFetchAttachment,
  onMessageAction = undefined,
}) => {
  if (loading) {
    return <MessageSkeleton />;
  }

  const groups = groupMessages(messages);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 3,
        display: "flex",
        flexDirection: "column",
        maxWidth: 960,
        mx: "auto",
        width: "100%",
        boxSizing: "border-box",
        "@keyframes qs-bubble-in": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "& > *": {
          animation: "qs-bubble-in 0.25s ease both",
        },
      }}
    >
      {groups.map((group, index) => (
        <MessageGroup
          key={`${group.sender?.id}-${index}`}
          messages={group.messages}
          sender={group.sender}
          onDownloadAttachment={onDownloadAttachment}
          onFetchAttachment={onFetchAttachment}
          onMessageAction={onMessageAction}
        />
      ))}
    </Box>
  );
};

export default ThreadView;

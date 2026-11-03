import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  IconButton as MuiIconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Subject-only header (issue #40): thread-level action icons are gone — every
// action now lives on the individual message (hover kebab / right-click menu),
// and addressing details live in the sender-avatar hover-card.
const ThreadHeader = ({ thread }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={(muiTheme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        // Translucent glass strip over the pane surface in both schemes.
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(12px)",
        ...muiTheme.applyStyles("dark", {
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        }),
      })}
    >
      {!isDesktop && (
        <MuiIconButton aria-label="back" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </MuiIconButton>
      )}
      <Typography
        variant="h6"
        component="h2"
        noWrap
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.0625rem", md: "1.25rem" },
          letterSpacing: "-0.02em",
          minWidth: 0,
        }}
      >
        {thread?.subject || "(No subject)"}
      </Typography>
    </Box>
  );
};

export default ThreadHeader;

import { createTheme } from "@mui/material";

// Quicksilver 2100 "Solar Inversion" design system (see DESIGN.md).
// Light mode: high-luminance cool-white lab — glacial grey surfaces, teal
// primary (#00696F), electric cyan (#00F2FF) for kinetic accents.
// Dark mode: the "deep space" counterpart — same cyan energy over near-black.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data" },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#00696F",
          light: "#00DBE7",
          dark: "#004F54",
          contrastText: "#FFFFFF",
        },
        secondary: {
          main: "#496366",
          light: "#CCE8EB",
          dark: "#324B4E",
          contrastText: "#FFFFFF",
        },
        success: { main: "#008A5E" },
        warning: { main: "#705D00" }, // tertiary gold — starred/important
        info: { main: "#00DBE7" },
        error: { main: "#BA1A1A" },
        background: {
          default: "#F7F9FB", // surface — cool white, not warm
          paper: "#FFFFFF", // surface-container-lowest
        },
        text: {
          primary: "#191C1E", // on-surface
          secondary: "#3A494B", // on-surface-variant
        },
        divider: "rgba(106, 122, 123, 0.25)", // hairline "cyber-lines"
        action: {
          hover: "rgba(0, 242, 255, 0.05)", // spec: list hover tint
          selected: "rgba(0, 242, 255, 0.18)", // primary-container tint
        },
      },
    },
    // Dark scheme: "deep space" glass look — cyan accent over near-black
    // blue-tinted surfaces, translucent panels, soft neon glows.
    dark: {
      palette: {
        primary: {
          main: "#00F2FF",
          light: "#B2F5FF",
          dark: "#00B8C4",
          contrastText: "#00373A",
        },
        secondary: {
          main: "#91D3CB",
          light: "#ACEFE8",
          dark: "#00524D",
          contrastText: "#00201E",
        },
        success: { main: "#91D3CB" },
        warning: { main: "#FFBE29" },
        info: { main: "#FFBE29" },
        error: { main: "#FFB4AB" },
        background: {
          default: "#0E0E0F",
          paper: "#131314",
        },
        text: {
          primary: "#E1E3E3",
          secondary: "#C1C8C8",
        },
        divider: "rgba(255, 255, 255, 0.08)",
        action: {
          hover: "rgba(255, 255, 255, 0.05)",
          selected: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
  typography: {
    fontFamily: [
      '"Geist"',
      '"Inter"',
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
    caption: { fontWeight: 500, letterSpacing: "0.01em" },
  },
  shape: {
    borderRadius: 8, // "functional precision" — engineered container radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: "none" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiFab: {
      styleOverrides: {
        // "Solar glow" in both schemes — the cyan LED accent.
        root: { boxShadow: "0 0 20px rgba(0, 242, 255, 0.3)" },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rectangular: { borderRadius: 12 },
      },
    },
  },
});

export default theme;

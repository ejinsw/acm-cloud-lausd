import { createTheme } from "@mantine/core";

export const Theme = createTheme({
  primaryColor: "brand-blue",
  defaultRadius: "md",
  fontFamily: "var(--font-body)",
  fontFamilyMonospace: "var(--font-mono)",
  headings: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
  },
  colors: {
    "brand-blue": [
      "#E7F1F9",
      "#D2E7F6",
      "#A8D0EC",
      "#7CB9E3",
      "#519FD7",
      "#2774AE",
      "#1F669D",
      "#195889",
      "#144A73",
      "#0F3A5A",
    ],
    "brand-gold": [
      "#FFF8DE",
      "#FFF1BE",
      "#FFE792",
      "#FFDD67",
      "#FFD747",
      "#FFD100",
      "#E6BC00",
      "#CCA700",
      "#B39100",
      "#8C7000",
    ],
    "app-navy": [
      "#E8ECF3",
      "#CBD5E5",
      "#A5B5CF",
      "#8096B8",
      "#5B77A1",
      "#36588A",
      "#29466F",
      "#1E3455",
      "#13213B",
      "#0B1F3B",
    ],
    "app-mist": [
      "#FFFFFF",
      "#FBFCFE",
      "#F7FAFD",
      "#F4F8FC",
      "#EBF1F8",
      "#DEE7F2",
      "#CBD7E6",
      "#A8B8CB",
      "#8598AE",
      "#5F738A",
    ],
  },
  components: {
    AppShell: {
      styles: {
        main: {
          background:
            "radial-gradient(circle at 0% 0%, rgba(39,116,174,0.12), transparent 35%), radial-gradient(circle at 100% 100%, rgba(255,209,0,0.15), transparent 32%), #F4F8FC",
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.01em",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
      styles: {
        root: {
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.95), rgba(255,255,255,0.86))",
          border: "1px solid rgba(39, 116, 174, 0.12)",
          backdropFilter: "blur(6px)",
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
      styles: {
        root: {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))",
          border: "1px solid rgba(39, 116, 174, 0.12)",
        },
      },
    },
    Badge: {
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.01em",
        },
      },
    },
    Text: {
      styles: {
        root: {
          color: "#0F172A",
        },
      },
    },
  },
});

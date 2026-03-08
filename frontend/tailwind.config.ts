import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        chat: {
          // Backgrounds — daily.dev inspired near-black
          bg:         "#0d0e13",
          sidebar:    "#13141a",
          surface:    "#1c1d24",
          "surface-2":"#22232e",

          // Borders
          border:     "#252631",
          border2:    "#32333f",

          // Text
          text:       "#f1f2f6",
          muted:      "#6b7280",

          // Green accent (primary)
          green:         "#3fb950",
          "green-hover": "#46d160",
          "green-dim":   "#1a3b25",

          // White (for buttons)
          white: "#ffffff",

          // Success / info
          success: "#4ade80",
        },
      },
      keyframes: {
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.35" },
          "30%": { transform: "translateY(-5px)", opacity: "1" },
        },
        fadeSlideIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "typing-dot":   "typingDot 1.2s ease-in-out infinite",
        "fade-slide-in":"fadeSlideIn 0.22s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

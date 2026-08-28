import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0B0E14",
        panel: "#12161F",
        panel2: "#171C28",
        hairline: "#232838",
        ink: "#E6E9F0",
        dim: "#7A8FA6",
        signal: {
          critical: "#FF5C5C",
          high: "#FF9F43",
          medium: "#F5D547",
          low: "#4FD1C5",
        },
        flow: "#5B8DEF",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(91,141,239,0.15), 0 0 24px rgba(91,141,239,0.08)",
      },
      keyframes: {
        pulse_ring: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        pulse_ring: "pulse_ring 1.4s ease-out infinite",
        ticker: "ticker 30s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

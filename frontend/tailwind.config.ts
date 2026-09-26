import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080A0F",
        secondary: "#0D1117",
        card: "#11161D",
        "card-hover": "#161C26",
        border: "rgba(255, 255, 255, 0.08)",
        "border-light": "rgba(255, 255, 255, 0.14)",
        primary: {
          DEFAULT: "#00F0FF",
          hover: "#38BDF8",
          dark: "#0284C7",
          foreground: "#080A0F",
        },
        text: {
          primary: "#F5F7FA",
          secondary: "#8B949E",
          muted: "#5B6574",
        },
        semantic: {
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          cyan: "#06B6D4",
          blue: "#3B82F6",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

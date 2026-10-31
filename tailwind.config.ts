import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: {
          DEFAULT: "#121922",
          elevated: "#1A2430",
          subtle: "#16202C",
        },
        border: {
          DEFAULT: "#273342",
          subtle: "#1E293B",
          highlight: "#384759",
        },
        accent: {
          DEFAULT: "#43D9A3",
          hover: "#38C290",
          muted: "rgba(67, 217, 163, 0.15)",
        },
        secondary: {
          DEFAULT: "#65B8FF",
          hover: "#4EA0E8",
          muted: "rgba(101, 184, 255, 0.15)",
        },
        content: {
          primary: "#F4F7FA",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        evidence: {
          supports: "#43D9A3",
          challenges: "#F59E0B",
          contradicts: "#EF4444",
          qualifies: "#65B8FF",
          extends: "#A855F7",
          replicates: "#38BDF8",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

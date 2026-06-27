import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens resolve to CSS variables so the whole app supports dark mode
        // (palettes defined in globals.css). Fallbacks keep the light palette.
        navy: "var(--c-navy, #1f2a44)",
        navy2: "var(--c-navy2, #3a4a6b)",
        teal: "var(--c-teal, #27ae9f)",
        tealdark: "var(--c-tealdark, #1f8b7f)",
        light: "var(--c-light, #eef6f5)",
        rowalt: "var(--c-rowalt, #f6f9f9)",
        line: "var(--c-line, #d6e0df)",
        ink: "var(--c-ink, #2c3038)",
        grey: "var(--c-grey, #5b6470)",
        surface: "var(--c-surface, #ffffff)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

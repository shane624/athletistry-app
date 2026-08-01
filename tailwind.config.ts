import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens resolve to CSS variables (palettes in globals.css). Names are
        // kept for compatibility; values are the Athletistry Project palette:
        //   navy = Graphite · teal = Royal blue · light = cool panel · gold = Silver.
        navy: "var(--c-navy, #2A2F36)",
        navy2: "var(--c-navy2, #3A414A)",
        teal: "var(--c-teal, #1E50A0)",
        tealdark: "var(--c-tealdark, #163C7A)",
        gold: "var(--c-gold, #8B93A0)",
        light: "var(--c-light, #EEF1F5)",
        rowalt: "var(--c-rowalt, #F3F5F8)",
        line: "var(--c-line, #DCE1E8)",
        ink: "var(--c-ink, #2A2F36)",
        grey: "var(--c-grey, #6B7280)",
        surface: "var(--c-surface, #FFFFFF)",
        marble: "var(--c-page, #F5F6F8)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

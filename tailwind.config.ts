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
        bluewash: "var(--c-bluewash, #EAF1FB)",
      },
      opacity: {
        28: ".28", 35: ".35", 42: ".42", 45: ".45", 48: ".48", 55: ".55", 58: ".58", 66: ".66", 85: ".85",
      },
      // Type scale (Apple text styles). Nothing in the app renders below 11px.
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.3" }],      // caption 2
        footnote: ["13px", { lineHeight: "1.4" }],
        subhead: ["15px", { lineHeight: "1.45" }],
        body: ["17px", { lineHeight: "1.5" }],
        title3: ["20px", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        title2: ["22px", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        title1: ["28px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        large: ["34px", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      // Five radii: 6 / 8 / 12 / 16 / 20, plus full.
      borderRadius: { "3xl": "20px" },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

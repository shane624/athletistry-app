import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1f2a44",
        navy2: "#3a4a6b",
        teal: "#27ae9f",
        tealdark: "#1f8b7f",
        light: "#eef6f5",
        rowalt: "#f6f9f9",
        line: "#d6e0df",
        ink: "#2c3038",
        grey: "#5b6470",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

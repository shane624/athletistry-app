import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athletistry — 24-Week Program",
  description: "Track your weight, reps, and progressions through the 24-week periodized program.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

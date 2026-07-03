import type { Metadata, Viewport } from "next";
import "./globals.css";
import InitialSplash from "@/components/InitialSplash";

export const metadata: Metadata = {
  metadataBase: new URL("https://athletistry.app"),
  title: "Athletistry",
  description: "Train smarter — programs, workouts, and progress tracking for dancers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Athletistry",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Athletistry",
    description: "Train smarter — programs, workouts, and progress tracking for dancers.",
    url: "https://athletistry.app",
    siteName: "Athletistry",
    images: [{ url: "/og-image.png", width: 1200, height: 1200, alt: "Athletistry" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athletistry",
    description: "Train smarter — programs, workouts, and progress tracking for dancers.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1f2a44",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "#1f2a44" }}>
      <body>
        <InitialSplash />
        {children}
      </body>
    </html>
  );
}

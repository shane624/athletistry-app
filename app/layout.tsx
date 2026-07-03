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

// iOS PWA launch screens (branded navy) so an installed app never launches white.
const SPLASH: { media: string; href: string }[] = [
  { media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", href: "/splash/splash-640x1136.png" },
  { media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", href: "/splash/splash-750x1334.png" },
  { media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1242x2208.png" },
  { media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1125x2436.png" },
  { media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", href: "/splash/splash-828x1792.png" },
  { media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1242x2688.png" },
  { media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1170x2532.png" },
  { media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1284x2778.png" },
  { media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1179x2556.png" },
  { media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", href: "/splash/splash-1290x2796.png" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "#1f2a44" }}>
      <body>
        {SPLASH.map((s) => (
          <link key={s.href} rel="apple-touch-startup-image" media={s.media} href={s.href} />
        ))}
        <InitialSplash />
        {children}
      </body>
    </html>
  );
}

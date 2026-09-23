import type { Metadata, Viewport } from "next";
import { Oswald, DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

// Editorial serif + clean UI sans: ballet publication, not generic fitness SaaS.
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
// Display face matches the landing page / athletistry.au: condensed, bold, uppercase headlines.
const display = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://athletistry.app"),
  title: "Athletistry",
  description: "Ballet training that finally makes sense.",
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
    description: "Ballet training that finally makes sense.",
    url: "https://athletistry.app",
    siteName: "Athletistry",
    images: [{ url: "/og-image.png", width: 1200, height: 1200, alt: "Athletistry" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athletistry",
    description: "Ballet training that finally makes sense.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        {SPLASH.map((s) => (
          <link key={s.href} rel="apple-touch-startup-image" media={s.media} href={s.href} />
        ))}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

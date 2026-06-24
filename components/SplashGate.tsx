"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

// Shows the branded splash for ~5 seconds when the app first opens in a
// session, then reveals the app. Only fires once per browser session (so it
// doesn't replay on every internal navigation).
const HOLD_MS = 5000;

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let seen = false;
    try { seen = sessionStorage.getItem("athl_splash_seen") === "1"; } catch {}
    if (!seen) {
      setShowSplash(true);
      try { sessionStorage.setItem("athl_splash_seen", "1"); } catch {}
    }
  }, []);

  // Avoid a hydration mismatch: render children normally until mounted.
  if (!mounted) return <>{children}</>;

  if (showSplash) {
    return <LoadingScreen holdMs={HOLD_MS} onDone={() => setShowSplash(false)} />;
  }
  return <>{children}</>;
}

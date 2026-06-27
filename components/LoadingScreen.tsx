"use client";

import { useEffect, useState } from "react";

// Branded splash / loading screen. Shows the app icon, a fixed quote, the
// tagline, and a slim progress bar. When used as a timed splash it holds for a
// few seconds then fades out. The quote is intentionally ALWAYS the same so
// returning users already know it and never feel rushed. (The in-app "Daily
// Inspiration" quote rotates separately.)
const SPLASH_QUOTE = {
  text: "Start where you are. Use what you have. Do what you can.",
  author: "Arthur Ashe",
};

export default function LoadingScreen({
  label = "Loading…",
  holdMs,
  onDone,
}: {
  label?: string;
  /** If set, the screen stays visible at least this long, then fades and calls onDone. */
  holdMs?: number;
  onDone?: () => void;
}) {
  const q = SPLASH_QUOTE;
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!holdMs) return;
    const fade = setTimeout(() => setLeaving(true), holdMs - 450);
    const done = setTimeout(() => onDone?.(), holdMs);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, [holdMs, onDone]);

  const barMs = holdMs ? holdMs - 450 : 2200;

  return (
    <main
      className={`min-h-screen grad-navy flex flex-col items-center justify-center px-8 text-center safe-top transition-all duration-500 ease-out ${
        leaving ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"
      }`}
    >
      <div className="splash-pop">
        <img
          src="/icon-192.png"
          alt="Athletistry"
          width={92}
          height={92}
          className="rounded-[22px] shadow-2xl"
        />
      </div>

      <p className="text-teal font-bold tracking-[5px] text-sm mt-6 splash-rise" style={{ animationDelay: ".15s" }}>
        ATHLETISTRY
      </p>

      <p className="text-white/90 text-base leading-relaxed italic mt-7 max-w-xs splash-rise" style={{ animationDelay: ".3s" }}>
        &ldquo;{q.text}&rdquo;
      </p>
      <p className="text-white/50 text-xs mt-2 splash-rise" style={{ animationDelay: ".42s" }}>
        — {q.author}
      </p>

      <div className="mt-9 h-[3px] w-40 rounded-full bg-white/15 overflow-hidden splash-rise" style={{ animationDelay: ".54s" }}>
        <div className="h-full rounded-full bg-teal splash-bar" style={{ animationDuration: `${barMs}ms` }} />
      </div>

      <p className="sr-only">{label}</p>
    </main>
  );
}

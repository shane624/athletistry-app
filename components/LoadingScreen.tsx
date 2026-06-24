"use client";

import { useEffect, useState } from "react";

// Branded splash / loading screen. Shows the app icon, a rotating dancer
// quote, the tagline, and animated dots. When used as a timed splash it
// holds for ~5s (enough to read the quote) then fades out.

const QUOTES: { text: string; author: string }[] = [
  { text: "No one can arrive from being talented alone. Work transforms talent into genius.", author: "Anna Pavlova" },
  { text: "I do not try to dance better than anyone else. I only try to dance better than myself.", author: "Mikhail Baryshnikov" },
  { text: "Great dancers are great because of their passion.", author: "Martha Graham" },
  { text: "Get the basics right and the rest will follow.", author: "Margot Fonteyn" },
  { text: "Technique is what you fall back on when you run out of inspiration.", author: "Rudolf Nureyev" },
  { text: "To follow, without halt, one aim: there is the secret of success.", author: "Anna Pavlova" },
  { text: "The body says what words cannot.", author: "Martha Graham" },
  { text: "You live as long as you dance.", author: "Rudolf Nureyev" },
];

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
  const [q] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!holdMs) return;
    const fade = setTimeout(() => setLeaving(true), holdMs - 500); // start fade 0.5s before end
    const done = setTimeout(() => onDone?.(), holdMs);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, [holdMs, onDone]);

  return (
    <main
      className={`min-h-screen grad-navy flex flex-col items-center justify-center px-8 text-center safe-top transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src="/icon-192.png"
        alt="Athletistry"
        width={88}
        height={88}
        className="rounded-2xl shadow-lg animate-in"
      />
      <p className="text-teal font-bold tracking-[4px] text-sm mt-5">ATHLETISTRY</p>

      <p className="text-white/90 text-base leading-snug italic mt-6 max-w-xs">
        &ldquo;{q.text}&rdquo;
      </p>
      <p className="text-white/55 text-xs mt-2">— {q.author}</p>

      <div className="flex items-center gap-1.5 mt-7 text-white/80">
        <span className="dot-pulse" />
        <span className="dot-pulse" style={{ animationDelay: "0.15s" }} />
        <span className="dot-pulse" style={{ animationDelay: "0.3s" }} />
      </div>

      <p className="text-white/40 text-[11px] tracking-wide mt-8">
        Train smarter. Dance stronger. Practice for many years.
      </p>
      <p className="sr-only">{label}</p>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rest timer used on every program.
 *  • Auto-starts (when `autoStartKey` changes) using the program's prescribed rest.
 *  • Manual override: start/pause, +15s / −15s, and skip.
 * Lives inline under an exercise card.
 */
export default function RestTimer({
  defaultSec,
  autoStartKey,
}: {
  defaultSec: number;
  autoStartKey?: number; // bump this (e.g. after logging a set) to auto-start
}) {
  const [target, setTarget] = useState(Math.max(5, defaultSec || 60));
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const tick = useRef<any>(null);
  const lastKey = useRef<number | undefined>(autoStartKey);

  function clear() { if (tick.current) { clearInterval(tick.current); tick.current = null; } }
  useEffect(() => () => clear(), []);

  function run(from: number) {
    clear();
    setLeft(from);
    setRunning(true);
    tick.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clear();
          setRunning(false);
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([120, 60, 120]);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
  }

  // auto-start when the key changes (a set was just logged)
  useEffect(() => {
    if (autoStartKey != null && autoStartKey !== lastKey.current) {
      lastKey.current = autoStartKey;
      run(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartKey]);

  function toggle() {
    if (running) { clear(); setRunning(false); }
    else run(left > 0 ? left : target);
  }
  function adjust(delta: number) {
    const nt = Math.max(5, target + delta);
    setTarget(nt);
    if (running) setLeft((l) => Math.max(1, l + delta));
  }
  function skip() { clear(); setRunning(false); setLeft(0); }

  const active = running || left > 0;
  return (
    <div className={`mt-2 rounded-lg px-3 py-2 flex items-center gap-2 text-sm border ${active ? "bg-navy text-white border-navy" : "bg-light border-line text-grey"}`}>
      <span className="font-semibold tabular-nums w-14">{active ? `${left}s` : `${target}s`}</span>
      <button onClick={toggle} className={`rounded-md px-2 py-1 text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-teal text-white"}`}>
        {running ? "Pause" : active ? "Resume" : "Start rest"}
      </button>
      <button onClick={() => adjust(-15)} className="rounded-md px-2 py-1 text-xs bg-white/15 text-current border border-current/20">−15</button>
      <button onClick={() => adjust(15)} className="rounded-md px-2 py-1 text-xs bg-white/15 text-current border border-current/20">+15</button>
      {active && <button onClick={skip} className="ml-auto rounded-md px-2 py-1 text-xs underline opacity-80">Skip</button>}
    </div>
  );
}

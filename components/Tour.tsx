"use client";

import { useEffect, useState, useCallback } from "react";

// Interactive coach-mark tour. Highlights real UI elements one at a time with a
// tooltip. Targets are tagged with data-tour="<key>". Replayable: dispatch the
// window event "athl:start-tour" (the TourButton does this) to launch.

export type TourStep = { target: string; title: string; body: string };

type Rect = { top: number; left: number; width: number; height: number };

// Clamp a target's bounding box to the visible viewport so a target taller than
// the screen still produces a sensible spotlight (rather than boxing everything).
function clampToViewport(r: DOMRect): Rect {
  const m = 8; // keep a small margin from the very edges
  const top = Math.max(m, r.top);
  const bottom = Math.min(window.innerHeight - m, r.bottom);
  const left = Math.max(m, r.left);
  const right = Math.min(window.innerWidth - m, r.right);
  return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

export default function Tour({ steps: allSteps }: { steps: TourStep[] }) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>(allSteps);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // read the target's current position (no scrolling) — used by the live
  // scroll/resize listeners so the spotlight tracks the element as the page moves
  const remeasure = useCallback(() => {
    const step = steps[i];
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    setRect(clampToViewport(el.getBoundingClientRect()));
  }, [i, steps]);

  useEffect(() => {
    function start() {
      // only include steps whose target actually exists on this screen
      const present = allSteps.filter((s) => document.querySelector(`[data-tour="${s.target}"]`));
      setSteps(present.length ? present : allSteps);
      setI(0);
      setActive(true);
    }
    window.addEventListener("athl:start-tour", start);
    // auto-start if arrived with ?tour=1 (e.g. from the guide)
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tour") === "1") {
      setTimeout(start, 600);
    }
    return () => window.removeEventListener("athl:start-tour", start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when the step changes: scroll the target into view, then lock onto it once
  // the smooth-scroll has actually settled (poll until the rect stops moving).
  useEffect(() => {
    if (!active) return;
    const step = steps[i];
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    // tall targets: scroll so their TOP is near the top of the screen; otherwise
    // centre them. Either way we clamp the spotlight to the viewport.
    const tall = el.getBoundingClientRect().height > window.innerHeight * 0.8;
    el.scrollIntoView({ behavior: "smooth", block: tall ? "start" : "center" });

    let last = -1, stable = 0, frames = 0;
    const id = window.setInterval(() => {
      const r = el.getBoundingClientRect();
      setRect(clampToViewport(r));
      if (Math.abs(r.top - last) < 1) stable++; else stable = 0;
      last = r.top;
      // stop once the position is steady for a few ticks, or after ~1.5s
      if (stable >= 3 || ++frames > 30) window.clearInterval(id);
    }, 50);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, i, steps]);

  // keep the spotlight glued to the element if the user scrolls or resizes
  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => { window.removeEventListener("resize", remeasure); window.removeEventListener("scroll", remeasure, true); };
  }, [active, remeasure]);

  if (!active) return null;
  const step = steps[i];
  const last = i === steps.length - 1;

  function close() { setActive(false); }
  function next() { if (last) close(); else setI((n) => n + 1); }
  function back() { setI((n) => Math.max(0, n - 1)); }

  // tooltip position: below the target if room, else above
  const pad = 8;
  const tipTop = rect
    ? (rect.top + rect.height + 180 > window.innerHeight && rect.top > 200
        ? rect.top - 12 - 150          // place above
        : rect.top + rect.height + 12) // place below
    : window.innerHeight / 2 - 80;
  const placeAbove = rect ? rect.top + rect.height + 180 > window.innerHeight && rect.top > 200 : false;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="App walkthrough">
      {/* dim overlay with a spotlight hole over the target */}
      <div className="absolute inset-0" style={{ background: "rgba(15,21,31,.72)" }} onClick={close} />
      {rect && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: rect.top - pad, left: rect.left - pad,
            width: rect.width + pad * 2, height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(15,21,31,.72)",
            border: "2px solid #27ae9f", borderRadius: 14,
            transition: "all .25s ease",
          }}
        />
      )}

      {/* tooltip */}
      <div
        className="absolute card p-4 shadow-xl"
        style={{
          top: tipTop,
          left: rect ? Math.min(Math.max(12, rect.left), window.innerWidth - 332) : window.innerWidth / 2 - 160,
          width: 320, maxWidth: "calc(100vw - 24px)",
          transform: placeAbove ? "translateY(-100%)" : "none",
          transition: "all .25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="eyebrow">Step {i + 1} of {steps.length}</p>
          <button onClick={close} className="text-grey text-sm" aria-label="Close walkthrough">Skip</button>
        </div>
        <h3 className="font-bold text-navy mt-1">{step.title}</h3>
        <p className="text-grey text-sm mt-1 leading-snug">{step.body}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            {steps.map((_, n) => (
              <span key={n} className={`w-1.5 h-1.5 rounded-full ${n === i ? "bg-teal" : "bg-line"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && <button onClick={back} className="btn-ghost py-1.5 px-3 text-sm">Back</button>}
            <button onClick={next} className="btn-primary py-1.5 px-4 text-sm">{last ? "Done" : "Next"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

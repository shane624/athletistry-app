"use client";

import { useState } from "react";

// Pre-workout warm-up. Two options are offered; the "Advanced" one is the
// harder progression. Members pick one, watch it, and mark the warm-up done
// before training. Kept on-brand (navy/teal, no emoji).
const WARMUPS = [
  { id: "nftG1M2IJPA", label: "Gentle Warm-Up", tag: "Easier — start here", advanced: false },
  { id: "Nt_zXCLKYc8", label: "Winning Warm-Up", tag: "Harder — level up", advanced: true },
];

export default function WarmUp() {
  const [choice, setChoice] = useState<string>(WARMUPS[0].id);
  const [done, setDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const selected = WARMUPS.find((w) => w.id === choice)!;

  return (
    <div className="card mb-5 p-4 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="eyebrow">Before you train</p>
          <h3 className="text-navy font-extrabold text-lg mt-1">Warm-Up</h3>
        </div>
        <button
          onClick={() => setDone((d) => !d)}
          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
            done ? "bg-teal text-white" : "btn-ghost"
          }`}
        >
          {done ? "✓ Warmed up" : "Mark complete"}
        </button>
      </div>

      <p className="text-grey text-sm mt-2">
        Complete one warm-up before your exercises. The Winning Warm-Up is harder — work up to it.
      </p>

      {/* option toggle */}
      <div className="flex gap-2 mt-3">
        {WARMUPS.map((w) => (
          <button
            key={w.id}
            onClick={() => { setChoice(w.id); setPlaying(false); }}
            className={`flex-1 text-left rounded-xl border p-3 transition ${
              choice === w.id ? "border-teal bg-light" : "border-line hover:border-teal"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-navy text-sm">{w.label}</span>
              {w.advanced && (
                <span className="badge bg-navy text-white text-[11px]">Advanced</span>
              )}
            </div>
            <span className="text-grey text-xs">{w.tag}</span>
          </button>
        ))}
      </div>

      {/* video — poster first, load the embed on tap (reliable on mobile) */}
      <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-black">
        {playing ? (
          <iframe
            key={selected.id}
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${selected.id}?rel=0&playsinline=1&autoplay=1`}
            title={`${selected.label} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${selected.label}`}
            className="group relative block w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${selected.id}/hqdefault.jpg`}
              alt={`${selected.label} preview`}
              className="w-full h-full object-cover"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal text-white shadow-lg transition group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>

      <p className="text-grey text-xs mt-2">
        {!done
          ? "Tip: warming up first reduces injury risk and helps you move better in your working sets. "
          : ""}
        <a href="/warmups" className="text-teal font-medium">All warm-ups →</a>
      </p>
    </div>
  );
}

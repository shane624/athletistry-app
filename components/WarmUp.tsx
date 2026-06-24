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
            onClick={() => setChoice(w.id)}
            className={`flex-1 text-left rounded-xl border p-3 transition ${
              choice === w.id ? "border-teal bg-light" : "border-line hover:border-teal"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-navy text-sm">{w.label}</span>
              {w.advanced && (
                <span className="badge bg-navy text-white text-[10px]">Advanced</span>
              )}
            </div>
            <span className="text-grey text-xs">{w.tag}</span>
          </button>
        ))}
      </div>

      {/* video */}
      <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          key={selected.id}
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${selected.id}?rel=0&playsinline=1`}
          title={`${selected.label} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
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

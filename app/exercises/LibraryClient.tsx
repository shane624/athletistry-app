"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";

export default function LibraryClient({ exercises }: { exercises: ExerciseRow[] }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<number | "">("");
  const [open, setOpen] = useState<number | null>(null);
  const [focusId, setFocusId] = useState<number | null>(null);

  // deep link from global search: /exercises?focus=<id> → scroll to, highlight,
  // and open that exercise's video.
  useEffect(() => {
    const f = Number(new URLSearchParams(window.location.search).get("focus"));
    if (f && exercises.some((e) => e.id === f)) {
      setFocusId(f);
      setOpen(f);
      // wait a tick for the card to render, then scroll to it
      setTimeout(() => {
        document.getElementById(`ex-${f}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      // clear the highlight after a few seconds
      const t = setTimeout(() => setFocusId(null), 3500);
      return () => clearTimeout(t);
    }
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchQ = e.name.toLowerCase().includes(q.toLowerCase());
      const matchL = level === "" || e.level === level;
      return matchQ && matchL;
    });
  }, [exercises, q, level]);

  return (
    <div className="mt-4">
      <div className="flex gap-2 flex-wrap">
        <input className="input max-w-xs" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[10rem]" value={level} onChange={(e) => setLevel(e.target.value === "" ? "" : Number(e.target.value))}>
          <option value="">All levels</option>
          {[1, 2, 3, 4].map((l) => <option key={l} value={l}>Level {l}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {filtered.map((e) => (
          <div key={e.id} id={`ex-${e.id}`}
            className={`card p-3 transition-shadow duration-500 ${
              focusId === e.id ? "ring-2 ring-teal shadow-lg" : ""
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-navy">{e.name}</p>
                <p className="text-xs text-grey">Level {e.level} · {e.category}</p>
              </div>
              <button className="btn-ghost text-sm" onClick={() => setOpen(open === e.id ? null : e.id)}>
                {open === e.id ? "Hide" : "Watch ▸"}
              </button>
            </div>
            {open === e.id && (
              <div className="mt-3">
                <ExerciseVideo cloudinaryId={e.cloudinary_id} youtubeId={e.youtube_id} title={e.name} />
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-grey mt-6">No matches.</p>}
    </div>
  );
}

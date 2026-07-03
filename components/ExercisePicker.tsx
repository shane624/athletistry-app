"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ExerciseRow } from "@/lib/types";

const CLOUD_NAME = "dsbtk5hpq";

// small poster thumbnail for a row (Cloudinary frame, else YouTube, else blank)
function thumb(e: ExerciseRow): string | null {
  if (e.cloudinary_id) return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_1,w_120,h_120,c_fill,g_auto/${e.cloudinary_id}.jpg`;
  if (e.youtube_id) return `https://i.ytimg.com/vi/${e.youtube_id}/default.jpg`;
  return null;
}

const RECENT_KEY = "athl_recent_ex";
function readRecent(): number[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
export function pushRecent(id: number) {
  try {
    const cur = readRecent().filter((x) => x !== id);
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...cur].slice(0, 40)));
  } catch {}
}

type Mode = "az" | "body" | "recent";

/**
 * Rich exercise picker — search, Alphabetical / Body Part / Recent tabs, an A–Z
 * fast-scroll rail, thumbnails and multi-select. Tapping a row toggles it.
 */
export default function ExercisePicker({
  allExercises, chosen, onToggle,
}: {
  allExercises: ExerciseRow[];
  chosen: Set<number>;
  onToggle: (id: number) => void;
}) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("az");
  const [recent, setRecent] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRecent(readRecent()); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allExercises.filter((e) => e.name.toLowerCase().includes(needle));
  }, [allExercises, q]);

  // group into sections depending on mode
  const sections = useMemo(() => {
    if (mode === "recent") {
      const byId = new Map(allExercises.map((e) => [e.id, e]));
      const rows = recent.map((id) => byId.get(id)).filter((e): e is ExerciseRow => !!e)
        .filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase()));
      return rows.length ? [{ key: "Recently used", rows }] : [];
    }
    const groups = new Map<string, ExerciseRow[]>();
    for (const e of filtered) {
      const key = mode === "az" ? e.name[0].toUpperCase() : (e.category || "Other");
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(e);
    }
    const keys = [...groups.keys()].sort();
    return keys.map((k) => ({ key: k, rows: groups.get(k)!.sort((a, b) => a.name.localeCompare(b.name)) }));
  }, [mode, filtered, recent, allExercises, q]);

  const letters = mode === "az" ? sections.map((s) => s.key) : [];

  function jumpTo(letter: string) {
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-sec="${letter}"]`);
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function toggle(id: number) {
    if (!chosen.has(id)) pushRecent(id);
    onToggle(id);
  }

  return (
    <div>
      <input className="input" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />

      {/* mode tabs */}
      <div className="flex gap-1.5 mt-3">
        {([["az", "A–Z"], ["body", "Body part"], ["recent", "Recent"]] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1.5 text-sm border ${mode === m ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <div ref={scrollRef} className="max-h-96 overflow-y-auto pr-5">
          {sections.length === 0 && (
            <p className="text-grey text-sm py-6 text-center">
              {mode === "recent" ? "No recent exercises yet — add some and they'll show here." : "No exercises match."}
            </p>
          )}
          {sections.map((sec) => (
            <div key={sec.key} data-sec={sec.key}>
              <p className="sticky top-0 bg-surface/95 backdrop-blur text-[11px] font-bold uppercase tracking-wide text-grey py-1.5 z-[1]">{sec.key}</p>
              {sec.rows.map((e) => {
                const on = chosen.has(e.id);
                const t = thumb(e);
                return (
                  <button key={e.id} onClick={() => toggle(e.id)}
                    className="w-full flex items-center gap-3 py-2 border-b border-line text-left">
                    <span className="w-11 h-11 rounded-lg bg-black/5 overflow-hidden shrink-0">
                      {t && <img src={t} alt="" className="w-full h-full object-cover" loading="lazy" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-navy truncate">{e.name}</span>
                      <span className="block text-xs text-grey">L{e.level} · {e.category}</span>
                    </span>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${on ? "bg-teal border-teal text-white" : "border-line text-transparent"}`}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* A–Z fast-scroll rail */}
        {letters.length > 3 && (
          <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-0.5 py-1">
            {letters.map((l) => (
              <button key={l} onClick={() => jumpTo(l)}
                className="text-[11px] leading-none text-grey hover:text-teal font-semibold w-4 text-center">
                {l}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

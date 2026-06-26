"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateBalletWorkout, saveCustomDay, setActiveProgram, markOnboarded } from "@/lib/data";
import { BALLET_MOVES } from "@/lib/ballet";
import { EQUIPMENT_LABEL, type Equipment } from "@/lib/equipment";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import Dots from "@/components/Dots";

const LEVELS = [
  { v: 1, label: "Beginner" },
  { v: 2, label: "Intermediate" },
  { v: 3, label: "Advanced" },
  { v: 4, label: "All levels" },
];

// equipment a traveller / home dancer might have
const EQUIP: Equipment[] = ["band", "dumbbell", "barbell", "slant_board", "step", "partner"];

export default function BalletClient() {
  const router = useRouter();
  const [slug, setSlug] = useState(BALLET_MOVES[0].slug);
  const [maxLevel, setMaxLevel] = useState(4);

  // deep link: /ballet?move=fondu pre-selects that move (from global search)
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("move");
    if (m && BALLET_MOVES.some((x) => x.slug === m)) setSlug(m);
  }, []);
  const [equipOpen, setEquipOpen] = useState(false);
  // which equipment the dancer HAS (empty = no filter, show everything)
  const [equip, setEquip] = useState<Set<Equipment>>(new Set());
  const [result, setResult] = useState<{ move: string; focus: string; exercises: ExerciseRow[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const move = BALLET_MOVES.find((m) => m.slug === slug)!;

  const build = useCallback(async () => {
    setBusy(true); setSavedMsg(null);
    const w = await generateBalletWorkout(slug, {
      maxLevel,
      equipment: equip.size ? [...equip] : undefined,
    });
    setResult(w);
    setBusy(false);
  }, [slug, maxLevel, equip]);

  // auto-build whenever the move / level / equipment changes — so tapping any
  // move instantly shows its exercises (no separate "build" step needed).
  useEffect(() => { build(); }, [build]);

  function toggleEquip(e: Equipment) {
    setEquip((prev) => {
      const next = new Set(prev);
      next.has(e) ? next.delete(e) : next.add(e);
      return next;
    });
  }

  async function useAsRoutine() {
    if (!result || !result.exercises.length) return;
    setBusy(true);
    const ids = result.exercises.map((e) => e.id);
    const r = await saveCustomDay(0, ids);
    if (r.ok) {
      await setActiveProgram("custom");
      await markOnboarded();
      setSavedMsg("Loading your workout…");
      router.push("/dashboard");
      router.refresh();
    } else {
      setSavedMsg("Couldn't load that. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      {/* move picker */}
      <p className="eyebrow mb-2">Pick a move</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {BALLET_MOVES.map((m) => (
          <button
            key={m.slug}
            onClick={() => { setSlug(m.slug); setSavedMsg(null); }}
            className={`text-center card card-hover p-3 border-2 transition ${
              slug === m.slug ? "border-teal bg-light" : "border-line hover:border-teal"
            }`}
          >
            <div className="font-bold text-navy text-sm">{m.name}</div>
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-4 mt-4 items-end">
        <div>
          <p className="text-sm font-medium text-navy">Level</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {LEVELS.map((l) => (
              <button key={l.v} onClick={() => setMaxLevel(l.v)}
                className={`rounded-full px-3 py-1.5 text-sm border ${maxLevel === l.v ? "bg-teal text-white border-teal" : "bg-white border-line"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setEquipOpen((v) => !v)}
          className="text-sm text-teal font-semibold">
          {equip.size ? `Equipment: ${equip.size} selected` : "Filter by equipment"} {equipOpen ? "▴" : "▾"}
        </button>
      </div>

      {equipOpen && (
        <div className="card mt-3 p-4">
          <p className="text-sm text-grey">Select what you have. Bodyweight exercises always show. Leave empty to see everything.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {EQUIP.map((e) => (
              <button key={e} onClick={() => toggleEquip(e)}
                className={`rounded-full px-3 py-1.5 text-sm border ${equip.has(e) ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>
                {EQUIPMENT_LABEL[e]}
              </button>
            ))}
          </div>
          {equip.size > 0 && (
            <button className="text-teal text-sm mt-3 font-semibold" onClick={() => setEquip(new Set())}>Clear equipment</button>
          )}
        </div>
      )}

      {/* why */}
      <div className="card mt-4 p-4 border-l-2 border-teal">
        <p className="eyebrow">{move.name} — what to build</p>
        <p className="text-grey text-sm mt-2">{move.why}</p>
      </div>

      {/* result */}
      <div className="mt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="eyebrow">
            {busy ? "Building…" : `${move.name} workout · ${result?.exercises.length ?? 0} exercises`}
          </p>
          {result && result.exercises.length > 0 && !busy && (
            <button className="text-teal text-sm font-semibold" onClick={useAsRoutine}>
              Use as today&apos;s workout →
            </button>
          )}
        </div>
        {savedMsg && <p className="text-grey text-sm mt-2">{savedMsg}</p>}

        {busy ? (
          <div className="py-10 flex justify-center text-navy"><Dots /></div>
        ) : result && result.exercises.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            {result.exercises.map((ex) => (
              <div key={ex.id} className="card card-hover p-4">
                <h3 className="font-semibold text-navy">{ex.name}</h3>
                <p className="text-xs text-grey mt-0.5">Level {ex.level} · {ex.category}</p>
                <div className="mt-3">
                  {openVid === ex.id ? (
                    <ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} />
                  ) : (
                    <button className="btn-ghost text-sm" onClick={() => setOpenVid(ex.id)}>Watch ▸</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-grey text-sm mt-3">
            No exercises match those filters. Try a higher level or fewer equipment limits.
          </p>
        )}
      </div>
    </div>
  );
}

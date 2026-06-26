"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateBalletWorkout, saveCustomDay, setActiveProgram, markOnboarded } from "@/lib/data";
import { BALLET_MOVES } from "@/lib/ballet";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import Dots from "@/components/Dots";

export default function BalletClient() {
  const router = useRouter();
  const [slug, setSlug] = useState(BALLET_MOVES[0].slug);
  const [result, setResult] = useState<{ move: string; focus: string; exercises: ExerciseRow[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const move = BALLET_MOVES.find((m) => m.slug === slug)!;

  async function build() {
    setBusy(true); setSavedMsg(null);
    const w = await generateBalletWorkout(slug);
    setResult(w);
    setBusy(false);
  }

  async function useAsRoutine() {
    if (!result) return;
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
      <div className="grid sm:grid-cols-2 gap-3">
        {BALLET_MOVES.map((m) => (
          <button
            key={m.slug}
            onClick={() => { setSlug(m.slug); setResult(null); setSavedMsg(null); }}
            className={`text-left card card-hover p-4 border-2 transition ${
              slug === m.slug ? "border-teal bg-light" : "border-line hover:border-teal"
            }`}
          >
            <div className="font-extrabold text-navy">{m.name}</div>
            <div className="text-grey text-xs mt-1">{m.focus}</div>
          </button>
        ))}
      </div>

      {/* why + generate */}
      <div className="card mt-4 p-4">
        <p className="eyebrow">{move.name} — what to build</p>
        <p className="text-grey text-sm mt-2">{move.why}</p>
        <button className="btn-primary mt-4" onClick={build} disabled={busy}>
          {busy ? <Dots /> : result ? "Rebuild workout" : `Build my ${move.name} workout`}
        </button>
      </div>

      {/* result */}
      {result && (
        <div className="mt-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="eyebrow">{result.move} workout · {result.exercises.length} exercises</p>
            <button className="text-teal text-sm font-semibold" onClick={useAsRoutine} disabled={busy}>
              Use as today&apos;s workout →
            </button>
          </div>
          {savedMsg && <p className="text-grey text-sm mt-2">{savedMsg}</p>}

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

          {result.exercises.length === 0 && (
            <p className="text-grey text-sm mt-3">No exercises found for that move yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

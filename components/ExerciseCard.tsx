"use client";

import { useState } from "react";
import { logSet } from "@/lib/data";
import type { Prescription } from "@/lib/program";

interface Props {
  exercise: { id: number; name: string; youtube_id: string; level: number; category: string };
  rx: Prescription;
  week: number;
  dayIndex: number;
  initialLogs: Record<number, { weight: number; reps: number }>;
}

export default function ExerciseCard({ exercise, rx, week, dayIndex, initialLogs }: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const sets = Array.from({ length: rx.sets }, (_, i) => i + 1);
  const [vals, setVals] = useState<Record<number, { weight: string; reps: string }>>(() => {
    const init: Record<number, { weight: string; reps: string }> = {};
    for (const s of sets) {
      init[s] = {
        weight: initialLogs[s]?.weight != null ? String(initialLogs[s].weight) : "",
        reps: initialLogs[s]?.reps != null ? String(initialLogs[s].reps) : "",
      };
    }
    return init;
  });
  const [saved, setSaved] = useState<Record<number, "idle" | "saving" | "ok">>({});

  async function save(setNumber: number) {
    setSaved((s) => ({ ...s, [setNumber]: "saving" }));
    const res = await logSet({
      exerciseId: exercise.id,
      week,
      dayIndex,
      setNumber,
      weight: parseFloat(vals[setNumber].weight || "0"),
      reps: parseInt(vals[setNumber].reps || "0"),
    });
    setSaved((s) => ({ ...s, [setNumber]: res.ok ? "ok" : "idle" }));
    if (res.ok) setTimeout(() => setSaved((s) => ({ ...s, [setNumber]: "idle" })), 1200);
  }

  // double-progression cue
  const topReps = sets.filter((s) => parseInt(vals[s].reps || "0") >= rx.repHigh).length;
  const hint =
    rx.block === "hypertrophy" && topReps >= 2
      ? `You hit ${rx.repHigh}+ reps on ${topReps} sets — bump the weight next week.`
      : rx.block === "strength" && topReps >= rx.sets
      ? `All sets at ${rx.repHigh} reps — add load next session.`
      : null;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy">{exercise.name}</h3>
          <p className="text-xs text-grey mt-0.5">
            Level {exercise.level} · {exercise.category} · Target {rx.sets} × {rx.repLow}–{rx.repHigh}
            {rx.tempo !== "smooth" ? ` · tempo ${rx.tempo}` : ""}
          </p>
        </div>
        <button className="btn-ghost text-sm shrink-0" onClick={() => setShowVideo((v) => !v)}>
          {showVideo ? "Hide video" : "Watch ▸"}
        </button>
      </div>

      {showVideo && (
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${exercise.youtube_id}`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="mt-3 space-y-2">
        {sets.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="w-12 text-sm text-grey">Set {s}</span>
            <input
              className="input py-1.5 w-24"
              inputMode="decimal"
              placeholder="kg"
              value={vals[s].weight}
              onChange={(e) => setVals((v) => ({ ...v, [s]: { ...v[s], weight: e.target.value } }))}
            />
            <span className="text-grey">×</span>
            <input
              className="input py-1.5 w-20"
              inputMode="numeric"
              placeholder="reps"
              value={vals[s].reps}
              onChange={(e) => setVals((v) => ({ ...v, [s]: { ...v[s], reps: e.target.value } }))}
            />
            <button className="btn-primary py-1.5 text-sm" onClick={() => save(s)}>
              {saved[s] === "saving" ? "…" : saved[s] === "ok" ? "✓" : "Save"}
            </button>
          </div>
        ))}
      </div>

      {hint && (
        <p className="mt-3 text-sm text-tealdark bg-light rounded-md px-3 py-2">{hint}</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { logSet } from "@/lib/data";
import type { ResolvedRx } from "@/lib/program";

interface Props {
  exercise: { id: number; name: string; youtube_id: string; level: number; category: string };
  rx: ResolvedRx;
  programId: string;
  week: number;
  dayIndex: number;
  timed?: boolean;
  initialLogs: Record<number, { weight: number; reps: number }>;
}

export default function ExerciseCard({ exercise, rx, programId, week, dayIndex, timed, initialLogs }: Props) {
  const [showVideo, setShowVideo] = useState(false);

  // ---------- timed mode (kids): work timer + done check, no weights ----------
  if (timed) {
    return <TimedCard exercise={exercise} rx={rx} programId={programId} week={week} dayIndex={dayIndex} initialDone={!!initialLogs[1]} showVideo={showVideo} setShowVideo={setShowVideo} />;
  }

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
      programId, exerciseId: exercise.id, week, dayIndex, setNumber,
      weight: parseFloat(vals[setNumber].weight || "0"),
      reps: parseInt(vals[setNumber].reps || "0"),
    });
    setSaved((s) => ({ ...s, [setNumber]: res.ok ? "ok" : "idle" }));
    if (res.ok) setTimeout(() => setSaved((s) => ({ ...s, [setNumber]: "idle" })), 1200);
  }

  const topReps = sets.filter((s) => parseInt(vals[s].reps || "0") >= rx.repHigh).length;
  const hint =
    rx.block === "hypertrophy" && topReps >= 2 ? `You hit ${rx.repHigh}+ reps on ${topReps} sets — bump the weight next time.`
    : rx.block === "strength" && topReps >= rx.sets ? `All sets at ${rx.repHigh} reps — add load next session.`
    : rx.block === "ballet" && topReps >= 2 ? `Reps feel easy — focus on a fuller range of motion before adding load.`
    : null;

  return (
    <div className="card p-4">
      <CardHeader exercise={exercise} rx={rx} showVideo={showVideo} setShowVideo={setShowVideo} />
      {showVideo && <VideoEmbed yid={exercise.youtube_id} name={exercise.name} />}

      <div className="mt-3 space-y-2">
        {sets.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="w-12 text-sm text-grey">Set {s}</span>
            <input className="input py-1.5 w-24" inputMode="decimal" placeholder="kg"
              value={vals[s].weight}
              onChange={(e) => setVals((v) => ({ ...v, [s]: { ...v[s], weight: e.target.value } }))} />
            <span className="text-grey">×</span>
            <input className="input py-1.5 w-20" inputMode="numeric" placeholder="reps"
              value={vals[s].reps}
              onChange={(e) => setVals((v) => ({ ...v, [s]: { ...v[s], reps: e.target.value } }))} />
            <button className="btn-primary py-1.5 text-sm" onClick={() => save(s)}>
              {saved[s] === "saving" ? "…" : saved[s] === "ok" ? "✓" : "Save"}
            </button>
          </div>
        ))}
      </div>

      {hint && <p className="mt-3 text-sm text-tealdark bg-light rounded-md px-3 py-2">{hint}</p>}
    </div>
  );
}

function CardHeader({ exercise, rx, showVideo, setShowVideo }: any) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-navy">{exercise.name}</h3>
        <p className="text-xs text-grey mt-0.5">
          Level {exercise.level} · {exercise.category} · Target {rx.sets} × {rx.repLow}–{rx.repHigh}
          {rx.tempo !== "smooth" ? ` · tempo ${rx.tempo}` : ""}
        </p>
      </div>
      <button className="btn-ghost text-sm shrink-0" onClick={() => setShowVideo((v: boolean) => !v)}>
        {showVideo ? "Hide video" : "Watch ▸"}
      </button>
    </div>
  );
}

function VideoEmbed({ yid, name }: { yid: string; name: string }) {
  return (
    <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${yid}?rel=0&playsinline=1`}
        title={name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function TimedCard({ exercise, rx, programId, week, dayIndex, initialDone, showVideo, setShowVideo }: any) {
  const work = rx.workSec ?? 30;
  const [left, setLeft] = useState<number | null>(null);
  const [done, setDone] = useState<boolean>(initialDone);
  const timer = useRef<any>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function start() {
    if (timer.current) clearInterval(timer.current);
    let t = work;
    setLeft(t);
    timer.current = setInterval(() => {
      t -= 1;
      if (t <= 0) { clearInterval(timer.current); setLeft(0); if (navigator.vibrate) navigator.vibrate([120, 60, 120]); }
      else setLeft(t);
    }, 1000);
  }

  async function toggleDone() {
    const nd = !done;
    setDone(nd);
    await logSet({ programId, exerciseId: exercise.id, week, dayIndex, setNumber: 1, weight: 0, reps: nd ? 1 : 0 });
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy">{exercise.name}</h3>
          <p className="text-xs text-grey mt-0.5">Do it for {work} seconds · {rx.sets} rounds</p>
        </div>
        <button className="btn-ghost text-sm shrink-0" onClick={() => setShowVideo((v: boolean) => !v)}>
          {showVideo ? "Hide video" : "Watch ▸"}
        </button>
      </div>
      {showVideo && <VideoEmbed yid={exercise.youtube_id} name={exercise.name} />}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <button className="btn-primary py-2" onClick={start}>▶ Start {work}s</button>
        <span className="text-2xl font-extrabold text-teal">
          {left === null ? "" : left === 0 ? "Great job! 🎉" : `${left}s`}
        </span>
        <button className={`${done ? "btn-primary" : "btn-ghost"} py-2`} onClick={toggleDone}>
          {done ? "✓ Done" : "Mark done"}
        </button>
      </div>
    </div>
  );
}

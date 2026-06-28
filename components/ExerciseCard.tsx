"use client";

import { useEffect, useRef, useState } from "react";
import { logSet } from "@/lib/data";
import type { ResolvedRx } from "@/lib/program";
import { isHoldExercise, holdSeconds } from "@/lib/program";
import ExerciseVideo from "@/components/ExerciseVideo";
import RestTimer from "@/components/RestTimer";
import Dots from "@/components/Dots";

interface Props {
  exercise: { id: number; name: string; youtube_id: string; cloudinary_id?: string | null; level: number; category: string };
  rx: ResolvedRx;
  programId: string;
  week: number;
  dayIndex: number;
  timed?: boolean;
  initialLogs: Record<number, { weight: number; reps: number }>;
  /** Most recent log of this exercise from an earlier session (for pre-fill). */
  lastLog?: { weight: number; reps: number };
}

export default function ExerciseCard({ exercise, rx, programId, week, dayIndex, timed, initialLogs, lastLog }: Props) {
  // ---------- timed mode (kids): work timer + done check, no weights ----------
  if (timed) {
    return <TimedCard exercise={exercise} rx={rx} programId={programId} week={week} dayIndex={dayIndex} initialDone={!!initialLogs[1]} />;
  }

  // ---------- isometric / hold exercises: per-set hold timer, logs seconds ----------
  if (isHoldExercise(exercise.name)) {
    return <HoldCard exercise={exercise} rx={rx} programId={programId} week={week} dayIndex={dayIndex} initialLogs={initialLogs} />;
  }

  const sets = Array.from({ length: rx.sets }, (_, i) => i + 1);
  // pre-fill: today's log if present, else last session's weight/reps (so the
  // dancer just confirms instead of typing).
  const preW = lastLog?.weight != null ? String(lastLog.weight) : "";
  const preR = lastLog?.reps != null ? String(lastLog.reps) : "";
  const [vals, setVals] = useState<Record<number, { weight: string; reps: string }>>(() => {
    const init: Record<number, { weight: string; reps: string }> = {};
    for (const s of sets) {
      init[s] = {
        weight: initialLogs[s]?.weight != null ? String(initialLogs[s].weight) : preW,
        reps: initialLogs[s]?.reps != null ? String(initialLogs[s].reps) : preR,
      };
    }
    return init;
  });
  const [saved, setSaved] = useState<Record<number, "idle" | "saving" | "ok">>({});
  const [restKey, setRestKey] = useState(0); // bump to auto-start the rest timer

  async function save(setNumber: number) {
    setSaved((s) => ({ ...s, [setNumber]: "saving" }));
    const res = await logSet({
      programId, exerciseId: exercise.id, week, dayIndex, setNumber,
      weight: parseFloat(vals[setNumber].weight || "0"),
      reps: parseInt(vals[setNumber].reps || "0"),
    });
    setSaved((s) => ({ ...s, [setNumber]: res.ok ? "ok" : "idle" }));
    if (res.ok) {
      setRestKey((k) => k + 1); // auto-start rest between sets
      setTimeout(() => setSaved((s) => ({ ...s, [setNumber]: "idle" })), 1200);
    }
  }

  // ONE-TAP: log every set at once. Uses each set's own value if entered,
  // otherwise fills from set 1 (the common "same weight across sets" case).
  const [allBusy, setAllBusy] = useState(false);
  async function logAll() {
    const w1 = vals[1]?.weight ?? "";
    const r1 = vals[1]?.reps ?? "";
    setAllBusy(true);
    const next = { ...vals };
    for (const s of sets) {
      const weight = (next[s].weight || w1);
      const reps = (next[s].reps || r1);
      next[s] = { weight, reps };
      setSaved((st) => ({ ...st, [s]: "saving" }));
      await logSet({
        programId, exerciseId: exercise.id, week, dayIndex, setNumber: s,
        weight: parseFloat(weight || "0"), reps: parseInt(reps || "0"),
      });
      setSaved((st) => ({ ...st, [s]: "ok" }));
    }
    setVals(next);          // reflect the filled-in values in the inputs
    setAllBusy(false);
    setRestKey((k) => k + 1);
  }
  const canLogAll = (vals[1]?.reps || "").trim() !== ""; // need at least set-1 reps

  const topReps = sets.filter((s) => parseInt(vals[s].reps || "0") >= rx.repHigh).length;
  const hint =
    rx.block === "hypertrophy" && topReps >= 2 ? `You hit ${rx.repHigh}+ reps on ${topReps} sets — bump the weight next time.`
    : rx.block === "strength" && topReps >= rx.sets ? `All sets at ${rx.repHigh} reps — add load next session.`
    : rx.block === "ballet" && topReps >= 2 ? `Reps feel easy — focus on a fuller range of motion before adding load.`
    : null;

  return (
    <div className="card card-hover p-4 animate-in">
      <CardHeader exercise={exercise} rx={rx} />
      <div className="mt-3"><VideoEmbed exercise={exercise} /></div>

      {lastLog && !initialLogs[1] && (
        <p className="text-grey text-xs mt-2">
          Last time: <b className="text-navy">{lastLog.weight ? `${lastLog.weight}kg × ` : ""}{lastLog.reps} reps</b> — pre-filled, just confirm or adjust.
        </p>
      )}

      <OneTapLog
        sets={sets}
        vals={vals}
        setVals={setVals}
        saved={saved}
        save={save}
        logAll={logAll}
        allBusy={allBusy}
        canLogAll={canLogAll}
      />

      <RestTimer defaultSec={rx.restSec ?? 60} autoStartKey={restKey} />

      {hint && <p className="mt-3 text-sm text-tealdark bg-light rounded-md px-3 py-2">{hint}</p>}
    </div>
  );
}

// One-tap logging: enter set 1, tap "Log all sets". Individual sets are tucked
// behind a toggle for the rare case where they differ.
function OneTapLog({ sets, vals, setVals, saved, save, logAll, allBusy, canLogAll }: {
  sets: number[];
  vals: Record<number, { weight: string; reps: string }>;
  setVals: React.Dispatch<React.SetStateAction<Record<number, { weight: string; reps: string }>>>;
  saved: Record<number, "idle" | "saving" | "ok">;
  save: (n: number) => void;
  logAll: () => void;
  allBusy: boolean;
  canLogAll: boolean;
}) {
  const [showEach, setShowEach] = useState(false);
  const allDone = sets.every((s) => saved[s] === "ok");

  return (
    <div className="mt-3">
      {/* primary: set 1 + one-tap "log all" */}
      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-sm text-grey">{sets.length} sets ×</span>
        <input className="input py-1.5 flex-1 min-w-0" inputMode="decimal" placeholder="kg"
          value={vals[1].weight}
          onChange={(e) => setVals((v) => ({ ...v, 1: { ...v[1], weight: e.target.value } }))} />
        <span className="text-grey shrink-0">×</span>
        <input className="input py-1.5 flex-1 min-w-0" inputMode="numeric" placeholder="reps"
          value={vals[1].reps}
          onChange={(e) => setVals((v) => ({ ...v, 1: { ...v[1], reps: e.target.value } }))} />
      </div>

      <button
        className="btn-primary w-full mt-2 py-2 disabled:opacity-50"
        onClick={logAll}
        disabled={!canLogAll || allBusy}
      >
        {allBusy ? <Dots /> : allDone ? "✓ All sets logged" : `Log all ${sets.length} sets`}
      </button>

      {/* secondary: per-set entry, only when they differ */}
      {sets.length > 1 && (
        <button onClick={() => setShowEach((v) => !v)} className="text-teal text-xs font-semibold mt-2">
          {showEach ? "Hide individual sets" : "Sets weren’t the same? Log each →"}
        </button>
      )}

      {showEach && (
        <div className="mt-2 space-y-2">
          {sets.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="w-11 shrink-0 text-sm text-grey">Set {s}</span>
              <input className="input py-1.5 flex-1 min-w-0" inputMode="decimal" placeholder="kg"
                value={vals[s].weight}
                onChange={(e) => setVals((v) => ({ ...v, [s]: { ...v[s], weight: e.target.value } }))} />
              <span className="text-grey shrink-0">×</span>
              <input className="input py-1.5 flex-1 min-w-0" inputMode="numeric" placeholder="reps"
                value={vals[s].reps}
                onChange={(e) => setVals((v) => ({ ...v, [s]: { ...v[s], reps: e.target.value } }))} />
              <button className="btn-primary py-1.5 text-sm shrink-0" onClick={() => save(s)}>
                {saved[s] === "saving" ? <Dots /> : saved[s] === "ok" ? "✓" : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardHeader({ exercise, rx }: any) {
  return (
    <div>
      <h3 className="font-semibold text-navy">{exercise.name}</h3>
      <p className="text-xs text-grey mt-0.5">
        Level {exercise.level} · {exercise.category} · Target {rx.sets} × {rx.repLow}–{rx.repHigh}
        {rx.tempo !== "smooth" ? ` · tempo ${rx.tempo}` : ""}
      </p>
    </div>
  );
}

function VideoEmbed({ exercise }: { exercise: { youtube_id: string; cloudinary_id?: string | null; name: string } }) {
  return <ExerciseVideo cloudinaryId={exercise.cloudinary_id} youtubeId={exercise.youtube_id} title={exercise.name} />;
}

/** Isometric / hold exercise: each set is a hold timed in seconds. We log the
 *  seconds achieved (stored in `reps`, weight 0) so it still counts toward
 *  tracking and achievements. A live count-up timer runs against a target. */
function HoldCard({ exercise, rx, programId, week, dayIndex, initialLogs }: any) {
  const target = holdSeconds(exercise.name);
  const sets: number[] = Array.from({ length: rx.sets }, (_, i) => i + 1);

  // seconds logged per set (reps field holds seconds)
  const [secs, setSecs] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    for (const s of sets) init[s] = initialLogs[s]?.reps != null ? String(initialLogs[s].reps) : "";
    return init;
  });
  const [saved, setSaved] = useState<Record<number, "idle" | "saving" | "ok">>({});
  const [activeSet, setActiveSet] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [restKey, setRestKey] = useState(0);
  const timer = useRef<any>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function startHold(setNumber: number) {
    if (timer.current) clearInterval(timer.current);
    setActiveSet(setNumber);
    setElapsed(0);
    timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  async function stopHold() {
    if (timer.current) clearInterval(timer.current);
    const setNumber = activeSet!;
    const held = elapsed;
    setActiveSet(null);
    setElapsed(0);
    if (navigator.vibrate) navigator.vibrate(60);
    setSecs((v) => ({ ...v, [setNumber]: String(held) }));
    await save(setNumber, held);
  }

  async function save(setNumber: number, seconds?: number) {
    const value = seconds != null ? seconds : parseInt(secs[setNumber] || "0");
    setSaved((s) => ({ ...s, [setNumber]: "saving" }));
    const res = await logSet({
      programId, exerciseId: exercise.id, week, dayIndex, setNumber,
      weight: 0, reps: value,
    });
    setSaved((s) => ({ ...s, [setNumber]: res.ok ? "ok" : "idle" }));
    if (res.ok) {
      setRestKey((k) => k + 1);
      setTimeout(() => setSaved((s) => ({ ...s, [setNumber]: "idle" })), 1200);
    }
  }

  return (
    <div className="card card-hover p-4 animate-in">
      <div>
        <h3 className="font-semibold text-navy">{exercise.name}</h3>
        <p className="text-xs text-grey mt-0.5">
          Hold · Level {exercise.level} · {exercise.category} · Target {rx.sets} × {target}s hold
        </p>
      </div>
      <div className="mt-3"><VideoEmbed exercise={exercise} /></div>

      {/* live timer */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {activeSet === null ? (
          <span className="text-grey text-sm">Tap a set below to start its hold timer.</span>
        ) : (
          <>
            <span className={`text-3xl font-extrabold tabular-nums ${elapsed >= target ? "text-teal" : "text-navy"}`}>
              {elapsed}s
            </span>
            <span className="text-grey text-sm">/ {target}s target — Set {activeSet}</span>
            <button className="btn-primary py-2 ml-auto" onClick={stopHold}>Stop &amp; log</button>
          </>
        )}
      </div>

      {/* per-set rows */}
      <div className="mt-3 space-y-2">
        {sets.map((s) => {
          const done = secs[s] !== "" && secs[s] != null;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className="w-11 shrink-0 text-sm text-grey">Set {s}</span>
              <input className="input py-1.5 flex-1 min-w-0" inputMode="numeric" placeholder="seconds held"
                value={secs[s]} onChange={(e) => setSecs((v) => ({ ...v, [s]: e.target.value }))} />
              <span className="text-grey text-sm shrink-0">s</span>
              {activeSet === s ? (
                <button className="btn-primary py-1.5 text-sm shrink-0" onClick={stopHold}>Stop</button>
              ) : (
                <button className="btn-ghost py-1.5 text-sm shrink-0" onClick={() => startHold(s)} disabled={activeSet !== null}>
                  ▶ {done ? "Redo" : "Start"}
                </button>
              )}
              <button className="btn-primary py-1.5 text-sm shrink-0" onClick={() => save(s)}>
                {saved[s] === "saving" ? <Dots /> : saved[s] === "ok" ? "✓" : "Save"}
              </button>
            </div>
          );
        })}
      </div>

      <RestTimer defaultSec={rx.restSec ?? 60} autoStartKey={restKey} />
    </div>
  );
}

function TimedCard({ exercise, rx, programId, week, dayIndex, initialDone }: any) {
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
    <div className="card card-hover p-4 animate-in">
      <div>
        <h3 className="font-semibold text-navy">{exercise.name}</h3>
        <p className="text-xs text-grey mt-0.5">Do it for {work} seconds · {rx.sets} rounds</p>
      </div>
      <div className="mt-3"><VideoEmbed exercise={exercise} /></div>
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

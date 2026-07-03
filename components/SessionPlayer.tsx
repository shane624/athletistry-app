"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logSet } from "@/lib/data";
import { logSession } from "@/lib/load-actions";
import { sessionTrimp } from "@/lib/load";
import type { ResolvedRx } from "@/lib/program";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import RestTimer from "@/components/RestTimer";
import Celebrate from "@/components/Celebrate";
import Icon from "@/components/Icon";
import Dots from "@/components/Dots";

type Logged = Record<number, Record<number, { weight: number; reps: number }>>; // exId -> set -> log

/**
 * Guided, one-exercise-at-a-time workout player. Steps through each exercise:
 * watch the demo, log each set, auto rest timer between sets, then move on —
 * finishing on a summary that records the session for training load.
 */
export default function SessionPlayer({
  exercises, rx, programId, week, dayIndex, dayTitle, timed = false,
  initialLogs = {}, lastLogs = {},
  levelIndex = 0, levelName = "", nextLevelName, backHref = "/dashboard",
}: {
  exercises: ExerciseRow[];
  rx: ResolvedRx;
  programId: string;
  week: number;
  dayIndex: number;
  dayTitle: string;
  timed?: boolean;
  initialLogs?: Logged;
  lastLogs?: Record<number, { weight: number; reps: number }>;
  levelIndex?: number; levelName?: string; nextLevelName?: string;
  backHref?: string;
}) {
  const router = useRouter();
  const total = exercises.length;
  const [i, setI] = useState(0);
  const [logged, setLogged] = useState<Logged>(initialLogs);
  const [restKey, setRestKey] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const startedAt = useRef(Date.now());

  const ex = exercises[i];
  const setCount = Math.max(1, rx.sets);
  const doneForEx = ex ? Object.keys(logged[ex.id] ?? {}).length : 0;
  const allSetsDone = doneForEx >= setCount;

  // per-set inputs for the current exercise; prefill from today's log else last time
  const preW = ex ? (lastLogs[ex.id]?.weight != null ? String(lastLogs[ex.id]!.weight) : "") : "";
  const preR = ex ? (lastLogs[ex.id]?.reps != null ? String(lastLogs[ex.id]!.reps) : "") : "";
  const [weight, setWeight] = useState(preW);
  const [reps, setReps] = useState(preR);

  // the set we're on (first unlogged set number, 1-based)
  const currentSet = useMemo(() => {
    const d = ex ? (logged[ex.id] ?? {}) : {};
    for (let s = 1; s <= setCount; s++) if (!d[s]) return s;
    return setCount;
  }, [ex, logged, setCount]);

  // when exercise changes, reset the inputs to that exercise's prefill
  useEffect(() => {
    if (!ex) return;
    const last = logged[ex.id]?.[Math.max(1, currentSet - 1)];
    setWeight(last ? String(last.weight) : (lastLogs[ex.id]?.weight != null ? String(lastLogs[ex.id]!.weight) : ""));
    setReps(last ? String(last.reps) : (lastLogs[ex.id]?.reps != null ? String(lastLogs[ex.id]!.reps) : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const [busy, setBusy] = useState(false);

  async function logCurrentSet() {
    if (!ex) return;
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    setBusy(true);
    await logSet({ programId, exerciseId: ex.id, week, dayIndex, setNumber: currentSet, weight: w, reps: r });
    setLogged((prev) => {
      const next = { ...prev, [ex.id]: { ...(prev[ex.id] ?? {}), [currentSet]: { weight: w, reps: r } } };
      return next;
    });
    setRestKey((k) => k + 1); // auto-start rest
    setBusy(false);
  }

  // timed (kids) exercises: one "done" tap logs the hold, no weights
  async function markTimedDone() {
    if (!ex) return;
    setBusy(true);
    await logSet({ programId, exerciseId: ex.id, week, dayIndex, setNumber: 1, weight: 0, reps: 1 });
    setLogged((prev) => ({ ...prev, [ex.id]: { 1: { weight: 0, reps: 1 } } }));
    setBusy(false);
  }

  function goNext() { if (i < total - 1) setI(i + 1); }
  function goPrev() { if (i > 0) setI(i - 1); }

  const completedCount = exercises.filter((e) => Object.keys(logged[e.id] ?? {}).length > 0).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;

  if (finishing) {
    return <FinishScreen
      elapsedMin={Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))}
      levelIndex={levelIndex} levelName={levelName} nextLevelName={nextLevelName}
      backHref={backHref}
      onDone={() => { router.push(backHref); router.refresh(); }}
    />;
  }

  if (!ex) {
    return (
      <div className="p-6 text-center">
        <p className="text-grey">No exercises in this session.</p>
        <Link href={backHref} className="btn-primary mt-4 inline-block">Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* top bar: progress + close */}
      <div className="sticky top-0 z-10 bg-navy text-white">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <Link href={backHref} aria-label="End session" className="text-white/80 hover:text-white">
            <Icon name="chevron" className="w-5 h-5 rotate-180" />
          </Link>
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-teal rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-white/80 tabular-nums shrink-0">{i + 1}/{total}</span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        <p className="eyebrow">{dayTitle.replace(/^Day \d+ — /, "")}</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">{ex.name}</h1>
        <p className="text-grey text-sm mt-0.5">
          Level {ex.level} · {timed ? "hold for time" : `${setCount} sets × ${rx.repLow}–${rx.repHigh} reps`}
        </p>

        <div className="mt-4">
          <ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} />
        </div>

        {timed ? (
          <div className="mt-5">
            {Object.keys(logged[ex.id] ?? {}).length > 0 ? (
              <p className="text-tealdark font-semibold text-center py-3">Done ✓</p>
            ) : (
              <button className="btn-primary w-full py-3" disabled={busy} onClick={markTimedDone}>
                {busy ? <Dots /> : "Mark done"}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5">
            {/* set tracker */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {Array.from({ length: setCount }, (_, s) => s + 1).map((s) => {
                const d = logged[ex.id]?.[s];
                return (
                  <span key={s} className={`text-xs rounded-full px-2.5 py-1 border ${
                    d ? "bg-teal text-white border-teal" : s === currentSet ? "border-teal text-tealdark" : "border-line text-grey"
                  }`}>
                    {d ? `${d.weight}×${d.reps}` : `Set ${s}`}
                  </span>
                );
              })}
            </div>

            {!allSetsDone && (
              <div className="card p-4">
                <p className="eyebrow">Set {currentSet} of {setCount}</p>
                <div className="flex gap-3 mt-2">
                  <label className="flex-1">
                    <span className="text-xs text-grey">Weight (kg)</span>
                    <input className="input mt-1 w-full" inputMode="decimal" placeholder="0"
                      value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </label>
                  <label className="flex-1">
                    <span className="text-xs text-grey">Reps</span>
                    <input className="input mt-1 w-full" inputMode="numeric" placeholder={String(rx.repLow)}
                      value={reps} onChange={(e) => setReps(e.target.value)} />
                  </label>
                </div>
                <button className="btn-primary w-full mt-3" disabled={busy} onClick={logCurrentSet}>
                  {busy ? <Dots /> : `Complete set ${currentSet}`}
                </button>
              </div>
            )}

            {allSetsDone && (
              <p className="text-tealdark font-semibold text-center py-2">All {setCount} sets logged ✓</p>
            )}

            {/* rest timer (auto-starts after each set) */}
            <RestTimer defaultSec={rx.restSec} autoStartKey={restKey} />
          </div>
        )}
      </div>

      {/* bottom nav: prev / next or finish */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-line safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={goPrev} disabled={i === 0}
            className="btn-ghost px-4 disabled:opacity-40">Back</button>
          {i < total - 1 ? (
            <button onClick={goNext} className="btn-primary flex-1 py-3">
              {allSetsDone || (timed && doneForEx > 0) ? "Next exercise →" : "Skip to next →"}
            </button>
          ) : (
            <button onClick={() => setFinishing(true)} className="btn-primary flex-1 py-3">
              Finish workout ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FinishScreen({
  elapsedMin, levelIndex, levelName, nextLevelName, backHref, onDone,
}: {
  elapsedMin: number; levelIndex: number; levelName: string; nextLevelName?: string;
  backHref: string; onDone: () => void;
}) {
  const [dur, setDur] = useState(String(elapsedMin));
  const [rpe, setRpe] = useState(6);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let last = -1;
    try { last = parseInt(localStorage.getItem("athl_last_rank") ?? "-1"); } catch {}
    if (last >= 0 && levelIndex > last) setCelebrate(true);
    try { localStorage.setItem("athl_last_rank", String(levelIndex)); } catch {}
  }, [levelIndex]);

  async function save(skip = false) {
    setBusy(true);
    if (!skip && dur) await logSession({ durationMin: Number(dur), rpe, kind: "workout" });
    setDone(true);
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {celebrate && (
        <Celebrate
          title={`You're now ${levelName}`}
          subtitle={nextLevelName ? `Keep training to reach ${nextLevelName}.` : "You've reached the top rank. Bravo."}
          onClose={() => setCelebrate(false)}
        />
      )}
      <div className="card p-6 max-w-sm w-full text-center">
        {!done ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-light text-teal flex items-center justify-center mx-auto">
              <Icon name="check" className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-navy mt-3">Workout done</h1>
            <p className="text-grey text-sm mt-1">Log a couple of numbers so it counts toward your training load.</p>
            <div className="mt-4 text-left">
              <label className="text-xs text-grey">How long? (minutes)</label>
              <input className="input mt-1 w-32" inputMode="numeric" value={dur} onChange={(e) => setDur(e.target.value)} />
            </div>
            <div className="mt-3 text-left">
              <label className="text-xs text-grey">Effort — how hard it felt <span className="opacity-70">(RPE)</span>: <b className="text-navy">{rpe}</b> / 10</label>
              <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-teal mt-1" />
              <div className="flex justify-between text-[11px] text-grey"><span>1 easy</span><span>10 max</span></div>
            </div>
            {dur && <p className="text-grey text-sm mt-1">= <b className="text-navy">{sessionTrimp(Number(dur) || 0, rpe)} TRIMP</b></p>}
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" disabled={busy || !dur} onClick={() => save(false)}>
                {busy ? <Dots /> : "Save & finish"}
              </button>
              <button className="btn-ghost" disabled={busy} onClick={() => save(true)}>Skip</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-extrabold text-navy">Nice work.</h1>
            <p className="text-grey text-sm mt-1">Progress, streak and training load updated.</p>
            <button className="btn-primary w-full mt-4" onClick={onDone}>Back to Today</button>
          </>
        )}
      </div>
    </div>
  );
}

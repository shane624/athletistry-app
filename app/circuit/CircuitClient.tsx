"use client";

import { useEffect, useMemo, useState } from "react";
import { generateCircuit } from "@/lib/data";
import {
  CIRCUIT_FORMATS, COMPOSITIONS, defaultConfig, exerciseCount, circuitSummary,
  INTERVAL_SECONDS, EMOM_ROUNDS, EMOM_REPS, AMRAP_MINUTES, AMRAP_SET_STYLES,
  type CircuitFormat, type CircuitConfig, type Composition,
} from "@/lib/circuit";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import FinishSession from "@/components/FinishSession";
import EquipmentNeeded from "@/components/EquipmentNeeded";
import Dots from "@/components/Dots";
import { EQUIPMENT_LABEL } from "@/lib/equipment";

const FORMAT_IDS: CircuitFormat[] = ["intervals", "tabata", "emom", "amrap"];
const COMP_IDS: Composition[] = ["full", "legs", "push", "pull", "core"];
const EQUIP = ["band", "dumbbell", "barbell", "slant_board", "step", "partner"];
const LEVELS = [
  { v: 1, label: "Beginner" },
  { v: 2, label: "Intermediate" },
  { v: 3, label: "Advanced" },
  { v: 4, label: "All levels" },
];

export default function CircuitClient() {
  const [format, setFormat] = useState<CircuitFormat>("intervals");
  const [comp, setComp] = useState<Composition>("full");
  const [cfg, setCfg] = useState<CircuitConfig>(defaultConfig("intervals"));
  const [exercises, setExercises] = useState<ExerciseRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [maxLevel, setMaxLevel] = useState(4);
  const [equip, setEquip] = useState<Set<string>>(new Set());
  const [equipOpen, setEquipOpen] = useState(false);

  function toggleEquip(e: string) {
    setEquip((prev) => { const n = new Set(prev); n.has(e) ? n.delete(e) : n.add(e); return n; });
    setExercises(null);
  }

  // apply presets passed from the Random generator (?format=&focus=)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const f = sp.get("format");
    const focus = sp.get("focus");
    if (f && (FORMAT_IDS as string[]).includes(f)) { setFormat(f as CircuitFormat); setCfg(defaultConfig(f as CircuitFormat)); }
    if (focus && (COMP_IDS as string[]).includes(focus)) setComp(focus as Composition);
  }, []);

  function pickFormat(f: CircuitFormat) {
    setFormat(f);
    setCfg(defaultConfig(f));
    setExercises(null);
  }

  async function build() {
    setBusy(true);
    const ex = await generateCircuit({
      composition: comp,
      count: exerciseCount(cfg),
      maxLevel,
      equipment: equip.size ? [...equip] : undefined,
    });
    setExercises(ex);
    setBusy(false);
  }

  return (
    <div className="mt-5 space-y-5">
      {/* format */}
      <div>
        <p className="eyebrow mb-2">Format</p>
        <div className="grid grid-cols-2 gap-2">
          {CIRCUIT_FORMATS.map((f) => (
            <button key={f.id} onClick={() => pickFormat(f.id)}
              className={`text-left card card-hover p-3 border-2 ${format === f.id ? "border-teal bg-light" : "border-line"}`}>
              <div className="font-bold text-navy text-sm">{f.label}</div>
              <div className="text-grey text-xs mt-0.5">{f.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      {/* format options */}
      <FormatOptions format={format} cfg={cfg} setCfg={setCfg} />

      {/* composition */}
      <div>
        <p className="eyebrow mb-2">Focus</p>
        <div className="flex flex-wrap gap-1.5">
          {COMPOSITIONS.map((c) => (
            <button key={c.id} onClick={() => { setComp(c.id); setExercises(null); }}
              className={`rounded-full px-3 py-1.5 text-sm border ${comp === c.id ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* difficulty (same as Random) */}
      <div>
        <p className="eyebrow mb-2">Difficulty</p>
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map((l) => (
            <button key={l.v} onClick={() => { setMaxLevel(l.v); setExercises(null); }}
              className={`rounded-full px-3 py-1.5 text-sm border ${maxLevel === l.v ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* equipment filter (same as Random / Build) */}
      <div>
        <button onClick={() => setEquipOpen((v) => !v)} className="text-sm text-teal font-semibold">
          {equip.size ? `Equipment: ${equip.size} selected` : "Filter by equipment"} {equipOpen ? "▴" : "▾"}
        </button>
        {equipOpen && (
          <div className="card mt-2 p-4">
            <p className="text-sm text-grey">Select what you have — handy when travelling. Bodyweight always shows; leave empty for everything.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {EQUIP.map((e) => (
                <button key={e} onClick={() => toggleEquip(e)}
                  className={`rounded-full px-3 py-1.5 text-sm border ${equip.has(e) ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>
                  {EQUIPMENT_LABEL[e as keyof typeof EQUIPMENT_LABEL]}
                </button>
              ))}
            </div>
            {equip.size > 0 && <button className="text-teal text-sm mt-3 font-semibold" onClick={() => { setEquip(new Set()); setExercises(null); }}>Clear</button>}
          </div>
        )}
      </div>

      <div className="card p-4 bg-light">
        <p className="text-navy font-semibold text-sm">{circuitSummary(cfg)}</p>
        <button className="btn-primary mt-3" onClick={build} disabled={busy}>
          {busy ? <Dots /> : exercises ? "Rebuild circuit" : "Build my circuit"}
        </button>
      </div>

      {exercises && <CircuitRunner format={format} cfg={cfg} exercises={exercises} openVid={openVid} setOpenVid={setOpenVid} />}
    </div>
  );
}

function FormatOptions({ format, cfg, setCfg }: { format: CircuitFormat; cfg: CircuitConfig; setCfg: (c: CircuitConfig) => void }) {
  if (format === "tabata") {
    return <p className="text-grey text-sm">Tabata is fixed: 20 seconds hard, 10 seconds rest, 8 rounds for each exercise.</p>;
  }
  if (format === "intervals") {
    return (
      <Opt label="Work / rest (seconds)">
        {INTERVAL_SECONDS.map((s) => (
          <Pill key={s} on={cfg.intervalSec === s} onClick={() => setCfg({ ...cfg, intervalSec: s })}>{s}s</Pill>
        ))}
        <span className="text-grey text-sm ml-2">Rounds:</span>
        {[2, 3, 4].map((r) => (
          <Pill key={r} on={cfg.rounds === r} onClick={() => setCfg({ ...cfg, rounds: r })}>{r}</Pill>
        ))}
      </Opt>
    );
  }
  if (format === "emom") {
    return (
      <Opt label="Rounds & reps">
        {EMOM_ROUNDS.map((r) => (
          <Pill key={r} on={cfg.emomRounds === r} onClick={() => setCfg({ ...cfg, emomRounds: r })}>{r} rounds</Pill>
        ))}
        <span className="text-grey text-sm ml-2">Reps/min:</span>
        {EMOM_REPS.map((r) => (
          <Pill key={r} on={cfg.emomReps === r} onClick={() => setCfg({ ...cfg, emomReps: r })}>{r}</Pill>
        ))}
      </Opt>
    );
  }
  // amrap
  return (
    <Opt label="Minutes & set style">
      {AMRAP_MINUTES.map((m) => (
        <Pill key={m} on={cfg.amrapMin === m} onClick={() => setCfg({ ...cfg, amrapMin: m })}>{m} min</Pill>
      ))}
      <span className="w-full" />
      {AMRAP_SET_STYLES.map((s) => (
        <Pill key={s.id} on={cfg.amrapSet === s.id} onClick={() => setCfg({ ...cfg, amrapSet: s.id })}>{s.label}</Pill>
      ))}
    </Opt>
  );
}

function Opt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 items-center">{children}</div>
    </div>
  );
}
function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm border ${on ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>{children}</button>
  );
}

const INTRO_SEC = 10; // "get ready" countdown before each exercise

const CLOUD = "dsbtk5hpq";
/** Muted, auto-looping clip of the exercise (no controls) for the active-exercise view. */
function LoopVideo({ ex }: { ex: ExerciseRow }) {
  if (ex.cloudinary_id) {
    const src = `https://res.cloudinary.com/${CLOUD}/video/upload/f_auto,q_auto/${ex.cloudinary_id}.mp4`;
    return (
      <video key={ex.cloudinary_id} className="w-full h-full object-cover" src={src}
        autoPlay muted loop playsInline preload="auto" />
    );
  }
  if (ex.youtube_id) {
    const yt = `https://www.youtube.com/embed/${ex.youtube_id}?autoplay=1&mute=1&loop=1&playlist=${ex.youtube_id}&controls=0&playsinline=1`;
    return <iframe className="w-full h-full" src={yt} allow="autoplay" title={ex.name} />;
  }
  return <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">No video</div>;
}

/* ---------- the runner: intro → work (looping video) → rest → repeat ---------- */
function CircuitRunner({ format, cfg, exercises, openVid, setOpenVid }: {
  format: CircuitFormat; cfg: CircuitConfig; exercises: ExerciseRow[]; openVid: number | null; setOpenVid: (n: number | null) => void;
}) {
  return (
    <div>
      <p className="eyebrow">Your circuit · {exercises.length} exercises</p>
      <EquipmentNeeded names={exercises.map((e) => e.name)} className="mt-2" />
      <div className="mt-3"><CircuitTimer format={format} cfg={cfg} exercises={exercises} /></div>

      <p className="eyebrow mt-5 mb-2">The exercises</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="card p-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal text-white text-xs font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
              <h3 className="font-semibold text-navy text-sm">{ex.name}</h3>
            </div>
            <p className="text-xs text-grey mt-1">{ex.category} · level {ex.level}{format === "emom" ? ` · ${cfg.emomReps} reps/min` : ""}</p>
            <div className="mt-2">
              {openVid === ex.id ? (
                <ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} />
              ) : (
                <button className="btn-ghost text-sm" onClick={() => setOpenVid(ex.id)}>Watch ▸</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <FinishSession kind="Circuit" label="Complete circuit" defaultDuration={20} />
    </div>
  );
}

function CircuitTimer({ format, cfg, exercises }: { format: CircuitFormat; cfg: CircuitConfig; exercises: ExerciseRow[] }) {
  // phases are stable for a given format/cfg/count; memoise so identity is steady
  const phases = useMemo(
    () => buildPhases(format, cfg, exercises.length),
    [format, cfg, exercises.length]
  );
  const isAmrap = format === "amrap";
  const amrapTotal = (cfg.amrapMin ?? 12) * 60;

  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false); // false = paused
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(0);

  function buzz(end: boolean) {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(end ? [120, 60, 120] : 60);
  }

  // Single countdown effect. Ticks `left`; when it hits 0 it advances the phase
  // (or stops for AMRAP / at the end). No nested state updaters, no stale reads.
  useEffect(() => {
    if (!started || !running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        // this phase just ended
        if (isAmrap) { setRunning(false); buzz(true); return 0; }
        setPhase((p) => {
          const np = p + 1;
          if (np >= phases.length) { setRunning(false); buzz(true); return p; }
          buzz(false);
          return np;
        });
        return 0; // will be reset by the phase-change effect below
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, running, isAmrap, phases.length]);

  // When the phase changes (and we're not AMRAP), load that phase's duration.
  useEffect(() => {
    if (!started || isAmrap) return;
    setLeft(phases[phase]?.sec ?? 0);
  }, [phase, started, isAmrap, phases]);

  function begin() {
    setStarted(true);
    setPhase(0);
    setLeft(isAmrap ? amrapTotal : (phases[0]?.sec ?? 0));
    setRunning(true);
  }
  function toggle() { setRunning((r) => !r); }
  function skip() {
    if (isAmrap) return;
    setPhase((p) => Math.min(p + 1, phases.length - 1));
  }
  function restart() { setRunning(false); setStarted(false); setPhase(0); setLeft(0); }

  // ---- AMRAP: continuous clock, all videos shown below ----
  if (isAmrap) {
    return (
      <div className="rounded-xl p-5 text-white grad-navy">
        <p className="text-white/75 text-xs uppercase tracking-wide">AMRAP · time remaining</p>
        <p className="text-5xl font-extrabold tabular-nums mt-1">{started ? fmt(left) : fmt((cfg.amrapMin ?? 12) * 60)}</p>
        <p className="text-white/85 text-sm mt-1">As many rounds as possible — cycle through all {exercises.length} exercises and count your laps.</p>
        <Controls started={started} running={running} onBegin={begin} onToggle={toggle} onRestart={restart} showSkip={false} onSkip={skip} />
      </div>
    );
  }

  // ---- intervals / tabata / emom: phase machine with intro + looping video ----
  const cur = phases[phase];
  // during the last 10s of a rest, preview the upcoming exercise
  const previewing = cur?.kind === "rest" && cur.nextIndex != null && left <= INTRO_SEC;
  const ex =
    cur?.exIndex != null ? exercises[cur.exIndex]
    : previewing ? exercises[cur.nextIndex!]
    : undefined;
  const showVideo = started && !!ex && (cur?.kind === "intro" || cur?.kind === "work" || previewing);
  const tone =
    !started ? "grad-navy" :
    previewing ? "bg-teal" :
    cur?.kind === "rest" ? "bg-navy2" :
    cur?.kind === "intro" ? "bg-teal" : "grad-navy";

  const banner =
    !started ? "Ready when you are"
    : previewing ? "Get ready — up next"
    : cur?.kind === "intro" ? "Get ready — up next"
    : cur?.kind === "rest" ? "Rest"
    : "Work";
  const title =
    !started ? `${phases.length} phases queued`
    : previewing && ex ? ex.name
    : (cur?.label ?? "");

  return (
    <div className={`rounded-xl overflow-hidden text-white ${tone}`}>
      {showVideo && ex && (
        <div className="aspect-video w-full bg-black">
          <LoopVideo ex={ex} />
        </div>
      )}
      <div className="p-5">
        <p className="text-white/80 text-xs uppercase tracking-wide">{banner}</p>
        <p className="text-lg font-bold mt-0.5">{title}</p>
        <p className="text-5xl font-extrabold tabular-nums mt-1">{started ? `${left}s` : `${INTRO_SEC}s`}</p>
        {started && <p className="text-white/70 text-xs mt-1">Phase {phase + 1} / {phases.length}</p>}
        <Controls started={started} running={running} onBegin={begin} onToggle={toggle} onRestart={restart} showSkip onSkip={skip} />
      </div>
    </div>
  );
}

function Controls({ started, running, onBegin, onToggle, onRestart, showSkip, onSkip }: {
  started: boolean; running: boolean; onBegin: () => void; onToggle: () => void; onRestart: () => void; showSkip: boolean; onSkip: () => void;
}) {
  return (
    <div className="mt-4 flex gap-2 flex-wrap">
      {!started ? (
        <button className="bg-white text-navy font-bold rounded-lg px-5 py-2 text-sm" onClick={onBegin}>▶ Start</button>
      ) : (
        <>
          <button className="bg-white text-navy font-bold rounded-lg px-4 py-2 text-sm" onClick={onToggle}>
            {running ? "❚❚ Pause" : "▶ Resume"}
          </button>
          {showSkip && <button className="bg-white/20 text-white font-bold rounded-lg px-4 py-2 text-sm" onClick={onSkip}>Skip ▸</button>}
          <button className="bg-white/20 text-white font-bold rounded-lg px-4 py-2 text-sm" onClick={onRestart}>Restart</button>
        </>
      )}
    </div>
  );
}

type Phase = { label: string; sec: number; kind: "intro" | "work" | "rest"; exIndex?: number; nextIndex?: number };
// One 10s intro at the very start only. After that, the rest period IS the
// transition: its last 10s preview the next exercise (no separate intro), so a
// 30s rest stays 30s rather than 30 + 10.
function buildPhases(format: CircuitFormat, cfg: CircuitConfig, count: number): Phase[] {
  const out: Phase[] = [];
  const idxs = Array.from({ length: count }, (_, i) => i);

  if (format === "intervals") {
    const s = cfg.intervalSec ?? 30;
    const rounds = cfg.rounds ?? 3;
    const seq: number[] = [];
    for (let r = 0; r < rounds; r++) for (const i of idxs) seq.push(i);
    seq.forEach((i, pos) => {
      if (pos === 0) out.push({ label: `Exercise ${i + 1}`, sec: INTRO_SEC, kind: "intro", exIndex: i });
      out.push({ label: `Work`, sec: s, kind: "work", exIndex: i });
      const next = seq[pos + 1];
      if (next != null) out.push({ label: "Rest", sec: s, kind: "rest", nextIndex: next });
    });
  } else if (format === "tabata") {
    idxs.forEach((i, pos) => {
      if (pos === 0) out.push({ label: `Exercise ${i + 1}`, sec: INTRO_SEC, kind: "intro", exIndex: i });
      for (let r = 0; r < 8; r++) {
        out.push({ label: `Round ${r + 1}/8`, sec: 20, kind: "work", exIndex: i });
        const lastRoundOfLastEx = r === 7 && pos === idxs.length - 1;
        if (!lastRoundOfLastEx) {
          const next = r === 7 ? idxs[pos + 1] : i; // next exercise after round 8, else same
          out.push({ label: "Rest", sec: 10, kind: "rest", nextIndex: next });
        }
      }
    });
  } else if (format === "emom") {
    const rounds = cfg.emomRounds ?? 10;
    for (let r = 0; r < rounds; r++) {
      const i = r % count;
      if (r === 0) out.push({ label: `Min 1 — get ready`, sec: INTRO_SEC, kind: "intro", exIndex: i });
      out.push({ label: `Min ${r + 1}: ${cfg.emomReps} reps`, sec: 60, kind: "work", exIndex: i });
    }
  }
  return out.length ? out : [{ label: "Ready", sec: 0, kind: "work" }];
}
function fmt(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; }

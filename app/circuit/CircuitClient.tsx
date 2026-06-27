"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateCircuit } from "@/lib/data";
import {
  CIRCUIT_FORMATS, COMPOSITIONS, defaultConfig, exerciseCount, circuitSummary,
  INTERVAL_SECONDS, EMOM_ROUNDS, EMOM_REPS, AMRAP_MINUTES, AMRAP_SET_STYLES,
  type CircuitFormat, type CircuitConfig, type Composition,
} from "@/lib/circuit";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import FinishSession from "@/components/FinishSession";
import Dots from "@/components/Dots";
import { EQUIPMENT_LABEL } from "@/lib/equipment";

const FORMAT_IDS: CircuitFormat[] = ["intervals", "tabata", "emom", "amrap"];
const COMP_IDS: Composition[] = ["full", "legs", "push", "pull", "core"];
const EQUIP = ["band", "dumbbell", "barbell", "slant_board", "step", "partner"];

export default function CircuitClient() {
  const params = useSearchParams();
  const [format, setFormat] = useState<CircuitFormat>("intervals");
  const [comp, setComp] = useState<Composition>("full");
  const [cfg, setCfg] = useState<CircuitConfig>(defaultConfig("intervals"));
  const [exercises, setExercises] = useState<ExerciseRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [equip, setEquip] = useState<Set<string>>(new Set());
  const [equipOpen, setEquipOpen] = useState(false);

  function toggleEquip(e: string) {
    setEquip((prev) => { const n = new Set(prev); n.has(e) ? n.delete(e) : n.add(e); return n; });
    setExercises(null);
  }

  // apply presets passed from the Random generator (?format=&focus=)
  useEffect(() => {
    const f = params.get("format");
    const focus = params.get("focus");
    if (f && (FORMAT_IDS as string[]).includes(f)) { setFormat(f as CircuitFormat); setCfg(defaultConfig(f as CircuitFormat)); }
    if (focus && (COMP_IDS as string[]).includes(focus)) setComp(focus as Composition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const phases = buildPhases(format, cfg, exercises.length);
  const isAmrap = format === "amrap";

  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false); // false = paused
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(phases[0]?.sec ?? 0);
  const tick = useRef<any>(null);

  useEffect(() => () => { if (tick.current) clearInterval(tick.current); }, []);

  function clear() { if (tick.current) { clearInterval(tick.current); tick.current = null; } }

  // one interval; advances phases (or counts down the AMRAP clock)
  function run() {
    clear();
    setRunning(true);
    tick.current = setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        // phase finished
        if (isAmrap) { clear(); setRunning(false); buzz(true); return 0; }
        let np = -1;
        setPhase((p) => { np = p + 1; return np; });
        if (np >= phases.length) { clear(); setRunning(false); buzz(true); return 0; }
        buzz(false);
        return phases[np].sec;
      });
    }, 1000);
  }
  function buzz(end: boolean) {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(end ? [120, 60, 120] : 60);
  }

  function begin() {
    setStarted(true);
    setPhase(0);
    setLeft(isAmrap ? (cfg.amrapMin ?? 12) * 60 : phases[0].sec);
    run();
  }
  function toggle() { if (running) { clear(); setRunning(false); } else run(); }
  function skip() {
    if (isAmrap) return;
    clear();
    const np = phase + 1;
    if (np >= phases.length) { setRunning(false); setLeft(0); return; }
    setPhase(np); setLeft(phases[np].sec); run();
  }
  function restart() { clear(); setStarted(false); setRunning(false); setPhase(0); setLeft(phases[0]?.sec ?? 0); }

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
  const ex = cur?.exIndex != null ? exercises[cur.exIndex] : undefined;
  const tone =
    !started ? "grad-navy" :
    cur?.kind === "rest" ? "bg-navy2" :
    cur?.kind === "intro" ? "bg-teal" : "grad-navy";

  return (
    <div className={`rounded-xl overflow-hidden text-white ${tone}`}>
      {/* active-exercise video (intro preview + work loop) */}
      {started && ex && (cur.kind === "intro" || cur.kind === "work") && (
        <div className="aspect-video w-full bg-black">
          <LoopVideo ex={ex} />
        </div>
      )}
      <div className="p-5">
        <p className="text-white/80 text-xs uppercase tracking-wide">
          {!started ? "Ready when you are"
            : cur?.kind === "intro" ? `Get ready — up next`
            : cur?.kind === "rest" ? "Rest"
            : "Work"}
        </p>
        <p className="text-lg font-bold mt-0.5">{started ? (cur?.label ?? "") : `${phases.length} phases queued`}</p>
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

type Phase = { label: string; sec: number; kind: "intro" | "work" | "rest"; exIndex?: number };
function buildPhases(format: CircuitFormat, cfg: CircuitConfig, count: number): Phase[] {
  const out: Phase[] = [];
  const idxs = Array.from({ length: count }, (_, i) => i);
  if (format === "intervals") {
    const s = cfg.intervalSec ?? 30;
    const rounds = cfg.rounds ?? 3;
    for (let r = 0; r < rounds; r++) {
      for (const i of idxs) {
        out.push({ label: `Exercise ${i + 1}`, sec: INTRO_SEC, kind: "intro", exIndex: i });
        out.push({ label: `Work`, sec: s, kind: "work", exIndex: i });
        out.push({ label: "Rest", sec: s, kind: "rest" });
      }
    }
  } else if (format === "tabata") {
    for (const i of idxs) {
      out.push({ label: `Exercise ${i + 1}`, sec: INTRO_SEC, kind: "intro", exIndex: i });
      for (let r = 0; r < 8; r++) {
        out.push({ label: `Round ${r + 1}/8`, sec: 20, kind: "work", exIndex: i });
        out.push({ label: "Rest", sec: 10, kind: "rest" });
      }
    }
  } else if (format === "emom") {
    const rounds = cfg.emomRounds ?? 10;
    for (let r = 0; r < rounds; r++) {
      const i = r % count;
      out.push({ label: `Min ${r + 1} — get ready`, sec: INTRO_SEC, kind: "intro", exIndex: i });
      out.push({ label: `Min ${r + 1}: ${cfg.emomReps} reps`, sec: 60, kind: "work", exIndex: i });
    }
  }
  return out.length ? out : [{ label: "Ready", sec: 0, kind: "work" }];
}
function fmt(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; }

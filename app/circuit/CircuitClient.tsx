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
import Dots from "@/components/Dots";

const FORMAT_IDS: CircuitFormat[] = ["intervals", "tabata", "emom", "amrap"];
const COMP_IDS: Composition[] = ["full", "legs", "push", "pull", "core"];

export default function CircuitClient() {
  const params = useSearchParams();
  const [format, setFormat] = useState<CircuitFormat>("intervals");
  const [comp, setComp] = useState<Composition>("full");
  const [cfg, setCfg] = useState<CircuitConfig>(defaultConfig("intervals"));
  const [exercises, setExercises] = useState<ExerciseRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [openVid, setOpenVid] = useState<number | null>(null);

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
    const ex = await generateCircuit({ composition: comp, count: exerciseCount(cfg) });
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

/* ---------- the runner with the format-appropriate timer ---------- */
function CircuitRunner({ format, cfg, exercises, openVid, setOpenVid }: {
  format: CircuitFormat; cfg: CircuitConfig; exercises: ExerciseRow[]; openVid: number | null; setOpenVid: (n: number | null) => void;
}) {
  return (
    <div>
      <p className="eyebrow">Your circuit · {exercises.length} exercises</p>
      <div className="mt-3"><CircuitTimer format={format} cfg={cfg} exerciseNames={exercises.map((e) => e.name)} /></div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
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
    </div>
  );
}

function CircuitTimer({ format, cfg, exerciseNames }: { format: CircuitFormat; cfg: CircuitConfig; exerciseNames: string[] }) {
  // generic phase-based timer: build a sequence of {label, seconds} phases
  const phases = buildPhases(format, cfg, exerciseNames);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(phases[0]?.sec ?? 0);
  const [elapsed, setElapsed] = useState(0); // for amrap count-up
  const tick = useRef<any>(null);

  useEffect(() => () => { if (tick.current) clearInterval(tick.current); }, []);

  function start() {
    setRunning(true);
    if (format === "amrap") {
      const total = (cfg.amrapMin ?? 12) * 60;
      setLeft(total);
      tick.current = setInterval(() => {
        setLeft((l) => {
          if (l <= 1) { clearInterval(tick.current); setRunning(false); if (navigator.vibrate) navigator.vibrate([120, 60, 120]); return 0; }
          return l - 1;
        });
        setElapsed((e) => e + 1);
      }, 1000);
      return;
    }
    let p = 0; setPhase(0); setLeft(phases[0].sec);
    tick.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          p += 1;
          if (p >= phases.length) { clearInterval(tick.current); setRunning(false); if (navigator.vibrate) navigator.vibrate([120, 60, 120]); return 0; }
          setPhase(p);
          if (navigator.vibrate) navigator.vibrate(60);
          return phases[p].sec;
        }
        return l - 1;
      });
    }, 1000);
  }
  function stop() { if (tick.current) clearInterval(tick.current); setRunning(false); }

  const cur = phases[phase];
  const isRest = cur?.kind === "rest";

  return (
    <div className={`rounded-xl p-5 text-white ${isRest ? "bg-navy2" : "grad-navy"}`}>
      {format === "amrap" ? (
        <>
          <p className="text-white/75 text-xs uppercase tracking-wide">AMRAP · time remaining</p>
          <p className="text-4xl font-extrabold tabular-nums mt-1">{fmt(left)}</p>
          <p className="text-white/85 text-sm mt-1">As many rounds as possible — keep moving through all {exerciseNames.length} exercises.</p>
        </>
      ) : (
        <>
          <p className="text-white/75 text-xs uppercase tracking-wide">{cur?.label ?? "Ready"}</p>
          <p className="text-4xl font-extrabold tabular-nums mt-1">{running ? `${left}s` : "Ready"}</p>
          <p className="text-white/70 text-xs mt-1">{phase + 1} / {phases.length} phases</p>
        </>
      )}
      <div className="mt-3 flex gap-2">
        {!running ? (
          <button className="bg-white text-navy font-bold rounded-lg px-4 py-2 text-sm" onClick={start}>▶ Start</button>
        ) : (
          <button className="bg-white/20 text-white font-bold rounded-lg px-4 py-2 text-sm" onClick={stop}>■ Stop</button>
        )}
      </div>
    </div>
  );
}

type Phase = { label: string; sec: number; kind: "work" | "rest" };
function buildPhases(format: CircuitFormat, cfg: CircuitConfig, names: string[]): Phase[] {
  const out: Phase[] = [];
  if (format === "intervals") {
    const s = cfg.intervalSec ?? 30;
    const rounds = cfg.rounds ?? 3;
    for (let r = 0; r < rounds; r++) {
      for (const n of names) {
        out.push({ label: `${n}`, sec: s, kind: "work" });
        out.push({ label: "Rest", sec: s, kind: "rest" });
      }
    }
  } else if (format === "tabata") {
    for (const n of names) {
      for (let r = 0; r < 8; r++) {
        out.push({ label: `${n} (${r + 1}/8)`, sec: 20, kind: "work" });
        out.push({ label: "Rest", sec: 10, kind: "rest" });
      }
    }
  } else if (format === "emom") {
    const rounds = cfg.emomRounds ?? 10;
    for (let r = 0; r < rounds; r++) {
      const n = names[r % names.length];
      out.push({ label: `Min ${r + 1}: ${cfg.emomReps} × ${n}`, sec: 60, kind: "work" });
    }
  }
  return out.length ? out : [{ label: "Ready", sec: 0, kind: "work" }];
}
function fmt(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; }

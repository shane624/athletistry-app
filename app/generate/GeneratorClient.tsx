"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateWorkout, saveCustomDay, setActiveProgram, markOnboarded, saveWorkout } from "@/lib/data";
import { styleRx } from "@/lib/program";
import type { ExerciseRow, WorkoutStyle } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import EquipmentNeeded from "@/components/EquipmentNeeded";
import Dots from "@/components/Dots";
import { EQUIPMENT_LABEL } from "@/lib/equipment";
import { CIRCUIT_FORMATS, COMPOSITIONS, type CircuitFormat, type Composition } from "@/lib/circuit";

const EQUIP = ["band", "dumbbell", "barbell", "slant_board", "step", "partner"];

// "circuit" is a 4th meta-style that hands off to the dedicated Circuit builder
type Style = WorkoutStyle | "circuit";
const STYLES: { id: Style; label: string; sub: string }[] = [
  { id: "hypertrophy", label: "Hypertrophy", sub: "8–12 reps · build muscle" },
  { id: "strength", label: "Strength", sub: "3–5 reps · lift heavy" },
  { id: "endurance", label: "Endurance", sub: "15–25+ reps · circuit" },
  { id: "circuit", label: "Circuit", sub: "timed: intervals, Tabata…" },
];
const LEVELS = [
  { v: 1, label: "Beginner" },
  { v: 2, label: "Intermediate" },
  { v: 3, label: "Advanced" },
  { v: 4, label: "All levels" },
];

export default function GeneratorClient() {
  const router = useRouter();
  const [style, setStyle] = useState<Style>("hypertrophy");
  const [maxLevel, setMaxLevel] = useState(4);
  const [perSlot, setPerSlot] = useState(1);
  const [equip, setEquip] = useState<Set<string>>(new Set());
  const [equipOpen, setEquipOpen] = useState(false);
  const [workout, setWorkout] = useState<{ slot: string; exercises: ExerciseRow[] }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  // circuit sub-choices (only used when style === "circuit")
  const [cFormat, setCFormat] = useState<CircuitFormat>("intervals");
  const [cComp, setCComp] = useState<Composition>("full");

  const isCircuit = style === "circuit";
  const rx = styleRx(isCircuit ? "endurance" : style);

  function toggleEquip(e: string) {
    setEquip((prev) => { const n = new Set(prev); n.has(e) ? n.delete(e) : n.add(e); return n; });
  }

  async function generate() {
    if (isCircuit) return; // circuit uses the dedicated builder via the link below
    setBusy(true); setSavedMsg(null);
    const w = await generateWorkout(style as WorkoutStyle, perSlot, maxLevel, equip.size ? [...equip] : undefined);
    setWorkout(w);
    setBusy(false);
  }

  async function useAsRoutine() {
    if (!workout) return;
    setBusy(true);
    setSavedMsg("Loading your workout…");
    const ids = workout.flatMap((s) => s.exercises.map((e) => e.id));
    await saveCustomDay(0, ids);
    await setActiveProgram("custom");
    await markOnboarded();
    // go straight to Today so they can do the workout (keep busy true through nav)
    router.push("/dashboard");
    router.refresh();
  }

  async function saveNamed() {
    if (!workout) return;
    const name = window.prompt("Name this workout (e.g. 'Leg Day', 'Quick Core'):");
    if (!name) return;
    setBusy(true);
    const ids = workout.flatMap((s) => s.exercises.map((e) => e.id));
    const res = await saveWorkout(name, ids, style as WorkoutStyle);
    setSavedMsg(res.ok ? `Saved “${name}” to My Workouts ✓` : (res.error ?? "Could not save"));
    setBusy(false);
  }

  return (
    <div className="mt-5">
      {/* style */}
      <p className="text-sm font-medium text-navy">Training style</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {STYLES.map((s) => {
          const selected = style === s.id;
          return (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className={`rounded-xl p-3 text-center border-2 transition ${
                selected ? "bg-teal border-teal text-white shadow-sm" : "bg-white border-line hover:border-teal"
              }`}>
              <div className={`font-semibold text-sm ${selected ? "text-white" : "text-navy"}`}>{s.label}</div>
              <div className={`text-xs mt-0.5 ${selected ? "text-white/90" : "text-grey"}`}>{s.sub}</div>
            </button>
          );
        })}
      </div>

      {/* circuit sub-choices + hand-off to the dedicated builder */}
      {isCircuit && (
        <div className="card p-4 mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-navy mb-2">Format</p>
            <div className="flex flex-wrap gap-1.5">
              {CIRCUIT_FORMATS.map((f) => (
                <button key={f.id} onClick={() => setCFormat(f.id)}
                  className={`rounded-full px-3 py-1.5 text-sm border ${cFormat === f.id ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-grey mt-1.5">{CIRCUIT_FORMATS.find((f) => f.id === cFormat)?.blurb}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-navy mb-2">Focus</p>
            <div className="flex flex-wrap gap-1.5">
              {COMPOSITIONS.map((c) => (
                <button key={c.id} onClick={() => setCComp(c.id)}
                  className={`rounded-full px-3 py-1.5 text-sm border ${cComp === c.id ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <Link href={`/circuit?format=${cFormat}&focus=${cComp}`} className="btn-primary inline-block">
            Build this circuit →
          </Link>
          <p className="text-xs text-grey">Opens the Circuit builder with a live timer for each format.</p>
        </div>
      )}

      {/* difficulty + per slot (rep-based styles only) */}
      {!isCircuit && (
      <>
      <div className="flex flex-wrap gap-4 mt-4">
        <div>
          <p className="text-sm font-medium text-navy">Difficulty</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {LEVELS.map((l) => (
              <button key={l.v} onClick={() => setMaxLevel(l.v)}
                className={`rounded-full px-3 py-1.5 text-sm border ${maxLevel === l.v ? "bg-teal text-white border-teal" : "bg-white border-line"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-navy">Per slot</p>
          <div className="flex gap-2 mt-1">
            {[1, 2].map((n) => (
              <button key={n} onClick={() => setPerSlot(n)}
                className={`rounded-full px-3 py-1.5 text-sm border ${perSlot === n ? "bg-teal text-white border-teal" : "bg-white border-line"}`}>
                {n} exercise{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* equipment filter */}
      <button onClick={() => setEquipOpen((v) => !v)} className="text-sm text-teal font-semibold mt-4">
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
          {equip.size > 0 && <button className="text-teal text-sm mt-3 font-semibold" onClick={() => setEquip(new Set())}>Clear</button>}
        </div>
      )}

      <button className="btn-primary mt-5 w-full sm:w-auto" onClick={generate} disabled={busy}>
        {busy ? "Rolling…" : workout ? "🎲 Regenerate" : "🎲 Generate workout"}
      </button>
      </>
      )}

      {workout && (
        <div className="mt-5">
          <div className="card p-4 bg-light">
            <p className="text-sm text-ink">
              <b>{rx.block[0].toUpperCase() + rx.block.slice(1)}</b> · {rx.sets} sets × {rx.repLow}–{rx.repHigh} reps
              {rx.tempo !== "smooth" ? ` · tempo ${rx.tempo}` : ""} · rest {rx.restSec}s
            </p>
            <p className="text-grey text-xs mt-1">{rx.notes}</p>
          </div>

          <EquipmentNeeded names={workout.flatMap((s) => s.exercises.map((e) => e.name))} className="mt-3" />

          <div className="mt-3 space-y-3">
            <p className="text-xs text-grey">Warm up 5 min (dynamic stretches) before you start.</p>
            {workout.map((slot) => (
              <div key={slot.slot}>
                <p className="text-xs font-semibold text-teal uppercase tracking-wide">{slot.slot}</p>
                {slot.exercises.length === 0 && <p className="text-grey text-sm">No exercise available at this level.</p>}
                {slot.exercises.map((e) => (
                  <div key={e.id} className="card p-3 mt-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-medium text-navy">{e.name}</span>
                        <span className="text-grey text-xs"> · L{e.level} · {rx.sets}×{rx.repLow}–{rx.repHigh}</span>
                      </div>
                      <button className="btn-ghost text-sm shrink-0" onClick={() => setOpenVid(openVid === e.id ? null : e.id)}>
                        {openVid === e.id ? "Hide" : "Watch ▸"}
                      </button>
                    </div>
                    {openVid === e.id && (
                      <div className="mt-3">
                        <ExerciseVideo cloudinaryId={e.cloudinary_id} youtubeId={e.youtube_id} title={e.name} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <p className="text-xs text-grey">Cool down 5 min (static stretches) when you finish.</p>
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button className="btn-primary" onClick={useAsRoutine} disabled={busy}>Train this today</button>
            <button className="btn-ghost" onClick={saveNamed} disabled={busy}>Save as workout</button>
            {savedMsg && <span className="text-tealdark text-sm">{savedMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

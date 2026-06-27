// Circuit-training engine. Pure module (client/server safe).
// Four formats, each with its own timing options, plus the composition rules:
//   • full-body (one per category: legs / push / pull / core) OR
//   • single-body-part (multiple from one category)
//   • compounds first, then isolation; legs always lead with a big movement.

export type CircuitFormat = "intervals" | "tabata" | "emom" | "amrap";

export interface FormatDef {
  id: CircuitFormat;
  label: string;
  blurb: string;
}

export const CIRCUIT_FORMATS: FormatDef[] = [
  { id: "intervals", label: "1:1 Intervals", blurb: "Work, then rest the same length. Steady and beginner-friendly." },
  { id: "tabata",    label: "Tabata",        blurb: "20s hard, 10s rest, 8 rounds. Short and brutal." },
  { id: "emom",      label: "EMOM",          blurb: "Every minute, do your reps — rest the time you've got left." },
  { id: "amrap",     label: "AMRAP",         blurb: "As many rounds as possible. You set the clock, keep moving." },
];

// ---- per-format options the dancer can pick (program sets a default) ----
export const INTERVAL_SECONDS = [15, 30, 45] as const;     // work = rest
export const EMOM_ROUNDS = [5, 10] as const;
export const EMOM_REPS = [3, 5, 10] as const;
export const AMRAP_MINUTES = [8, 12, 16, 20] as const;
export const AMRAP_SET_STYLES = [
  { id: "super", label: "Superset", count: 2, desc: "2 exercises back to back" },
  { id: "tri",   label: "Tri-set",  count: 3, desc: "3 exercises back to back" },
  { id: "grand", label: "Grand-set", count: 4, desc: "4 exercises back to back" },
] as const;

export interface CircuitConfig {
  format: CircuitFormat;
  // intervals
  intervalSec?: number;     // 15 | 30 | 45 (work = rest)
  // tabata is fixed 20/10 × 8
  // emom
  emomRounds?: number;      // 5 | 10
  emomReps?: number;        // 3 | 5 | 10
  // amrap
  amrapMin?: number;        // total minutes
  amrapSet?: "super" | "tri" | "grand";
  // how many times through (intervals/tabata) — rounds of the whole circuit
  rounds?: number;
}

/** Sensible defaults per format. */
export function defaultConfig(format: CircuitFormat): CircuitConfig {
  switch (format) {
    case "intervals": return { format, intervalSec: 30, rounds: 3 };
    case "tabata":    return { format, rounds: 1 }; // 8 internal rounds per exercise
    case "emom":      return { format, emomRounds: 10, emomReps: 5 };
    case "amrap":     return { format, amrapMin: 12, amrapSet: "tri" };
  }
}

/** How many exercises a circuit should hold for a given format/config. */
export function exerciseCount(cfg: CircuitConfig): number {
  if (cfg.format === "amrap") {
    return cfg.amrapSet === "super" ? 2 : cfg.amrapSet === "grand" ? 4 : 3;
  }
  return 4; // intervals / tabata / emom: legs, push, pull, core (or 4 from one part)
}

/** Human-readable timing summary for a config. */
export function circuitSummary(cfg: CircuitConfig): string {
  switch (cfg.format) {
    case "intervals": return `${cfg.intervalSec}s work / ${cfg.intervalSec}s rest · ${cfg.rounds ?? 3} rounds`;
    case "tabata":    return `20s work / 10s rest · 8 rounds each exercise`;
    case "emom":      return `EMOM · ${cfg.emomRounds} rounds · ${cfg.emomReps} reps every minute`;
    case "amrap":     return `AMRAP ${cfg.amrapMin} min · ${cfg.amrapSet === "super" ? "supersets" : cfg.amrapSet === "grand" ? "grand-sets" : "tri-sets"}`;
  }
}

export type Composition = "full" | "legs" | "push" | "pull" | "core";

export const COMPOSITIONS: { id: Composition; label: string }[] = [
  { id: "full", label: "Full body" },
  { id: "legs", label: "Legs focus" },
  { id: "push", label: "Push focus" },
  { id: "pull", label: "Pull focus" },
  { id: "core", label: "Core focus" },
];

// which library categories feed each slot
export const SLOT_CATS: Record<string, string[]> = {
  legs: ["squat", "hinge", "lunge"],
  push: ["push", "shoulder"],
  pull: ["pull"],
  core: ["core"],
};

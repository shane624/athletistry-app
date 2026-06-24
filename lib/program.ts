// The 24-week periodized engine. Pure functions, no I/O — easy to test.

export type Block = "hypertrophy" | "strength" | "endurance";

export interface Prescription {
  block: Block;
  sets: number;
  repLow: number;
  repHigh: number;
  tempo: string; // "ecc:pause:con"
  restSec: number;
  notes: string;
}

export const TOTAL_WEEKS = 24;

/** Current program week (1..24) from a start date. Clamps to range. */
export function weekFromStartDate(startISO: string, today = new Date()): number {
  const start = new Date(startISO);
  const ms = today.getTime() - start.getTime();
  const week = Math.floor(ms / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(Math.max(week, 1), TOTAL_WEEKS);
}

export function blockForWeek(week: number): Block {
  if (week <= 8) return "hypertrophy";
  if (week <= 16) return "strength";
  return "endurance";
}

/** Tempo wave for the hypertrophy block: 3:1:1 -> 4:1:1 -> 5:1:1 -> 6:1:1 every 2 weeks. */
function hypertrophyTempo(week: number): string {
  const ecc = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 7: 6, 8: 6 }[week] ?? 3;
  return `${ecc}:1:1`;
}

export function prescription(week: number): Prescription {
  const block = blockForWeek(week);
  if (block === "hypertrophy") {
    return {
      block,
      sets: 3,
      repLow: 8,
      repHigh: 12,
      tempo: hypertrophyTempo(week),
      restSec: 75,
      notes:
        "3 sets of 8–12. Last 1–2 reps should be hard with good form. " +
        "Double progression: hit 12 reps on 2 sets in a row → add weight on set 3, start there next week.",
    };
  }
  if (block === "strength") {
    return {
      block,
      sets: 4,
      repLow: 6,
      repHigh: 8,
      tempo: "2:1:1",
      restSec: 150,
      notes:
        "4 sets of 6–8, 2–3 min rest. When all 4 sets reach 8 reps, add load and drop back toward 6.",
    };
  }
  return {
    block,
    sets: 3,
    repLow: 15,
    repHigh: 25,
    tempo: "smooth",
    restSec: 40,
    notes:
      "3 sets of 15–25 at a light load (~40–55% of strength weights), 30–45s rest. " +
      "Finish with an AMRAP/EMOM finisher at 8–10 reps per movement.",
  };
}

export interface SetRecord {
  week: number;
  setNumber: number;
  weight: number;
  reps: number;
}

/**
 * Double-progression hint. Given this exercise's logs for the most recent week,
 * suggest whether to increase weight next session.
 */
export function progressionHint(
  recentWeekLogs: SetRecord[],
  rx: Prescription
): { suggestIncrease: boolean; message: string } {
  if (recentWeekLogs.length === 0) {
    return { suggestIncrease: false, message: "No history yet — log your first session to start tracking." };
  }
  const atTop = recentWeekLogs.filter((s) => s.reps >= rx.repHigh).length;
  if (rx.block === "hypertrophy" && atTop >= 2) {
    return {
      suggestIncrease: true,
      message: `You hit ${rx.repHigh}+ reps on ${atTop} sets. Bump the weight on your next set and start there next week.`,
    };
  }
  if (rx.block === "strength" && atTop >= rx.sets) {
    return {
      suggestIncrease: true,
      message: `All ${rx.sets} sets reached ${rx.repHigh} reps. Add load next session and drop back toward ${rx.repLow}.`,
    };
  }
  if (rx.block === "endurance" && atTop >= 2) {
    return {
      suggestIncrease: true,
      message: `Reps are topping out — nudge the load or shorten rest to keep it challenging.`,
    };
  }
  return { suggestIncrease: false, message: "On track — keep building reps toward the top of the range." };
}

export const BLOCK_LABEL: Record<Block, string> = {
  hypertrophy: "Hypertrophy",
  strength: "Strength",
  endurance: "Endurance",
};

export const BLOCK_WEEKS: Record<Block, string> = {
  hypertrophy: "Weeks 1–8",
  strength: "Weeks 9–16",
  endurance: "Weeks 17–24",
};

/** Which split day for a given calendar day index within the training week (0..3 used). */
export const DAY_TITLES = [
  "Lower — Squat focus",
  "Upper Push",
  "Lower — Hinge & Lunge focus",
  "Upper Pull & Core",
];

// ---- unified prescription for any program (periodized or fixed/timed) ----
import type { Program } from "@/lib/programs";

export interface ResolvedRx {
  block: string;
  sets: number;
  repLow: number;
  repHigh: number;
  tempo: string;
  restSec: number;
  workSec?: number;   // timed mode
  notes: string;
  week: number;       // 1 for fixed programs
}

// ---- Random Workout helpers (pure; safe to import into client or server) ----
import type { WorkoutStyle } from "@/lib/types";

// Map the "Great 8" slots to library categories.
export const SLOT_CATEGORIES: Record<string, string[]> = {
  Legs: ["squat", "hinge", "lunge", "calf"],
  Push: ["push", "shoulder"],
  Pull: ["pull"],
  Core: ["core"],
};

// ---- Isometric / hold exercises: tracked by hold-time, not weight × reps ----
// Matched by name so any program (periodized, custom, random, kids) routes these
// to a hold timer. Keep patterns lowercase.
const HOLD_PATTERNS: RegExp[] = [
  /isometric/i,
  /\bhold\b/i,
  /\bplank\b/i,
  /\bl-?\s?sit\b/i,
  /\bhandstand\b/i,
  /\bbattu\b/i,            // battu strength / l-sit battu
  /\bhollow\b/i,           // hollow hold/body
  /\bhang\b/i,             // dead hang / hanging hold
  /\bwall sit\b/i,
  /\bbridge hold\b/i,
  /\bsuperman hold\b/i,
  /\bhover\b/i,
];

/** True if this exercise should be tracked with a hold timer instead of reps. */
export function isHoldExercise(name: string): boolean {
  return HOLD_PATTERNS.some((re) => re.test(name));
}

/** Suggested target hold per set (seconds) for a hold exercise, by difficulty cue. */
export function holdSeconds(name: string): number {
  const n = name.toLowerCase();
  if (/handstand|l-?\s?sit/.test(n)) return 20;   // hard holds — shorter target
  if (/battu/.test(n)) return 20;
  if (/plank|hollow|bridge|superman/.test(n)) return 30;
  return 30;
}

export function styleRx(style: WorkoutStyle): ResolvedRx {
  if (style === "strength") return { block: "strength", sets: 4, repLow: 3, repHigh: 5, tempo: "2:1:1", restSec: 180, notes: "Strength: lift heavy, 3–5 reps, full ~3 min rest between sets. Intensity high, volume low.", week: 1 };
  if (style === "endurance") return { block: "endurance", sets: 3, repLow: 15, repHigh: 25, tempo: "smooth", restSec: 30, notes: "Endurance: 15–25+ reps, minimal rest, keep moving (circuit-style). Intensity low, volume high.", week: 1 };
  return { block: "hypertrophy", sets: 3, repLow: 8, repHigh: 12, tempo: "3:1:1", restSec: 60, notes: "Hypertrophy: 8–12 reps, 3–4 sets, slow eccentric, low rest. Moderate volume & intensity.", week: 1 };
}

/** Resolve the prescription for a program. For periodized programs, pass the current week. */
export function resolveRx(program: Program, week: number): ResolvedRx {
  if (program.type === "periodized") {
    const p = prescription(week);
    return {
      block: p.block, sets: p.sets, repLow: p.repLow, repHigh: p.repHigh,
      tempo: p.tempo, restSec: p.restSec, notes: p.notes, week,
    };
  }
  const f = program.fixedRx!;
  return {
    block: f.block, sets: f.sets, repLow: f.lo, repHigh: f.hi,
    tempo: f.tempo, restSec: f.rest, workSec: f.work, notes: f.notes, week: 1,
  };
}

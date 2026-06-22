// All training programs, defined in code (the DB stores users + set logs only).
// Days reference exercises by NAME so they resolve against whatever ids the
// exercises table was seeded with.

export type ProgramType = "periodized" | "fixed";

export interface FixedRx {
  block: string;
  sets: number;
  lo: number;
  hi: number;
  tempo: string;
  rest: number;
  work?: number; // timed mode only
  notes: string;
}

export interface ProgramDay {
  index: number;
  title: string;
  exerciseNames: string[];
}

export interface Program {
  id: string;
  name: string;
  tagline: string;
  type: ProgramType;
  scheduling: "weekday" | "manual";
  mode?: "timed";
  fixedRx?: FixedRx;
  days: ProgramDay[];
}

export const PROGRAMS: Program[] = [
  {
    id: "periodized24",
    name: "24-Week Periodized",
    tagline: "Hypertrophy → Strength → Endurance. Auto week detection, 4-day split.",
    type: "periodized",
    scheduling: "weekday",
    days: [
      { index: 0, title: "Day 1 — Lower (Squat focus)", exerciseNames: ["Barbell Back Squat", "Slant Board Squat", "Adductor Isometric Squat Hold", "Kneeling Quadricep Extensions", "Bent Knee Calf Raise", "Angled Calf Raise"] },
      { index: 1, title: "Day 2 — Upper Push", exerciseNames: ["Barbell Bench Press", "Barbell Overhead Strict Press", "Pushup On Toes", "Deficit Pushup", "Tricep Chest Dip", "Overhead Press In Second"] },
      { index: 2, title: "Day 3 — Lower (Hinge & Lunge focus)", exerciseNames: ["Deadlift", "Nordic Hamstring Curls", "Single Leg Deadlift", "Hip Extension Lunge", "Side Lunge To A La Second", "Anterior Tibialis Raises"] },
      { index: 3, title: "Day 4 — Upper Pull & Core", exerciseNames: ["Bent Over Row", "Lat Pulls", "Dumbbell Bench Row", "Lat Press Downs", "Hanging Knee Raise", "Palloff Press", "Cross Body Extensions"] },
    ],
  },
  {
    id: "ballet50",
    name: "Ballet Return — 50+",
    tagline: "Gentle 2-day full-body return to ballet. Mobility-focused, 3×8–10 at 2:2 tempo.",
    type: "fixed",
    scheduling: "manual",
    fixedRx: { block: "ballet", sets: 3, lo: 8, hi: 10, tempo: "2:2", rest: 60, notes: "Full body, twice a week. Move with control — 2 seconds down, 2 seconds up. Prioritize range of motion and mobility over load. Rest ~60s. Stop any movement that causes joint pain." },
    days: [
      { index: 0, title: "Day 1 — Full Body & Mobility", exerciseNames: ["Side Split Walkouts", "Deep Knee Bend", "Chair Elevated Hip Extension Lunge", "Band Row", "Seated Barbell Overhead Press", "Band Deadlift", "Arabesque Port De Bras", "Single Leg Hip Flexor Raise"] },
      { index: 1, title: "Day 2 — Full Body & Mobility", exerciseNames: ["Paralell Front Split Slides", "Adductor Isometric Squat Hold", "Side Lunge To A La Second", "Lat Pulls", "Pushup On Knees", "Arabesque Kicks", "Bent Knee Calf Raise", "Palloff Press"] },
    ],
  },
  {
    id: "fullbody3",
    name: "3-Day Full Body",
    tagline: "Basic hypertrophy, 3 full-body days a week. 3×8–12, controlled tempo.",
    type: "fixed",
    scheduling: "manual",
    fixedRx: { block: "hypertrophy", sets: 3, lo: 8, hi: 12, tempo: "3:1:1", rest: 90, notes: "Three full-body sessions a week. 3 sets of 8–12, last 1–2 reps challenging. Controlled 3:1:1 tempo, ~90s rest. When you hit 12 reps on 2 sets, add weight next time (carried forward automatically)." },
    days: [
      { index: 0, title: "Day 1 — Full Body A", exerciseNames: ["Barbell Back Squat", "Pushup On Toes", "Bent Over Row", "Seated Barbell Overhead Press", "Hanging Knee Raise", "Bent Knee Calf Raise"] },
      { index: 1, title: "Day 2 — Full Body B", exerciseNames: ["Deadlift", "Tricep Chest Dip", "Lat Pulls", "Overhead Press In Second", "Hip Extension Lunge", "Palloff Press"] },
      { index: 2, title: "Day 3 — Full Body C", exerciseNames: ["Slant Board Squat", "Deficit Pushup", "Dumbbell Bench Row", "Barbell Overhead Strict Press", "Single Leg Deadlift", "Cross Body Extensions"] },
    ],
  },
  {
    id: "kids",
    name: "Kids Movement (6–13)",
    tagline: "Fun, bodyweight movement & mobility for kids. 2 short days, no weights — hold each move for 30 seconds.",
    type: "fixed",
    scheduling: "manual",
    mode: "timed",
    fixedRx: { block: "kids", sets: 2, lo: 30, hi: 30, tempo: "smooth", rest: 30, work: 30, notes: "For kids 6–13. Two fun rounds. Do each movement for about 30 seconds, then rest 30 seconds. No weights — just bodyweight, good form, and having fun. Stop and rest anytime. A grown-up should keep an eye out." },
    days: [
      { index: 0, title: "Day 1 — Move & Play", exerciseNames: ["Side Split Walkouts", "Squat", "Pushup On Knees", "Arabesque Kicks", "Side Lunge To A La Second", "Bent Knee Calf Raise", "Battu Strength"] },
      { index: 1, title: "Day 2 — Stretch & Strong", exerciseNames: ["Paralell Front Split Slides", "Deep Knee Bend", "Band Row", "Chair Elevated Hip Extension Lunge", "Single Leg Hip Flexor Raise", "Arabesque Port De Bras", "Palloff Press"] },
    ],
  },
];

export const DEFAULT_PROGRAM_ID = "periodized24";

export function getProgram(id: string | null | undefined): Program {
  return PROGRAMS.find((p) => p.id === id) ?? PROGRAMS[0];
}

export const BLOCK_LABEL: Record<string, string> = {
  hypertrophy: "Hypertrophy", strength: "Strength", endurance: "Endurance", ballet: "Ballet Return", kids: "Kids",
};
export const BLOCK_WEEKS: Record<string, string> = {
  hypertrophy: "Weeks 1–8", strength: "Weeks 9–16", endurance: "Weeks 17–24", ballet: "Full body", kids: "Full body",
};

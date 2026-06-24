// Pure achievements engine — no DB, no "use server". Computes streaks,
// levels (ballet ranks), weekly ring, and badge unlocks from a list of
// workout days and total volume. Importable by both server and client.

export type WorkoutDay = string; // "YYYY-MM-DD" (local)

export interface AchievementsInput {
  /** Distinct local dates the user logged at least one set, ascending. */
  workoutDays: WorkoutDay[];
  /** Total sets logged across all time. */
  totalSets: number;
  /** Total volume lifted (sum of weight*reps), kg. */
  totalVolume: number;
  /** Weekly goal — workouts per week the member aims for. */
  weeklyGoal?: number;
}

export interface Level {
  index: number;        // 0-based
  name: string;
  minWorkouts: number;  // threshold to reach this level
}

// Ballet-rank progression. Thresholds are total workout *days*.
export const LEVELS: Level[] = [
  { index: 0, name: "Apprentice",      minWorkouts: 0 },
  { index: 1, name: "Corps de Ballet", minWorkouts: 5 },
  { index: 2, name: "Coryphée",        minWorkouts: 15 },
  { index: 3, name: "Demi-Soloist",    minWorkouts: 30 },
  { index: 4, name: "Soloist",         minWorkouts: 60 },
  { index: 5, name: "Principal",       minWorkouts: 100 },
  { index: 6, name: "Premier Danseur", minWorkouts: 175 },
  { index: 7, name: "Étoile", minWorkouts: 300 },
];

export interface Badge {
  id: string;
  name: string;
  desc: string;
  earned: boolean;
  /** 0..1 progress toward earning (for locked ones). */
  progress: number;
}

export interface AchievementsResult {
  totalWorkouts: number;
  currentStreak: number;   // consecutive weeks with >=1 workout (rolling)
  bestStreak: number;
  level: Level;
  nextLevel: Level | null;
  toNextLevel: number;       // workouts remaining to next level
  levelProgress: number;     // 0..1 within current level band
  weekCount: number;         // workouts in the current calendar week
  weeklyGoal: number;
  weeklyRing: number;        // 0..1 (capped)
  badges: Badge[];
}

// ---- date helpers (all local) ----
function toDate(d: WorkoutDay): Date { const [y, m, day] = d.split("-").map(Number); return new Date(y, m - 1, day); }
function dayKey(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
/** Monday-based week key, e.g. "2026-W26". */
function weekKey(dt: Date): string {
  const d = new Date(dt);
  const day = (d.getDay() + 6) % 7; // 0=Mon
  d.setDate(d.getDate() - day);
  // ISO-ish week number
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function levelFor(workouts: number): { level: Level; next: Level | null } {
  let level = LEVELS[0];
  for (const l of LEVELS) if (workouts >= l.minWorkouts) level = l;
  const next = LEVELS.find((l) => l.minWorkouts > level.minWorkouts) ?? null;
  return { level, next };
}

export function computeAchievements(input: AchievementsInput): AchievementsResult {
  const days = [...new Set(input.workoutDays)].sort();
  const totalWorkouts = days.length;
  const weeklyGoal = input.weeklyGoal ?? 3;

  // ---- weekly streak (consecutive weeks with >=1 workout, ending this week or last) ----
  const weeks = new Set(days.map((d) => weekKey(toDate(d))));
  // build current/best streak by walking back week by week from this week
  const now = new Date();
  function shiftWeek(base: Date, n: number) { const d = new Date(base); d.setDate(d.getDate() + n * 7); return d; }

  let currentStreak = 0;
  // allow the streak to be "alive" if they trained this week OR last week
  let cursor = weeks.has(weekKey(now)) ? now : (weeks.has(weekKey(shiftWeek(now, -1))) ? shiftWeek(now, -1) : null);
  if (cursor) {
    while (weeks.has(weekKey(cursor))) { currentStreak++; cursor = shiftWeek(cursor, -1); }
  }
  // best streak: longest run of consecutive week keys
  let bestStreak = 0;
  if (days.length) {
    const sortedWeeks = [...weeks].map((wk) => {
      // reconstruct a representative date for ordering: use first day matching
      return wk;
    });
    // Simpler: walk the actual day range week by week.
    const first = toDate(days[0]);
    let run = 0;
    let probe = new Date(first);
    const lastWeek = weekKey(toDate(days[days.length - 1]));
    let safety = 0;
    while (safety++ < 5000) {
      if (weeks.has(weekKey(probe))) { run++; bestStreak = Math.max(bestStreak, run); }
      else run = 0;
      if (weekKey(probe) === lastWeek) break;
      probe = shiftWeek(probe, 1);
    }
  }

  // ---- this week's count ----
  const thisWeek = weekKey(now);
  const weekCount = days.filter((d) => weekKey(toDate(d)) === thisWeek).length;
  const weeklyRing = Math.min(1, weekCount / weeklyGoal);

  // ---- level ----
  const { level, next } = levelFor(totalWorkouts);
  const toNextLevel = next ? Math.max(0, next.minWorkouts - totalWorkouts) : 0;
  const band = next ? next.minWorkouts - level.minWorkouts : 1;
  const levelProgress = next ? Math.min(1, (totalWorkouts - level.minWorkouts) / band) : 1;

  // ---- "perfect week" check: any week meeting the goal ----
  const perWeek: Record<string, number> = {};
  for (const d of days) { const wk = weekKey(toDate(d)); perWeek[wk] = (perWeek[wk] ?? 0) + 1; }
  const hadPerfectWeek = Object.values(perWeek).some((n) => n >= weeklyGoal);

  // ---- comeback: a gap of >=14 days followed by another workout ----
  let comeback = false;
  for (let i = 1; i < days.length; i++) {
    const gap = (toDate(days[i]).getTime() - toDate(days[i - 1]).getTime()) / 86400000;
    if (gap >= 14) { comeback = true; break; }
  }

  // ---- badges ----
  const badge = (id: string, name: string, desc: string, earned: boolean, progress: number): Badge =>
    ({ id, name, desc, earned, progress: Math.max(0, Math.min(1, progress)) });

  const badges: Badge[] = [
    badge("first", "First Steps", "Complete your first workout.", totalWorkouts >= 1, totalWorkouts / 1),
    badge("ten", "Finding Rhythm", "Train 10 days.", totalWorkouts >= 10, totalWorkouts / 10),
    badge("fifty", "Dedicated", "Train 50 days.", totalWorkouts >= 50, totalWorkouts / 50),
    badge("hundred", "Centurion", "Train 100 days.", totalWorkouts >= 100, totalWorkouts / 100),
    badge("streak3", "On a Roll", "Reach a 3-week streak.", bestStreak >= 3, bestStreak / 3),
    badge("streak8", "Unstoppable", "Reach an 8-week streak.", bestStreak >= 8, bestStreak / 8),
    badge("streak20", "Iron Discipline", "Reach a 20-week streak.", bestStreak >= 20, bestStreak / 20),
    badge("perfectweek", "Perfect Week", `Hit your weekly goal of ${weeklyGoal} workouts.`, hadPerfectWeek, hadPerfectWeek ? 1 : weekCount / weeklyGoal),
    badge("volume10k", "Ten Tonnes", "Lift 10,000 kg of total volume.", input.totalVolume >= 10000, input.totalVolume / 10000),
    badge("volume50k", "Heavy Lifter", "Lift 50,000 kg of total volume.", input.totalVolume >= 50000, input.totalVolume / 50000),
    badge("comeback", "Welcome Back", "Return to training after two weeks away.", comeback, comeback ? 1 : 0),
    badge("principal", "Principal", `Reach the Principal rank (${LEVELS[5].minWorkouts} workouts).`, totalWorkouts >= LEVELS[5].minWorkouts, totalWorkouts / LEVELS[5].minWorkouts),
  ];

  return {
    totalWorkouts, currentStreak, bestStreak,
    level, nextLevel: next, toNextLevel, levelProgress,
    weekCount, weeklyGoal, weeklyRing, badges,
  };
}

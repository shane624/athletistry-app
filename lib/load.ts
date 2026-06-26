// Training-load engine. Pure functions, no I/O — testable.
//
// Model: session-RPE TRIMP (Foster's method).
//   session TRIMP = duration(min) × RPE(1–10)
//   weekly load   = sum of session TRIMPs in that week
//
// Rules (set by the coach):
//   • Each week aim for ~10% MORE weekly load than last week (progressive overload).
//   • Push volume OR intensity, not both — flag a week where avg duration AND
//     avg RPE both jumped meaningfully (overreaching risk).
//   • From 2 weeks out from an event: cut volume ~30% but hold intensity (taper).

export interface SessionInput {
  date: string;        // YYYY-MM-DD (local)
  durationMin: number;
  rpe: number;         // 1–10
}

export function sessionTrimp(durationMin: number, rpe: number): number {
  return Math.max(0, Math.round(durationMin)) * Math.max(0, Math.min(10, rpe));
}

// ---- week keys (Monday-based, local) ----
export function weekKey(d: Date): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
function parseDate(s: string): Date { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }

export interface WeekLoad {
  week: string;        // monday date key
  trimp: number;       // total weekly load
  sessions: number;    // count
  avgDuration: number; // mean session minutes
  avgRpe: number;      // mean session RPE
}

/** Group sessions into weekly loads, ascending by week. */
export function weeklyLoads(sessions: SessionInput[]): WeekLoad[] {
  const map = new Map<string, { trimp: number; n: number; dur: number; rpe: number }>();
  for (const s of sessions) {
    const wk = weekKey(parseDate(s.date));
    if (!map.has(wk)) map.set(wk, { trimp: 0, n: 0, dur: 0, rpe: 0 });
    const w = map.get(wk)!;
    w.trimp += sessionTrimp(s.durationMin, s.rpe);
    w.n += 1; w.dur += s.durationMin; w.rpe += s.rpe;
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, w]) => ({
      week, trimp: w.trimp, sessions: w.n,
      avgDuration: w.n ? Math.round(w.dur / w.n) : 0,
      avgRpe: w.n ? +(w.rpe / w.n).toFixed(1) : 0,
    }));
}

export type LoadStatus = "no-data" | "on-track" | "under" | "over" | "taper" | "event-week";

export interface LoadAssessment {
  thisWeek: WeekLoad | null;
  lastWeek: WeekLoad | null;
  changePct: number | null;      // this vs last week, %
  targetTrimp: number | null;    // last week + 10% (or taper target)
  status: LoadStatus;
  message: string;
  bothJumped: boolean;           // duration AND rpe both rose (overreaching)
  weeksToEvent: number | null;   // null if no upcoming event
  taper: boolean;                // within 2 weeks of an event
}

const TARGET_INC = 0.10;     // +10% week to week
const TAPER_CUT = 0.30;      // -30% volume in taper
const OVERREACH = 0.08;      // both metrics up >8% = "both jumped"

/** Assess the current week given the load history and an optional next event. */
export function assessLoad(sessions: SessionInput[], nextEventISO?: string | null, today = new Date()): LoadAssessment {
  const weeks = weeklyLoads(sessions);
  const thisKey = weekKey(today);
  const lastKey = weekKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
  const thisWeek = weeks.find((w) => w.week === thisKey) ?? null;
  const lastWeek = weeks.find((w) => w.week === lastKey) ?? null;

  // weeks until the event
  let weeksToEvent: number | null = null;
  if (nextEventISO) {
    const ev = parseDate(nextEventISO);
    const ms = ev.getTime() - today.getTime();
    weeksToEvent = Math.ceil(ms / (7 * 24 * 3600 * 1000));
    if (weeksToEvent < 0) weeksToEvent = null; // already passed
  }
  const taper = weeksToEvent !== null && weeksToEvent <= 2 && weeksToEvent >= 1;
  const eventWeek = weeksToEvent !== null && weeksToEvent <= 0;

  const base = lastWeek?.trimp ?? 0;

  // both-jumped check
  let bothJumped = false;
  if (thisWeek && lastWeek && lastWeek.avgDuration > 0 && lastWeek.avgRpe > 0) {
    const durUp = (thisWeek.avgDuration - lastWeek.avgDuration) / lastWeek.avgDuration;
    const rpeUp = (thisWeek.avgRpe - lastWeek.avgRpe) / lastWeek.avgRpe;
    bothJumped = durUp > OVERREACH && rpeUp > OVERREACH;
  }

  if (eventWeek) {
    return { thisWeek, lastWeek, changePct: null, targetTrimp: null, status: "event-week", bothJumped: false, weeksToEvent, taper: false,
      message: "Event week — keep movement light and sharp. The training is banked. Now dance." };
  }

  if (taper) {
    const target = Math.round(base * (1 - TAPER_CUT));
    const change = base > 0 && thisWeek ? Math.round(((thisWeek.trimp - base) / base) * 100) : null;
    return { thisWeek, lastWeek, changePct: change, targetTrimp: target, status: "taper", bothJumped, weeksToEvent, taper: true,
      message: `Taper: aim to drop weekly load ~30% to about ${target} TRIMP — cut volume (shorter/fewer sessions) but keep intensity (RPE) high. Arrive fresh.` };
  }

  if (!thisWeek && !lastWeek) {
    return { thisWeek, lastWeek, changePct: null, targetTrimp: null, status: "no-data", bothJumped: false, weeksToEvent, taper: false,
      message: "Log a few sessions (duration + RPE) and your weekly load and targets will appear here." };
  }

  const target = Math.round(base * (1 + TARGET_INC));
  const change = base > 0 && thisWeek ? Math.round(((thisWeek.trimp - base) / base) * 100) : null;

  if (!lastWeek || base === 0) {
    return { thisWeek, lastWeek, changePct: change, targetTrimp: null, status: "on-track", bothJumped, weeksToEvent, taper: false,
      message: "First tracked week — this becomes your baseline. Next week, aim for about 10% more." };
  }

  let status: LoadStatus = "on-track";
  let message = "";
  const cur = thisWeek?.trimp ?? 0;
  if (cur >= base * 1.20) { status = "over"; message = `You're well over a 10% increase (${change}%). That's a big jump — make sure it isn't both more volume and more intensity at once.`; }
  else if (cur >= base * 1.05) { status = "on-track"; message = `On track — up ${change}% on last week. Target ~${target} TRIMP.`; }
  else if (cur >= base * 0.95) { status = "on-track"; message = `Holding steady. To progress, build toward ~${target} TRIMP this week (about +10%).`; }
  else { status = "under"; message = `Below last week so far (${change}%). To keep progressing, build toward ~${target} TRIMP.`; }

  if (bothJumped) message += " Heads up: both your session length and RPE rose — push one or the other, not both.";

  return { thisWeek, lastWeek, changePct: change, targetTrimp: target, status, message, bothJumped, weeksToEvent, taper: false };
}

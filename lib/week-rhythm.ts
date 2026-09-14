// This week's training rhythm for the dashboard: the days themselves, plus a
// comparison against the dancer's own recent average.
//
// Deliberately no fixed weekly target. The onboarding asks how often someone
// can train but never persists the answer, so any "3 of 5" bar would be an
// invented denominator. Comparing against their own trailing average is both
// derivable from real data and more honest: it says whether this week is
// heavier or lighter than usual for them, which is the question a dancer
// actually has.
import { cookies } from "next/headers";
import { getLoadData, type SessionRow } from "@/lib/load-data";
import { classLabel } from "@/lib/classes";
import { sessionTrimp } from "@/lib/load";

const WEEKS_OF_HISTORY = 4;

export interface RhythmSession {
  id: number;
  kind: string;
  label: string;
  durationMin: number;
  rpe: number;
  startTime: string | null;
}

export interface RhythmDay {
  iso: string;
  weekday: string;
  dayNum: number;
  isToday: boolean;
  isFuture: boolean;
  sessions: RhythmSession[];
  load: number;
}

export interface WeekRhythm {
  days: RhythmDay[];
  sessionCount: number;
  minutes: number;
  load: number;
  /** Trailing average over the previous full weeks, null until there's history. */
  avgSessions: number | null;
  avgMinutes: number | null;
  hasHistory: boolean;
}

// The dancer's LOCAL date, same convention as event-plan-data: a cookie the
// client sets, so a Monday in Brisbane is not read as Sunday in UTC.
function todayISO(): string {
  try {
    const c = cookies().get("athl_local_date")?.value;
    if (c && /^\d{4}-\d{2}-\d{2}$/.test(c)) return c;
  } catch {}
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Monday of the week containing `dateISO`. Weeks start Monday, as in class timetables. */
function mondayOf(dateISO: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = (dt.getDay() + 6) % 7; // Mon = 0
  dt.setDate(dt.getDate() - dow);
  return dt;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function getWeekRhythm(): Promise<WeekRhythm> {
  const { sessions } = await getLoadData();
  const today = todayISO();
  const monday = mondayOf(today);

  const byDay = new Map<string, SessionRow[]>();
  for (const s of sessions) {
    const list = byDay.get(s.session_date) ?? [];
    list.push(s);
    byDay.set(s.session_date, list);
  }

  const days: RhythmDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    const key = iso(dt);
    const rows = (byDay.get(key) ?? []).slice().sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
    days.push({
      iso: key,
      weekday: WEEKDAYS[i],
      dayNum: dt.getDate(),
      isToday: key === today,
      isFuture: key > today,
      sessions: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        label: classLabel(r.kind),
        durationMin: r.duration_min,
        rpe: r.rpe,
        startTime: r.start_time,
      })),
      load: rows.reduce((sum, r) => sum + sessionTrimp(r.duration_min, r.rpe), 0),
    });
  }

  const thisWeek = days.flatMap((d) => d.sessions);
  const minutes = thisWeek.reduce((sum, s) => sum + s.durationMin, 0);
  const load = days.reduce((sum, d) => sum + d.load, 0);

  // Trailing average over the previous complete weeks, excluding this one.
  const weekStart = iso(monday);
  const earliest = new Date(monday);
  earliest.setDate(monday.getDate() - 7 * WEEKS_OF_HISTORY);
  const earliestISO = iso(earliest);
  const prior = sessions.filter((s) => s.session_date >= earliestISO && s.session_date < weekStart);

  const priorWeeks = new Set(prior.map((s) => iso(mondayOf(s.session_date))));
  const weekCount = priorWeeks.size;
  const hasHistory = weekCount > 0;

  return {
    days,
    sessionCount: thisWeek.length,
    minutes,
    load: Math.round(load),
    avgSessions: hasHistory ? Math.round((prior.length / weekCount) * 10) / 10 : null,
    avgMinutes: hasHistory ? Math.round(prior.reduce((sum, s) => sum + s.duration_min, 0) / weekCount) : null,
    hasHistory,
  };
}

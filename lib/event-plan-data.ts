import { createClient } from "@/lib/supabase-server";
import type { ExerciseRow } from "@/lib/types";

export interface EventPlanToday {
  active: boolean;
  label: string | null;
  date: string;
  sessionType: string;          // strength|hypertrophy|endurance|cardio|tabata|rest
  title: string;
  detail: string;
  block: string | null;         // rx block to resolve
  exercises: ExerciseRow[];     // the day's exercises (empty for rest/cardio/tabata)
  weekIndex: number;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * If the dancer has an active event plan, return today's prescribed day
 * (session or rest). Returns { active: false } otherwise so the dashboard
 * falls back to the normal program.
 */
export async function getEventPlanToday(): Promise<EventPlanToday | { active: false }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: false };

  const { data: state } = await supabase
    .from("user_program_state")
    .select("event_plan_active, event_plan_label")
    .eq("user_id", user.id)
    .single();
  if (!state?.event_plan_active) return { active: false };

  const iso = todayISO();
  const { data: row } = await supabase
    .from("event_plan_days")
    .select("plan_date, session_type, title, detail, exercise_ids, block, week_index")
    .eq("user_id", user.id)
    .eq("plan_date", iso)
    .single();

  // active plan but no row for today (plan finished / gap) → treat as rest
  if (!row) {
    return {
      active: true, label: state.event_plan_label ?? null, date: iso,
      sessionType: "rest", title: "Rest day", detail: "Nothing scheduled today — gentle mobility if you like, otherwise rest and recover.",
      block: null, exercises: [], weekIndex: 0,
    };
  }

  let exercises: ExerciseRow[] = [];
  const ids: number[] = row.exercise_ids ?? [];
  if (ids.length) {
    const { data: exRows } = await supabase
      .from("exercises")
      .select("id,name,youtube_id,cloudinary_id,level,category")
      .in("id", ids);
    // preserve the saved order
    const byId = new Map((exRows ?? []).map((e) => [e.id, e as ExerciseRow]));
    exercises = ids.map((id) => byId.get(id)).filter((e): e is ExerciseRow => !!e);
  }

  return {
    active: true,
    label: state.event_plan_label ?? null,
    date: row.plan_date,
    sessionType: row.session_type,
    title: row.title,
    detail: row.detail,
    block: row.block ?? null,
    exercises,
    weekIndex: row.week_index ?? 0,
  };
}

/* ---------------- whole-plan "at a glance" ---------------- */

export interface PlanGlanceDay {
  date: string;
  sessionType: string;
  title: string;
  isToday: boolean;
  isPast: boolean;
}
export interface PlanGlanceWeek { weekIndex: number; days: PlanGlanceDay[]; }
export interface PlanGlance {
  active: boolean;
  label: string | null;
  totalDays: number;
  doneDays: number;
  daysToEvent: number;
  weeks: PlanGlanceWeek[];
}

export interface PlanCalendarDay { date: string; sessionType: string; title: string; }

export interface PlanUpcomingDay {
  date: string;
  weekday: string;
  sessionType: string;
  title: string;
  detail: string;
  exerciseNames: string[];
  isWorkout: boolean;
}

const DOW3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The next few plan days AFTER today, with exercise names — for a "coming up"
 *  preview. Returns the first working day expanded + a short look-ahead. */
export async function getEventPlanUpcoming(count = 5): Promise<{ active: boolean; days: PlanUpcomingDay[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: false, days: [] };

  const { data: state } = await supabase
    .from("user_program_state")
    .select("event_plan_active")
    .eq("user_id", user.id)
    .single();
  if (!state?.event_plan_active) return { active: false, days: [] };

  const iso = todayISO();
  const { data: rows } = await supabase
    .from("event_plan_days")
    .select("plan_date, session_type, title, detail, exercise_ids")
    .eq("user_id", user.id)
    .gt("plan_date", iso)
    .order("plan_date", { ascending: true })
    .limit(count);

  const all = rows ?? [];
  // resolve all referenced exercise names in one query
  const allIds = [...new Set(all.flatMap((r) => (r.exercise_ids ?? []) as number[]))];
  const nameById = new Map<number, string>();
  if (allIds.length) {
    const { data: exRows } = await supabase.from("exercises").select("id,name").in("id", allIds);
    for (const e of exRows ?? []) nameById.set(e.id, e.name as string);
  }

  const days: PlanUpcomingDay[] = all.map((r) => {
    const ids: number[] = r.exercise_ids ?? [];
    return {
      date: r.plan_date,
      weekday: DOW3[new Date(r.plan_date + "T00:00:00").getDay()],
      sessionType: r.session_type,
      title: r.title,
      detail: r.detail,
      exerciseNames: ids.map((id) => nameById.get(id)).filter((n): n is string => !!n),
      isWorkout: r.session_type !== "rest",
    };
  });

  return { active: true, days };
}

/** Flat list of the active plan's days, for overlaying on the calendar. */
export async function getEventPlanDays(): Promise<{ active: boolean; label: string | null; days: PlanCalendarDay[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: false, label: null, days: [] };

  const { data: state } = await supabase
    .from("user_program_state")
    .select("event_plan_active, event_plan_label")
    .eq("user_id", user.id)
    .single();
  if (!state?.event_plan_active) return { active: false, label: null, days: [] };

  const { data: rows } = await supabase
    .from("event_plan_days")
    .select("plan_date, session_type, title")
    .eq("user_id", user.id)
    .order("plan_date", { ascending: true });

  return {
    active: true,
    label: state.event_plan_label ?? null,
    days: (rows ?? []).map((r) => ({ date: r.plan_date, sessionType: r.session_type, title: r.title })),
  };
}

/** The whole active event plan, grouped by week, for the overview screen. */
export async function getEventPlanOverview(): Promise<PlanGlance | { active: false }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: false };

  const { data: state } = await supabase
    .from("user_program_state")
    .select("event_plan_active, event_plan_label")
    .eq("user_id", user.id)
    .single();
  if (!state?.event_plan_active) return { active: false };

  const { data: rows } = await supabase
    .from("event_plan_days")
    .select("plan_date, session_type, title, week_index")
    .eq("user_id", user.id)
    .order("plan_date", { ascending: true });

  const all = rows ?? [];
  if (!all.length) return { active: false };

  const iso = todayISO();
  const byWeek = new Map<number, PlanGlanceDay[]>();
  let doneDays = 0;
  for (const r of all) {
    const isPast = r.plan_date < iso;
    const isToday = r.plan_date === iso;
    if (isPast) doneDays++;
    const wk = r.week_index ?? 1;
    if (!byWeek.has(wk)) byWeek.set(wk, []);
    byWeek.get(wk)!.push({ date: r.plan_date, sessionType: r.session_type, title: r.title, isToday, isPast });
  }
  const weeks = [...byWeek.entries()].sort((a, b) => a[0] - b[0]).map(([weekIndex, days]) => ({ weekIndex, days }));

  // days until the event = the last plan day
  const lastDate = all[all.length - 1].plan_date;
  const daysToEvent = Math.max(0, Math.round((new Date(lastDate + "T00:00:00").getTime() - new Date(iso + "T00:00:00").getTime()) / 86400000));

  return { active: true, label: state.event_plan_label ?? null, totalDays: all.length, doneDays, daysToEvent, weeks };
}

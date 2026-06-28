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

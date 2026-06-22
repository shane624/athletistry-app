"use server";

import { createClient } from "@/lib/supabase-server";
import { prescription, weekFromStartDate, DAY_TITLES } from "@/lib/program";
import type { ExerciseRow, TodayData } from "@/lib/types";

/** Resolve the user's current week (override wins, else derive from start date). */
async function resolveWeek(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 1;
  const { data: profile } = await supabase.from("profiles").select("program_start_date").eq("id", user.id).single();
  const { data: state } = await supabase.from("user_program_state").select("week_override").eq("user_id", user.id).single();
  if (state?.week_override) return state.week_override;
  return weekFromStartDate(profile?.program_start_date ?? new Date().toISOString());
}

/** Pick today's split day. Simple rotation by ISO day-of-week; rest days fall back to Day 1 preview. */
function todayDayIndex(): number {
  const dow = new Date().getDay(); // 0 Sun..6 Sat
  const map: Record<number, number> = { 1: 0, 2: 1, 4: 2, 5: 3 }; // Mon,Tue,Thu,Fri
  return map[dow] ?? 0;
}

export async function getToday(): Promise<TodayData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const week = await resolveWeek();
  const dayIndex = todayDayIndex();
  const rx = prescription(week);

  const { data: day } = await supabase.from("program_days").select("id,title").eq("day_index", dayIndex).single();
  const { data: links } = await supabase
    .from("program_day_exercises")
    .select("ord, exercises(id,name,youtube_id,level,category)")
    .eq("day_id", day?.id ?? -1)
    .order("ord");

  const exercises: ExerciseRow[] = (links ?? []).map((l: any) => l.exercises);

  const logs: TodayData["logs"] = {};
  if (user && exercises.length) {
    const { data: setRows } = await supabase
      .from("set_logs")
      .select("exercise_id,set_number,weight,reps")
      .eq("user_id", user.id)
      .eq("week", week)
      .in("exercise_id", exercises.map((e) => e.id));
    for (const r of setRows ?? []) {
      logs[r.exercise_id] ??= {};
      logs[r.exercise_id][r.set_number] = { weight: Number(r.weight), reps: r.reps };
    }
  }

  return { week, dayIndex, dayTitle: day?.title ?? DAY_TITLES[dayIndex], rx, exercises, logs };
}

export async function logSet(input: {
  exerciseId: number;
  week: number;
  dayIndex: number;
  setNumber: number;
  weight: number;
  reps: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("set_logs").upsert(
    {
      user_id: user.id,
      exercise_id: input.exerciseId,
      week: input.week,
      day_index: input.dayIndex,
      set_number: input.setNumber,
      weight: input.weight,
      reps: input.reps,
    },
    { onConflict: "user_id,exercise_id,week,set_number" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Progress series for one exercise: top weight & total volume per week. */
export async function getProgress(exerciseId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("set_logs")
    .select("week,weight,reps")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .order("week");
  const byWeek: Record<number, { topWeight: number; volume: number }> = {};
  for (const r of data ?? []) {
    const w = r.week as number;
    byWeek[w] ??= { topWeight: 0, volume: 0 };
    byWeek[w].topWeight = Math.max(byWeek[w].topWeight, Number(r.weight));
    byWeek[w].volume += Number(r.weight) * r.reps;
  }
  return Object.entries(byWeek).map(([week, v]) => ({ week: Number(week), ...v }));
}

export async function listExercises(): Promise<ExerciseRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from("exercises").select("id,name,youtube_id,level,category").order("name");
  return data ?? [];
}

"use server";

import { createClient } from "@/lib/supabase-server";
import { weekFromStartDate, resolveRx, type ResolvedRx } from "@/lib/program";
import { getProgram, DEFAULT_PROGRAM_ID, type Program } from "@/lib/programs";
import type { ExerciseRow, TodayData } from "@/lib/types";

/** Read the user's saved program state (active program, selected day, week override, start date). */
async function getUserState() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, programId: DEFAULT_PROGRAM_ID, selectedDay: 0, weekOverride: null as number | null, startDate: new Date().toISOString() };
  const { data: profile } = await supabase.from("profiles").select("program_start_date").eq("id", user.id).single();
  const { data: state } = await supabase
    .from("user_program_state")
    .select("week_override, active_program, selected_day")
    .eq("user_id", user.id)
    .single();
  return {
    user,
    programId: state?.active_program ?? DEFAULT_PROGRAM_ID,
    selectedDay: state?.selected_day ?? 0,
    weekOverride: state?.week_override ?? null,
    startDate: profile?.program_start_date ?? new Date().toISOString(),
  };
}

function weekdayDayIndex(): number {
  const dow = new Date().getDay();
  const map: Record<number, number> = { 1: 0, 2: 1, 4: 2, 5: 3 };
  return map[dow] ?? 0;
}

/** Resolve all exercises for a list of names, returning DB rows (id/name/youtube/level/category). */
async function exercisesByName(names: string[]): Promise<ExerciseRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("exercises")
    .select("id,name,youtube_id,level,category")
    .in("name", names);
  const byName = new Map((data ?? []).map((e: any) => [e.name, e]));
  // preserve the program's order
  return names.map((n) => byName.get(n)).filter(Boolean) as ExerciseRow[];
}

export async function getToday(): Promise<TodayData & { programId: string; programName: string; programType: string; mode?: string; dayCount: number; scheduling: string }> {
  const st = await getUserState();
  const program: Program = getProgram(st.programId);

  const week = program.type === "periodized"
    ? (st.weekOverride ?? weekFromStartDate(st.startDate))
    : 1;
  const dayIndex = program.scheduling === "weekday"
    ? weekdayDayIndex()
    : Math.min(st.selectedDay, program.days.length - 1);

  const rx: ResolvedRx = resolveRx(program, week);
  const day = program.days[dayIndex];
  const exercises = await exercisesByName(day.exerciseNames);

  const logs: TodayData["logs"] = {};
  if (st.user && exercises.length) {
    const supabase = createClient();
    const { data: setRows } = await supabase
      .from("set_logs")
      .select("exercise_id,set_number,weight,reps")
      .eq("user_id", st.user.id)
      .eq("program_id", program.id)
      .eq("week", week)
      .eq("day_index", dayIndex)
      .in("exercise_id", exercises.map((e) => e.id));
    for (const r of setRows ?? []) {
      logs[r.exercise_id] ??= {};
      logs[r.exercise_id][r.set_number] = { weight: Number(r.weight), reps: r.reps };
    }
  }

  return {
    week, dayIndex, dayTitle: day.title, rx: rx as any, exercises, logs,
    programId: program.id, programName: program.name, programType: program.type,
    mode: program.mode, dayCount: program.days.length, scheduling: program.scheduling,
  };
}

export async function setActiveProgram(programId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("user_program_state").upsert(
    { user_id: user.id, active_program: programId, selected_day: 0, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function setSelectedDay(dayIndex: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("user_program_state").upsert(
    { user_id: user.id, selected_day: dayIndex, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function logSet(input: {
  programId: string;
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
      program_id: input.programId,
      exercise_id: input.exerciseId,
      week: input.week,
      day_index: input.dayIndex,
      set_number: input.setNumber,
      weight: input.weight,
      reps: input.reps,
    },
    { onConflict: "user_id,program_id,exercise_id,week,day_index,set_number" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Progress series for one exercise within the active program. */
export async function getProgress(programId: string, exerciseId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("set_logs")
    .select("week,weight,reps")
    .eq("user_id", user.id)
    .eq("program_id", programId)
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

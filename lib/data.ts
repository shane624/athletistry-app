"use server";

import { createClient } from "@/lib/supabase-server";
import { weekFromStartDate, resolveRx, SLOT_CATEGORIES, isHoldExercise, type ResolvedRx } from "@/lib/program";
import { getProgram, DEFAULT_PROGRAM_ID, type Program } from "@/lib/programs";
import type { ExerciseRow, TodayData, WorkoutStyle } from "@/lib/types";

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
    .select("id,name,youtube_id,cloudinary_id,level,category")
    .in("name", names);
  const byName = new Map((data ?? []).map((e: any) => [e.name, e]));
  // preserve the program's order
  return names.map((n) => byName.get(n)).filter(Boolean) as ExerciseRow[];
}

export async function getToday(): Promise<TodayData & { programId: string; programName: string; programType: string; mode?: string; dayCount: number; scheduling: string; isCustom?: boolean; phase?: string; principle?: string }> {
  const st = await getUserState();
  const program: Program = getProgram(st.programId);
  const isCustom = program.id === "custom";

  const week = program.type === "periodized"
    ? (st.weekOverride ?? weekFromStartDate(st.startDate))
    : 1;

  let exercises: ExerciseRow[];
  let dayIndex: number;
  let dayTitle: string;
  let dayCount: number;
  let phase: string | undefined;
  let principle: string | undefined;

  if (isCustom) {
    // custom days come from the user's saved rows
    const customDays = await getCustomDays();         // [{dayIndex, exercises[]}, ...]
    dayCount = Math.max(customDays.length, 1);
    dayIndex = Math.min(st.selectedDay, dayCount - 1);
    const sel = customDays.find((d) => d.dayIndex === dayIndex) ?? customDays[0];
    exercises = sel?.exercises ?? [];
    dayTitle = `My Routine — Day ${dayIndex + 1}`;
  } else {
    dayIndex = program.scheduling === "weekday"
      ? weekdayDayIndex()
      : Math.min(st.selectedDay, program.days.length - 1);
    const day = program.days[dayIndex];
    dayTitle = day.title;
    phase = day.phase;
    principle = day.principle;
    dayCount = program.days.length;
    exercises = await exercisesByName(day.exerciseNames);
  }

  const rx: ResolvedRx = resolveRx(program, week);

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
    week, dayIndex, dayTitle, phase, principle, rx: rx as any, exercises, logs,
    programId: program.id, programName: program.name, programType: program.type,
    mode: program.mode, dayCount, scheduling: program.scheduling, isCustom,
  };
}

/** Read the user's custom routine, grouped by day with resolved exercise rows. */
export async function getCustomDays(): Promise<{ dayIndex: number; exercises: ExerciseRow[] }[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [{ dayIndex: 0, exercises: [] }];
  const { data: rows } = await supabase
    .from("custom_program_exercises")
    .select("day_index, ord, exercises(id,name,youtube_id,cloudinary_id,level,category)")
    .eq("user_id", user.id)
    .order("day_index").order("ord");
  const byDay = new Map<number, ExerciseRow[]>();
  for (const r of (rows ?? []) as any[]) {
    const arr = byDay.get(r.day_index) ?? [];
    if (r.exercises) arr.push(r.exercises);
    byDay.set(r.day_index, arr);
  }
  if (byDay.size === 0) return [{ dayIndex: 0, exercises: [] }];
  return [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([dayIndex, exercises]) => ({ dayIndex, exercises }));
}

/** Replace the user's custom routine for one day with a new ordered list of exercise ids. */
export async function saveCustomDay(dayIndex: number, exerciseIds: number[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  // clear existing rows for that day, then insert the new order
  await supabase.from("custom_program_exercises").delete().eq("user_id", user.id).eq("day_index", dayIndex);
  if (exerciseIds.length) {
    const rows = exerciseIds.map((id, i) => ({ user_id: user.id, day_index: dayIndex, exercise_id: id, ord: i }));
    const { error } = await supabase.from("custom_program_exercises").insert(rows);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
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
  const { data } = await supabase.from("exercises").select("id,name,youtube_id,cloudinary_id,level,category").order("name");
  return data ?? [];
}

/* ============================================================
   Random Workout Generator (async server action).
   styleRx + SLOT_CATEGORIES live in lib/program.ts (pure helpers).
   ============================================================ */

/** Generate a balanced one-day workout. perSlot = exercises per slot (1 or 2).
 *  maxLevel caps difficulty. equipment (optional) limits to what's available. */
export async function generateWorkout(style: WorkoutStyle, perSlot = 1, maxLevel = 4, equipment?: string[]): Promise<{ slot: string; exercises: ExerciseRow[] }[]> {
  const { fitsEquipment } = await import("@/lib/equipment");
  const all = await listExercises();
  let usable = all.filter((e) => e.level <= maxLevel);
  // Isometric / hold exercises don't suit a hypertrophy rep scheme — keep them
  // out of hypertrophy-style generated workouts (they belong in strength/skill work).
  if (style === "hypertrophy") {
    usable = usable.filter((e) => !isHoldExercise(e.name));
  }
  if (equipment && equipment.length) {
    const allowed = new Set(equipment as any[]);
    usable = usable.filter((e) => fitsEquipment(e.name, allowed as any));
  }
  const pick = <T,>(arr: T[], n: number): T[] => {
    const copy = [...arr]; const out: T[] = [];
    while (copy.length && out.length < n) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    return out;
  };
  return Object.entries(SLOT_CATEGORIES).map(([slot, cats]) => {
    const pool = usable.filter((e) => cats.includes(e.category));
    return { slot, exercises: pick(pool, perSlot) };
  });
}

/** Build a targeted workout for a ballet move: the library exercises that
 *  benefit that move, optionally filtered by max level and available
 *  equipment (e.g. band-only for a traveller). */
export async function generateBalletWorkout(
  moveSlug: string,
  opts?: { maxLevel?: number; equipment?: string[] }
): Promise<{ move: string; focus: string; exercises: ExerciseRow[] } | null> {
  const { balletMove } = await import("@/lib/ballet");
  const { fitsEquipment } = await import("@/lib/equipment");
  const move = balletMove(moveSlug);
  if (!move) return null;
  const all = await listExercises();
  const byName = new Map(all.map((e) => [e.name.toLowerCase(), e]));
  const maxLevel = opts?.maxLevel ?? 4;
  const allowed = opts?.equipment && opts.equipment.length
    ? new Set(opts.equipment as any[])
    : null; // null = no equipment filter
  const exercises = move.exercises
    .map((n) => byName.get(n.toLowerCase()))
    .filter((e): e is ExerciseRow => !!e)
    .filter((e) => e.level <= maxLevel)
    .filter((e) => !allowed || fitsEquipment(e.name, allowed as any));
  return { move: move.name, focus: move.focus, exercises };
}

/** Onboarding status for the logged-in user.
 *  If the onboarding columns don't exist yet (migration not run) or the query
 *  errors, we treat the user as fully onboarded so they are NOT trapped in a
 *  redirect loop to the disclaimer. */
export async function getOnboarding(): Promise<{ disclaimerAccepted: boolean; onboarded: boolean; learningCompleted: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { disclaimerAccepted: true, onboarded: true, learningCompleted: true };
  const { data, error } = await supabase
    .from("profiles")
    .select("disclaimer_accepted_at, onboarded, learning_completed")
    .eq("id", user.id)
    .single();
  if (error) {
    // columns missing or read failed — don't loop the onboarding flows
    return { disclaimerAccepted: true, onboarded: true, learningCompleted: true };
  }
  return {
    disclaimerAccepted: !!data?.disclaimer_accepted_at,
    onboarded: !!data?.onboarded,
    // if the column doesn't exist yet, default to true so nobody is locked out
    learningCompleted: data?.learning_completed === undefined ? true : !!data?.learning_completed,
  };
}

/** Mark the Start Here learning flow complete (called after passing the quiz). */
export async function completeLearning() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("profiles").update({ learning_completed: true }).eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function acceptDisclaimer() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase
    .from("profiles")
    .update({ disclaimer_accepted_at: new Date().toISOString() })
    .eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Mark onboarding complete (called when they pick their first program). */
export async function markOnboarded() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ============================================================
   Saved Workouts library (multiple named workouts per user)
   ============================================================ */

/** Save a named workout from an ordered list of exercise ids. */
export async function saveWorkout(name: string, exerciseIds: number[], style = "custom") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (!name.trim() || exerciseIds.length === 0) return { ok: false, error: "Add a name and at least one exercise." };
  const { data: wk, error: e1 } = await supabase
    .from("saved_workouts")
    .insert({ user_id: user.id, name: name.trim(), style })
    .select("id")
    .single();
  if (e1 || !wk) return { ok: false, error: e1?.message ?? "Could not save" };
  const rows = exerciseIds.map((id, i) => ({ workout_id: wk.id, exercise_id: id, ord: i }));
  const { error: e2 } = await supabase.from("saved_workout_exercises").insert(rows);
  if (e2) return { ok: false, error: e2.message };
  return { ok: true, id: wk.id as number };
}

/** List the user's saved workouts with their exercises. */
export async function listSavedWorkouts(): Promise<{ id: number; name: string; style: string; exercises: ExerciseRow[] }[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: wks } = await supabase
    .from("saved_workouts")
    .select("id,name,style,saved_workout_exercises(ord, exercises(id,name,youtube_id,cloudinary_id,level,category))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (wks ?? []).map((w: any) => ({
    id: w.id, name: w.name, style: w.style,
    exercises: (w.saved_workout_exercises ?? [])
      .sort((a: any, b: any) => a.ord - b.ord)
      .map((r: any) => r.exercises)
      .filter(Boolean),
  }));
}

export async function deleteSavedWorkout(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("saved_workouts").delete().eq("id", id).eq("user_id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function renameSavedWorkout(id: number, name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("saved_workouts").update({ name: name.trim() }).eq("id", id).eq("user_id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Load a saved workout into the custom slot and make it active for tracking in Today. */
export async function loadSavedWorkout(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  // verify ownership + read exercises
  const { data: rows } = await supabase
    .from("saved_workout_exercises")
    .select("ord, exercise_id, saved_workouts!inner(user_id)")
    .eq("workout_id", id)
    .order("ord");
  const owned = (rows ?? []).filter((r: any) => r.saved_workouts?.user_id === user.id);
  if (!owned.length) return { ok: false, error: "Workout not found" };
  const ids = owned.map((r: any) => r.exercise_id);
  const save = await saveCustomDay(0, ids);
  if (!save.ok) return save;
  await setActiveProgram("custom");
  await markOnboarded();
  return { ok: true };
}


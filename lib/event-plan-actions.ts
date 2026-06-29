"use server";

import { createClient } from "@/lib/supabase-server";
import { generateWorkout } from "@/lib/data";
import type { WorkoutStyle } from "@/lib/types";

type SavedDay = {
  iso: string;
  type: string;       // strength|hypertrophy|endurance|cardio|tabata|rest
  title: string;
  detail: string;
  weekIndex: number;
};

// Map a session type to the rx "block" / generation style.
const STYLE_FOR: Record<string, WorkoutStyle | null> = {
  hypertrophy: "hypertrophy",
  strength: "strength",
  endurance: "endurance",
  cardio: null, tabata: null, rest: null,
};

/**
 * Persist a generated event plan as dated rows, and flip the dashboard to be
 * driven by it. Strength/hypertrophy/endurance days get a real exercise list
 * (filtered by the dancer's level + equipment); cardio/tabata/rest store none.
 */
export async function saveEventPlan(input: {
  label: string;
  days: SavedDay[];
  maxLevel: number;
  equipment?: string[];
  focus?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (!input.days.length) return { ok: false, error: "Nothing to save" };

  // pre-generate one exercise list per distinct style so we don't hit the DB
  // for every single day. (Variety still comes from the day's own slot order.)
  const styles = new Set(
    input.days.map((d) => STYLE_FOR[d.type]).filter((s): s is WorkoutStyle => !!s)
  );
  const byStyle: Record<string, number[]> = {};
  for (const style of styles) {
    const slots = await generateWorkout(style, 1, input.maxLevel, input.equipment);
    byStyle[style] = slots.flatMap((s) => s.exercises.map((e) => e.id));
  }

  // wipe any previous plan, then insert the new one
  await supabase.from("event_plan_days").delete().eq("user_id", user.id);

  const rows = input.days.map((d) => {
    const style = STYLE_FOR[d.type];
    return {
      user_id: user.id,
      plan_date: d.iso,
      session_type: d.type,
      title: d.title,
      detail: d.detail,
      exercise_ids: style ? (byStyle[style] ?? []) : [],
      block: style ?? null,
      week_index: d.weekIndex,
    };
  });

  // insert in chunks to stay well under any payload limits
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from("event_plan_days").insert(rows.slice(i, i + 100));
    if (error) return { ok: false, error: error.message };
  }

  // flip the dashboard to follow the plan
  const { error: stErr } = await supabase.from("user_program_state").upsert(
    { user_id: user.id, event_plan_active: true, event_plan_label: input.label, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (stErr) return { ok: false, error: stErr.message };

  return { ok: true };
}

function localTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Pause the event plan (back to the regular program) WITHOUT deleting it, so the
 * dancer can rejoin later. We keep the label so the rejoin prompt can name it.
 */
export async function clearEventPlan(): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("user_program_state").update({ event_plan_active: false }).eq("user_id", user.id);
  return { ok: true };
}

/** Rejoin a previously paused plan, if it still has days left to run. */
export async function reactivateEventPlan(): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { count } = await supabase
    .from("event_plan_days")
    .select("plan_date", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("plan_date", localTodayISO());
  if (!count) return { ok: false, error: "No upcoming plan days to rejoin." };
  await supabase.from("user_program_state").update({ event_plan_active: true }).eq("user_id", user.id);
  return { ok: true };
}

/** Permanently delete the saved plan (used when building a fresh one, or on request). */
export async function deleteEventPlan(): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("event_plan_days").delete().eq("user_id", user.id);
  await supabase.from("user_program_state").update({ event_plan_active: false, event_plan_label: null }).eq("user_id", user.id);
  return { ok: true };
}

/** Reroll the exercises for one plan day (same style/level as originally built). */
export async function regeneratePlanDay(date: string, maxLevel = 4, equipment?: string[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { data: row } = await supabase
    .from("event_plan_days")
    .select("block, session_type")
    .eq("user_id", user.id).eq("plan_date", date).single();
  if (!row) return { ok: false, error: "No plan day on that date." };
  const style = (row.block as WorkoutStyle | null) ?? STYLE_FOR[row.session_type];
  if (!style) return { ok: false, error: "This day has no exercise workout to swap." };
  const slots = await generateWorkout(style, 1, maxLevel, equipment);
  const ids = slots.flatMap((s) => s.exercises.map((e) => e.id));
  const { error } = await supabase.from("event_plan_days")
    .update({ exercise_ids: ids }).eq("user_id", user.id).eq("plan_date", date);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Append one or more extra exercises to a plan day's workout. */
export async function addExercisesToPlanDay(date: string, count = 1, maxLevel = 4, equipment?: string[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { data: row } = await supabase
    .from("event_plan_days")
    .select("block, session_type, exercise_ids")
    .eq("user_id", user.id).eq("plan_date", date).single();
  if (!row) return { ok: false, error: "No plan day on that date." };
  const style = (row.block as WorkoutStyle | null) ?? STYLE_FOR[row.session_type];
  if (!style) return { ok: false, error: "This day has no exercise workout to add to." };
  const existing: number[] = row.exercise_ids ?? [];
  const slots = await generateWorkout(style, 1, maxLevel, equipment);
  const candidates = slots.flatMap((s) => s.exercises.map((e) => e.id)).filter((id) => !existing.includes(id));
  const additions = candidates.slice(0, Math.max(1, count));
  if (!additions.length) return { ok: false, error: "No new exercises available to add." };
  const { error } = await supabase.from("event_plan_days")
    .update({ exercise_ids: [...existing, ...additions] }).eq("user_id", user.id).eq("plan_date", date);
  return error ? { ok: false, error: error.message } : { ok: true };
}

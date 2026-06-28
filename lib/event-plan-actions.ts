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

/** Turn the event plan off (back to the regular program). */
export async function clearEventPlan(): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("event_plan_days").delete().eq("user_id", user.id);
  await supabase.from("user_program_state").update({ event_plan_active: false, event_plan_label: null }).eq("user_id", user.id);
  return { ok: true };
}

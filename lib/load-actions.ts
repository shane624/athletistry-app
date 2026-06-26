"use server";

import { createClient } from "@/lib/supabase-server";

/** Log a training session / class. TRIMP = duration × RPE. */
export async function logSession(input: {
  durationMin: number; rpe: number; kind?: string; date?: string; note?: string; startTime?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const duration = Math.round(Number(input.durationMin));
  const rpe = Math.round(Number(input.rpe));
  if (!(duration >= 1 && duration <= 600)) return { ok: false, error: "Duration must be 1–600 minutes" };
  if (!(rpe >= 1 && rpe <= 10)) return { ok: false, error: "RPE must be 1–10" };
  const { error } = await supabase.from("training_sessions").insert({
    user_id: user.id,
    duration_min: duration,
    rpe,
    kind: input.kind || "workout",
    session_date: input.date || new Date().toISOString().slice(0, 10),
    start_time: input.startTime || null,
    note: input.note || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Log a recurring class: inserts one session per week on the same weekday,
 *  starting from `date`, for `weeks` occurrences (including the first). */
export async function logRecurring(input: {
  durationMin: number; rpe: number; kind?: string; date: string; startTime?: string; weeks: number;
}): Promise<{ ok: boolean; error?: string; count?: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const duration = Math.round(Number(input.durationMin));
  const rpe = Math.round(Number(input.rpe));
  const weeks = Math.max(1, Math.min(52, Math.round(Number(input.weeks))));
  if (!(duration >= 1 && duration <= 600)) return { ok: false, error: "Duration must be 1–600 minutes" };
  if (!(rpe >= 1 && rpe <= 10)) return { ok: false, error: "RPE must be 1–10" };
  if (!input.date) return { ok: false, error: "Pick a start date" };

  const [y, m, d] = input.date.split("-").map(Number);
  const rows = [];
  for (let i = 0; i < weeks; i++) {
    const dt = new Date(y, m - 1, d + i * 7);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    rows.push({
      user_id: user.id, duration_min: duration, rpe,
      kind: input.kind || "workout", session_date: iso,
      start_time: input.startTime || null,
    });
  }
  const { error } = await supabase.from("training_sessions").insert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true, count: rows.length };
}

export async function deleteSession(id: number): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("training_sessions").delete().eq("id", id).eq("user_id", user.id);
  return { ok: true };
}

export async function addEvent(input: { date: string; kind?: string; name?: string }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (!input.date) return { ok: false, error: "Pick a date" };
  const { error } = await supabase.from("events").insert({
    user_id: user.id,
    event_date: input.date,
    kind: input.kind || "performance",
    name: input.name || "",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteEvent(id: number): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("events").delete().eq("id", id).eq("user_id", user.id);
  return { ok: true };
}

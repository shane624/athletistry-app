// Server-only read query for achievements. NOT a "use server" file — this is
// a plain server module imported by server components, so it isn't bound by
// the Server-Action "all exports must be async actions" rule.
import { createClient } from "@/lib/supabase-server";
import { computeAchievements, type AchievementsResult } from "@/lib/achievements";
import { getAnatomyQuizCount } from "@/lib/anatomy-data";
import { ANATOMY_MODULES } from "@/lib/anatomy";

/** Compute the member's achievements (streak, level, badges, weekly ring)
 *  from their logged sets. All derived — no extra tables. */
export async function getAchievements(): Promise<AchievementsResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return computeAchievements({ workoutDays: [], totalSets: 0, totalVolume: 0 });
  }
  // Count ANY logged training as an active day — both logged sets AND logged
  // sessions (classes / rehearsals / cardio from the calendar). Otherwise a
  // week where the dancer only logged a class (no sets) breaks the streak.
  const [{ data: rows }, { data: sessions }] = await Promise.all([
    supabase.from("set_logs").select("logged_at, weight, reps").eq("user_id", user.id),
    supabase.from("training_sessions").select("session_date").eq("user_id", user.id),
  ]);

  const logs = rows ?? [];
  const daySet = new Set<string>();
  let totalVolume = 0;
  for (const r of logs) {
    const d = new Date(r.logged_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    daySet.add(key);
    totalVolume += Number(r.weight || 0) * Number(r.reps || 0);
  }
  // session_date is already a local YYYY-MM-DD — add each as an active day
  for (const s of sessions ?? []) {
    if (s.session_date) daySet.add(String(s.session_date).slice(0, 10));
  }

  const quizzesPassed = await getAnatomyQuizCount();

  return computeAchievements({
    workoutDays: [...daySet].sort(),
    totalSets: logs.length,
    totalVolume,
    quizzesPassed,
    quizzesTotal: ANATOMY_MODULES.length,
  });
}

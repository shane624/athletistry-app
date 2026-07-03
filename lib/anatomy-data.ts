import { createClient } from "@/lib/supabase-server";

/** Set of module indices whose quiz the dancer has passed. */
export async function getAnatomyProgress(): Promise<Set<number>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("anatomy_quiz")
    .select("module_index")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((r) => r.module_index as number));
}

/** How many anatomy quizzes the dancer has passed (for achievements). */
export async function getAnatomyQuizCount(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("anatomy_quiz")
    .select("module_index", { count: "exact", head: true })
    .eq("user_id", user.id);
  return count ?? 0;
}

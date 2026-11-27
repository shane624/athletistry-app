import { createClient } from "@/lib/supabase-server";
import type { Attempt } from "@/lib/self-tests";

/** Every self-test attempt for the signed-in dancer, oldest first. */
export async function getSelfTestAttempts(testId?: string): Promise<Attempt[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase
    .from("self_test_results")
    .select("id, test_id, values, note, taken_at")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: true });
  if (testId) q = q.eq("test_id", testId);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    testId: r.test_id as string,
    values: (r.values ?? {}) as Record<string, number>,
    note: (r.note as string | null) ?? null,
    takenAt: r.taken_at as string,
  }));
}

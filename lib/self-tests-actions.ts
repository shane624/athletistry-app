"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getTest, type Values } from "@/lib/self-tests";

/** Save one attempt at a self-test. Values are checked against the test's measures. */
export async function logSelfTest(testId: string, values: Values, note?: string): Promise<{ ok: boolean; error?: string }> {
  const test = getTest(testId);
  if (!test) return { ok: false, error: "Unknown test" };

  const clean: Values = {};
  for (const m of test.measures) {
    const v = values[m.id];
    if (v === undefined || v === null || Number.isNaN(Number(v))) continue;
    const n = Number(v);
    if (m.kind === "choice" && !m.options?.some((o) => o.value === n)) return { ok: false, error: `Pick an answer for "${m.label}"` };
    if (m.kind !== "choice" && (n < (m.min ?? 0) || (m.max !== undefined && n > m.max))) return { ok: false, error: `Check the number for "${m.label}"` };
    clean[m.id] = m.kind === "seconds" ? Math.round(n * 10) / 10 : n;
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "Add at least one result" };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("self_test_results").insert({
    user_id: user.id,
    test_id: testId,
    values: clean,
    note: note?.trim() ? note.trim().slice(0, 500) : null,
    taken_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/self-tests");
  revalidatePath(`/self-tests/${testId}`);
  return { ok: true };
}

/** Remove one of your own attempts (for a mistaken entry). */
export async function deleteSelfTestAttempt(id: string, testId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("self_test_results").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/self-tests");
  revalidatePath(`/self-tests/${testId}`);
  return { ok: true };
}

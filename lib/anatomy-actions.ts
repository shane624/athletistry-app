"use server";

import { createClient } from "@/lib/supabase-server";

/** Record a passed anatomy-module quiz (idempotent). */
export async function recordAnatomyQuiz(moduleIndex: number): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase
    .from("anatomy_quiz")
    .upsert({ user_id: user.id, module_index: moduleIndex }, { onConflict: "user_id,module_index" });
  return error ? { ok: false, error: error.message } : { ok: true };
}

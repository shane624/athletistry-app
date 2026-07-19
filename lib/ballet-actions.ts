"use server";

import { createClient } from "@/lib/supabase-server";
import type { MoveResult } from "@/lib/ballet-moves";

/** Save (upsert) the result of one Ballet Movement Lab test. */
export async function saveBalletResult(moveId: string, res: MoveResult): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { error } = await supabase.from("ballet_assessments").upsert(
    {
      user_id: user.id,
      move_id: moveId,
      findings: res.findings,
      votes: res.votes,
      headline: res.headline,
      taken_at: new Date().toISOString(),
    },
    { onConflict: "user_id,move_id" }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

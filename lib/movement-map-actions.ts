"use server";

import { createClient } from "@/lib/supabase-server";
import { scoreMovementMap, type TypeId } from "@/lib/movement-map";

/** Score the 5 answers and save the dancer's Movement Map result. */
export async function saveMovementMap(answers: (TypeId | null)[]): Promise<{ ok: boolean; primary?: TypeId; secondary?: TypeId; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const res = scoreMovementMap(answers);
  const { error } = await supabase.from("movement_map").upsert(
    {
      user_id: user.id,
      primary_type: res.primary,
      secondary_type: res.secondary,
      answers,
      taken_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  return error ? { ok: false, error: error.message } : { ok: true, primary: res.primary, secondary: res.secondary };
}

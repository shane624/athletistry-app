"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function saveSettings(input: {
  displayName: string;
  startDate: string;
  reminders: boolean;
  weekOverride: number | null;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error: pErr } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      program_start_date: input.startDate,
      reminders_opt_in: input.reminders,
    })
    .eq("id", user.id);
  if (pErr) return { ok: false, error: pErr.message };

  const { error: sErr } = await supabase
    .from("user_program_state")
    .upsert({ user_id: user.id, week_override: input.weekOverride, updated_at: new Date().toISOString() });
  if (sErr) return { ok: false, error: sErr.message };

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true };
}

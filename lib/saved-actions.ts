"use server";

import { createClient } from "@/lib/supabase-server";

// Toggle a bookmark. Pass the item's key + display fields; returns the new state.
export async function toggleSave(input: {
  itemKey: string;
  title: string;
  subtitle?: string;
  href: string;
  kind?: string;
}): Promise<{ ok: boolean; saved: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, saved: false, error: "Not signed in" };

  const { data: existing } = await supabase
    .from("saved_content")
    .select("item_key")
    .eq("user_id", user.id)
    .eq("item_key", input.itemKey)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_content")
      .delete()
      .eq("user_id", user.id)
      .eq("item_key", input.itemKey);
    return error ? { ok: false, saved: true, error: error.message } : { ok: true, saved: false };
  }

  const { error } = await supabase.from("saved_content").insert({
    user_id: user.id,
    item_key: input.itemKey,
    title: input.title,
    subtitle: input.subtitle ?? null,
    href: input.href,
    kind: input.kind ?? "other",
  });
  return error ? { ok: false, saved: false, error: error.message } : { ok: true, saved: true };
}

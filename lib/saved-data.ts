import { createClient } from "@/lib/supabase-server";

export interface SavedItem {
  itemKey: string;
  title: string;
  subtitle: string | null;
  href: string;
  kind: string;
}

/** The user's bookmarked items, newest first. */
export async function getSaved(): Promise<SavedItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("saved_content")
    .select("item_key, title, subtitle, href, kind")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    itemKey: r.item_key, title: r.title, subtitle: r.subtitle, href: r.href, kind: r.kind,
  }));
}

/** Just the set of saved keys — handy for rendering save-state on a page of items. */
export async function getSavedKeys(): Promise<Set<string>> {
  const items = await getSaved();
  return new Set(items.map((i) => i.itemKey));
}

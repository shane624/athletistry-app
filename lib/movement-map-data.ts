import { createClient } from "@/lib/supabase-server";
import type { TypeId } from "@/lib/movement-map";

export interface SavedMap {
  primary: TypeId;
  secondary: TypeId;
  takenAt: string;
}

/** The dancer's saved Movement Map result, if they've taken it. */
export async function getMovementMap(): Promise<SavedMap | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("movement_map")
    .select("primary_type, secondary_type, taken_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { primary: data.primary_type as TypeId, secondary: data.secondary_type as TypeId, takenAt: data.taken_at };
}

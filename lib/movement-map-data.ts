import { createClient } from "@/lib/supabase-server";
import type { TypeId } from "@/lib/movement-map";
import type { Finding } from "@/lib/posture-metrics";

export interface SavedMap {
  primary: TypeId;
  secondary: TypeId;
  takenAt: string;
  mode: "quiz" | "scan";
  findings?: Finding[]; // present when the result came from the camera scan
}

/** The dancer's saved Movement Map result, if they've taken it. */
export async function getMovementMap(): Promise<SavedMap | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("movement_map")
    .select("primary_type, secondary_type, taken_at, answers")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  const a = data.answers as unknown;
  const scan = a && typeof a === "object" && !Array.isArray(a) && (a as { mode?: string }).mode === "scan";
  return {
    primary: data.primary_type as TypeId,
    secondary: data.secondary_type as TypeId,
    takenAt: data.taken_at,
    mode: scan ? "scan" : "quiz",
    findings: scan ? ((a as { findings?: Finding[] }).findings ?? []) : undefined,
  };
}

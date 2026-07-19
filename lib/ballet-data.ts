import { createClient } from "@/lib/supabase-server";
import type { Finding } from "@/lib/posture-metrics";
import type { TypeId } from "@/lib/movement-map";

export interface BalletRow {
  moveId: string;
  findings: Finding[];
  votes: TypeId[];
  headline: string;
  takenAt: string;
}

/** All of the dancer's saved Ballet Movement Lab results. */
export async function getBalletResults(): Promise<BalletRow[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("ballet_assessments")
    .select("move_id, findings, votes, headline, taken_at")
    .eq("user_id", user.id);
  if (!data) return [];
  return data.map((r) => ({
    moveId: r.move_id as string,
    findings: (r.findings ?? []) as Finding[],
    votes: (r.votes ?? []) as TypeId[],
    headline: (r.headline ?? "") as string,
    takenAt: r.taken_at as string,
  }));
}

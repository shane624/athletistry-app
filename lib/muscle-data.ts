// Server-only: which muscle groups a member has trained, by volume. Maps the
// exercise category to a friendly group, sums weight×reps per group from
// set_logs. Plain server module (not "use server").
import { createClient } from "@/lib/supabase-server";

// category -> display group
const GROUP: Record<string, string> = {
  squat: "Legs (Quads/Glutes)",
  lunge: "Legs (Single-leg)",
  hinge: "Posterior (Hamstrings/Glutes)",
  calf: "Calves & Ankles",
  push: "Push (Chest/Triceps)",
  shoulder: "Shoulders",
  pull: "Pull (Back/Biceps)",
  core: "Core",
  mobility: "Mobility & Turnout",
};

export interface MuscleStat {
  group: string;
  volume: number;   // weight × reps total
  sets: number;     // count of logged sets
  share: number;    // 0..1 of total volume (or sets if no weight)
}

export interface MuscleProgress {
  groups: MuscleStat[];
  totalSets: number;
  trainedGroups: number;
  totalGroups: number;
}

export async function getMuscleProgress(): Promise<MuscleProgress> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const empty = { groups: [] as MuscleStat[], totalSets: 0, trainedGroups: 0, totalGroups: Object.values(new Set(Object.values(GROUP))).length };
  if (!user) return empty;

  // join set_logs -> exercises.category
  const { data: rows } = await supabase
    .from("set_logs")
    .select("weight, reps, exercises(category)")
    .eq("user_id", user.id);

  const byGroup = new Map<string, { volume: number; sets: number }>();
  // seed every group at 0 so untrained ones show as gaps
  const allGroups = [...new Set(Object.values(GROUP))];
  for (const g of allGroups) byGroup.set(g, { volume: 0, sets: 0 });

  let totalSets = 0;
  for (const r of rows ?? []) {
    const cat = (r as any).exercises?.category as string | undefined;
    if (!cat) continue;
    const group = GROUP[cat] ?? "Other";
    if (!byGroup.has(group)) byGroup.set(group, { volume: 0, sets: 0 });
    const g = byGroup.get(group)!;
    g.volume += Number(r.weight || 0) * Number(r.reps || 0);
    g.sets += 1;
    totalSets += 1;
  }

  const totalVolume = [...byGroup.values()].reduce((a, b) => a + b.volume, 0);
  const totalSetCount = [...byGroup.values()].reduce((a, b) => a + b.sets, 0) || 1;

  const groups: MuscleStat[] = [...byGroup.entries()]
    .map(([group, v]) => ({
      group,
      volume: Math.round(v.volume),
      sets: v.sets,
      // share by volume if any weight logged, else by set count (bodyweight work)
      share: totalVolume > 0 ? v.volume / totalVolume : v.sets / totalSetCount,
    }))
    .sort((a, b) => b.share - a.share);

  const trainedGroups = groups.filter((g) => g.sets > 0).length;
  return { groups, totalSets, trainedGroups, totalGroups: allGroups.length };
}

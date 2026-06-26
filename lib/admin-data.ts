// Admin-only data layer. Server module (NOT "use server"), uses the service-
// role key. Every export checks the caller is the admin before doing anything.
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { computeAchievements } from "@/lib/achievements";
import { getProgram } from "@/lib/programs";

// Hard-coded admin. Only this email can use the admin tools.
const ADMIN_EMAIL = "swuerthner@gmail.com";

/** Throws unless the logged-in user is the admin. Returns the admin client. */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Not authorized");
  }
  return createAdminClient();
}

/** True if the current user is the admin (for gating the UI/route). */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user && (user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export interface MemberRow {
  id: string;
  email: string;
  name: string;
  joinedAt: string | null;
  disabled: boolean;
  lastActive: string | null;     // YYYY-MM-DD or null
  totalWorkouts: number;
  currentStreak: number;
  rank: string;
  programName: string;
}

/** Full member roster with activity, streak, rank, program and status. */
export async function getRoster(): Promise<MemberRow[]> {
  const admin = await requireAdmin();

  // 1) all auth users (paginate)
  const users: any[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  // 2) profiles (names) + program state, in bulk
  const { data: profiles } = await admin.from("profiles").select("id, display_name");
  const nameById = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]));
  const { data: states } = await admin.from("user_program_state").select("user_id, active_program");
  const progById = new Map((states ?? []).map((s: any) => [s.user_id, s.active_program]));

  // 3) all set_logs (for activity/streak). Pulled once, grouped by user.
  const { data: logs } = await admin.from("set_logs").select("user_id, logged_at, weight, reps");
  const byUser = new Map<string, { days: Set<string>; volume: number }>();
  for (const r of logs ?? []) {
    const d = new Date(r.logged_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, { days: new Set(), volume: 0 });
    const u = byUser.get(r.user_id)!;
    u.days.add(key);
    u.volume += Number(r.weight || 0) * Number(r.reps || 0);
  }

  const rows: MemberRow[] = users.map((u) => {
    const agg = byUser.get(u.id) ?? { days: new Set<string>(), volume: 0 };
    const days = [...agg.days].sort();
    const ach = computeAchievements({ workoutDays: days, totalSets: 0, totalVolume: agg.volume });
    const progId = progById.get(u.id) || "periodized24";
    let programName = progId;
    try { programName = getProgram(progId)?.name ?? progId; } catch {}
    return {
      id: u.id,
      email: u.email || "",
      name: (nameById.get(u.id) || u.email?.split("@")[0] || "").trim(),
      joinedAt: u.created_at ?? null,
      disabled: !!u.banned_until && new Date(u.banned_until) > new Date(),
      lastActive: days.length ? days[days.length - 1] : null,
      totalWorkouts: ach.totalWorkouts,
      currentStreak: ach.currentStreak,
      rank: ach.level.name,
      programName,
    };
  });

  // sort: active-but-stale first (so lapsed members surface), then by name
  rows.sort((a, b) => (a.lastActive || "").localeCompare(b.lastActive || ""));
  return rows;
}

/** Disable a member's login (keeps all their data). Reversible. */
export async function disableMember(userId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  // ban for a very long time = effectively disabled until re-enabled
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Re-enable a previously disabled member. */
export async function enableMember(userId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

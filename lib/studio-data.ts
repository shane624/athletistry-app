// Studio data layer. Plain server module (NOT "use server"). Owner-facing reads
// use the service-role client AFTER an ownership check, and only ever read data
// for users who are members of a studio the caller owns.
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { computeAchievements } from "@/lib/achievements";
import { getProgram } from "@/lib/programs";
import { assessLoad, weeklyLoads, type LoadStatus, type WeekLoad, type SessionInput } from "@/lib/load";
import { MOVEMENT_TYPES, type TypeId } from "@/lib/movement-map";
import { getBalletMove } from "@/lib/ballet-moves";
import { billableSeats, isActive, FREE_SEATS } from "@/lib/stripe";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function currentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Verify the caller owns `studioId`. Returns the admin client + studio row. */
async function requireStudioOwner(studioId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Not signed in");
  const admin = createAdminClient();
  const { data: studio } = await admin.from("studios")
    .select("id, name, owner_id, join_code, created_at, subscription_status").eq("id", studioId).maybeSingle();
  if (!studio || studio.owner_id !== user.id) throw new Error("Not authorized");
  return { admin, studio, user };
}

// ---- helpers --------------------------------------------------------------
const LOAD_LABEL: Record<LoadStatus, string> = {
  "no-data": "Not tracking", "on-track": "On track", under: "Undertraining",
  over: "Overreaching", taper: "Tapering", "event-week": "Event week",
};

function dayKey(ts: string): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso + "T00:00:00").getTime()) / 86400000);
}

// ---- owner: my studios ----------------------------------------------------
export interface StudioSummary {
  id: string; name: string; joinCode: string; memberCount: number; createdAt: string;
  subscriptionStatus: string; active: boolean; billableSeats: number; freeSeats: number;
}

export async function getMyStudios(): Promise<StudioSummary[]> {
  const user = await currentUser();
  if (!user) return [];
  const admin = createAdminClient();
  const { data: studios } = await admin.from("studios")
    .select("id, name, join_code, created_at, subscription_status").eq("owner_id", user.id).order("created_at");
  if (!studios?.length) return [];
  const ids = studios.map((s: any) => s.id);
  const { data: members } = await admin.from("studio_members").select("studio_id").in("studio_id", ids);
  const counts = new Map<string, number>();
  for (const m of members ?? []) counts.set(m.studio_id, (counts.get(m.studio_id) ?? 0) + 1);
  return studios.map((s: any) => {
    const memberCount = counts.get(s.id) ?? 0;
    return {
      id: s.id, name: s.name, joinCode: s.join_code, memberCount, createdAt: s.created_at,
      subscriptionStatus: s.subscription_status ?? "none", active: isActive(s.subscription_status),
      billableSeats: billableSeats(memberCount), freeSeats: FREE_SEATS,
    };
  });
}

// ---- student: studios I've joined ----------------------------------------
export interface JoinedStudio { id: string; name: string }

export async function getMyMemberships(): Promise<JoinedStudio[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("studio_members").select("studios ( id, name )").eq("user_id", user.id);
  return (data ?? []).map((r: any) => r.studios).filter(Boolean).map((s: any) => ({ id: s.id, name: s.name }));
}

// ---- owner: roster --------------------------------------------------------
export interface RosterStudent {
  id: string; name: string; email: string; joinedAt: string;
  lastActive: string | null; totalWorkouts: number; currentStreak: number; rank: string;
  movementType: string | null;
  loadStatus: LoadStatus; loadLabel: string; weeklyTrimp: number | null;
  tracking: boolean; lastTracked: string | null;
}

export async function getStudioRoster(studioId: string): Promise<{ studio: StudioSummary; students: RosterStudent[] }> {
  const { admin, studio } = await requireStudioOwner(studioId);
  const { data: members } = await admin.from("studio_members").select("user_id, joined_at").eq("studio_id", studioId);
  const rows = members ?? [];
  const ids = rows.map((m: any) => m.user_id);
  const summary: StudioSummary = {
    id: studio.id, name: studio.name, joinCode: studio.join_code, memberCount: ids.length, createdAt: studio.created_at,
    subscriptionStatus: (studio as any).subscription_status ?? "none", active: isActive((studio as any).subscription_status),
    billableSeats: billableSeats(ids.length), freeSeats: FREE_SEATS,
  };
  if (!ids.length) return { studio: summary, students: [] };

  const [{ data: profiles }, { data: logs }, { data: maps }, { data: sessions }, ...userResults] = await Promise.all([
    admin.from("profiles").select("id, display_name").in("id", ids),
    admin.from("set_logs").select("user_id, logged_at, weight, reps").in("user_id", ids),
    admin.from("movement_map").select("user_id, primary_type").in("user_id", ids),
    admin.from("training_sessions").select("user_id, session_date, duration_min, rpe").in("user_id", ids),
    ...ids.map((id: string) => admin.auth.admin.getUserById(id)),
  ]);

  const nameById = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]));
  const emailById = new Map<string, string>();
  userResults.forEach((r: any) => { const u = r?.data?.user; if (u) emailById.set(u.id, u.email || ""); });
  const typeById = new Map((maps ?? []).map((m: any) => [m.user_id, MOVEMENT_TYPES[m.primary_type as TypeId]?.name ?? null]));

  const logsBy = new Map<string, { days: Set<string>; volume: number }>();
  for (const r of logs ?? []) {
    if (!logsBy.has(r.user_id)) logsBy.set(r.user_id, { days: new Set(), volume: 0 });
    const u = logsBy.get(r.user_id)!;
    u.days.add(dayKey(r.logged_at)); u.volume += Number(r.weight || 0) * Number(r.reps || 0);
  }
  const sessBy = new Map<string, SessionInput[]>();
  for (const s of sessions ?? []) {
    if (!sessBy.has(s.user_id)) sessBy.set(s.user_id, []);
    sessBy.get(s.user_id)!.push({ date: s.session_date, durationMin: s.duration_min, rpe: s.rpe });
  }

  const students: RosterStudent[] = rows.map((m: any) => {
    const agg = logsBy.get(m.user_id) ?? { days: new Set<string>(), volume: 0 };
    const days = [...agg.days].sort();
    const ach = computeAchievements({ workoutDays: days, totalSets: 0, totalVolume: agg.volume });
    const inputs = sessBy.get(m.user_id) ?? [];
    const assess = assessLoad(inputs, null);
    const lastTracked = inputs.length ? inputs.map((i) => i.date).sort().slice(-1)[0] : null;
    const since = daysSince(lastTracked);
    const tracking = since !== null && since <= 10;
    return {
      id: m.user_id,
      name: (nameById.get(m.user_id) || emailById.get(m.user_id)?.split("@")[0] || "Dancer").trim(),
      email: emailById.get(m.user_id) || "",
      joinedAt: m.joined_at,
      lastActive: days.length ? days[days.length - 1] : null,
      totalWorkouts: ach.totalWorkouts, currentStreak: ach.currentStreak, rank: ach.level.name,
      movementType: typeById.get(m.user_id) ?? null,
      loadStatus: assess.status, loadLabel: LOAD_LABEL[assess.status],
      weeklyTrimp: assess.thisWeek?.trimp ?? null,
      tracking, lastTracked,
    };
  });
  // surface concerns first: not-tracking, then over/under, then the rest
  const rank = (s: RosterStudent) => (!s.tracking ? 0 : s.loadStatus === "over" ? 1 : s.loadStatus === "under" ? 2 : 3);
  students.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return { studio: summary, students };
}

// ---- owner: one student's full overview -----------------------------------
export interface StudentOverview {
  id: string; name: string; email: string; joinedAt: string;
  rank: string; totalWorkouts: number; currentStreak: number; lastActive: string | null; program: string;
  movement: { primary: string; secondary: string } | null;
  ballet: { move: string; headline: string }[];
  load: { status: LoadStatus; label: string; message: string; weeklyTrimp: number | null; changePct: number | null; weeks: WeekLoad[]; tracking: boolean; lastTracked: string | null };
}

export async function getStudentOverview(studioId: string, userId: string): Promise<StudentOverview> {
  const { admin } = await requireStudioOwner(studioId);
  const { data: mem } = await admin.from("studio_members").select("user_id, joined_at").eq("studio_id", studioId).eq("user_id", userId).maybeSingle();
  if (!mem) throw new Error("That dancer isn't in this studio");

  const [{ data: prof }, userRes, { data: logs }, { data: state }, { data: map }, { data: ballet }, { data: sessions }] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
    admin.from("set_logs").select("logged_at, weight, reps").eq("user_id", userId),
    admin.from("user_program_state").select("active_program").eq("user_id", userId).maybeSingle(),
    admin.from("movement_map").select("primary_type, secondary_type").eq("user_id", userId).maybeSingle(),
    admin.from("ballet_assessments").select("move_id, headline").eq("user_id", userId),
    admin.from("training_sessions").select("session_date, duration_min, rpe").eq("user_id", userId),
  ]);

  const email = (userRes as any)?.data?.user?.email || "";
  const days = [...new Set((logs ?? []).map((r: any) => dayKey(r.logged_at)))].sort();
  const volume = (logs ?? []).reduce((a: number, r: any) => a + Number(r.weight || 0) * Number(r.reps || 0), 0);
  const ach = computeAchievements({ workoutDays: days, totalSets: 0, totalVolume: volume });

  const progId = (state as any)?.active_program || "periodized24";
  let program = progId; try { program = getProgram(progId)?.name ?? progId; } catch { /* keep id */ }

  const inputs: SessionInput[] = (sessions ?? []).map((s: any) => ({ date: s.session_date, durationMin: s.duration_min, rpe: s.rpe }));
  const assess = assessLoad(inputs, null);
  const lastTracked = inputs.length ? inputs.map((i) => i.date).sort().slice(-1)[0] : null;
  const since = daysSince(lastTracked);

  return {
    id: userId,
    name: ((prof as any)?.display_name || email.split("@")[0] || "Dancer").trim(),
    email, joinedAt: mem.joined_at,
    rank: ach.level.name, totalWorkouts: ach.totalWorkouts, currentStreak: ach.currentStreak,
    lastActive: days.length ? days[days.length - 1] : null, program,
    movement: map ? { primary: MOVEMENT_TYPES[(map as any).primary_type as TypeId]?.name ?? "—", secondary: MOVEMENT_TYPES[(map as any).secondary_type as TypeId]?.name ?? "—" } : null,
    ballet: (ballet ?? []).map((b: any) => ({ move: getBalletMove(b.move_id)?.name ?? b.move_id, headline: b.headline || "" })),
    load: {
      status: assess.status, label: LOAD_LABEL[assess.status], message: assess.message,
      weeklyTrimp: assess.thisWeek?.trimp ?? null, changePct: assess.changePct,
      weeks: weeklyLoads(inputs).slice(-8), tracking: since !== null && since <= 10, lastTracked,
    },
  };
}

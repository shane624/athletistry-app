import { createClient } from "@/lib/supabase-server";
import { getAchievements } from "@/lib/achievements-data";
import { getToday } from "@/lib/data";

export type MonthlyActivityPoint = { label: string; value: number };
export type RecentTraining = { date: string; label: string; detail: string };

export interface ProgressOverview {
  totalWorkouts: number;
  hoursTrained: number;
  currentStreak: number;
  bestStreak: number;
  averageMinutes: number;
  thisMonth: number;
  monthly: MonthlyActivityPoint[];
  recent: RecentTraining[];
  phaseLabel: string;
  phaseDetail: string;
  phasePercent: number;
  phaseProgressLabel: string;
}

function localDateKey(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getProgressOverview(): Promise<ProgressOverview> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const achievements = await getAchievements();

  let today: Awaited<ReturnType<typeof getToday>> | null = null;
  try { today = await getToday(); } catch { today = null; }

  if (!user) {
    return {
      totalWorkouts: 0, hoursTrained: 0, currentStreak: 0, bestStreak: 0,
      averageMinutes: 0, thisMonth: 0, monthly: [], recent: [],
      phaseLabel: today?.phase ? `Phase · ${today.phase}` : "Current program",
      phaseDetail: today?.programName ?? "Your training",
      phasePercent: 0,
      phaseProgressLabel: "Start training to build your progress history.",
    };
  }

  const [{ data: setLogs }, { data: sessions }] = await Promise.all([
    supabase.from("set_logs").select("logged_at, week").eq("user_id", user.id).order("logged_at", { ascending: false }),
    supabase.from("training_sessions").select("session_date, kind, duration_min, rpe, note").eq("user_id", user.id).order("session_date", { ascending: false }),
  ]);

  const activeDays = new Map<string, RecentTraining>();
  for (const r of setLogs ?? []) {
    const key = localDateKey(String(r.logged_at));
    if (!activeDays.has(key)) {
      activeDays.set(key, { date: key, label: "Strength practice", detail: `Week ${Number(r.week || 1)}` });
    }
  }
  for (const s of sessions ?? []) {
    const key = String(s.session_date).slice(0, 10);
    const mins = Number(s.duration_min || 0);
    activeDays.set(key, {
      date: key,
      label: String(s.kind || "Training").replace(/\b\w/g, (c) => c.toUpperCase()),
      detail: mins ? `${mins} min · RPE ${Number(s.rpe || 0)}` : (s.note || "Completed session"),
    });
  }

  const sessionMinutes = (sessions ?? []).reduce((sum: number, s: any) => sum + Number(s.duration_min || 0), 0);
  const averageMinutes = sessions?.length ? Math.round(sessionMinutes / sessions.length) : 0;
  const hoursTrained = Math.round((sessionMinutes / 60) * 10) / 10;

  const now = new Date();
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleDateString("en-AU", { month: "short" }), value: 0 });
  }
  for (const key of activeDays.keys()) {
    const mk = key.slice(0, 7);
    const bucket = months.find((m) => m.key === mk);
    if (bucket) bucket.value += 1;
  }

  const phaseWeek = Math.max(1, Math.min(Number(today?.week || 1), 24));
  const periodized = today?.programType === "periodized";
  const phasePercent = periodized ? Math.round((phaseWeek / 24) * 100) : Math.min(100, Math.round((achievements.weekCount / Math.max(achievements.weeklyGoal, 1)) * 100));
  const phaseLabel = today?.phase ? `Phase · ${today.phase}` : (periodized ? `Week ${phaseWeek}` : "Current block");
  const phaseDetail = today?.programName ?? "Your training";
  const phaseProgressLabel = periodized ? `Week ${phaseWeek} of 24` : `${achievements.weekCount} of ${achievements.weeklyGoal} sessions this week`;

  return {
    totalWorkouts: activeDays.size,
    hoursTrained,
    currentStreak: achievements.currentStreak,
    bestStreak: achievements.bestStreak,
    averageMinutes,
    thisMonth: months[months.length - 1]?.value ?? 0,
    monthly: months.map(({ label, value }) => ({ label, value })),
    recent: [...activeDays.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    phaseLabel,
    phaseDetail,
    phasePercent,
    phaseProgressLabel,
  };
}

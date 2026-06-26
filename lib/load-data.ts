// Server-only reads for the load tracker + calendar. Plain module (not
// "use server") so it can export non-action helpers to server components.
import { createClient } from "@/lib/supabase-server";
import { assessLoad, weeklyLoads, type SessionInput, type LoadAssessment, type WeekLoad } from "@/lib/load";

export interface SessionRow {
  id: number; session_date: string; kind: string; duration_min: number; rpe: number; note: string | null;
}
export interface EventRow {
  id: number; event_date: string; kind: string; name: string;
}

/** Raw sessions + events for the current user (most recent first). */
export async function getLoadData(): Promise<{ sessions: SessionRow[]; events: EventRow[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { sessions: [], events: [] };
  const [{ data: s }, { data: e }] = await Promise.all([
    supabase.from("training_sessions").select("id, session_date, kind, duration_min, rpe, note").eq("user_id", user.id).order("session_date", { ascending: false }),
    supabase.from("events").select("id, event_date, kind, name").eq("user_id", user.id).order("event_date", { ascending: true }),
  ]);
  return { sessions: (s ?? []) as SessionRow[], events: (e ?? []) as EventRow[] };
}

/** The current week's load assessment, plus weekly history for charts. */
export async function getAssessment(): Promise<{ assessment: LoadAssessment; weeks: WeekLoad[]; nextEvent: EventRow | null }> {
  const { sessions, events } = await getLoadData();
  const inputs: SessionInput[] = sessions.map((r) => ({ date: r.session_date, durationMin: r.duration_min, rpe: r.rpe }));
  // next upcoming event (events sorted ascending)
  const todayISO = new Date().toISOString().slice(0, 10);
  const nextEvent = events.find((e) => e.event_date >= todayISO) ?? null;
  const assessment = assessLoad(inputs, nextEvent?.event_date ?? null);
  const weeks = weeklyLoads(inputs);
  return { assessment, weeks, nextEvent };
}

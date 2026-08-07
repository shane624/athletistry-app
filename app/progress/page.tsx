import NavBar from "@/components/NavBar";
import ProgressClient from "./ProgressClient";
import MuscleBalance from "@/components/MuscleBalance";
import ActivityTrend from "@/components/ActivityTrend";
import ProgressRing from "@/components/ProgressRing";
import Icon from "@/components/Icon";
import { listExercises } from "@/lib/data";
import { createClient } from "@/lib/supabase-server";
import { getProgressOverview } from "@/lib/progress-overview";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [exercises, overview] = await Promise.all([listExercises(), getProgressOverview()]);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let programId = "periodized24";
  if (user) {
    const { data } = await supabase.from("user_program_state").select("active_program").eq("user_id", user.id).single();
    programId = data?.active_program ?? "periodized24";
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page">
        <header className="page-lead animate-in">
          <div>
            <h1>Progress &amp; Profile</h1>
            <p className="mt-3">Track your practice. Notice what is changing. Keep moving forward.</p>
          </div>
        </header>

        <div className="editorial-tabs mb-4 animate-in" aria-label="Progress sections">
          <span className="editorial-tab editorial-tab-active">Overview</span>
          <a href="#lift-progress" className="editorial-tab">Workouts</a>
          <a href="#muscle-focus" className="editorial-tab">Strength</a>
          <a href="#activity" className="editorial-tab">Consistency</a>
        </div>

        <section className="metric-grid stagger">
          <Metric label="Total workouts" value={overview.totalWorkouts} note={`${overview.thisMonth} this month`} />
          <Metric label="Hours trained" value={overview.hoursTrained} note="Logged session time" />
          <Metric label="Current streak" value={`${overview.currentStreak} wk`} note={`Best: ${overview.bestStreak} weeks`} />
          <Metric label="Average time" value={overview.averageMinutes ? `${overview.averageMinutes} min` : "—"} note="Per logged session" />
        </section>

        <section className="progress-layout mt-3">
          <div id="activity" className="panel panel-pad animate-in scroll-mt-24">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="panel-title">Monthly activity</p>
                <p className="text-grey text-[11px] mt-1">Distinct days you trained</p>
              </div>
              <span className="text-[10px] text-grey border border-line rounded-full px-3 py-1.5">Last 8 months</span>
            </div>
            <ActivityTrend data={overview.monthly} />
          </div>

          <div className="panel panel-pad animate-in">
            <p className="panel-title">Phase progress</p>
            <div className="progress-phase mt-4">
              <ProgressRing value={overview.phasePercent} label="complete" />
              <div>
                <p className="font-display text-[25px] font-bold leading-none text-ink">{overview.phaseLabel}</p>
                <p className="text-grey text-[11px] mt-1">{overview.phaseDetail}</p>
                <div className="progress-bar-thin mt-5"><span style={{ width: `${overview.phasePercent}%` }} /></div>
                <div className="flex justify-between gap-3 mt-2 text-[9px] text-grey">
                  <span>{overview.phaseProgressLabel}</span><span>{overview.phasePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="progress-layout mt-3">
          <div id="muscle-focus" className="scroll-mt-24"><MuscleBalance /></div>
          <div className="panel panel-pad animate-in">
            <div className="flex items-center justify-between gap-3">
              <div><p className="panel-title">Recent workouts</p><p className="text-grey text-[10px] mt-1">Your latest training days</p></div>
              <Icon name="check" className="w-4 h-4 text-teal" />
            </div>
            <div className="mt-3">
              {overview.recent.length ? overview.recent.map((r) => (
                <div key={r.date} className="recent-row">
                  <span className="recent-thumb"><Icon name="ballet" className="w-4 h-4" /></span>
                  <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-ink truncate">{r.label}</p><p className="text-[9px] text-grey truncate">{r.detail}</p></div>
                  <time className="text-[9px] text-grey" dateTime={r.date}>{new Date(`${r.date}T12:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</time>
                </div>
              )) : <p className="text-grey text-xs py-5">Your recent sessions will appear here as you log training.</p>}
            </div>
          </div>
        </section>

        <section id="lift-progress" className="mt-9 scroll-mt-24 animate-in">
          <p className="eyebrow">Strength history</p>
          <div className="flex items-end justify-between gap-4 flex-wrap mt-1">
            <h2 className="font-display text-[34px] leading-none font-bold text-ink">Exercise progress.</h2>
            <p className="text-grey text-[11px] max-w-md">Choose an exercise to see top-set load and training volume across your current program.</p>
          </div>
          <ProgressClient exercises={exercises} programId={programId} />
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string | number; note: string }) {
  return <div className="metric-card animate-in"><p className="metric-label">{label}</p><p className="metric-value">{value}</p><p className="metric-note">{note}</p></div>;
}

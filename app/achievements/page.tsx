import NavBar from "@/components/NavBar";
import ProgressRing from "@/components/ProgressRing";
import Icon from "@/components/Icon";
import { getAchievements } from "@/lib/achievements-data";
import { LEVELS } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const a = await getAchievements();
  const earned = a.badges.filter((b) => b.earned);
  const locked = a.badges.filter((b) => !b.earned);
  const nextBadge = locked.find((b) => b.progress > 0) ?? locked[0];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page">
        <header className="page-lead animate-in">
          <div>
            <h1>Achievements</h1>
            <p className="mt-3">Proof that consistency compounds. The goal is not collecting badges. It is becoming the dancer who earns them.</p>
          </div>
        </header>

        <div className="editorial-tabs mb-4 animate-in">
          <span className="editorial-tab editorial-tab-active">Overview</span>
          <a href="#milestones" className="editorial-tab">Milestones</a>
          <a href="#ranks" className="editorial-tab">Ranks</a>
        </div>

        <section className="progress-layout">
          <div className="panel panel-pad animate-in" id="ranks">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="panel-title">Current rank</p>
                <h2 className="font-display text-[38px] leading-none font-bold text-ink mt-2">{a.level.name}</h2>
                <p className="text-grey text-[11px] mt-2">{a.totalWorkouts} training days recorded</p>
              </div>
              <span className="medal medal-dark !w-[82px] !h-[82px]"><Icon name="trophy" className="w-8 h-8" /></span>
            </div>
            {a.nextLevel ? <>
              <div className="progress-bar-thin mt-7"><span style={{ width: `${Math.round(a.levelProgress * 100)}%` }} /></div>
              <div className="flex items-center justify-between gap-3 mt-2 text-[10px] text-grey"><span>{a.toNextLevel} more to {a.nextLevel.name}</span><span>{Math.round(a.levelProgress * 100)}%</span></div>
            </> : <p className="text-teal text-xs font-semibold mt-6">Top rank reached. Étoile.</p>}

            <div className="mt-7 grid grid-cols-4 md:grid-cols-8 gap-2">
              {LEVELS.map((l) => {
                const reached = a.totalWorkouts >= l.minWorkouts;
                return <div key={l.index} className="text-center"><span className={`mx-auto w-7 h-7 rounded-full grid place-items-center text-[9px] font-bold border ${reached ? "bg-navy text-white border-navy" : "bg-transparent text-grey border-line"}`}>{l.index + 1}</span><p className="text-[7px] leading-tight text-grey mt-1.5 truncate">{l.name}</p></div>;
              })}
            </div>
          </div>

          <div className="panel panel-pad animate-in">
            <p className="panel-title">This week</p>
            <div className="flex items-center justify-between gap-4 mt-3">
              <ProgressRing value={Math.round(a.weeklyRing * 100)} size={118} label="weekly goal" />
              <div className="flex-1">
                <p className="font-display text-[32px] leading-none font-bold text-ink">{a.weekCount} / {a.weeklyGoal}</p>
                <p className="text-grey text-[10px] mt-1">workouts completed</p>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div><p className="font-display text-2xl font-bold text-ink">{a.currentStreak}</p><p className="text-[8px] uppercase tracking-[.11em] text-grey">Current streak</p></div>
                  <div><p className="font-display text-2xl font-bold text-ink">{a.bestStreak}</p><p className="text-[8px] uppercase tracking-[.11em] text-grey">Best streak</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="milestones" className="mt-8 scroll-mt-24">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-3">
            <div><p className="eyebrow">Recent achievements</p><h2 className="font-display text-[34px] leading-none font-bold text-ink mt-1">Milestones earned.</h2></div>
            <p className="text-grey text-[10px]">{earned.length} of {a.badges.length} unlocked</p>
          </div>
          <div className="achievement-grid stagger">
            {earned.slice(0, 8).map((b, i) => <MedalCard key={b.id} badge={b} dark={i % 3 === 0} />)}
            {!earned.length && <div className="panel panel-pad col-span-full"><p className="font-display text-2xl font-bold text-ink">Your first milestone is waiting.</p><p className="text-grey text-xs mt-2">Complete a training day and the collection begins.</p></div>}
          </div>
        </section>

        <section className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] gap-3 mt-3">
          <div className="panel panel-pad animate-in">
            <p className="panel-title">Milestone progress</p>
            <div className="flex items-center justify-between gap-4 mt-4">
              <div><p className="font-display text-[36px] leading-none font-bold text-ink">{earned.length} / {a.badges.length}</p><p className="text-grey text-[10px] mt-2">Achievements earned</p></div>
              <div className="w-1/2"><div className="progress-bar-thin"><span style={{ width: `${Math.round((earned.length / Math.max(a.badges.length, 1)) * 100)}%` }} /></div></div>
            </div>
          </div>
          <div className="panel panel-pad animate-in">
            <p className="panel-title">Next milestone</p>
            {nextBadge ? <><p className="font-display text-[24px] leading-none font-bold text-ink mt-3">{nextBadge.name}</p><p className="text-grey text-[10px] leading-relaxed mt-2">{nextBadge.desc}</p><div className="progress-bar-thin mt-4"><span style={{ width: `${Math.round(nextBadge.progress * 100)}%` }} /></div></> : <p className="text-grey text-xs mt-3">Every current badge has been earned.</p>}
          </div>
        </section>

        {locked.length > 0 && <section className="mt-8"><p className="eyebrow mb-3">Still ahead</p><div className="achievement-grid">{locked.slice(0, 8).map((b) => <MedalCard key={b.id} badge={b} locked />)}</div></section>}
      </main>
    </div>
  );
}

function MedalCard({ badge: b, dark = false, locked = false }: { badge: { name: string; desc: string; earned: boolean; progress: number }; dark?: boolean; locked?: boolean }) {
  return <div className="achievement-medal-card animate-in"><span className={`medal ${dark ? "medal-dark" : ""} ${locked ? "medal-locked" : ""}`}><Icon name={b.earned ? "trophy" : "sparkle"} className="w-7 h-7" /></span><p className="text-[11px] font-semibold text-ink">{b.name}</p><p className="text-[9px] leading-relaxed text-grey mt-1.5">{b.desc}</p>{!b.earned && b.progress > 0 && <div className="progress-bar-thin mt-3"><span style={{ width: `${Math.round(b.progress * 100)}%` }} /></div>}</div>;
}

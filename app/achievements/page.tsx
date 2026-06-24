import NavBar from "@/components/NavBar";
import { getAchievements } from "@/lib/achievements-data";
import { LEVELS } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const a = await getAchievements();
  const earned = a.badges.filter((b) => b.earned);
  const locked = a.badges.filter((b) => !b.earned);

  // ring geometry
  const R = 52, C = 2 * Math.PI * R;
  const ringDash = C * a.weeklyRing;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="eyebrow animate-in">Your journey</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1 animate-in">Achievements</h1>

        {/* top: level + streak + ring */}
        <div className="grid md:grid-cols-3 gap-4 mt-5">
          {/* LEVEL */}
          <div className="card p-5 md:col-span-2 animate-in">
            <p className="eyebrow">Current rank</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-extrabold text-navy">{a.level.name}</h2>
              <span className="text-grey text-sm">· {a.totalWorkouts} workouts</span>
            </div>
            {a.nextLevel ? (
              <>
                <div className="mt-4 h-2 rounded-full bg-light overflow-hidden">
                  <div className="h-full grad-brand rounded-full transition-all duration-700"
                       style={{ width: `${Math.round(a.levelProgress * 100)}%` }} />
                </div>
                <p className="text-grey text-sm mt-2">
                  {a.toNextLevel} more {a.toNextLevel === 1 ? "workout" : "workouts"} to{" "}
                  <span className="text-navy font-semibold">{a.nextLevel.name}</span>
                </p>
              </>
            ) : (
              <p className="text-teal text-sm mt-3 font-semibold">Top rank reached — Étoile. Bravo.</p>
            )}

            {/* rank ladder */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {LEVELS.map((l) => (
                <span key={l.index}
                  className={`text-[11px] px-2 py-1 rounded-full border ${
                    a.totalWorkouts >= l.minWorkouts
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-grey border-line"
                  }`}>
                  {l.name}
                </span>
              ))}
            </div>
          </div>

          {/* WEEKLY RING */}
          <div className="card p-5 flex flex-col items-center justify-center animate-in">
            <p className="eyebrow self-start">This week</p>
            <div className="relative mt-2" style={{ width: 132, height: 132 }}>
              <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                <circle cx="66" cy="66" r={R} fill="none" stroke="#eef6f5" strokeWidth="12" />
                <circle cx="66" cy="66" r={R} fill="none" stroke="#27ae9f" strokeWidth="12"
                  strokeLinecap="round" strokeDasharray={`${ringDash} ${C}`}
                  style={{ transition: "stroke-dasharray .8s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-navy">{a.weekCount}<span className="text-grey text-base font-semibold">/{a.weeklyGoal}</span></span>
                <span className="text-grey text-xs">workouts</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-center">
              <div><div className="text-xl font-extrabold text-navy">{a.currentStreak}</div><div className="text-grey text-xs">week streak</div></div>
              <div><div className="text-xl font-extrabold text-navy">{a.bestStreak}</div><div className="text-grey text-xs">best</div></div>
            </div>
          </div>
        </div>

        {/* badges */}
        <p className="eyebrow mt-8">Earned · {earned.length} of {a.badges.length}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {earned.map((b) => <BadgeCard key={b.id} b={b} />)}
          {earned.length === 0 && (
            <p className="text-grey text-sm col-span-full">No badges yet — log your first workout to get started.</p>
          )}
        </div>

        {locked.length > 0 && (
          <>
            <p className="eyebrow mt-8">Locked</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {locked.map((b) => <BadgeCard key={b.id} b={b} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function BadgeCard({ b }: { b: { id: string; name: string; desc: string; earned: boolean; progress: number } }) {
  return (
    <div className={`card p-4 animate-in ${b.earned ? "card-hover" : "opacity-80"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${b.earned ? "grad-brand" : "bg-light"}`}>
          {b.earned ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#5b6470" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          )}
        </div>
        <div className="min-w-0">
          <div className={`font-bold text-sm ${b.earned ? "text-navy" : "text-grey"}`}>{b.name}</div>
        </div>
      </div>
      <p className="text-grey text-xs mt-2 leading-snug">{b.desc}</p>
      {!b.earned && b.progress > 0 && (
        <div className="mt-2 h-1.5 rounded-full bg-light overflow-hidden">
          <div className="h-full bg-teal/70 rounded-full" style={{ width: `${Math.round(b.progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

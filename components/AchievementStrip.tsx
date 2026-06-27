import Link from "next/link";
import { getAchievements } from "@/lib/achievements-data";

// Apple Fitness–style weekly ring card for the dashboard. Server component —
// fetches the same derived achievements as the full Achievements page.
export default async function AchievementStrip() {
  const a = await getAchievements();
  const R = 15.5, C = 2 * Math.PI * R;
  const offset = C * (1 - a.weeklyRing); // ring fills clockwise as the week fills
  const remaining = Math.max(0, a.weeklyGoal - a.weekCount);
  const closed = remaining === 0;

  const nudge = closed
    ? "Ring closed — beautiful work this week."
    : remaining === 1
      ? "One more session to close your ring."
      : `${remaining} more sessions to close your ring.`;

  return (
    <Link href="/achievements" className="card card-hover block p-5 mb-5 animate-in">
      <div className="flex items-center gap-5">
        {/* big weekly ring */}
        <div className="relative shrink-0" style={{ width: 84, height: 84 }}>
          <svg width="84" height="84" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r={R} fill="none" stroke="var(--c-line)" strokeWidth="3.4" />
            <circle
              cx="18" cy="18" r={R} fill="none" stroke="var(--c-teal)" strokeWidth="3.4"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-navy leading-none">{a.weekCount}</span>
            <span className="text-[11px] text-grey">of {a.weeklyGoal}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-navy text-base font-bold">This week</p>
          <p className="text-grey text-sm mt-0.5 leading-snug">{nudge}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {a.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                <span aria-hidden>🔥</span>{a.currentStreak}-week streak
              </span>
            )}
            <span className="text-sm font-semibold text-tealdark">{a.level.name}</span>
          </div>
        </div>

        <span className="text-teal text-xl shrink-0" aria-hidden>›</span>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { getAchievements } from "@/lib/achievements-data";

export default async function AchievementStrip() {
  const a = await getAchievements();
  const R = 15.5, C = 2 * Math.PI * R;
  const offset = C * (1 - a.weeklyRing);
  const remaining = Math.max(0, a.weeklyGoal - a.weekCount);
  const closed = remaining === 0;
  const nudge = closed
    ? "Week complete. Keep the quality high."
    : remaining === 1
      ? "One more session closes the week."
      : `${remaining} sessions left to close the week.`;

  return (
    <Link href="/achievements" className="card card-hover achievement-card block animate-in">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: 78, height: 78 }}>
          <svg width="78" height="78" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r={R} fill="none" stroke="var(--c-line)" strokeWidth="2.7" />
            <circle cx="18" cy="18" r={R} fill="none" stroke="var(--c-teal)" strokeWidth="2.7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} className="ring-draw" style={{ ["--ring-c" as string]: String(C) }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[26px] font-bold text-navy leading-none">{a.weekCount}</span>
            <span className="text-[9px] tracking-wide text-grey">of {a.weeklyGoal}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow">Your week</p>
          <p className="font-display text-[24px] leading-none font-bold text-navy mt-1.5">Keep building.</p>
          <p className="text-grey text-[12px] mt-2 leading-snug">{nudge}</p>
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {a.currentStreak > 0 && <span className="text-[11px] font-semibold text-navy">{a.currentStreak}-week streak</span>}
            <span className="text-[11px] font-bold text-teal">{a.level.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

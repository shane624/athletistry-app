import Link from "next/link";
import { getAchievements } from "@/lib/achievements-data";

// Compact streak + level + weekly-ring strip for the dashboard. Server
// component — fetches the same derived achievements as the full page.
export default async function AchievementStrip() {
  const a = await getAchievements();
  const R = 15, C = 2 * Math.PI * R;
  const dash = C * a.weeklyRing;

  return (
    <Link href="/achievements" className="card card-hover block p-4 mb-5 animate-in">
      <div className="flex items-center gap-4">
        {/* weekly ring */}
        <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
          <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
            <circle cx="22" cy="22" r={R} fill="none" stroke="#eef6f5" strokeWidth="5" />
            <circle cx="22" cy="22" r={R} fill="none" stroke="#27ae9f" strokeWidth="5"
              strokeLinecap="round" strokeDasharray={`${dash} ${C}`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-navy">
            {a.weekCount}/{a.weeklyGoal}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow">{a.level.name}</p>
          <p className="text-navy text-sm font-semibold mt-0.5">
            {a.currentStreak > 0
              ? `${a.currentStreak}-week streak — keep it going`
              : "Train this week to start a streak"}
          </p>
        </div>

        <span className="text-teal text-sm font-semibold whitespace-nowrap shrink-0">View →</span>
      </div>
    </Link>
  );
}

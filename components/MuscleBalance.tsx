import { getMuscleProgress } from "@/lib/muscle-data";

// Shows which muscle groups the member has trained, by share of volume, with
// bars — so they can see balance and spot gaps (e.g. "all legs, no pull").
export default async function MuscleBalance() {
  const m = await getMuscleProgress();

  if (m.totalSets === 0) {
    return (
      <div className="card p-5 animate-in">
        <p className="eyebrow">Muscle-group focus</p>
        <p className="text-grey text-sm mt-2">Log a few workouts and your training balance across muscle groups will show here.</p>
      </div>
    );
  }

  return (
    <div className="card p-5 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="eyebrow">Muscle-group focus</p>
        <p className="text-grey text-xs">{m.trainedGroups} of {m.totalGroups} groups trained</p>
      </div>
      <div className="mt-4 space-y-2.5">
        {m.groups.map((g) => (
          <div key={g.group}>
            <div className="flex items-center justify-between text-sm">
              <span className={g.sets > 0 ? "text-navy font-medium" : "text-grey"}>{g.group}</span>
              <span className="text-grey text-xs">
                {g.sets > 0 ? `${g.sets} set${g.sets > 1 ? "s" : ""}` : "not yet"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-light overflow-hidden mt-1">
              <div className="h-full grad-brand rounded-full transition-all duration-500"
                   style={{ width: `${Math.max(g.share * 100, g.sets > 0 ? 4 : 0)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-grey text-xs mt-4">
        Bars show each group&apos;s share of your training. Even bars mean balanced training; a low or
        empty bar is a gap worth filling.
      </p>
    </div>
  );
}

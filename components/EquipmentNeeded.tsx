"use client";

import { equipmentNeeded, EQUIPMENT_LABEL, type Equipment } from "@/lib/equipment";

// friendly "or use…" hints for household swaps
const HINT: Partial<Record<Equipment, string>> = {
  band: "a resistance / theraband",
  dumbbell: "or filled water bottles",
  barbell: "or dumbbells",
  slant_board: "or a wedge / rolled mat",
  step: "or a sturdy chair, bench or stair",
  partner: "someone to assist",
};

const ICON: Record<Equipment, string> = {
  bodyweight: "🤸",
  band: "🎗️",
  dumbbell: "🏋️",
  barbell: "🏋️",
  slant_board: "📐",
  step: "🪑",
  partner: "🤝",
};

/** "What you'll need" list derived from the exercises in a built workout. */
export default function EquipmentNeeded({ names, className = "" }: { names: string[]; className?: string }) {
  const needed = equipmentNeeded(names);

  if (needed.length === 0) {
    return (
      <div className={`card p-3 bg-light ${className}`}>
        <p className="text-sm text-navy"><b>What you'll need:</b> nothing — this one&apos;s all bodyweight. Just some space to move.</p>
      </div>
    );
  }

  return (
    <div className={`card p-4 ${className}`}>
      <p className="eyebrow mb-2">What you'll need</p>
      <ul className="space-y-1.5">
        {needed.map((e) => (
          <li key={e} className="flex items-start gap-2 text-sm">
            <span className="shrink-0">{ICON[e]}</span>
            <span className="text-navy">
              <b>{EQUIPMENT_LABEL[e]}</b>
              {HINT[e] ? <span className="text-grey"> — {HINT[e]}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-grey text-xs mt-2">Plus a bit of clear space, and water nearby.</p>
    </div>
  );
}

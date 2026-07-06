"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { addExercisesToPlanDay } from "@/lib/event-plan-actions";

// Adds a short accessory workout (e.g. core) to a class / cardio / rest day, so
// a dancer can pair some strength work with a class or a bike ride.
export default function AddDayWorkout({ date }: { date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    setBusy(true); setMsg(null);
    const res = await addExercisesToPlanDay(date, 4);
    setBusy(false);
    if (res.ok) router.refresh();
    else setMsg(res.error ?? "Couldn't add a workout.");
  }

  return (
    <div className="mt-3">
      <button onClick={add} disabled={busy}
        className="btn-ghost text-sm inline-flex items-center gap-1.5">
        <Icon name="dumbbell" className="w-4 h-4" /> {busy ? "Adding…" : "Add a short workout to this day"}
      </button>
      {msg && <span className="text-red-600 text-sm ml-2">{msg}</span>}
      <p className="text-grey text-xs mt-1">Pairs some strength or core work with your class or cross-training.</p>
    </div>
  );
}

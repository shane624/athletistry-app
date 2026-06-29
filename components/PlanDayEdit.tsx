"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { regeneratePlanDay, addExercisesToPlanDay } from "@/lib/event-plan-actions";

// Swap (reroll) or add an exercise to a single plan day's workout.
export default function PlanDayEdit({ date }: { date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "swap" | "add">(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function swap() {
    if (!confirm("Swap today's exercises for a fresh set? Your logged sets for today will be cleared if exercises change.")) return;
    setBusy("swap"); setMsg(null);
    const res = await regeneratePlanDay(date);
    setMsg(res.ok ? null : res.error ?? "Couldn't swap.");
    setBusy(null);
    if (res.ok) router.refresh();
  }

  async function add() {
    setBusy("add"); setMsg(null);
    const res = await addExercisesToPlanDay(date, 1);
    setMsg(res.ok ? null : res.error ?? "Couldn't add.");
    setBusy(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-3 mt-3 flex-wrap">
      <button onClick={swap} disabled={!!busy}
        className="btn-ghost text-sm inline-flex items-center gap-1.5">
        <Icon name="bolt" className="w-4 h-4" /> {busy === "swap" ? "Swapping…" : "Swap exercises"}
      </button>
      <button onClick={add} disabled={!!busy}
        className="btn-ghost text-sm inline-flex items-center gap-1.5">
        <Icon name="check" className="w-4 h-4" /> {busy === "add" ? "Adding…" : "Add an exercise"}
      </button>
      {msg && <span className="text-red-600 text-sm">{msg}</span>}
    </div>
  );
}

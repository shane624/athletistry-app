"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { reactivateEventPlan } from "@/lib/event-plan-actions";

// Shown when a dancer has a paused event plan with days left. One tap puts them
// back on it.
export default function RejoinEventPlan({ label, daysLeft }: { label: string | null; daysLeft: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function rejoin() {
    setBusy(true); setErr(null);
    const res = await reactivateEventPlan();
    if (res.ok) { router.refresh(); }
    else { setErr(res.error ?? "Couldn't rejoin."); setBusy(false); }
  }

  return (
    <div className="card p-4 mb-5 border-l-2 border-teal animate-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="eyebrow">Paused plan</p>
          <p className="text-navy text-sm font-semibold mt-0.5">
            {label ?? "Your event plan"} · {daysLeft} day{daysLeft === 1 ? "" : "s"} left
          </p>
          {err && <p className="text-red-600 text-xs mt-1">{err}</p>}
        </div>
        <button onClick={rejoin} disabled={busy}
          className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2 shrink-0">
          <Icon name="check" className="w-4 h-4" /> {busy ? "Rejoining…" : "Rejoin plan"}
        </button>
      </div>
    </div>
  );
}

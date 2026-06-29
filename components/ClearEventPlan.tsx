"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearEventPlan } from "@/lib/event-plan-actions";

export default function ClearEventPlan() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function exit() {
    if (!confirm("Pause this plan and go back to your regular program? You can rejoin it any time from Today or the Training Plan Builder.")) return;
    setBusy(true);
    await clearEventPlan();
    router.refresh();
  }

  return (
    <button onClick={exit} disabled={busy} className="text-grey hover:text-navy text-sm font-medium">
      {busy ? "Exiting…" : "Exit plan"}
    </button>
  );
}

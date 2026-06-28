"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearEventPlan } from "@/lib/event-plan-actions";

export default function ClearEventPlan() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function exit() {
    if (!confirm("Stop following the event plan and go back to your regular program?")) return;
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

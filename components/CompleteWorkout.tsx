"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Celebrate from "@/components/Celebrate";
import Dots from "@/components/Dots";

// Bottom-of-workout "Complete Workout" button. Confirms the session is done,
// then checks whether the member's rank went up (current level passed from the
// server vs the last level we celebrated, stored locally). If so, fires the
// confetti/flowers celebration.
export default function CompleteWorkout({
  levelIndex,
  levelName,
  nextLevelName,
}: {
  levelIndex: number;       // current rank index from achievements
  levelName: string;        // current rank name
  nextLevelName?: string;   // for the subtitle / encouragement
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // On mount, check if rank increased since last time we celebrated.
  useEffect(() => {
    let last = -1;
    try { last = parseInt(localStorage.getItem("athl_last_rank") ?? "-1"); } catch {}
    if (last >= 0 && levelIndex > last) {
      setCelebrate(true);
    }
    // record the current rank as seen (so we only celebrate a given promotion once)
    try { localStorage.setItem("athl_last_rank", String(levelIndex)); } catch {}
  }, [levelIndex]);

  function complete() {
    setBusy(true);
    // The workout's sets are already logged as the member trains; "complete"
    // is a confirmation + celebration moment. Refresh so achievements update.
    setDone(true);
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      {celebrate && (
        <Celebrate
          title={`You're now ${levelName}`}
          subtitle={nextLevelName ? `Keep training to reach ${nextLevelName}.` : "You've reached the top rank. Bravo."}
          onClose={() => setCelebrate(false)}
        />
      )}

      <div className="mt-8">
        {!done ? (
          <button className="btn-primary w-full py-3 text-base" onClick={complete} disabled={busy}>
            {busy ? <Dots /> : "✓ Complete workout"}
          </button>
        ) : (
          <div className="card p-4 text-center">
            <p className="text-navy font-semibold">Workout complete — nice work.</p>
            <p className="text-grey text-sm mt-1">Your progress and streak are updated.</p>
          </div>
        )}
      </div>
    </>
  );
}

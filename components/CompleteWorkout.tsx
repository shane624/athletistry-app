"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Celebrate from "@/components/Celebrate";
import Dots from "@/components/Dots";
import { logSession } from "@/lib/load-actions";
import { sessionTrimp } from "@/lib/load";

// Bottom-of-workout "Complete Workout" button. On complete, it asks for the
// session duration + RPE (so it counts toward training load / TRIMP), logs it,
// then shows done — and fires the rank-up celebration if the member just
// reached a new ballet rank.
export default function CompleteWorkout({
  levelIndex, levelName, nextLevelName,
}: {
  levelIndex: number; levelName: string; nextLevelName?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "logging" | "done">("idle");
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [dur, setDur] = useState("");
  const [rpe, setRpe] = useState(6);

  useEffect(() => {
    let last = -1;
    try { last = parseInt(localStorage.getItem("athl_last_rank") ?? "-1"); } catch {}
    if (last >= 0 && levelIndex > last) setCelebrate(true);
    try { localStorage.setItem("athl_last_rank", String(levelIndex)); } catch {}
  }, [levelIndex]);

  async function finish(skipLog = false) {
    setBusy(true);
    if (!skipLog && dur) {
      await logSession({ durationMin: Number(dur), rpe, kind: "workout" });
    }
    setStage("done");
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
        {stage === "idle" && (
          <button className="btn-primary w-full py-3 text-base" onClick={() => setStage("logging")}>
            ✓ Complete workout
          </button>
        )}

        {stage === "logging" && (
          <div className="card p-5">
            <p className="eyebrow">Log this session</p>
            <p className="text-grey text-sm mt-1">Quick numbers so it counts toward your training load.</p>
            <div className="mt-3">
              <label className="text-xs text-grey">How long? (minutes)</label>
              <input className="input mt-1 w-32" inputMode="numeric" placeholder="e.g. 45" value={dur} onChange={(e) => setDur(e.target.value)} />
            </div>
            <div className="mt-3">
              <label className="text-xs text-grey">Effort (RPE): <b className="text-navy">{rpe}</b> / 10</label>
              <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-teal mt-1" />
              <div className="flex justify-between text-[10px] text-grey"><span>1 easy</span><span>10 max</span></div>
            </div>
            {dur && <p className="text-grey text-sm mt-1">= <b className="text-navy">{sessionTrimp(Number(dur) || 0, rpe)} TRIMP</b></p>}
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" disabled={busy || !dur} onClick={() => finish(false)}>
                {busy ? <Dots /> : "Save & finish"}
              </button>
              <button className="btn-ghost" disabled={busy} onClick={() => finish(true)}>Skip</button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="card p-4 text-center">
            <p className="text-navy font-semibold">Workout complete — nice work.</p>
            <p className="text-grey text-sm mt-1">Progress, streak and training load updated.</p>
          </div>
        )}
      </div>
    </>
  );
}

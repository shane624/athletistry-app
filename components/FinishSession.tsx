"use client";

import { useState } from "react";
import { logSession } from "@/lib/load-actions";
import { effortWord } from "@/lib/load";

/**
 * "Mark complete" + effort picker that logs the session to the dancer's training
 * load (time × how hard it felt). Reusable across circuits and guided workouts.
 */
export default function FinishSession({
  kind,
  label = "Complete workout",
  defaultDuration = 30,
}: {
  kind: string;             // e.g. "Circuit", "Guided workout"
  label?: string;
  defaultDuration?: number; // sensible default minutes
}) {
  const [open, setOpen] = useState(false);
  const [rpe, setRpe] = useState(6);
  const [duration, setDuration] = useState(defaultDuration);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setState("saving"); setErr(null);
    const res = await logSession({ durationMin: duration, rpe, kind });
    if (res.ok) setState("done");
    else { setState("error"); setErr(res.error ?? "Could not save"); }
  }

  if (state === "done") {
    return (
      <div className="card p-4 bg-light border-2 border-teal mt-4">
        <p className="text-tealdark font-semibold">Logged ✓ — added to your training load.</p>
        <p className="text-grey text-sm mt-1">{duration} min · {effortWord(rpe)} · {duration * rpe} load. See it in your Training Calendar.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button className="btn-primary mt-4 w-full sm:w-auto" onClick={() => setOpen(true)}>
        ✓ {label}
      </button>
    );
  }

  return (
    <div className="card p-4 mt-4">
      <p className="font-semibold text-navy">How hard was that?</p>
      <p className="text-grey text-sm mt-0.5">Your effort and time set the training load this session adds.</p>

      <div className="mt-3">
        <p className="text-sm font-medium text-navy">Effort — how hard it felt: {rpe} · {effortWord(rpe)}</p>
        <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full mt-1 accent-teal" />
        <div className="flex justify-between text-xs text-grey"><span>Easy</span><span>All-out</span></div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium text-navy">How long? (minutes)</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {[10, 15, 20, 30, 45, 60].map((m) => (
            <button key={m} onClick={() => setDuration(m)}
              className={`rounded-full px-3 py-1.5 text-sm border ${duration === m ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
      <div className="flex gap-2 mt-4">
        <button className="btn-primary" onClick={save} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Log it"}
        </button>
        <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

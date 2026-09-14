"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Celebrate from "@/components/Celebrate";
import Dots from "@/components/Dots";
import Link from "next/link";
import { logSession } from "@/lib/load-actions";
import { sessionTrimp, effortWord } from "@/lib/load";

// Bottom-of-workout "Complete Workout" button. On complete, it asks for the
// session duration + RPE (so it counts toward training load / TRIMP), logs it,
// then shows done — and fires the rank-up celebration if the member just
// reached a new ballet rank.
export default function CompleteWorkout({
  levelIndex, levelName, nextLevelName, sessionTitle, exercisesLogged, exercisesTotal, weekLoadBefore, weekSessionsBefore,
}: {
  levelIndex: number; levelName: string; nextLevelName?: string;
  sessionTitle?: string;
  exercisesLogged?: number;
  exercisesTotal?: number;
  /** Week-to-date figures from before this session, so the summary can show what it added. */
  weekLoadBefore?: number;
  weekSessionsBefore?: number;
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
              <label className="text-xs text-grey">Effort — how hard it felt: <b className="text-navy">{rpe} · {effortWord(rpe)}</b></label>
              <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-teal mt-1" />
              <div className="flex justify-between text-[11px] text-grey"><span>easy</span><span>all-out</span></div>
            </div>
            {dur && <p className="text-grey text-sm mt-1">Adds <b className="text-navy">{sessionTrimp(Number(dur) || 0, rpe)} load</b> to your week</p>}
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" disabled={busy || !dur} onClick={() => finish(false)}>
                {busy ? <Dots /> : "Save & finish"}
              </button>
              <button className="btn-ghost" disabled={busy} onClick={() => finish(true)}>Skip</button>
            </div>
          </div>
        )}

        {stage === "done" && (() => {
          // The end of a session is the moment a dancer is most receptive to
          // what they just did. It used to be two lines of grey text.
          const added = dur ? sessionTrimp(Number(dur) || 0, rpe) : 0;
          const weekLoad = (weekLoadBefore ?? 0) + added;
          const weekSessions = (weekSessionsBefore ?? 0) + (dur ? 1 : 0);
          return (
            <div className="session-summary">
              <p className="hero-kicker">Session complete</p>
              <h3 className="font-display text-[clamp(1.8rem,5vw,2.5rem)] leading-[1.02] font-bold tracking-[-.035em] mt-2">
                {sessionTitle || "Well done."}
              </h3>

              <div className="session-summary-figures">
                {dur && (
                  <span>
                    <b>{dur}</b>
                    <small>minutes</small>
                  </span>
                )}
                {dur && (
                  <span>
                    <b>{added}</b>
                    <small>load added</small>
                  </span>
                )}
                {exercisesTotal ? (
                  <span>
                    <b>{exercisesLogged ?? 0}/{exercisesTotal}</b>
                    <small>exercises logged</small>
                  </span>
                ) : null}
                {dur && (
                  <span>
                    <b>{effortWord(rpe)}</b>
                    <small>effort</small>
                  </span>
                )}
              </div>

              {dur && (
                <p className="session-summary-note">
                  That is {weekSessions} session{weekSessions === 1 ? "" : "s"} and {weekLoad} load this week.
                </p>
              )}
              {!dur && (
                <p className="session-summary-note">
                  Logged without numbers, so it will not count toward your training load.
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                <Link href="/progress" className="btn-ghost !min-h-[40px] !text-[12px]">See your progress</Link>
                <Link href="/load" className="btn-ghost !min-h-[40px] !text-[12px]">Training calendar</Link>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}

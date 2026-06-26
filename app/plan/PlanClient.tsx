"use client";

import { useState } from "react";

// First-version event planner. Enter an event date and event type; we compute
// the macro/meso/micro structure back from it, following the Build Your Workout
// method — build volume through the meso phase, then taper ~30% in the final
// two weeks. No DB needed; this is a planning guide the dancer reads and follows.

type Phase = { label: string; weeks: string; focus: string; tone: "build" | "peak" | "taper" | "base" };

function buildPlan(eventISO: string): { weeksOut: number; phases: Phase[] } | null {
  const event = new Date(eventISO + "T00:00:00");
  if (isNaN(event.getTime())) return null;
  const now = new Date();
  const msWeek = 7 * 24 * 3600 * 1000;
  const weeksOut = Math.max(0, Math.ceil((event.getTime() - now.getTime()) / msWeek));

  const phases: Phase[] = [];
  if (weeksOut <= 0) {
    return { weeksOut: 0, phases: [{ label: "Event week", weeks: "now", focus: "Keep movement light and sharp. Trust the work you've banked.", tone: "peak" }] };
  }

  // taper = final 2 weeks (or 1 if very close)
  const taperWeeks = weeksOut >= 3 ? 2 : 1;
  const buildWeeks = weeksOut - taperWeeks;

  if (buildWeeks >= 9) {
    // long runway: a base block then a build block
    const base = Math.ceil(buildWeeks / 3);
    phases.push({ label: "Base phase", weeks: `weeks ${weeksOut}–${weeksOut - base + 1} out`, focus: "Rebuild foundations — control, range, and clean technique. Moderate volume, low intensity. Install the pattern before loading it.", tone: "base" });
    phases.push({ label: "Build phase (meso)", weeks: `weeks ${weeksOut - base}–${taperWeeks + 1} out`, focus: "Progressively increase load and volume week to week. Strength and power on a correct base. This is where the gains are made.", tone: "build" });
  } else {
    phases.push({ label: "Build phase (meso)", weeks: `weeks ${weeksOut}–${taperWeeks + 1} out`, focus: "Progressively increase your weekly effort. Add load or volume each week. Track it so you know it's climbing.", tone: "build" });
  }

  phases.push({
    label: "Taper",
    weeks: taperWeeks === 2 ? "final 2 weeks" : "final week",
    focus: "Cut gym volume by ~30% while keeping intensity. You control your output even when rehearsal load isn't yours to control — arrive fresh, strong, and lower-risk.",
    tone: "taper",
  });
  phases.push({ label: "Event", weeks: "performance / comp / exam", focus: "Light, sharp movement only. The training is done — now dance.", tone: "peak" });

  return { weeksOut, phases };
}

const toneClass: Record<Phase["tone"], string> = {
  base: "bg-navy2",
  build: "grad-navy",
  taper: "grad-brand",
  peak: "bg-teal",
};

export default function PlanClient() {
  const [date, setDate] = useState("");
  const [type, setType] = useState("Performance");
  const [plan, setPlan] = useState<ReturnType<typeof buildPlan>>(null);

  function go(e: React.FormEvent) {
    e.preventDefault();
    setPlan(buildPlan(date));
  }

  return (
    <div className="mt-5">
      <form onSubmit={go} className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-sm font-medium text-navy">Event type</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {["Performance", "Competition", "Exam"].map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1.5 text-sm border ${type === t ? "bg-teal text-white border-teal" : "bg-white border-line"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-navy">Event date</p>
            <input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <button className="btn-primary" disabled={!date}>Build my plan</button>
        </div>
      </form>

      {plan && (
        <div className="mt-6">
          <p className="eyebrow">
            {plan.weeksOut > 0 ? `${plan.weeksOut} weeks until your ${type.toLowerCase()}` : `Your ${type.toLowerCase()} is here`}
          </p>
          <div className="mt-3 space-y-3">
            {plan.phases.map((p, i) => (
              <div key={i} className={`${toneClass[p.tone]} text-white rounded-xl p-4`}>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-extrabold">{p.label}</span>
                  <span className="text-white/80 text-xs">{p.weeks}</span>
                </div>
                <p className="text-white/90 text-sm mt-2">{p.focus}</p>
              </div>
            ))}
          </div>
          <p className="text-grey text-xs mt-4">
            This is a planning guide based on the Build Your Workout method. Track your weekly effort
            (hours × RPE × days) and aim for it to climb through the build phase, then drop ~30% in the
            taper. See the Guide for the full method.
          </p>
        </div>
      )}
    </div>
  );
}

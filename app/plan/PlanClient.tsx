"use client";

import { useState } from "react";
import Link from "next/link";
import { buildEventPlan, planSummary, type EventPlan, type PlanTone } from "@/lib/event-plan";
import Icon from "@/components/Icon";

// Event Planner. The dancer tells us their event, their weekly CLASS load, and
// how many gym days they want. We generate a week-by-week periodized plan:
// total load climbs ~10%/week through the build, then tapers ~30% over the
// final two weeks. Classes stay constant; the gym load is what rises and falls.

const toneClass: Record<PlanTone, string> = {
  base: "bg-navy2",
  build: "grad-navy",
  taper: "grad-brand",
  event: "bg-teal",
  past: "bg-navy2",
};

const RPE_LABEL: Record<number, string> = {
  4: "easy", 5: "steady", 6: "moderate", 7: "hard", 8: "very hard",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type ClassEntry = { id: number; mins: number; rpe: number };
type Schedule = Record<string, ClassEntry[]>;
let CLASS_ID = 1;

export default function PlanClient() {
  const [date, setDate] = useState("");
  const [type, setType] = useState("Performance");
  const [gymDays, setGymDays] = useState(3);
  const [plan, setPlan] = useState<EventPlan | null>(null);

  // weekly class schedule: each day can hold one or more classes
  const [sched, setSched] = useState<Schedule>(() =>
    Object.fromEntries(DAYS.map((d) => [d, [] as ClassEntry[]]))
  );

  function addClass(day: string) {
    setSched((s) => ({ ...s, [day]: [...s[day], { id: CLASS_ID++, mins: 90, rpe: 6 }] }));
  }
  function removeClass(day: string, id: number) {
    setSched((s) => ({ ...s, [day]: s[day].filter((c) => c.id !== id) }));
  }
  function updateClass(day: string, id: number, patch: Partial<ClassEntry>) {
    setSched((s) => ({ ...s, [day]: s[day].map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }

  // weekly class TRIMP = sum over every class of (minutes × RPE)
  const allClasses = DAYS.flatMap((d) => sched[d]);
  const classLoad = allClasses.reduce((sum, c) => sum + c.mins * c.rpe, 0);
  const classCount = allClasses.length;
  // a sensible week-1 gym starting load: ~25 min × RPE6 per chosen gym day
  const gymStart = gymDays * 25 * 6;

  function go(e: React.FormEvent) {
    e.preventDefault();
    setPlan(buildEventPlan({ eventISO: date, classLoad, gymDays, gymStart }));
  }

  return (
    <div className="mt-5">
      <form onSubmit={go} className="card p-5 space-y-5">
        {/* event */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-sm font-medium text-navy">Event type</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {["Performance", "Competition", "Exam"].map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1.5 text-sm border ${type === t ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-navy">Event date</p>
            <input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        {/* class schedule — Mon–Sun */}
        <div>
          <p className="eyebrow mb-2">Your weekly class schedule</p>
          <p className="text-grey text-sm mb-3">Add each class and rehearsal on the day you do it, with its length and how hard it usually is. This stays constant — we plan your gym training around it.</p>
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="rounded-xl border border-line p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-sm w-12">{day}</span>
                  <button type="button" onClick={() => addClass(day)} className="text-teal text-sm font-semibold inline-flex items-center gap-1">
                    <Icon name="sparkle" className="w-3.5 h-3.5" /> Add class
                  </button>
                </div>
                {sched[day].length === 0 ? (
                  <p className="text-grey text-xs mt-1">Rest day</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {sched[day].map((c) => (
                      <div key={c.id} className="flex items-center gap-2 flex-wrap bg-light rounded-lg px-2.5 py-2">
                        <input className="input w-16 py-1" inputMode="numeric" value={c.mins}
                          onChange={(e) => updateClass(day, c.id, { mins: Math.max(15, Math.min(300, Number(e.target.value.replace(/[^0-9]/g, "")) || 0)) })} />
                        <span className="text-grey text-xs">min</span>
                        <span className="text-grey text-xs ml-1">RPE</span>
                        <input type="range" min={4} max={8} value={c.rpe}
                          onChange={(e) => updateClass(day, c.id, { rpe: Number(e.target.value) })} className="accent-teal w-24" />
                        <span className="text-navy text-sm font-semibold w-20">{c.rpe} · {RPE_LABEL[c.rpe] ?? ""}</span>
                        <span className="text-grey text-xs ml-auto">{(c.mins * c.rpe).toLocaleString()} TRIMP</span>
                        <button type="button" onClick={() => removeClass(day, c.id)} className="text-grey hover:text-red-600 text-sm">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-grey text-xs mt-2">
            {classCount > 0
              ? <>That&apos;s <b className="text-navy">{classCount} {classCount === 1 ? "class" : "classes"}</b> a week · about <b className="text-navy">{classLoad.toLocaleString()} TRIMP</b> of class load.</>
              : "Add at least one class to build your plan."}
          </p>
        </div>

        {/* gym days */}
        <div>
          <p className="eyebrow mb-2">Gym days a week</p>
          <p className="text-grey text-sm mb-2">How many strength/conditioning sessions you&apos;ll commit to. We&apos;ll raise the load on these days, not your classes.</p>
          <div className="flex gap-1.5">
            {[2, 3, 4].map((d) => (
              <button key={d} type="button" onClick={() => setGymDays(d)}
                className={`rounded-full px-4 py-1.5 text-sm border ${gymDays === d ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
                {d} days
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" disabled={!date || classLoad === 0}>Build my plan</button>
      </form>

      {plan && (
        <div className="mt-6">
          <div className="card p-4 bg-light">
            <p className="text-navy font-semibold text-sm">{planSummary(plan)}</p>
            <p className="text-grey text-xs mt-1">
              Each week shows your target total load (class + gym). Keep your classes the same; adjust your gym sessions to hit the gym target shown.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {plan.weeks.map((w) => (
              <div key={w.index} className={`${toneClass[w.tone]} text-white rounded-2xl p-4`}>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-extrabold">{w.label}</span>
                  <span className="text-white/80 text-xs">
                    {w.weeksOut > 0 ? `${w.weeksOut} ${w.weeksOut === 1 ? "week" : "weeks"} out` : "event week"}
                  </span>
                </div>

                {w.tone !== "event" && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
                    <span className="text-white/90">Target total <b>{w.totalLoad.toLocaleString()}</b> TRIMP
                      {w.changePct != null && <span className="text-white/70"> ({w.changePct > 0 ? "+" : ""}{w.changePct}%)</span>}
                    </span>
                    <span className="text-white/80">Classes <b>{w.classLoad.toLocaleString()}</b></span>
                    <span className="text-white/80">Gym <b>{w.gymLoad.toLocaleString()}</b> · {plan.gymDays} sessions (~{w.perSession.toLocaleString()} each)</span>
                  </div>
                )}

                <p className="text-white/90 text-sm mt-2">{w.focus}</p>

                {(w.tone === "build" || w.tone === "base") && (
                  <Link href="/generate" className="inline-flex items-center gap-1.5 mt-3 bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 text-sm font-semibold transition">
                    <Icon name="bolt" className="w-4 h-4" /> Generate this week&apos;s session
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="text-grey text-xs mt-4">
            This plan follows the Build Your Workout method — a steady ~10% weekly climb, then a ~30% volume cut in the taper while keeping intensity.
            Log your sessions in the <Link href="/load" className="text-teal font-medium">Training Calendar</Link> to see your actual load against these targets. Add the event there too and the app will track the taper for you.
          </p>
        </div>
      )}
    </div>
  );
}

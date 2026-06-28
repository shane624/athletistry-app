"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  buildEventPlan, buildDailySchedule, planSummary,
  type EventPlan, type PlanTone, type PlanDay, type PlanDemand, type DemandFocus, type SessionType,
} from "@/lib/event-plan";
import { useRouter } from "next/navigation";
import { saveEventPlan } from "@/lib/event-plan-actions";
import { EQUIPMENT_LABEL, type Equipment } from "@/lib/equipment";
import Icon, { type IconName } from "@/components/Icon";
import Dots from "@/components/Dots";

type LoggedClass = { date: string; mins: number; rpe: number };
const EQUIP: Equipment[] = ["band", "dumbbell", "barbell", "slant_board", "step", "partner"];
const LEVELS = [
  { v: 1, label: "Beginner" }, { v: 2, label: "Intermediate" },
  { v: 3, label: "Advanced" }, { v: 4, label: "All levels" },
];

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
type ClassEntry = { id: number; name: string; mins: number; rpe: number };
type Schedule = Record<string, ClassEntry[]>;
let CLASS_ID = 1;

// common class types for quick naming
const CLASS_NAMES = ["Ballet", "Pointe", "Jazz", "Contemporary", "Tap", "Rehearsal", "Conditioning"];

const FOCUS_OPTS: { id: DemandFocus; label: string }[] = [
  { id: "turnout", label: "Turnout & hips" },
  { id: "jumps", label: "Jumps & calves" },
  { id: "core", label: "Core & control" },
  { id: "upper", label: "Upper body & lifts" },
];

const SESSION_ICON: Record<SessionType, IconName> = {
  strength: "dumbbell", hypertrophy: "dumbbell", endurance: "circuit",
  cardio: "heart", tabata: "bolt", rest: "warmup",
};
const SESSION_TONE: Record<SessionType, string> = {
  strength: "bg-light text-tealdark", hypertrophy: "bg-light text-tealdark",
  endurance: "bg-light text-tealdark", cardio: "bg-light text-navy",
  tabata: "bg-light text-navy", rest: "bg-rowalt text-grey",
};

export default function PlanClient({ loggedClasses = [] }: { loggedClasses?: LoggedClass[] }) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("Performance");
  const [gymDays, setGymDays] = useState(3);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [schedule, setSchedule] = useState<PlanDay[] | null>(null);

  const router = useRouter();

  // event demand
  const [stamina, setStamina] = useState(false);
  const [explosive, setExplosive] = useState(false);
  const [focus, setFocus] = useState<Set<DemandFocus>>(new Set());

  // exercise preferences
  const [maxLevel, setMaxLevel] = useState(4);
  const [equip, setEquip] = useState<Set<Equipment>>(new Set());
  const [equipOpen, setEquipOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function toggleEquip(e: Equipment) {
    setEquip((prev) => { const n = new Set(prev); n.has(e) ? n.delete(e) : n.add(e); return n; });
  }

  // weekly class schedule: each day can hold one or more classes
  const [sched, setSched] = useState<Schedule>(() =>
    Object.fromEntries(DAYS.map((d) => [d, [] as ClassEntry[]]))
  );

  // pre-fill from recently logged classes: infer a typical week (which weekday,
  // typical minutes/RPE). Runs once on mount if the dancer has logged classes.
  useEffect(() => {
    if (!loggedClasses.length) return;
    setSched((prev) => {
      // only prefill if the schedule is still empty
      if (DAYS.some((d) => prev[d].length)) return prev;
      const next: Schedule = Object.fromEntries(DAYS.map((d) => [d, [] as ClassEntry[]]));
      const seen = new Set<string>();
      for (const c of loggedClasses) {
        const dt = new Date(c.date + "T00:00:00");
        if (isNaN(dt.getTime())) continue;
        const wd = (dt.getDay() + 6) % 7; // 0=Mon
        const key = `${wd}-${c.mins}-${c.rpe}`;
        if (seen.has(key)) continue;
        seen.add(key);
        next[DAYS[wd]].push({ id: CLASS_ID++, name: "Class", mins: c.mins, rpe: c.rpe });
      }
      return DAYS.some((d) => next[d].length) ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleFocus(f: DemandFocus) {
    setFocus((prev) => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; });
  }

  function addClass(day: string) {
    setSched((s) => ({ ...s, [day]: [...s[day], { id: CLASS_ID++, name: "Ballet", mins: 90, rpe: 6 }] }));
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

  // which weekdays (0=Mon) the dancer has class, and the class names per weekday
  const classWeekdays = DAYS.map((d, i) => (sched[d].length ? i : -1)).filter((i) => i >= 0);
  const classNamesByWeekday: Record<number, string[]> = {};
  DAYS.forEach((d, i) => { if (sched[d].length) classNamesByWeekday[i] = sched[d].map((c) => c.name.trim() || "Class"); });

  function go(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    const p = buildEventPlan({ eventISO: date, classLoad, gymDays, gymStart });
    setPlan(p);
    if (p) {
      const demand: PlanDemand = { stamina, explosive, focus: [...focus] };
      setSchedule(buildDailySchedule(p, classWeekdays, gymDays, demand, new Date(), classNamesByWeekday));
    } else {
      setSchedule(null);
    }
  }

  async function activate() {
    if (!schedule || !schedule.length) return;
    setSaving(true); setSavedMsg(null);
    const res = await saveEventPlan({
      label: `${type} plan`,
      days: schedule.map((d) => ({ iso: d.iso, type: d.type, title: d.title, detail: d.detail, weekIndex: d.weekIndex })),
      maxLevel,
      equipment: equip.size ? [...equip] : undefined,
      focus: [...focus],
    });
    setSaving(false);
    if (res.ok) {
      setSavedMsg("Plan activated — your Today screen will follow it.");
      router.push("/dashboard");
      router.refresh();
    } else {
      setSavedMsg(res.error ?? "Couldn't activate the plan.");
    }
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
          <p className="text-grey text-sm mb-3">
            Add each class and rehearsal on the day you do it, with its length and how hard it usually is. This stays constant — we plan your gym training around it.
            {loggedClasses.length > 0 && classCount > 0 && <span className="text-tealdark"> Pre-filled from your logged classes — adjust as needed.</span>}
          </p>
          <datalist id="class-names">
            {CLASS_NAMES.map((n) => <option key={n} value={n} />)}
          </datalist>
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
                      <div key={c.id} className="bg-light rounded-lg px-2.5 py-2">
                        <div className="flex items-center gap-2">
                          <input className="input flex-1 py-1" list="class-names" placeholder="Class name (e.g. Ballet)"
                            value={c.name} onChange={(e) => updateClass(day, c.id, { name: e.target.value })} />
                          <input className="input w-16 py-1" inputMode="numeric" value={c.mins}
                            onChange={(e) => updateClass(day, c.id, { mins: Math.max(15, Math.min(300, Number(e.target.value.replace(/[^0-9]/g, "")) || 0)) })} />
                          <span className="text-grey text-xs">min</span>
                          <button type="button" onClick={() => removeClass(day, c.id)} className="text-grey hover:text-red-600 text-sm">✕</button>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-grey text-xs">RPE</span>
                          <input type="range" min={4} max={8} value={c.rpe}
                            onChange={(e) => updateClass(day, c.id, { rpe: Number(e.target.value) })} className="accent-teal flex-1 max-w-[140px]" />
                          <span className="text-navy text-xs font-semibold w-20">{c.rpe} · {RPE_LABEL[c.rpe] ?? ""}</span>
                          <span className="text-grey text-xs ml-auto">{(c.mins * c.rpe).toLocaleString()} TRIMP</span>
                        </div>
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

        {/* event demand */}
        <div>
          <p className="eyebrow mb-2">What does the event demand?</p>
          <p className="text-grey text-sm mb-3">This shapes the conditioning we schedule, and which areas the strength work biases toward.</p>

          <div className="space-y-2">
            <button type="button" onClick={() => setStamina((v) => !v)}
              className={`w-full text-left rounded-xl border p-3 flex items-start gap-3 ${stamina ? "border-teal bg-light" : "border-line"}`}>
              <Icon name="heart" className={`w-5 h-5 mt-0.5 shrink-0 ${stamina ? "text-teal" : "text-grey"}`} />
              <span>
                <span className="block font-semibold text-navy text-sm">Stamina for a long / full-length show</span>
                <span className="block text-grey text-xs">We&apos;ll add some steady-state cardio to build the endurance to last.</span>
              </span>
            </button>
            <button type="button" onClick={() => setExplosive((v) => !v)}
              className={`w-full text-left rounded-xl border p-3 flex items-start gap-3 ${explosive ? "border-teal bg-light" : "border-line"}`}>
              <Icon name="bolt" className={`w-5 h-5 mt-0.5 shrink-0 ${explosive ? "text-teal" : "text-grey"}`} />
              <span>
                <span className="block font-semibold text-navy text-sm">Short, explosive efforts — jumps, allegro, quick variations</span>
                <span className="block text-grey text-xs">We&apos;ll add Tabata-style bursts to build quick-burst power.</span>
              </span>
            </button>
          </div>

          <p className="text-sm font-medium text-navy mt-4">Areas to prioritise</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {FOCUS_OPTS.map((f) => (
              <button key={f.id} type="button" onClick={() => toggleFocus(f.id)}
                className={`rounded-full px-3 py-1.5 text-sm border ${focus.has(f.id) ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* exercise preferences */}
        <div>
          <p className="eyebrow mb-2">Exercise options</p>
          <p className="text-sm font-medium text-navy">Difficulty</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {LEVELS.map((l) => (
              <button key={l.v} type="button" onClick={() => setMaxLevel(l.v)}
                className={`rounded-full px-3 py-1.5 text-sm border ${maxLevel === l.v ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setEquipOpen((v) => !v)} className="text-sm text-teal font-semibold mt-3">
            {equip.size ? `Equipment: ${equip.size} selected` : "Filter by equipment"} {equipOpen ? "▴" : "▾"}
          </button>
          {equipOpen && (
            <div className="card mt-2 p-4">
              <p className="text-sm text-grey">Select what you have. Bodyweight always shows; leave empty for everything.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {EQUIP.map((e) => (
                  <button key={e} type="button" onClick={() => toggleEquip(e)}
                    className={`rounded-full px-3 py-1.5 text-sm border ${equip.has(e) ? "bg-navy text-white border-navy" : "bg-white border-line text-grey"}`}>
                    {EQUIPMENT_LABEL[e]}
                  </button>
                ))}
              </div>
              {equip.size > 0 && <button type="button" className="text-teal text-sm mt-3 font-semibold" onClick={() => setEquip(new Set())}>Clear</button>}
            </div>
          )}
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

          {/* DATED DAY-BY-DAY SCHEDULE */}
          {schedule && schedule.length > 0 && (
            <div className="mt-8">
              <div className="card p-4 mb-4 grad-navy text-white">
                <p className="font-bold">Make this your plan</p>
                <p className="text-white/85 text-sm mt-1">Activate it and your Today screen will show each day&apos;s session — or a rest day — automatically, until the event.</p>
                <button onClick={activate} disabled={saving}
                  className="mt-3 bg-white text-navy font-bold rounded-xl px-4 py-2 text-sm inline-flex items-center gap-2 active:scale-[.98] transition">
                  {saving ? <Dots /> : <><Icon name="check" className="w-4 h-4" /> Activate this plan</>}
                </button>
                {savedMsg && <p className="text-white/90 text-sm mt-2">{savedMsg}</p>}
              </div>

              <p className="eyebrow">Your day-by-day plan</p>
              <p className="text-grey text-sm mt-1 mb-3">Exactly what to do each day from now to the event — strength, conditioning, or rest with recovery ideas.</p>
              <div className="space-y-5">
                {groupByWeek(schedule).map((wk) => {
                  const weeksOut = (plan?.weeksOut ?? 0) - (wk.weekIndex - 1);
                  return (
                  <div key={wk.weekIndex}>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-grey mb-2">
                      Week {wk.weekIndex} · {weeksOut} {weeksOut === 1 ? "week" : "weeks"} out
                    </p>
                    <div className="space-y-1.5">
                      {wk.days.map((d) => (
                        <div key={d.iso} className="flex items-start gap-3 rounded-xl border border-line p-2.5">
                          <span className="w-12 text-center shrink-0">
                            <span className="block text-[10px] text-grey uppercase">{DAYS[d.weekday]}</span>
                            <span className="block text-sm font-bold text-navy">{d.iso.slice(8)}</span>
                          </span>
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${SESSION_TONE[d.type]}`}>
                            <Icon name={SESSION_ICON[d.type]} className="w-4 h-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-navy">{d.title}</span>
                            <span className="block text-grey text-xs leading-snug">{d.detail}</span>
                          </span>
                          {d.type !== "rest" && (
                            <Link href={sessionLink(d.type)} className="ml-auto shrink-0 text-teal text-xs font-semibold self-center">Start →</Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-grey text-xs mt-6">
            This plan follows the Build Your Workout method — a steady ~10% weekly climb, then a ~30% volume cut in the taper while keeping intensity.
            Log your sessions in the <Link href="/load" className="text-teal font-medium">Training Calendar</Link> so your actual load tracks against these targets. Add the event there too and the app will track the taper for you.
          </p>
        </div>
      )}
    </div>
  );
}

// group the flat day list into weeks for rendering
function groupByWeek(days: PlanDay[]): { weekIndex: number; days: PlanDay[] }[] {
  const byWeek = new Map<number, PlanDay[]>();
  for (const d of days) {
    if (!byWeek.has(d.weekIndex)) byWeek.set(d.weekIndex, []);
    byWeek.get(d.weekIndex)!.push(d);
  }
  return [...byWeek.entries()].sort((a, b) => a[0] - b[0]).map(([weekIndex, ds]) => ({ weekIndex, days: ds }));
}

// where a session type sends the dancer
function sessionLink(type: SessionType): string {
  if (type === "tabata") return "/circuit?format=tabata";
  if (type === "cardio") return "/load";
  return "/generate";
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  buildEventPlan, buildDailySchedule,
  type EventPlan, type PlanDay, type PlanDemand, type DemandFocus, type SessionType,
} from "@/lib/event-plan";
import { useRouter } from "next/navigation";
import { saveEventPlan, previewPlanExercises } from "@/lib/event-plan-actions";
import { EQUIPMENT_LABEL, type Equipment } from "@/lib/equipment";
import { CLASS_GROUPS } from "@/lib/classes";
import Icon, { type IconName } from "@/components/Icon";
import Dots from "@/components/Dots";

// dance + other-sport presets for the planner picker (skip the General group;
// gym/cardio are scheduled by the plan itself).
const PLAN_CLASS_GROUPS = CLASS_GROUPS.filter((g) => g.title !== "General");

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

const RPE_LABEL: Record<number, string> = {
  4: "easy", 5: "steady", 6: "moderate", 7: "hard", 8: "very hard",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type ClassEntry = { id: number; name: string; mins: number; rpe: number };
type Schedule = Record<string, ClassEntry[]>;
let CLASS_ID = 1;

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

const STEPS = [
  { title: "Your event", subtitle: "What are you training for, and when?" },
  { title: "Your classes", subtitle: "Add the classes you already do each week." },
  { title: "What it needs", subtitle: "Tell us what the day will demand of you." },
  { title: "Your preferences", subtitle: "Difficulty and kit — then we build it." },
];

const PLAN_CLOUD = "dsbtk5hpq";
function exThumb(e: { cloudinary_id: string | null; youtube_id: string | null }): string | null {
  if (e.cloudinary_id) return `https://res.cloudinary.com/${PLAN_CLOUD}/video/upload/so_1,w_80,h_80,c_fill,g_auto/${e.cloudinary_id}.jpg`;
  if (e.youtube_id) return `https://i.ytimg.com/vi/${e.youtube_id}/default.jpg`;
  return null;
}

export default function PlanClient({ loggedClasses = [] }: { loggedClasses?: LoggedClass[] }) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("Performance");
  const [noEvent, setNoEvent] = useState(false);
  const [horizon, setHorizon] = useState(8);
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

  // wizard step + built-plan exercise thumbnails
  const [step, setStep] = useState(0);
  const [building, setBuilding] = useState(false);
  const [styleExercises, setStyleExercises] = useState<Record<string, { id: number; name: string; cloudinary_id: string | null; youtube_id: string | null }[]>>({});

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

  // add a class from a preset kind (chosen in the dropdown)
  function addClassByKind(day: string, kind: string) {
    if (!kind) return;
    const preset = PLAN_CLASS_GROUPS.flatMap((g) => g.items).find((c) => c.kind === kind);
    if (!preset) return;
    setSched((s) => ({ ...s, [day]: [...s[day], { id: CLASS_ID++, name: preset.label, mins: preset.defaultMin, rpe: preset.defaultRpe }] }));
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

  // live preview: weeks until the event (for the form summary)
  const weeksToEvent = date
    ? Math.max(0, Math.ceil((new Date(date + "T00:00:00").getTime() - Date.now()) / (7 * 864e5)))
    : null;

  // headline stats for the built plan
  const planStats = plan && schedule ? {
    weeks: plan.weeks.length,
    sessions: schedule.filter((d) => d.type !== "rest").length,
    restDays: schedule.filter((d) => d.type === "rest").length,
    maxWeekLoad: Math.max(1, ...plan.weeks.map((w) => w.totalLoad)),
  } : null;

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    const p = noEvent
      ? buildEventPlan({ eventISO: "", classLoad, gymDays, gymStart, general: true, horizonWeeks: horizon })
      : buildEventPlan({ eventISO: date, classLoad, gymDays, gymStart });
    setPlan(p);
    if (!p) { setSchedule(null); return; }
    const demand: PlanDemand = { stamina, explosive, focus: [...focus] };
    setSchedule(buildDailySchedule(p, classWeekdays, gymDays, demand, new Date(), classNamesByWeekday));
    // fetch real exercise thumbnails to show in the reveal (and reuse on activate)
    setBuilding(true);
    try {
      const ex = await previewPlanExercises(maxLevel, equip.size ? [...equip] : undefined);
      setStyleExercises(ex);
    } catch { /* reveal still works without images */ }
    setBuilding(false);
  }

  async function activate() {
    if (!schedule || !schedule.length) return;
    setSaving(true); setSavedMsg(null);
    const exercisesByStyle: Record<string, number[]> = {};
    for (const k of Object.keys(styleExercises)) exercisesByStyle[k] = styleExercises[k].map((x) => x.id);
    const res = await saveEventPlan({
      label: noEvent ? "Training block" : `${type} plan`,
      days: schedule.map((d) => ({ iso: d.iso, type: d.type, title: d.title, detail: d.detail, weekIndex: d.weekIndex })),
      maxLevel,
      equipment: equip.size ? [...equip] : undefined,
      focus: [...focus],
      exercisesByStyle: Object.keys(exercisesByStyle).length ? exercisesByStyle : undefined,
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
        {/* wizard header + progress */}
        <div>
          <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? "bg-teal" : "bg-line"}`} />
            ))}
          </div>
          <h2 className="text-lg font-bold text-navy mt-3">{STEPS[step].title}</h2>
          <p className="text-grey text-sm">{STEPS[step].subtitle}</p>
        </div>

        {step === 0 && (<>
        {/* event */}
        <div data-tour="event">
          {!noEvent && (
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
                <input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          )}

          {/* no-event toggle */}
          <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-teal w-4 h-4" checked={noEvent} onChange={(e) => setNoEvent(e.target.checked)} />
            <span>
              <span className="block text-sm font-medium text-navy">I don&apos;t have an event yet</span>
              <span className="block text-grey text-xs">Build me a general training block instead — steady progress, no taper or countdown.</span>
            </span>
          </label>

          {noEvent && (
            <div className="mt-3">
              <p className="text-sm font-medium text-navy">How many weeks?</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {[4, 6, 8, 12].map((w) => (
                  <button key={w} type="button" onClick={() => setHorizon(w)}
                    className={`rounded-full px-3 py-1.5 text-sm border ${horizon === w ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
                    {w} weeks
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        </>)}

        {step === 1 && (<>
        {/* class schedule — Mon–Sun */}
        <div>
          <div data-tour="schedule">
            <p className="eyebrow mb-2">Your weekly class schedule</p>
            <p className="text-grey text-sm mb-3">
              Add each class and rehearsal on the day you do it, with its length and how hard it usually is. This stays constant — we plan your gym training around it.
              {loggedClasses.length > 0 && classCount > 0 && <span className="text-tealdark"> Pre-filled from your logged classes — adjust as needed.</span>}
            </p>
          </div>
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="rounded-xl border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-navy text-sm w-12 shrink-0">{day}</span>
                  <select
                    value=""
                    onChange={(e) => { addClassByKind(day, e.target.value); e.currentTarget.value = ""; }}
                    className="input py-1 text-sm max-w-[180px] text-teal font-semibold"
                    aria-label={`Add a class on ${day}`}
                  >
                    <option value="">+ Add class…</option>
                    {PLAN_CLASS_GROUPS.map((g) => (
                      <optgroup key={g.title} label={g.title}>
                        {g.items.map((c) => (
                          <option key={c.kind} value={c.kind}>{c.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {sched[day].length === 0 ? (
                  <p className="text-grey text-xs mt-1">Rest day</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {sched[day].map((c) => (
                      <div key={c.id} className="bg-light rounded-lg p-3">
                        {/* row 1: class name + remove */}
                        <div className="flex items-center gap-2">
                          <input className="input flex-1 min-w-0 py-1.5" placeholder="Class name"
                            value={c.name} onChange={(e) => updateClass(day, c.id, { name: e.target.value })} />
                          <button type="button" onClick={() => removeClass(day, c.id)} className="text-grey hover:text-red-600 shrink-0 px-1" aria-label="Remove class">✕</button>
                        </div>
                        {/* row 2: minutes + RPE */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <label className="flex items-center gap-1.5 text-xs text-grey">
                            <MinsField value={c.mins} onCommit={(n) => updateClass(day, c.id, { mins: n })} />
                            min
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-grey">
                            Effort
                            <input type="range" min={4} max={8} value={c.rpe}
                              onChange={(e) => updateClass(day, c.id, { rpe: Number(e.target.value) })} className="accent-teal w-24" />
                            <span className="text-navy font-semibold">{c.rpe} · {RPE_LABEL[c.rpe] ?? ""}</span>
                          </label>
                          <span className="text-grey text-xs ml-auto">{(c.mins * c.rpe).toLocaleString()} load</span>
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
              ? <>That&apos;s <b className="text-navy">{classCount} {classCount === 1 ? "class" : "classes"}</b> a week · about <b className="text-navy">{classLoad.toLocaleString()} load</b> from class.</>
              : "Add at least one class to build your plan."}
          </p>
        </div>

        </>)}

        {step === 2 && (<>
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
        <div data-tour="demand">
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

        </>)}

        {step === 3 && (<>
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

        {/* live preview — shows the plan taking shape as you fill it in */}
        {(date || noEvent || classCount > 0) && (
          <div className="card p-3 bg-light flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {noEvent
              ? <span className="text-navy"><b>{horizon}</b>-week general block</span>
              : weeksToEvent != null && <span className="text-navy"><b>{weeksToEvent}</b> week{weeksToEvent === 1 ? "" : "s"} until your {type.toLowerCase()}</span>}
            <span className="text-grey"><b className="text-navy">{classCount}</b> class{classCount === 1 ? "" : "es"} a week</span>
            <span className="text-grey"><b className="text-navy">{gymDays}</b> gym day{gymDays === 1 ? "" : "s"}</span>
          </div>
        )}
        </>)}

        {/* wizard nav */}
        <div className="flex items-center gap-3 pt-1">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost px-5">Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !date && !noEvent) || (step === 1 && classLoad === 0)}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {step === 0 && !date && !noEvent ? "Add a date, or pick 'no event yet'" : step === 1 && classLoad === 0 ? "Add at least one class" : "Next →"}
            </button>
          ) : (
            <button data-tour="build" type="submit" className="btn-primary flex-1 py-3" disabled={(!date && !noEvent) || classLoad === 0 || building}>
              {building ? <Dots /> : plan ? "Rebuild my plan" : "Build my plan ✨"}
            </button>
          )}
        </div>
      </form>

      {plan && (
        <div className="mt-6 stagger">
          {/* celebratory header — warm, plain language */}
          <div className="card p-5 grad-navy text-white animate-in">
            <p className="text-white/75 text-xs font-semibold uppercase tracking-wide">Your plan is ready 🎉</p>
            <p className="font-extrabold text-xl mt-1">{noEvent ? "Here's your training block." : `Here's your roadmap to your ${type.toLowerCase()}.`}</p>
            <p className="text-white/85 text-sm mt-2 leading-relaxed">
              {noEvent
                ? `${planStats?.weeks} weeks that build you up steadily around your classes — no countdown, just steady progress. Press activate and I'll guide you through it one day at a time.`
                : `${planStats?.weeks} weeks that build you up gently, then ease off just before the day so you arrive fresh and strong. Press activate and I'll guide you through it one day at a time — no guesswork, nothing scary.`}
            </p>
            <button onClick={activate} disabled={saving}
              className="mt-4 bg-white text-navy font-bold rounded-xl px-5 py-3 text-sm inline-flex items-center gap-2 active:scale-[.98] transition">
              {saving ? <Dots /> : <><Icon name="check" className="w-4 h-4" /> Activate this plan</>}
            </button>
            {savedMsg && <p className="text-white/90 text-sm mt-2">{savedMsg}</p>}
          </div>

          {/* headline stats */}
          {planStats && (
            <div className="grid grid-cols-3 gap-3 mt-4 animate-in">
              <Stat label="weeks" value={planStats.weeks} />
              <Stat label="workouts" value={planStats.sessions} />
              <Stat label="rest days" value={planStats.restDays} />
            </div>
          )}

          {/* visual week timeline — the build-then-ease-off shape at a glance */}
          {planStats && (
            <div className="card p-5 mt-4 animate-in">
              <p className="eyebrow">Build up, then ease off</p>
              <p className="text-grey text-xs mt-1 mb-3">Each bar is a week. You climb steadily, then wind down before the event so you peak fresh — that&apos;s the whole idea.</p>
              <div className="flex items-end gap-1.5">
                {plan.weeks.map((w) => {
                  const h = Math.max((w.totalLoad / planStats.maxWeekLoad) * 100, 10);
                  const isTaper = w.tone === "taper";
                  const isEvent = w.tone === "event";
                  return (
                    <div key={w.index} className="flex-1 flex flex-col items-center">
                      <div className="w-full h-24 flex items-end">
                        <div
                          className={`w-full rounded-t transition-all duration-700 ${isEvent ? "bg-navy" : isTaper ? "bg-teal/50" : "bg-teal"}`}
                          style={{ height: `${h}%` }}
                          title={`${w.label}: ${w.focus}`}
                        />
                      </div>
                      <span className="text-[10px] text-grey mt-1">{w.index}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-grey mt-2">
                <span>Build ↗</span>
                <span>Ease off ↘ · arrive fresh</span>
              </div>
            </div>
          )}

          {/* day-by-day, friendlier */}
          {schedule && schedule.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow">Day by day</p>
              <p className="text-grey text-sm mt-1 mb-3">A peek at each day{noEvent ? " in your block" : ` from now to your ${type.toLowerCase()}`}. Once you activate, these appear on your Today screen with demo videos — one day at a time, so it never feels like a lot.</p>
              <div className="space-y-5 stagger">
                {groupByWeek(schedule).map((wk) => {
                  const weeksOut = (plan?.weeksOut ?? 0) - (wk.weekIndex - 1);
                  return (
                  <div key={wk.weekIndex} className="animate-in">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-grey mb-2">
                      Week {wk.weekIndex} · {weeksOut === 0 ? "event week 🩰" : `${weeksOut} ${weeksOut === 1 ? "week" : "weeks"} to go`}
                    </p>
                    <div className="space-y-1.5">
                      {wk.days.map((d) => {
                        const rest = d.type === "rest";
                        return (
                        <div key={d.iso} className={`flex items-start gap-3 rounded-xl border border-line p-2.5 ${rest ? "bg-light/40" : ""}`}>
                          <span className="w-12 text-center shrink-0">
                            <span className="block text-[11px] text-grey uppercase">{DAYS[d.weekday]}</span>
                            <span className="block text-sm font-bold text-navy">{d.iso.slice(8)}</span>
                          </span>
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${SESSION_TONE[d.type]}`}>
                            <Icon name={SESSION_ICON[d.type]} className="w-4 h-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-navy">{d.title}</span>
                            <span className="block text-grey text-xs leading-snug">{d.detail}</span>
                            {/* real exercise thumbnails for workout days */}
                            {(styleExercises[d.type]?.length ?? 0) > 0 && (
                              <span className="flex -space-x-2 mt-2">
                                {styleExercises[d.type].slice(0, 4).map((ex) => {
                                  const t = exThumb(ex);
                                  return (
                                    <span key={ex.id} className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-white bg-black/5 shrink-0" title={ex.name}>
                                      {t && <img src={t} alt="" className="w-full h-full object-cover" loading="lazy" />}
                                    </span>
                                  );
                                })}
                                {styleExercises[d.type].length > 4 && (
                                  <span className="w-8 h-8 rounded-lg ring-2 ring-white bg-light flex items-center justify-center text-[11px] font-bold text-tealdark shrink-0">
                                    +{styleExercises[d.type].length - 4}
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-grey text-xs mt-6">
            Once it&apos;s active, log your sessions in the <Link href="/load" className="text-teal font-medium">Training Calendar</Link> and the app keeps you on track. You can swap or add exercises on any day, and rejoin the plan any time if life gets in the way.
          </p>
        </div>
      )}
    </div>
  );
}

// Minutes input that lets you clear and retype freely, then clamps to 15–300 on
// blur (the old version clamped on every keystroke, so you couldn't edit it).
function MinsField({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [str, setStr] = useState(String(value));
  useEffect(() => { setStr(String(value)); }, [value]);
  return (
    <input
      className="input w-16 py-1 text-center"
      inputMode="numeric"
      value={str}
      onChange={(e) => setStr(e.target.value.replace(/[^0-9]/g, ""))}
      onBlur={() => { const n = Math.max(15, Math.min(300, Number(str) || 60)); onCommit(n); setStr(String(n)); }}
    />
  );
}

// headline stat tile for the built plan
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-extrabold text-navy">{value}</div>
      <div className="text-grey text-xs mt-0.5">{label}</div>
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

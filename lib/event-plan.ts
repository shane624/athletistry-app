// Event periodization engine. Pure module (client/server safe, no DB).
//
// Turns a dancer's real situation — their weekly CLASS load, how many GYM days
// they want, and their EVENT date — into a week-by-week plan:
//   • class load stays constant (it's not theirs to control)
//   • gym load rises so TOTAL weekly load climbs ~10% per week (build phase)
//   • the final 2 weeks taper: total volume drops ~30%, intensity held
//   • each week carries a phase label + a suggested gym focus
//
// Load is expressed in TRIMP (duration_min × RPE), matching lib/load.ts.

export const WEEKLY_BUILD = 0.10;   // +10% total load per build week
export const TAPER_CUT = 0.30;      // -30% volume in the taper
export const TAPER_WEEKS_DEFAULT = 2;

export interface PlanInput {
  eventISO: string;          // YYYY-MM-DD
  /** Weekly class load the dancer already carries (TRIMP). */
  classLoad: number;
  /** Gym sessions per week the dancer wants to commit to. */
  gymDays: number;
  /** Where the gym load starts in week 1 (TRIMP across all gym sessions). */
  gymStart?: number;
  today?: Date;
}

export type PlanTone = "base" | "build" | "taper" | "event" | "past";

export interface PlanWeek {
  index: number;             // 1 = first week of the plan
  weeksOut: number;          // weeks remaining before the event at this week
  label: string;             // e.g. "Build week 2"
  tone: PlanTone;
  classLoad: number;         // constant class TRIMP
  gymLoad: number;           // gym TRIMP this week (across gymDays sessions)
  totalLoad: number;         // class + gym
  perSession: number;        // suggested TRIMP per gym session
  changePct: number | null;  // % change in TOTAL vs previous week
  focus: string;             // gym focus / guidance for the week
}

export interface EventPlan {
  weeksOut: number;
  gymDays: number;
  weeks: PlanWeek[];
  peakTotal: number;
}

function weeksUntil(eventISO: string, today: Date): number {
  const event = new Date(eventISO + "T00:00:00");
  if (isNaN(event.getTime())) return -1;
  const ms = event.getTime() - today.getTime();
  return Math.ceil(ms / (7 * 24 * 3600 * 1000));
}

const round = (n: number) => Math.round(n);

/**
 * Build the full plan. The build phase grows the GYM load so that the TOTAL
 * (class + gym) climbs ~10% each week; the taper drops total volume ~30%.
 */
export function buildEventPlan(input: PlanInput): EventPlan | null {
  const today = input.today ?? new Date();
  const weeksOut = weeksUntil(input.eventISO, today);
  if (weeksOut < 0) return null;

  const classLoad = Math.max(0, round(input.classLoad));
  const gymDays = Math.max(1, Math.min(6, Math.round(input.gymDays)));
  // sensible starting gym load if not given: a moderate session (~30min × RPE6) per day
  const gymStart = Math.max(gymDays * 60, round(input.gymStart ?? gymDays * 180));

  if (weeksOut === 0) {
    const wk: PlanWeek = {
      index: 1, weeksOut: 0, label: "Event week", tone: "event",
      classLoad, gymLoad: round(gymStart * 0.4), totalLoad: round(classLoad + gymStart * 0.4),
      perSession: round((gymStart * 0.4) / gymDays), changePct: null,
      focus: "Light, sharp movement only. The training is banked — keep the body primed, then dance.",
    };
    return { weeksOut: 0, gymDays, weeks: [wk], peakTotal: wk.totalLoad };
  }

  const taperWeeks = weeksOut >= 3 ? TAPER_WEEKS_DEFAULT : 1;
  const buildWeeks = weeksOut - taperWeeks;

  const weeks: PlanWeek[] = [];
  let prevTotal: number | null = null;

  // ---- build phase ----
  let gym = gymStart;
  for (let i = 0; i < buildWeeks; i++) {
    const wOut = weeksOut - i;
    const total = classLoad + gym;
    const changePct = prevTotal ? round(((total - prevTotal) / prevTotal) * 100) : null;
    const isBase = buildWeeks >= 6 && i < Math.ceil(buildWeeks / 3);
    weeks.push({
      index: i + 1, weeksOut: wOut,
      label: isBase ? `Base week ${i + 1}` : `Build week ${i + 1 - (buildWeeks >= 6 ? Math.ceil(buildWeeks / 3) : 0)}`,
      tone: isBase ? "base" : "build",
      classLoad, gymLoad: round(gym), totalLoad: round(total), perSession: round(gym / gymDays),
      changePct,
      focus: isBase
        ? "Rebuild the base — control and clean technique. Moderate gym sessions; install the pattern before loading it."
        : "Push the gym load a little past last week — add a set, a little weight, or a few minutes. Keep classes as they are.",
    });
    prevTotal = total;
    // next week's gym load is set so TOTAL climbs ~10%
    const nextTotal = total * (1 + WEEKLY_BUILD);
    gym = Math.max(gymDays * 60, nextTotal - classLoad);
  }

  const peakTotal = prevTotal ?? classLoad + gymStart;

  // ---- taper ----
  // hold the last build total, then cut volume ~30% across the taper.
  for (let t = 0; t < taperWeeks; t++) {
    const wOut = taperWeeks - t;
    // gradual cut: split the 30% across the taper weeks
    const cut = TAPER_CUT * ((t + 1) / taperWeeks);
    const taperTotal = peakTotal * (1 - cut);
    const taperGym = Math.max(gymDays * 45, taperTotal - classLoad);
    const total = classLoad + taperGym;
    const changePct = prevTotal ? round(((total - prevTotal) / prevTotal) * 100) : null;
    weeks.push({
      index: weeks.length + 1, weeksOut: wOut,
      label: taperWeeks === 2 ? `Taper week ${t + 1}` : "Taper week",
      tone: "taper",
      classLoad, gymLoad: round(taperGym), totalLoad: round(total), perSession: round(taperGym / gymDays),
      changePct,
      focus: "Cut gym VOLUME (fewer sets / shorter), hold INTENSITY (keep it crisp). You control your output even when rehearsal load isn't yours to control — arrive fresh and lower-risk.",
    });
    prevTotal = total;
  }

  // ---- event week ----
  weeks.push({
    index: weeks.length + 1, weeksOut: 0, label: "Event week", tone: "event",
    classLoad, gymLoad: round(gymStart * 0.3), totalLoad: round(classLoad + gymStart * 0.3),
    perSession: round((gymStart * 0.3) / gymDays), changePct: null,
    focus: "Light, sharp movement only. The training is done — now perform.",
  });

  return { weeksOut, gymDays, weeks, peakTotal: round(peakTotal) };
}

/** A short, human summary of the whole plan. */
export function planSummary(plan: EventPlan): string {
  if (plan.weeksOut === 0) return "Your event is here — keep it light and sharp.";
  const build = plan.weeks.filter((w) => w.tone === "build" || w.tone === "base").length;
  const taper = plan.weeks.filter((w) => w.tone === "taper").length;
  return `${plan.weeksOut} weeks out · ${build} weeks building (+10%/wk), ${taper}-week taper (−30% volume), then event.`;
}

/* ====================================================================== *
 *  DAY-BY-DAY SCHEDULE
 *  Lays the weekly plan onto a real calendar: each date gets a session
 *  type (strength focus / cardio / conditioning / rest+recovery), the
 *  blocks micro-cycle hypertrophy → strength → endurance, and the event
 *  "demand" decides whether to add steady-state cardio or Tabata bursts.
 * ====================================================================== */

export type DemandFocus = "turnout" | "jumps" | "core" | "upper" | "general";
export interface PlanDemand {
  /** Needs stamina for a long / full-length show → steady-state cardio. */
  stamina: boolean;
  /** Explosive — jumps, allegro, quick variations → Tabata / metcon. */
  explosive: boolean;
  /** Body areas to bias the strength work toward. */
  focus: DemandFocus[];
}

export type SessionType = "strength" | "hypertrophy" | "endurance" | "cardio" | "tabata" | "rest";

export interface PlanDay {
  iso: string;               // YYYY-MM-DD
  weekday: number;           // 0 = Mon … 6 = Sun
  weekIndex: number;         // which plan week (1-based)
  tone: PlanTone;
  type: SessionType;
  title: string;
  detail: string;            // what to do / recovery ideas
  isClassDay: boolean;
}

const FOCUS_LABEL: Record<DemandFocus, string> = {
  turnout: "turnout & hips", jumps: "jumps & calves", core: "core & control",
  upper: "upper body & lifts", general: "balanced full body",
};

// Micro-cycle order through the BUILD weeks: hypertrophy → strength → endurance,
// repeating. (Base weeks are hypertrophy-led; taper trims volume.)
const BLOCK_BY_BUILD_INDEX = ["hypertrophy", "strength", "endurance"] as const;

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function mondayWeekday(d: Date): number { return (d.getDay() + 6) % 7; } // 0=Mon

/**
 * Build a dated day-by-day schedule from now until the event.
 * @param classWeekdays  weekdays the dancer has class (0=Mon..6=Sun) — kept as class days.
 * @param gymDays        how many gym sessions per week to place.
 */
export function buildDailySchedule(
  plan: EventPlan,
  classWeekdays: number[],
  gymDays: number,
  demand: PlanDemand,
  today: Date = new Date(),
  classNamesByWeekday?: Record<number, string[]>
): PlanDay[] {
  if (plan.weeksOut === 0) return [];
  const focusText = demand.focus.length
    ? demand.focus.map((f) => FOCUS_LABEL[f]).join(", ")
    : FOCUS_LABEL.general;

  const classSet = new Set(classWeekdays);
  // Place gym days on weekdays the dancer does NOT have a heavy class, preferring
  // a spread. Fall back to any day if needed.
  const allWeekdays = [0, 1, 2, 3, 4, 5, 6];
  const freeDays = allWeekdays.filter((d) => !classSet.has(d));
  // pick gymDays evenly from freeDays first, then top up from class days
  function pickGymWeekdays(): Set<number> {
    const pick: number[] = [];
    const pool = freeDays.length >= gymDays ? freeDays : allWeekdays;
    const step = pool.length / gymDays;
    for (let i = 0; i < gymDays; i++) pick.push(pool[Math.floor(i * step)]);
    return new Set(pick);
  }
  const gymSet = pickGymWeekdays();

  const out: PlanDay[] = [];
  // iterate day by day from today to the event
  const start = new Date(today); start.setHours(0, 0, 0, 0);
  const totalDays = plan.weeksOut * 7;

  let buildCounter = 0; // counts gym sessions in build phase for micro-cycling

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const d = new Date(start); d.setDate(start.getDate() + dayOffset);
    const wd = mondayWeekday(d);
    const weekIndex = Math.floor(dayOffset / 7) + 1;
    const wk = plan.weeks[Math.min(weekIndex - 1, plan.weeks.length - 1)];
    const tone = wk?.tone ?? "build";
    const isClassDay = classSet.has(wd);
    const isGymDay = gymSet.has(wd);

    let type: SessionType = "rest";
    let title = "Rest day";
    let detail = "";

    if (isGymDay && tone !== "event") {
      if (tone === "taper") {
        // taper: keep one sharp, low-volume session; intensity held
        type = "strength";
        title = `Sharpening session — ${focusText}`;
        detail = "Low volume, crisp intensity. A couple of working sets of your key lifts. Leave feeling primed, not tired.";
      } else {
        // build/base: micro-cycle the block, and weave in conditioning by demand
        const block = tone === "base" ? "hypertrophy" : BLOCK_BY_BUILD_INDEX[buildCounter % 3];
        buildCounter++;
        // every ~3rd gym session becomes conditioning if the event demands it
        const conditioningSlot = buildCounter % 3 === 0;
        if (conditioningSlot && demand.explosive) {
          type = "tabata";
          title = "Conditioning — Tabata burst";
          detail = "Short, explosive intervals (20s on / 10s off × 8). Builds the quick-burst capacity for jumps and fast variations.";
        } else if (conditioningSlot && demand.stamina) {
          type = "cardio";
          title = "Steady-state cardio";
          detail = "20–35 min easy, conversational pace (bike, brisk walk, light jog). Builds the stamina to last a full-length show.";
        } else if (block === "hypertrophy") {
          type = "hypertrophy";
          title = `Hypertrophy — ${focusText}`;
          detail = "8–12 reps, 3–4 sets, controlled tempo. Build the muscle that holds your line. Bias toward your focus areas.";
        } else if (block === "strength") {
          type = "strength";
          title = `Strength — ${focusText}`;
          detail = "3–5 reps, heavier, full rest. Power for jumps and control for held positions, on a base you've already built.";
        } else {
          type = "endurance";
          title = `Endurance — ${focusText}`;
          detail = "15–25 reps, minimal rest, circuit-style. The stamina to repeat without fading late in a class or run.";
        }
      }
    } else if (isClassDay && tone !== "event") {
      type = "rest";
      const names = classNamesByWeekday?.[wd]?.filter(Boolean);
      title = names && names.length ? `Class day — ${names.join(", ")}` : "Class day — no extra gym";
      detail = "Your class is the training today. Warm up first, and treat it as the session.";
    } else {
      // genuine rest day with active-recovery ideas
      type = "rest";
      title = "Rest day";
      detail = restIdea(dayOffset);
    }

    if (tone === "event" || dayOffset === totalDays - 1) {
      type = "rest";
      title = "Event week — keep it light";
      detail = "Gentle mobility and a thorough warm-up only. Trust the work you've banked. Then perform.";
    }

    out.push({ iso: isoOf(d), weekday: wd, weekIndex, tone, type, title, detail, isClassDay });
  }
  return out;
}

// rotating active-recovery suggestions for rest days
const REST_IDEAS = [
  "Active recovery: 10–15 min gentle mobility — hips, ankles, spine. Move blood, don't load.",
  "Easy recovery: a relaxed walk and some calf and hip-flexor stretching. Hydrate well.",
  "Recovery day: foam-roll the legs and back, a few slow port de bras, then rest. Sleep is the real recovery.",
  "Light recovery: gentle stretching and breathing work. If you feel stiff, a short warm walk helps more than sitting still.",
  "Full rest: prioritise sleep and food today. A little easy mobility if you want it — nothing that taxes you.",
];
function restIdea(seed: number): string {
  return REST_IDEAS[seed % REST_IDEAS.length];
}

export const SESSION_LABEL: Record<SessionType, string> = {
  strength: "Strength", hypertrophy: "Hypertrophy", endurance: "Endurance",
  cardio: "Cardio", tabata: "Tabata", rest: "Rest",
};

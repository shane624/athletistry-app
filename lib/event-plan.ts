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

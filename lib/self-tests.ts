// The 10 self-tests from The Dancer's Playbook (and the Athletistry workshops).
// Pure module: safe for client and server.
//
// Each test has one or more measures. A measure is either a number the dancer
// records (seconds held, the count the leg came down on) or a choice from a
// short list of what they saw. Choices are ordered best first, so value 0 is
// always the goal and a lower number is always an improvement.

export type MeasureKind = "seconds" | "count" | "choice";

export interface ChoiceOption { value: number; label: string }

export interface Measure {
  id: string;
  label: string;
  kind: MeasureKind;
  better: "higher" | "lower";
  options?: ChoiceOption[];   // for kind "choice"
  min?: number;
  max?: number;               // for kind "count"
  unit?: string;
}

export interface SelfTest {
  id: string;
  n: number;
  title: string;
  correction: string;         // the correction it explains, in the words dancers hear
  how: string[];              // steps
  tells: string;              // what it tells you
  focus: string;              // what to work on when it isn't there yet
  timer?: boolean;            // show the built-in stopwatch
  measures: Measure[];
}

const sides = (base: Omit<Measure, "id" | "label">, label: string): Measure[] => [
  { ...base, id: "left", label: `${label}, left leg` },
  { ...base, id: "right", label: `${label}, right leg` },
];

export const SELF_TESTS: SelfTest[] = [
  {
    id: "balance", n: 1, title: "The balance test", correction: "Squeeze your core",
    how: [
      "Stand on one leg and squeeze your core as hard as you can.",
      "Close your eyes.",
      "Rise to demi-pointe. Time how long you hold it.",
    ],
    tells: "Balance comes mostly from your feet, your eyes and your inner ear, not your core. If you fall straight away with your eyes closed, your feet and inner ear need training.",
    focus: "Practise eyes-closed balances on flat, then on relevé. Dancers who can balance eyes-closed on relevé find turns much easier.",
    timer: true,
    measures: sides({ kind: "seconds", better: "higher", min: 0, unit: "s" }, "Eyes closed on relevé"),
  },
  {
    id: "strength-gap", n: 2, title: "The strength gap test", correction: "Stop gripping",
    how: [
      "Hold your foot and place your leg as high as it goes à la seconde.",
      "Let go and see where it stays.",
    ],
    tells: "Where you can place it is your flexibility. Where you can hold it is your strength. The gap between them is your next job.",
    focus: "No range yet? Flexibility first (elephant walks). A big gap? Strength first: place, let go, hold, then lower as slowly as you can.",
    measures: sides({
      kind: "choice", better: "lower", options: [
        { value: 0, label: "No gap: it stays where I placed it" },
        { value: 1, label: "Small: it drops a few centimetres" },
        { value: 2, label: "Medium: it drops about a hand-width" },
        { value: 3, label: "Large: it drops more than a hand-width" },
        { value: 4, label: "I can't place it high yet" },
      ],
    }, "Gap à la seconde"),
  },
  {
    id: "shrug", n: 3, title: "The shrug test", correction: "Spot",
    how: [
      "Lift your shoulders to your ears and try to turn your head.",
      "Then film your next pirouette and watch your shoulders in the preparation.",
    ],
    tells: "Raised shoulders lock the neck, and a locked neck kills your spot.",
    focus: "If your shoulders rise in pirouettes, think \"shoulders down\" instead of \"core\" in your turns.",
    measures: [{
      id: "shoulders", label: "My shoulders in the pirouette preparation", kind: "choice", better: "lower", options: [
        { value: 0, label: "Stayed down" },
        { value: 1, label: "Rose a little" },
        { value: 2, label: "Rose clearly" },
      ],
    }],
  },
  {
    id: "scapula", n: 4, title: "The scapula test", correction: "Squeeze your shoulder blades",
    how: [
      "Keep your back and shoulders completely still and try to lift your arms above your head.",
      "Put your arms in second and squeeze your shoulder blades together.",
      "Ask someone to look at your back.",
    ],
    tells: "Arms can't reach fifth unless the shoulder blades rotate. If your blades stick out more when you squeeze them, squeezing is making it worse.",
    focus: "Stop squeezing. Bring the arms slightly forward, let the blades spread, then slide the shoulders down.",
    measures: [{
      id: "blades", label: "My shoulder blades in second", kind: "choice", better: "lower", options: [
        { value: 0, label: "Lie flat, back looks smooth and wide" },
        { value: 1, label: "Stick out a little when I squeeze" },
        { value: 2, label: "Stick out clearly" },
      ],
    }],
  },
  {
    id: "tripod", n: 5, title: "The tripod test", correction: "Weight over the balls of your feet",
    how: [
      "Stand in tendu à la seconde.",
      "Is your standing heel pressing into the floor?",
      "Is the bony point of your hip over the middle of your standing foot, or have you shifted right over?",
    ],
    tells: "If the heel has lifted or you've shifted too far, your standing ankle is probably rolling and your standing leg turning in.",
    focus: "Find the rotation in the standing hip first. That may put a little more weight towards your heel than you're used to.",
    measures: sides({
      kind: "choice", better: "lower", options: [
        { value: 0, label: "Heel pressing, hip over the middle of the foot" },
        { value: 1, label: "Heel pressing, but I've shifted over" },
        { value: 2, label: "Heel lifted" },
      ],
    }, "Standing foot"),
  },
  {
    id: "standing-leg", n: 6, title: "The standing leg question", correction: "Rotate your standing leg",
    how: [
      "In your next jeté combination, notice: were you thinking about your standing leg the whole way through?",
      "Watch the standing knee each time the working leg moves.",
    ],
    tells: "If your standing knee rolls in each time the working leg moves, your balance changes every count.",
    focus: "Rotate the standing leg as much as the working leg. This one correction fixes a lot of rond de jambe and pirouette problems.",
    measures: [{
      id: "knee", label: "My standing knee through the combination", kind: "choice", better: "lower", options: [
        { value: 0, label: "Stayed rotated the whole way" },
        { value: 1, label: "Rolled in on some counts" },
        { value: 2, label: "Rolled in on most counts" },
      ],
    }],
  },
  {
    id: "hold", n: 7, title: "The hold test", correction: "Hold it",
    how: [
      "In your next adagio, count honestly.",
      "Note the count your leg actually comes down on, not the count it's meant to.",
    ],
    tells: "One count early in each direction adds up to 16,000 counts over ten years of training.",
    focus: "Hold to the last count. Lift once more before you put the leg down.",
    measures: [{ id: "count", label: "Count my leg came down on (out of 8)", kind: "count", better: "higher", min: 1, max: 8 }],
  },
  {
    id: "office-chair", n: 8, title: "The office chair test", correction: "Use your arms",
    how: [
      "Spin on an office chair with your arms out, then pull them in.",
      "Then watch a video of your pirouette.",
    ],
    tells: "Arms out slows you, arms in speeds you up. If you never open, you can't close, and you can't speed up.",
    focus: "Open a little, then close. Open the front arm only until your upper arm lines up with your thigh.",
    measures: [{
      id: "arms", label: "My arms in the pirouette", kind: "choice", better: "lower", options: [
        { value: 0, label: "Open a little, then close" },
        { value: 1, label: "Never open" },
        { value: 2, label: "Fling behind me" },
      ],
    }],
  },
  {
    id: "jump", n: 9, title: "The jump test", correction: "Jump higher",
    how: [
      "Jump as high as you can from two feet.",
      "Then from one foot.",
      "Then from one foot while throwing the other leg up like a grand battement.",
    ],
    tells: "The thrown leg should take you highest. If it doesn't, your grand battement isn't pushing the floor away yet.",
    focus: "Don't lift. Push the floor away in grand battement. Your barre battements are jump training.",
    measures: [{
      id: "highest", label: "Which jump went highest", kind: "choice", better: "lower", options: [
        { value: 0, label: "One foot with the thrown leg" },
        { value: 1, label: "One foot" },
        { value: 2, label: "Two feet" },
      ],
    }],
  },
  {
    id: "zombie", n: 10, title: "The zombie walk", correction: "Keep your hips square",
    how: [
      "Walk across the room keeping both hip bones perfectly square and still.",
      "Then walk normally, and watch your hips in your next jetés derrière.",
    ],
    tells: "If you can't walk with perfectly square hips, you can't do fast jetés derrière that way either. A small, stable opening is fine.",
    focus: "What we don't want is the alignment changing all the time. Open the back hip a little and keep it there.",
    measures: [{
      id: "hips", label: "My hips in jetés derrière", kind: "choice", better: "lower", options: [
        { value: 0, label: "Small, stable opening" },
        { value: 1, label: "Alignment changes all the time" },
      ],
    }],
  },
];

export const RETEST_DAYS = 28;

export function getTest(id: string): SelfTest | undefined {
  return SELF_TESTS.find((t) => t.id === id);
}

export type Values = Record<string, number>;

export interface Attempt { id: string; testId: string; values: Values; note: string | null; takenAt: string }

/** Display a single measured value. */
export function formatValue(m: Measure, v: number | undefined): string {
  if (v === undefined || v === null || Number.isNaN(v)) return "None";
  if (m.kind === "choice") return m.options?.find((o) => o.value === v)?.label ?? String(v);
  if (m.kind === "seconds") return `${v.toFixed(1)}s`;
  return `${v}${m.max ? ` of ${m.max}` : ""}`;
}

/** Whether a measure has reached its goal. Numbers have no fixed goal. */
export function atGoal(m: Measure, v: number | undefined): boolean | null {
  if (v === undefined) return null;
  if (m.kind === "choice") return v === 0;
  if (m.kind === "count" && m.max) return v >= m.max;
  return null;
}

export type Trend = "better" | "same" | "worse" | null;

export function trend(m: Measure, first: number | undefined, latest: number | undefined): Trend {
  if (first === undefined || latest === undefined) return null;
  if (latest === first) return "same";
  const up = latest > first;
  return (m.better === "higher") === up ? "better" : "worse";
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

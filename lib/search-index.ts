// Static part of the global search index — pages/features, ballet moves,
// programs, and class types. Exercises are added at runtime (from the DB).
// Pure module: safe for client and server.
import { BALLET_MOVES } from "@/lib/ballet";
import { PROGRAMS } from "@/lib/programs";
import { CLASS_PRESETS } from "@/lib/classes";

export type SearchKind = "page" | "exercise" | "move" | "program" | "class";

export interface SearchItem {
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;            // where clicking goes
  keywords: string;        // extra terms to match (lowercased)
}

// ---- app pages / features ----
const PAGES: SearchItem[] = [
  { kind: "page", title: "Today", subtitle: "Your daily workout", href: "/dashboard", keywords: "home dashboard session workout warm up" },
  { kind: "page", title: "Programs", subtitle: "Choose a guided plan", href: "/programs", keywords: "the practice 24 week periodised ballet return kids build your own" },
  { kind: "page", title: "Random Workout", subtitle: "Balanced session on demand", href: "/generate", keywords: "generate quick legs push pull core" },
  { kind: "page", title: "Circuit Training", subtitle: "Intervals, Tabata, EMOM & AMRAP", href: "/circuit", keywords: "circuit conditioning intervals tabata emom amrap superset triset grandset timer rounds hiit" },
  { kind: "page", title: "Train for Ballet", subtitle: "Workouts for a ballet move", href: "/ballet", keywords: "plie fondu frappe rond de jambe move technique" },
  { kind: "page", title: "My Workouts", subtitle: "Your saved routines", href: "/my-workouts", keywords: "saved custom routine library" },
  { kind: "page", title: "Guided Workouts", subtitle: "Follow-along videos", href: "/workouts", keywords: "video follow along mobility strength" },
  { kind: "page", title: "Warm-Ups", subtitle: "Gentle & Winning warm-ups", href: "/warmups", keywords: "warm up pre class performance exam rehearsal" },
  { kind: "page", title: "Progress", subtitle: "Lifts & muscle-group balance", href: "/progress", keywords: "charts volume muscle group tracking" },
  { kind: "page", title: "Training Calendar", subtitle: "Log classes & training load", href: "/load", keywords: "calendar load trimp rpe schedule class jazz tap rehearsal taper" },
  { kind: "page", title: "Event Planner", subtitle: "Plan around a performance", href: "/plan", keywords: "competition exam taper performance schedule" },
  { kind: "page", title: "Achievements", subtitle: "Ranks, streaks & badges", href: "/achievements", keywords: "rank level streak ring badge etoile" },
  { kind: "page", title: "Library", subtitle: "Every exercise & video", href: "/exercises", keywords: "exercises catalogue demo video" },
  { kind: "page", title: "How to Use the App", subtitle: "Beginner guide", href: "/guide", keywords: "help guide getting started beginner how to" },
  { kind: "page", title: "Training Science", subtitle: "The why behind the programs", href: "/training-science", keywords: "great 8 hypertrophy strength endurance phases trimp deload rpe science deeper" },
  { kind: "page", title: "Understand Anatomy", subtitle: "The Dancer's Body course", href: "/anatomy", keywords: "anatomy biomechanics hip knee foot ankle shoulder core turnout dancer body regions plie develop arabesque" },
  { kind: "page", title: "Settings", subtitle: "Name, reminders, start date", href: "/settings", keywords: "account profile reminders" },
];

// ---- ballet moves ----
const MOVES: SearchItem[] = BALLET_MOVES.map((m) => ({
  kind: "move" as const,
  title: m.name,
  subtitle: "Train for this move",
  href: `/ballet?move=${m.slug}`,
  keywords: `ballet ${m.name} ${m.focus}`.toLowerCase(),
}));

// ---- programs ----
const PROGS: SearchItem[] = PROGRAMS.map((p) => ({
  kind: "program" as const,
  title: p.name,
  subtitle: "Program",
  href: "/programs",
  keywords: `program ${p.name} ${p.tagline}`.toLowerCase(),
}));

// ---- class / activity types ----
const CLASSES: SearchItem[] = CLASS_PRESETS.map((c) => ({
  kind: "class" as const,
  title: c.label,
  subtitle: "Add to your calendar",
  href: "/load",
  keywords: `class activity ${c.label}`.toLowerCase(),
}));

export const STATIC_INDEX: SearchItem[] = [...PAGES, ...MOVES, ...PROGS, ...CLASSES];

/** Score an item against a query (0 = no match). Higher = better. */
export function scoreItem(item: SearchItem, q: string): number {
  const t = item.title.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  if (item.subtitle && item.subtitle.toLowerCase().includes(q)) return 40;
  if (item.keywords.includes(q)) return 30;
  return 0;
}

/** Search any item list with a query; returns sorted matches. */
export function searchItems(items: SearchItem[], query: string, limit = 12): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items
    .map((it) => ({ it, s: scoreItem(it, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.it);
}

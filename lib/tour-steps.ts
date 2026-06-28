import type { TourStep } from "@/components/Tour";

// Per-page walkthrough steps. Targets are tagged with data-tour="<key>" on each
// page. PageTour picks the set whose route the user is on. Keep the copy plain
// and friendly — these are for first-timers.

export const TOUR_STEPS: Record<string, TourStep[]> = {
  "/dashboard": [
    { target: "ring", title: "Your week at a glance", body: "This ring fills as you train through the week. Keep it closing and your streak grows — a little, often, is the goal." },
    { target: "today-session", title: "Today's workout", body: "Exactly what to do today — the focus, sets and reps. Tap Start when you're ready." },
    { target: "warmup", title: "Warm up first", body: "Always start here. A few minutes lowers injury risk and helps you move better." },
    { target: "log", title: "Logging is one tap", body: "Enter your weight and reps once, then tap “Log all sets”. They even pre-fill from last time — just confirm." },
    { target: "menu", title: "Find anything fast", body: "Search any exercise, move or page here. The full menu lives in the navigation — explore whenever you're curious." },
  ],
  "/programs": [
    { target: "programs", title: "Choose a pathway", body: "Each program is a ready-made plan — from gentle returns to serious strength. Pick one and the app guides you day by day." },
    { target: "tools", title: "Off-plan tools", body: "Below your programs are quick tools: build your own routine, generate a session, or run a timed circuit." },
  ],
  "/plan": [
    { target: "event", title: "Tell us your event", body: "Add your performance, competition or exam date — we plan the weeks back from it." },
    { target: "schedule", title: "Your weekly classes", body: "Add the classes you already do. We keep these constant and build your gym training around them." },
    { target: "demand", title: "What the event needs", body: "Tell us if it needs stamina or explosive power, and which areas to prioritise — it shapes your plan." },
    { target: "build", title: "Build & activate", body: "Generate a dated, day-by-day plan. Activate it and your Today screen follows it automatically." },
  ],
  "/load": [
    { target: "load-status", title: "Your training load", body: "This tracks how hard your week has been (time × effort). Aim for a gentle ~10% climb week to week." },
    { target: "log-session", title: "Log what you did", body: "Record a class, rehearsal or gym session you've finished, so it counts toward your load." },
    { target: "calendar", title: "Your schedule", body: "Your week at a glance. Tap a day to plan ahead, or a ◆ plan day to see its workout." },
  ],
  "/circuit": [
    { target: "format", title: "Pick a format", body: "Four timed styles — intervals, Tabata, EMOM, AMRAP. Each runs its own clock for you." },
    { target: "focus", title: "Focus & difficulty", body: "Choose full-body or a single area, your level, and the equipment you have." },
    { target: "build-circuit", title: "Build & go", body: "The app picks the exercises and runs the timer — including a get-ready countdown and rest." },
  ],
  "/generate": [
    { target: "style", title: "Pick a style", body: "Hypertrophy, strength or endurance — or a timed circuit. The app builds a balanced session." },
    { target: "gen-build", title: "Generate", body: "Tap to roll a workout. Train it today, or save it to My Workouts." },
  ],
  "/ballet": [
    { target: "move", title: "Pick a move", body: "Choose a ballet move you want to improve and we build a workout for exactly what it needs." },
    { target: "ballet-filters", title: "Level & equipment", body: "Filter to your level and the equipment you have. The exercises update instantly." },
  ],
  "/progress": [
    { target: "muscle", title: "Muscle balance", body: "See which areas you've trained. Even bars mean balanced training; a gap is worth filling." },
    { target: "lift", title: "Lift trends", body: "Pick an exercise to watch your weight and volume climb week to week." },
  ],
  "/achievements": [
    { target: "rank", title: "Your rank", body: "Ballet ranks from Apprentice to Étoile — earned by showing up consistently." },
    { target: "badges", title: "Badges", body: "Unlock badges for streaks, volume and milestones. Something to chase." },
  ],
  "/warmups": [
    { target: "warmup-pick", title: "Pick a warm-up", body: "Gentle to start, Winning when you're stronger. Do one before training, class or a performance." },
  ],
  "/exercises": [
    { target: "ex-search", title: "Find any exercise", body: "Search the full library or filter by level. Tap Watch on any exercise for its demo video." },
  ],
};

export function tourFor(pathname: string): TourStep[] | null {
  // exact match, else longest-prefix match
  if (TOUR_STEPS[pathname]) return TOUR_STEPS[pathname];
  const key = Object.keys(TOUR_STEPS).find((k) => pathname.startsWith(k));
  return key ? TOUR_STEPS[key] : null;
}

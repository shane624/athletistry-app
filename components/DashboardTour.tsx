"use client";

import Tour, { type TourStep } from "@/components/Tour";

// The Today-screen walkthrough. Targets are tagged with data-tour="..." on the
// dashboard. Replayable via the "Show me around" button.
const STEPS: TourStep[] = [
  {
    target: "ring",
    title: "Your week at a glance",
    body: "This ring fills as you train through the week. Keep it closing and your streak grows — a little, often, is the goal.",
  },
  {
    target: "today-session",
    title: "Today's workout",
    body: "Here's exactly what to do today — the focus, sets and reps. Tap Start when you're ready.",
  },
  {
    target: "warmup",
    title: "Warm up first",
    body: "Always start here. A few minutes of warm-up lowers injury risk and helps you move better.",
  },
  {
    target: "log",
    title: "Logging is one tap",
    body: "Enter your weight and reps once, then tap “Log all sets”. Your numbers even pre-fill from last time — just confirm.",
  },
  {
    target: "menu",
    title: "Find anything fast",
    body: "Search any exercise, move or page from here. The full menu — Programs, Training Plan Builder, your calendar, progress and more — lives in the navigation. Explore whenever you're curious.",
  },
];

export default function DashboardTour() {
  return <Tour steps={STEPS} />;
}

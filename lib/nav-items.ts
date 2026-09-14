import type { IconName } from "@/components/Icon";

// Five destinations, and nothing else competing with them.
//
// The app has thirty-odd routes. Presenting them as a flat list of twenty-two
// nav items meant a new member met twelve doors all marked "start training" and
// had no reason to prefer one. Each primary destination below is a hub: the
// specialist tools live inside the destination they belong to, reached once
// someone is already looking for that kind of thing. Global search still
// addresses every route directly for people who know what they want.
export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { title: string; items: NavItem[] };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: "home" },
  { href: "/explore", label: "Train", icon: "sparkle" },
  // The calendar is a capture tool, not a review screen: you log a class
  // right after class. Collapsing it under Progress taxed the most frequent
  // action in the app, so it stays a destination in its own right.
  { href: "/load", label: "Calendar", icon: "calendar" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/guide", label: "Learn", icon: "book" },
  { href: "/profile", label: "Profile", icon: "user" },
];

// Everything below is reached from inside a primary destination. These lists
// are the single source of truth for the hub screens and the mobile menu, so a
// route can never quietly become unreachable.
export const TRAIN_TOOLS: NavItem[] = [
  { href: "/programs", label: "Programs", icon: "stack" },
  { href: "/workouts", label: "Guided Workouts", icon: "play" },
  { href: "/warmups", label: "Warm-Ups", icon: "warmup" },
  { href: "/circuit", label: "Circuit Training", icon: "circuit" },
  { href: "/ballet", label: "Train for Ballet", icon: "ballet" },
  { href: "/movement-map", label: "Movement Map", icon: "target" },
  { href: "/plan", label: "Training Plan Builder", icon: "calendar" },
  { href: "/generate", label: "Practice Generator", icon: "bolt" },
  { href: "/my-workouts", label: "My Workouts", icon: "grid" },
  { href: "/exercises", label: "Exercise Library", icon: "library" },
];

export const PROGRESS_TOOLS: NavItem[] = [
  { href: "/progress", label: "Trend", icon: "chart" },
  { href: "/achievements", label: "Achievements", icon: "trophy" },
];

export const LEARN_TOOLS: NavItem[] = [
  { href: "/guide", label: "How to Use the App", icon: "book" },
  { href: "/anatomy", label: "Understand Anatomy", icon: "body" },
  { href: "/training-science", label: "Training Science", icon: "flask" },
];

export const PROFILE_TOOLS: NavItem[] = [
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export const STUDIO_ITEM: NavItem = { href: "/studio", label: "Studios", icon: "users" };
export const ADMIN_ITEM: NavItem = { href: "/admin", label: "Members", icon: "user" };

// Grouped view, used by the mobile menu hub so every route stays addressable.
export const NAV_GROUPS: NavGroup[] = [
  { title: "Train", items: TRAIN_TOOLS },
  // The calendar is a primary destination rather than a Progress tab, but the
  // menu lists every route, so it is named here too.
  { title: "Progress", items: [{ href: "/load", label: "Training Calendar", icon: "calendar" }, ...PROGRESS_TOOLS] },
  { title: "Learn", items: LEARN_TOOLS },
  { title: "Account", items: PROFILE_TOOLS },
];

export const ADMIN_EMAIL = "swuerthner@gmail.com";

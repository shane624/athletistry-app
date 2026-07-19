import type { IconName } from "@/components/Icon";

// Shared navigation model — used by both the desktop sidebar and the mobile
// dropdown so they never drift apart. Each item carries an icon.
export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Train",
    items: [
      { href: "/dashboard", label: "Today", icon: "home" },
      { href: "/explore", label: "Explore", icon: "sparkle" },
      { href: "/movement-map", label: "Movement Map", icon: "target" },
      { href: "/programs", label: "Programs", icon: "grid" },
      { href: "/plan", label: "Training Plan Builder", icon: "target" },
      { href: "/generate", label: "Practice Generator", icon: "bolt" },
      { href: "/circuit", label: "Circuit Training", icon: "circuit" },
      { href: "/ballet", label: "Train for Ballet", icon: "ballet" },
      { href: "/warmups", label: "Warm-Ups", icon: "warmup" },
      { href: "/workouts", label: "Guided Workouts", icon: "play" },
      { href: "/my-workouts", label: "My Workouts", icon: "stack" },
    ],
  },
  {
    title: "Track",
    items: [
      { href: "/progress", label: "Progress", icon: "chart" },
      { href: "/load", label: "Training Calendar", icon: "calendar" },
      { href: "/achievements", label: "Achievements", icon: "trophy" },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/guide", label: "How to Use the App", icon: "book" },
      { href: "/anatomy", label: "Understand Anatomy", icon: "body" },
      { href: "/training-science", label: "Training Science", icon: "flask" },
    ],
  },
  {
    title: "More",
    items: [
      { href: "/exercises", label: "Library", icon: "library" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const ADMIN_EMAIL = "swuerthner@gmail.com";

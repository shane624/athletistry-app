// Drop-in class presets for the calendar. Each has a sensible default duration
// and RPE the dancer can adjust when adding it. Pure module (client/server safe).

export interface ClassPreset {
  kind: string;       // stored in training_sessions.kind
  label: string;      // display
  defaultMin: number; // default duration
  defaultRpe: number; // default effort
  color: string;      // dot/chip colour for the calendar
}

export interface ClassGroup { title: string; items: ClassPreset[]; }

// Grouped for the picker: dance classes, then other sports, then general.
export const CLASS_GROUPS: ClassGroup[] = [
  {
    title: "Dance",
    items: [
      { kind: "ballet",    label: "Ballet",    defaultMin: 90, defaultRpe: 6, color: "#27ae9f" },
      { kind: "pointe",    label: "Pointe",    defaultMin: 45, defaultRpe: 7, color: "#1f8b7f" },
      { kind: "jazz",      label: "Jazz",      defaultMin: 60, defaultRpe: 6, color: "#e88aa0" },
      { kind: "lyrical",   label: "Lyrical",   defaultMin: 60, defaultRpe: 5, color: "#b079d6" },
      { kind: "contemporary", label: "Contemporary", defaultMin: 60, defaultRpe: 6, color: "#7a6ff0" },
      { kind: "hiphop",    label: "Hip Hop",   defaultMin: 60, defaultRpe: 6, color: "#f4a261" },
      { kind: "tap",       label: "Tap",       defaultMin: 45, defaultRpe: 5, color: "#e9c46a" },
      { kind: "acro",      label: "Acro",      defaultMin: 60, defaultRpe: 7, color: "#e76f51" },
      { kind: "rehearsal", label: "Rehearsal", defaultMin: 120, defaultRpe: 7, color: "#3a4a6b" },
    ],
  },
  {
    title: "Other sports",
    items: [
      { kind: "swimming",   label: "Swimming",   defaultMin: 60, defaultRpe: 6, color: "#4aa3df" },
      { kind: "running",    label: "Running",    defaultMin: 40, defaultRpe: 7, color: "#2f9e57" },
      { kind: "cycling",    label: "Cycling",    defaultMin: 60, defaultRpe: 6, color: "#56c2b0" },
      { kind: "pilates",    label: "Pilates",    defaultMin: 50, defaultRpe: 5, color: "#9b8cf0" },
      { kind: "yoga",       label: "Yoga",       defaultMin: 60, defaultRpe: 4, color: "#7fc8a9" },
      { kind: "gymnastics", label: "Gymnastics", defaultMin: 90, defaultRpe: 7, color: "#e07a5f" },
      { kind: "soccer",     label: "Soccer",     defaultMin: 90, defaultRpe: 7, color: "#3da35d" },
      { kind: "netball",    label: "Netball",    defaultMin: 60, defaultRpe: 7, color: "#e9897e" },
      { kind: "tennis",     label: "Tennis",     defaultMin: 60, defaultRpe: 6, color: "#cbe04a" },
      { kind: "sport",      label: "Other sport", defaultMin: 60, defaultRpe: 6, color: "#6b7280" },
    ],
  },
  {
    title: "General",
    items: [
      { kind: "workout",  label: "Gym / Strength", defaultMin: 45, defaultRpe: 6, color: "#1f2a44" },
      { kind: "cardio",   label: "Cardio",         defaultMin: 30, defaultRpe: 7, color: "#1f2a44" },
      { kind: "crosstrain", label: "Cross-training", defaultMin: 45, defaultRpe: 6, color: "#3a4a6b" },
    ],
  },
];

// flat list (kept for anywhere that iterates all presets, e.g. logger chips)
export const CLASS_PRESETS: ClassPreset[] = CLASS_GROUPS.flatMap((g) => g.items);

export function classPreset(kind: string): ClassPreset | undefined {
  return CLASS_PRESETS.find((c) => c.kind === kind);
}

export function classColor(kind: string): string {
  return classPreset(kind)?.color ?? "#5b6470";
}

export function classLabel(kind: string): string {
  return classPreset(kind)?.label ?? kind.charAt(0).toUpperCase() + kind.slice(1);
}

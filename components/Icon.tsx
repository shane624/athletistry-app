// Single inline-SVG icon set so the app reads visually, not just text.
// Consistent 24-grid, 1.8 stroke, rounded caps. Inherits color via currentColor.
// Usage: <Icon name="home" className="w-5 h-5" />

type IconName =
  | "home" | "grid" | "circuit" | "chart" | "dots"
  | "play" | "pause" | "skip" | "flame" | "trophy"
  | "calendar" | "target" | "book" | "body" | "flask"
  | "ballet" | "warmup" | "library" | "settings" | "user"
  | "dumbbell" | "clock" | "check" | "chevron" | "sparkle"
  | "bolt" | "heart" | "ruler" | "stack" | "users";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  circuit: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></>,
  chart: <><path d="M4 19V5M4 19h16" /><path d="M8 16l4-5 3 3 4-6" /></>,
  dots: <><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>,
  play: <path d="M7 5v14l11-7z" />,
  pause: <><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></>,
  skip: <><path d="M6 5l9 7-9 7z" /><path d="M18 5v14" /></>,
  flame: <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C8 11 8 8 12 3z" />,
  trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0z" /><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3" /><path d="M12 12v4M9 20h6M10 20l.5-4M14 20l-.5-4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13" />,
  body: <><circle cx="12" cy="5" r="2" /><path d="M12 7v7M12 9l-5 2M12 9l5 2M12 14l-3 6M12 14l3 6" /></>,
  flask: <><path d="M9 3h6M10 3v6l-4.5 8a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9V3" /><path d="M7.5 14h9" /></>,
  ballet: <><circle cx="12" cy="4" r="2" /><path d="M12 6v6M12 8l-5 3M12 8l5 3M12 12l-4 8M12 12l4 8" /></>,
  warmup: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  library: <><rect x="4" y="4" width="4" height="16" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><path d="M17 5l3 1-3 14-3-1z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  dumbbell: <><path d="M6 9v6M3 10v4M18 9v6M21 10v4M6 12h12" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  sparkle: <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  heart: <path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-2 4.5-9 9-9 9z" />,
  ruler: <><rect x="3" y="8" width="18" height="8" rx="1.5" transform="rotate(0 12 12)" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>,
  stack: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5M3 16l9 5 9-5" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-3-4.9" /></>,
};

export default function Icon({
  name,
  className = "w-5 h-5",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  const filled = name === "play" || name === "flame" || name === "sparkle" || name === "bolt";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };

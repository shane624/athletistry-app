"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// iOS-style bottom tab bar. Mobile only (hidden on sm+). The dropdown NavBar
// still handles the full menu; this gives thumb-friendly access to the five
// most-used destinations. "More" opens the full menu via the top nav.
type Tab = { href: string; label: string; icon: React.ReactNode };

const I = {
  today: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9" />
  ),
  programs: (
    <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>
  ),
  circuit: (
    <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></>
  ),
  progress: (
    <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16l4-5 3 3 4-6" /></>
  ),
  more: (
    <><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>
  ),
};

const TABS: Tab[] = [
  { href: "/dashboard", label: "Today", icon: I.today },
  { href: "/programs", label: "Programs", icon: I.programs },
  { href: "/circuit", label: "Circuit", icon: I.circuit },
  { href: "/progress", label: "Progress", icon: I.progress },
  { href: "/menu", label: "More", icon: I.more },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line"
      style={{
        background: "var(--c-surface)",
        opacity: 0.97,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="flex">
        {TABS.map((t) => {
          const active = t.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-2 ${active ? "text-teal" : "text-grey"}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
                <span className="text-[10px] font-semibold">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

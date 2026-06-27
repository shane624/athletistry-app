"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";

// iOS-style bottom tab bar. Mobile only (hidden on sm+). The dropdown NavBar
// still handles the full menu on desktop; this gives thumb-friendly access to
// the five most-used destinations. "More" opens the full /menu hub.
type Tab = { href: string; label: string; icon: IconName };

const TABS: Tab[] = [
  { href: "/dashboard", label: "Today", icon: "home" },
  { href: "/programs", label: "Programs", icon: "grid" },
  { href: "/circuit", label: "Circuit", icon: "circuit" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/menu", label: "More", icon: "dots" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line"
      style={{
        background: "var(--c-surface)",
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
                className={`flex flex-col items-center gap-0.5 py-2 transition-colors ${active ? "text-teal" : "text-grey"}`}
              >
                <span className={`transition-transform duration-200 ${active ? "scale-110 -translate-y-0.5" : ""}`}>
                  <Icon name={t.icon} className="w-6 h-6" strokeWidth={active ? 2.1 : 1.8} />
                </span>
                <span className={`text-[10px] ${active ? "font-bold" : "font-semibold"}`}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

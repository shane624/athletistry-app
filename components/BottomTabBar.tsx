"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";

type Tab = { href: string; label: string; icon: IconName };

const TABS: Tab[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/programs", label: "Programs", icon: "grid" },
  { href: "/workouts", label: "Workouts", icon: "play" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/profile", label: "Profile", icon: "user" },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="mobile-tab-shell sm:hidden fixed z-40">
      <ul className="flex px-1 py-1">
        {TABS.map((t) => {
          const active = t.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1 min-w-0">
              <Link href={t.href} className={`flex flex-col items-center gap-0.5 py-1.5 transition-colors ${active ? "mobile-tab-active" : "text-white/58"}`}>
                <span className={`w-9 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${active ? "mobile-tab-icon-active -translate-y-0.5" : ""}`}>
                  <Icon name={t.icon} className="w-[18px] h-[18px]" strokeWidth={active ? 2 : 1.55} />
                </span>
                <span className={`text-[9px] leading-none truncate max-w-full ${active ? "font-bold" : "font-medium"}`}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

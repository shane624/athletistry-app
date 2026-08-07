"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";

type Tab = { href: string; label: string; icon: IconName };

const TABS: Tab[] = [
  { href: "/dashboard", label: "Today", icon: "home" },
  { href: "/explore", label: "Explore", icon: "grid" },
  { href: "/circuit", label: "Circuit", icon: "circuit" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/menu", label: "More", icon: "dots" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="mobile-tab-shell sm:hidden fixed z-40">
      <ul className="flex px-1.5 py-1.5">
        {TABS.map((t) => {
          const active = t.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} className={`flex flex-col items-center gap-0.5 py-1.5 transition-colors ${active ? "mobile-tab-active" : "text-grey"}`}>
                <span className={`w-9 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${active ? "mobile-tab-icon-active -translate-y-0.5" : ""}`}>
                  <Icon name={t.icon} className="w-[19px] h-[19px]" strokeWidth={active ? 2 : 1.65} />
                </span>
                <span className={`text-[10px] leading-none ${active ? "font-bold" : "font-semibold"}`}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { PRIMARY_NAV } from "@/lib/nav-items";

// Same five destinations as the desktop sidebar, in the same order, so the two
// never drift apart and a member's mental model survives changing device.
const SECTION_OF: Record<string, string> = {
  "/programs": "/explore",
  "/workouts": "/explore",
  "/warmups": "/explore",
  "/circuit": "/explore",
  "/ballet": "/explore",
  "/movement-map": "/explore",
  "/plan": "/explore",
  "/generate": "/explore",
  "/my-workouts": "/explore",
  "/exercises": "/explore",
  "/session": "/explore",
  "/build": "/explore",
  "/achievements": "/progress",
  "/anatomy": "/guide",
  "/training-science": "/guide",
  "/training-styles": "/guide",
  "/settings": "/profile",
  "/menu": "/profile",
};

function sectionFor(pathname: string): string {
  const hit = Object.keys(SECTION_OF).find((p) => pathname === p || pathname.startsWith(p + "/"));
  return hit ? SECTION_OF[hit] : pathname;
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const section = sectionFor(pathname);
  return (
    <nav aria-label="Primary" className="mobile-tab-shell sm:hidden fixed z-40">
      <ul className="flex px-1 py-1">
        {PRIMARY_NAV.map((t) => {
          const active = section === t.href;
          return (
            <li key={t.href} className="flex-1 min-w-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`tab-press flex flex-col items-center gap-0.5 py-1.5 transition-colors ${active ? "mobile-tab-active" : "text-white/58"}`}
              >
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

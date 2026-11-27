"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { PRIMARY_NAV } from "@/lib/nav-items";

// Phones get five tabs, which is the most a thumb can tell apart without
// reading. Learn folds into Profile here (and stays one tap away in the menu
// and search); the desktop sidebar has the room to show all six.
const MOBILE_TABS = PRIMARY_NAV.filter((t) => t.href !== "/guide");

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
  "/tools": "/explore",
  "/achievements": "/progress",
  "/self-tests": "/progress",
  "/guide": "/profile",
  "/anatomy": "/profile",
  "/training-science": "/profile",
  "/training-styles": "/profile",
  "/settings": "/profile",
  "/pricing": "/profile",
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
      <ul className="flex">
        {MOBILE_TABS.map((t) => {
          const active = section === t.href;
          return (
            <li key={t.href} className="flex-1 min-w-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`mobile-tab tab-press flex flex-col items-center justify-center gap-1 pt-1.5 pb-1 ${active ? "mobile-tab-active" : ""}`}
              >
                <Icon name={t.icon} className="w-6 h-6" strokeWidth={active ? 2.1 : 1.6} />
                <span className={`mobile-tab-label truncate max-w-full ${active ? "font-semibold" : ""}`}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

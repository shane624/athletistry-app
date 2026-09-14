"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav-items";

// Turns a set of sibling routes into one destination with tabs.
//
// Progress, Training Calendar and Achievements were three separate nav entries
// answering the same question ("how am I going?"). Rather than merge three
// data-heavy server pages into one, they now share this tab strip, so they read
// as a single destination while keeping their own loaders and URLs.
export default function SectionTabs({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <div className="editorial-tabs mb-5 animate-in" aria-label={label}>
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`editorial-tab tab-press ${active ? "editorial-tab-active" : ""}`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}

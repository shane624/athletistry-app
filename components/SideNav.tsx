"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Icon from "@/components/Icon";
import { NAV_GROUPS, ADMIN_EMAIL, type NavGroup } from "@/lib/nav-items";

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStudio, setShowStudio] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setShowAdmin((data.user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase());
    });
    supabase.from("studios").select("id").limit(1).then(({ data }) => setShowStudio(!!data?.length));
  }, [supabase]);

  const base: NavGroup[] = showStudio
    ? NAV_GROUPS
    : NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => it.href !== "/studio") }));
  const groups: NavGroup[] = showAdmin
    ? [...base, { title: "Admin", items: [{ href: "/admin", label: "Members", icon: "user" }] }]
    : base;

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="app-sidebar hidden lg:flex flex-col fixed inset-y-0 left-0 w-[17rem] z-30 border-r overflow-y-auto">
      <Link href="/dashboard" className="flex items-center gap-3.5 px-5 h-[84px] shrink-0 border-b border-black/[.055]">
        <span className="ath-brand-mark">A</span>
        <span className="min-w-0">
          <span className="ath-wordmark block">ATHLETISTRY</span>
          <span className="ath-submark block">The Athletistry Project</span>
        </span>
      </Link>

      <nav className="px-3.5 pt-5 pb-4 flex-1">
        {groups.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="px-3 mb-2 text-[9px] font-bold tracking-[.19em] uppercase text-grey">{g.title}</p>
            <div className="space-y-1">
              {g.items.map((it) => {
                const active = it.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 text-[13px] ${active ? "sidebar-link-active font-semibold" : ""}`}
                  >
                    <Icon name={it.icon} className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2 : 1.65} />
                    <span className="truncate">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-4 mb-3 rounded-[22px] border border-black/[.06] bg-white/35 p-4">
        <p className="eyebrow">Athletistry</p>
        <p className="mt-2 font-display text-[22px] leading-[1.02] font-bold text-navy">Practice for many years.</p>
        <p className="mt-2 text-[11px] leading-relaxed text-grey">Train smarter. Dance stronger.</p>
      </div>

      <button onClick={signOut} className="m-3 mt-0 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-grey hover:bg-white/55 shrink-0 transition">
        <Icon name="chevron" className="w-[18px] h-[18px] rotate-180" />
        Sign out
      </button>
    </aside>
  );
}

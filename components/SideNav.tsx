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
  const [memberName, setMemberName] = useState("Member");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setShowAdmin((data.user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase());
      const u = data.user;
      setMemberName(String(u?.user_metadata?.display_name || (u?.email || "Member").split("@")[0] || "Member"));
    });
    supabase.from("studios").select("id").limit(1).then(({ data }) => setShowStudio(!!data?.length));
  }, [supabase]);

  const base: NavGroup[] = showStudio ? NAV_GROUPS : NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => it.href !== "/studio") }));
  const groups: NavGroup[] = showAdmin ? [...base, { title: "Admin", items: [{ href: "/admin", label: "Members", icon: "user" }] }] : base;

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="app-sidebar hidden lg:flex flex-col fixed inset-y-0 left-0 w-[17rem] z-30 overflow-y-auto">
      <Link href="/dashboard" className="sidebar-brand flex flex-col items-center justify-center px-5 h-[130px] shrink-0">
        <span className="sidebar-monogram">A</span>
        <span className="sidebar-wordmark">ATHLETISTRY</span>
        <span className="sidebar-mantra">Discipline. Artistry. Forever.</span>
      </Link>

      <nav className="px-3 pt-3 pb-5 flex-1">
        {groups.map((g) => (
          <div key={g.title} className="mb-4">
            <p className="sidebar-group-title">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = it.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(it.href);
                return (
                  <Link key={it.href} href={it.href} className={`sidebar-link flex items-center gap-3 px-3 py-2 text-[12px] ${active ? "sidebar-link-active font-semibold" : ""}`}>
                    <Icon name={it.icon} className="w-[17px] h-[17px] shrink-0" strokeWidth={active ? 1.9 : 1.45} />
                    <span className="truncate">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link href="/profile" className="sidebar-footer mx-3 mb-2 p-3.5 flex items-center gap-3 hover:bg-white/[.04] transition">
        <span className="w-8 h-8 rounded-full grid place-items-center bg-white/[.08] border border-white/10 text-white font-display text-[17px] italic">{memberName.charAt(0).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><span className="block text-[7px] uppercase tracking-[.13em] text-white/30">Welcome back</span><span className="block text-[11px] font-semibold text-white/80 truncate mt-0.5">{memberName}</span></span>
        <Icon name="chevron" className="w-3.5 h-3.5 text-white/25" />
      </Link>
      <button onClick={signOut} className="mx-3 mb-4 flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] text-white/42 hover:text-white hover:bg-white/[.05] shrink-0 transition">
        <Icon name="chevron" className="w-[16px] h-[16px] rotate-180" /> Sign out
      </button>
    </aside>
  );
}

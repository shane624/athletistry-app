"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Icon from "@/components/Icon";
import { PRIMARY_NAV, STUDIO_ITEM, ADMIN_ITEM, ADMIN_EMAIL, type NavItem } from "@/lib/nav-items";

// Routes that belong to a primary destination but live at their own path. The
// sidebar highlights the destination they sit under, so someone deep in the
// Practice Generator can still see that they are inside Train.
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
};

function sectionFor(pathname: string): string {
  const hit = Object.keys(SECTION_OF).find((p) => pathname === p || pathname.startsWith(p + "/"));
  return hit ? SECTION_OF[hit] : pathname;
}

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

  const section = sectionFor(pathname);
  const secondary: NavItem[] = [
    ...(showStudio ? [STUDIO_ITEM] : []),
    ...(showAdmin ? [ADMIN_ITEM] : []),
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function renderLink(it: NavItem, quiet = false) {
    const active = section === it.href;
    return (
      <Link
        key={it.href}
        href={it.href}
        aria-current={active ? "page" : undefined}
        className={`sidebar-link flex items-center gap-3 px-3 ${quiet ? "py-1.5 text-[11px]" : "py-2.5 text-[13px]"} ${active ? "sidebar-link-active font-semibold" : ""}`}
      >
        <Icon name={it.icon} className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 1.9 : 1.45} />
        <span className="truncate">{it.label}</span>
      </Link>
    );
  }

  return (
    <aside className="app-sidebar hidden lg:flex flex-col fixed inset-y-0 left-0 w-[17rem] z-30 overflow-y-auto">
      <Link href="/dashboard" className="sidebar-brand flex flex-col items-center justify-center px-5 h-[130px] shrink-0">
        <span className="sidebar-monogram">A</span>
        <span className="sidebar-wordmark">ATHLETISTRY</span>
        <span className="sidebar-mantra">Discipline. Artistry. Forever.</span>
      </Link>

      <nav className="px-3 pt-4 pb-5 flex-1">
        <div className="space-y-1">{PRIMARY_NAV.map((it) => renderLink(it))}</div>

        {secondary.length > 0 && (
          <div className="mt-6">
            <div className="hairline mx-3 mb-3" />
            <div className="space-y-0.5">{secondary.map((it) => renderLink(it, true))}</div>
          </div>
        )}
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

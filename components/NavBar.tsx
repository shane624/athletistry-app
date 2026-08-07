"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import GlobalSearch from "@/components/GlobalSearch";
import BottomTabBar from "@/components/BottomTabBar";
import SideNav from "@/components/SideNav";
import PageTour from "@/components/PageTour";
import { NAV_GROUPS, ADMIN_EMAIL, type NavGroup } from "@/lib/nav-items";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStudio, setShowStudio] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

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
  const current = groups.flatMap((g) => g.items).find((l) => pathname.startsWith(l.href))?.label ?? "Menu";

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <SideNav />
      <header className="app-topbar sticky top-0 z-30 safe-top lg:hidden">
        <div className="px-4">
          <div className="h-[58px] flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="ath-brand-mark !w-8 !h-8 !rounded-[11px] !text-[21px]">A</span>
              <span className="ath-wordmark hidden min-[390px]:block !text-[11px]">ATHLETISTRY</span>
            </Link>

            <span data-tour="menu" className="flex-1 min-w-0 flex justify-end"><GlobalSearch /></span>

            <button
              onClick={() => setOpen((v) => !v)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/60 border border-black/[.06] text-[12px] shrink-0"
              aria-expanded={open}
              aria-label="Open menu"
            >
              <span className="text-ink max-w-[115px] truncate">{current}</span>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" className={`transition-transform ${open ? "rotate-180" : ""}`}>
                <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <>
            <div className="fixed inset-0 z-20 bg-black/10 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
            <div className="absolute left-3 right-3 top-[62px] z-30 bg-white/95 border border-black/[.07] shadow-2xl rounded-[24px] max-h-[78vh] overflow-y-auto backdrop-blur-2xl">
              <nav className="px-3 py-4">
                {groups.map((g) => (
                  <div key={g.title} className="mb-4 last:mb-0">
                    <p className="text-teal text-[9px] font-bold tracking-[.18em] uppercase px-2 mb-1.5">{g.title}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {g.items.map((l) => {
                        const active = l.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.href);
                        return (
                          <Link key={l.href} href={l.href} className={`px-3 py-2.5 rounded-xl text-[13px] transition ${active ? "bg-navy text-white" : "text-ink hover:bg-light"}`}>
                            {l.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="border-t border-black/[.06] mt-2 pt-2 space-y-1">
                  <button onClick={() => { setOpen(false); setTimeout(() => window.dispatchEvent(new Event("athl:start-tour")), 250); }} className="px-3 py-2.5 rounded-xl text-[13px] text-left text-teal hover:bg-light w-full">
                    Show me around this page
                  </button>
                  <button onClick={signOut} className="px-3 py-2.5 rounded-xl text-[13px] text-left text-grey hover:bg-light w-full">Sign out</button>
                </div>
              </nav>
            </div>
          </>
        )}
      </header>
      <PageTour />
      <BottomTabBar />
    </>
  );
}

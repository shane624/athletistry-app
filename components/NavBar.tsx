"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import GlobalSearch from "@/components/GlobalSearch";
import BottomTabBar from "@/components/BottomTabBar";
import SideNav from "@/components/SideNav";
import PageTour from "@/components/PageTour";
import Icon from "@/components/Icon";
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
    supabase.auth.getUser().then(({ data }) => setShowAdmin((data.user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase()));
    supabase.from("studios").select("id").limit(1).then(({ data }) => setShowStudio(!!data?.length));
  }, [supabase]);

  const base: NavGroup[] = showStudio ? NAV_GROUPS : NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => it.href !== "/studio") }));
  const groups: NavGroup[] = showAdmin ? [...base, { title: "Admin", items: [{ href: "/admin", label: "Members", icon: "user" }] }] : base;
  const current = groups.flatMap((g) => g.items).find((l) => l.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.href))?.label ?? "Athletistry";

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
            <Link href="/dashboard" className="mobile-brand shrink-0" aria-label="Athletistry home">A</Link>
            <div className="min-w-0 flex-1 text-center">
              <span className="font-display text-[18px] font-bold text-ink leading-none">{current}</span>
            </div>
            <span data-tour="menu" className="shrink-0"><GlobalSearch compact /></span>
            <button onClick={() => setOpen((v) => !v)} className="mobile-menu-button" aria-expanded={open} aria-label="Open menu">
              <Icon name="dots" className="w-[19px] h-[19px]" />
            </button>
          </div>
        </div>

        {open && (
          <>
            <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <div className="mobile-menu-panel absolute left-3 right-3 top-[62px] z-30 max-h-[79vh] overflow-y-auto">
              <nav className="px-3 py-4">
                {groups.map((g) => (
                  <div key={g.title} className="mb-4 last:mb-0">
                    <p className="text-teal text-[8px] font-bold tracking-[.2em] uppercase px-2 mb-1.5">{g.title}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {g.items.map((l) => {
                        const active = l.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.href);
                        return (
                          <Link key={l.href} href={l.href} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] transition ${active ? "bg-navy text-white" : "text-ink hover:bg-light"}`}>
                            <Icon name={l.icon} className="w-4 h-4" /> {l.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="border-t border-black/[.06] mt-2 pt-2 space-y-1">
                  <button onClick={() => { setOpen(false); setTimeout(() => window.dispatchEvent(new Event("athl:start-tour")), 250); }} className="px-3 py-2.5 rounded-xl text-[12px] text-left text-teal hover:bg-light w-full">Show me around this page</button>
                  <button onClick={signOut} className="px-3 py-2.5 rounded-xl text-[12px] text-left text-grey hover:bg-light w-full">Sign out</button>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import GlobalSearch from "@/components/GlobalSearch";
import BottomTabBar from "@/components/BottomTabBar";
import SideNav from "@/components/SideNav";

type Item = { href: string; label: string };
type Group = { title: string; items: Item[] };

// Grouped menu — tidier than one long flat list.
const GROUPS: Group[] = [
  {
    title: "Train",
    items: [
      { href: "/dashboard", label: "Today" },
      { href: "/programs", label: "Programs" },
      { href: "/generate", label: "Random" },
      { href: "/circuit", label: "Circuit Training" },
      { href: "/ballet", label: "Train for Ballet" },
      { href: "/warmups", label: "Warm-Ups" },
      { href: "/workouts", label: "Guided Workouts" },
      { href: "/my-workouts", label: "My Workouts" },
    ],
  },
  {
    title: "Track",
    items: [
      { href: "/progress", label: "Progress" },
      { href: "/load", label: "Training Calendar" },
      { href: "/plan", label: "Event Planner" },
      { href: "/achievements", label: "Achievements" },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/guide", label: "How to Use the App" },
      { href: "/anatomy", label: "Understand Anatomy" },
      { href: "/training-science", label: "Training Science" },
    ],
  },
  {
    title: "More",
    items: [
      { href: "/exercises", label: "Library" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

const ADMIN_EMAIL = "swuerthner@gmail.com";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setShowAdmin((data.user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase());
    });
  }, [supabase]);

  const groups: Group[] = showAdmin
    ? [...GROUPS, { title: "Admin", items: [{ href: "/admin", label: "Members" }] }]
    : GROUPS;

  // current page label for the menu button
  const allItems = groups.flatMap((g) => g.items);
  const current = allItems.find((l) => pathname.startsWith(l.href))?.label ?? "Menu";

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
    <SideNav />
    <header className="bg-navy text-white sticky top-0 z-30 safe-top">
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-12 flex items-center gap-2">
          <Link href="/dashboard" className="font-bold tracking-widest text-teal text-sm shrink-0 lg:hidden">ATHLETISTRY</Link>

          <GlobalSearch />

          <button
            onClick={() => setOpen((v) => !v)}
            className="hidden sm:flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 text-sm shrink-0 ml-auto"
            aria-expanded={open}
            aria-label="Open menu"
          >
            <span className="text-white/90 max-w-[120px] truncate">{current}</span>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className={`transition-transform ${open ? "rotate-180" : ""}`}>
              <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-30 bg-navy border-t border-white/10 shadow-lg max-h-[80vh] overflow-y-auto">
            <nav className="max-w-4xl mx-auto px-3 py-3">
              {groups.map((g) => (
                <div key={g.title} className="mb-3 last:mb-0">
                  <p className="text-teal text-[10px] font-bold tracking-widest uppercase px-1 mb-1">{g.title}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {g.items.map((l) => (
                      <Link key={l.href} href={l.href}
                        className={`px-3 py-2.5 rounded-md text-sm ${
                          pathname.startsWith(l.href) ? "bg-teal text-white" : "text-white/85 hover:bg-white/10"
                        }`}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-t border-white/10 mt-2 pt-2">
                <button onClick={signOut}
                  className="px-3 py-2.5 rounded-md text-sm text-left text-white/70 hover:bg-white/10 w-full">
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
    <BottomTabBar />
    </>
  );
}

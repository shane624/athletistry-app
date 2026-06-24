"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const links = [
  { href: "/dashboard", label: "Today" },
  { href: "/programs", label: "Programs" },
  { href: "/generate", label: "Random" },
  { href: "/ballet", label: "Train for Ballet" },
  { href: "/my-workouts", label: "My Workouts" },
  { href: "/workouts", label: "Guided" },
  { href: "/warmups", label: "Warm-Ups" },
  { href: "/progress", label: "Progress" },
  { href: "/achievements", label: "Achievements" },
  { href: "/exercises", label: "Library" },
  { href: "/guide", label: "Guide" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  // close the dropdown whenever the route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const current = links.find((l) => pathname.startsWith(l.href))?.label ?? "Menu";

  return (
    <header className="bg-navy text-white sticky top-0 z-30 safe-top">
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-12 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="font-bold tracking-widest text-teal text-sm shrink-0">ATHLETISTRY</Link>

          {/* dropdown menu button — used on every screen size for consistency */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-sm"
            aria-expanded={open}
            aria-label="Open menu"
          >
            <span className="text-white/90">{current}</span>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className={`transition-transform ${open ? "rotate-180" : ""}`}>
              <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* dropdown panel — shown on every screen size */}
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-30 bg-navy border-t border-white/10 shadow-lg">
            <nav className="max-w-4xl mx-auto px-2 py-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href}
                  className={`px-3 py-2.5 rounded-md text-sm ${
                    pathname.startsWith(l.href) ? "bg-teal text-white" : "text-white/85 hover:bg-white/10"
                  }`}>
                  {l.label}
                </Link>
              ))}
              <button onClick={signOut}
                className="px-3 py-2.5 rounded-md text-sm text-left text-white/70 hover:bg-white/10 col-span-2">
                Sign out
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

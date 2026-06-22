"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const links = [
  { href: "/dashboard", label: "Today" },
  { href: "/programs", label: "Programs" },
  { href: "/generate", label: "Random" },
  { href: "/workouts", label: "Guided" },
  { href: "/progress", label: "Progress" },
  { href: "/exercises", label: "Library" },
  { href: "/guide", label: "Guide" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-navy text-white sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* top row: brand + sign out */}
        <div className="h-12 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold tracking-widest text-teal text-sm">ATHLETISTRY</Link>
          <button onClick={signOut} className="text-sm text-white/70 hover:text-white py-2">Sign out</button>
        </div>
        {/* links: scroll horizontally on small screens, never wrap/clip */}
        <nav className="nav-scroll flex items-center gap-1 pb-2 -mt-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm ${
                pathname.startsWith(l.href) ? "bg-white/15 text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

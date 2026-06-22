"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const links = [
  { href: "/dashboard", label: "Today" },
  { href: "/progress", label: "Progress" },
  { href: "/exercises", label: "Library" },
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
    <header className="bg-navy text-white">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold tracking-widest text-teal">ATHLETISTRY</Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm ${
                pathname.startsWith(l.href) ? "bg-white/15 text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={signOut} className="ml-2 text-sm text-white/70 hover:text-white">Sign out</button>
        </nav>
      </div>
    </header>
  );
}

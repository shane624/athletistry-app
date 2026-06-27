"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import Icon from "@/components/Icon";
import { NAV_GROUPS, ADMIN_EMAIL, type NavGroup } from "@/lib/nav-items";

// Persistent desktop sidebar (lg+ only). Light surface, grouped icon nav with
// an active highlight. Mobile uses the bottom tab bar instead, so this is
// hidden below lg.
export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setShowAdmin((data.user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase());
    });
  }, [supabase]);

  const groups: NavGroup[] = showAdmin
    ? [...NAV_GROUPS, { title: "Admin", items: [{ href: "/admin", label: "Members", icon: "user" }] }]
    : NAV_GROUPS;

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 z-30 border-r overflow-y-auto"
      style={{ background: "var(--c-surface)", borderColor: "var(--c-line)" }}
    >
      <Link href="/dashboard" className="flex items-center gap-2 px-5 h-14 shrink-0">
        <span className="w-7 h-7 rounded-lg grad-navy flex items-center justify-center text-white">
          <Icon name="sparkle" className="w-4 h-4" />
        </span>
        <span className="font-bold tracking-widest text-teal text-sm">ATHLETISTRY</span>
      </Link>

      <nav className="px-3 pb-4 flex-1">
        {groups.map((g) => (
          <div key={g.title} className="mb-4">
            <p className="px-3 mb-1 text-[10px] font-bold tracking-widest uppercase text-grey">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = it.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      active ? "bg-light text-tealdark font-semibold" : "text-grey hover:bg-light hover:text-navy"
                    }`}
                  >
                    <Icon name={it.icon} className="w-5 h-5 shrink-0" strokeWidth={active ? 2.1 : 1.8} />
                    <span className="truncate">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={signOut}
        className="m-3 mt-0 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-grey hover:bg-light shrink-0"
      >
        <Icon name="chevron" className="w-5 h-5 rotate-180" />
        Sign out
      </button>
    </aside>
  );
}

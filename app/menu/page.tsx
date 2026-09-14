import NavBar from "@/components/NavBar";
import Link from "next/link";
import Icon from "@/components/Icon";
import { NAV_GROUPS } from "@/lib/nav-items";

export const dynamic = "force-dynamic";

// Every route in one list. The five primary destinations carry the app; this
// page exists so nothing is ever unreachable, and it reads from the same nav
// model the sidebar uses so the two cannot drift apart.
export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-compact">
        <header className="page-lead animate-in">
          <div>
            <p className="eyebrow">Everything in the app</p>
            <h1>All sections.</h1>
          </div>
        </header>
        <div className="page-lead-rule" />

        <div className="mt-7 space-y-7 stagger">
          {NAV_GROUPS.map((g) => (
            <section key={g.title}>
              <p className="eyebrow mb-2.5">{g.title}</p>
              <div className="panel overflow-hidden">
                {g.items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0 hover:bg-rowalt transition-colors"
                  >
                    <span className="settings-icon shrink-0">
                      <Icon name={it.icon} className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0 text-ink text-[12px] font-semibold truncate">{it.label}</span>
                    <Icon name="chevron" className="w-3.5 h-3.5 text-grey shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

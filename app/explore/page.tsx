import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Icon, { type IconName } from "@/components/Icon";
import SaveButton from "@/components/SaveButton";
import Link from "next/link";
import { PROGRAMS } from "@/lib/programs";
import { getSaved, getSavedKeys } from "@/lib/saved-data";

export const dynamic = "force-dynamic";

// Goal tiles — the main entry points, browsable at a glance.
const TILES: { href: string; label: string; icon: IconName; grad: string }[] = [
  { href: "/movement-map", label: "Movement Map", icon: "target", grad: "linear-gradient(135deg,#1f2a44,#27ae9f)" },
  { href: "/programs", label: "Programs", icon: "stack", grad: "linear-gradient(135deg,#1f2a44,#3a4a6b)" },
  { href: "/plan", label: "Plan for an event", icon: "target", grad: "linear-gradient(135deg,#1f2a44,#27ae9f)" },
  { href: "/generate", label: "Practice Generator", icon: "bolt", grad: "linear-gradient(135deg,#3a4a6b,#27ae9f)" },
  { href: "/circuit", label: "Circuit Training", icon: "circuit", grad: "linear-gradient(135deg,#2bb3a2,#1f8b7f)" },
  { href: "/ballet", label: "Train for Ballet", icon: "ballet", grad: "linear-gradient(135deg,#3a4a6b,#27ae9f)" },
  { href: "/warmups", label: "Warm-Ups", icon: "warmup", grad: "linear-gradient(135deg,#1f8b7f,#27ae9f)" },
];

function programLook(id: string): { grad: string; icon: IconName } {
  if (id.includes("practice")) return { grad: "linear-gradient(135deg,#1f2a44,#27ae9f)", icon: "sparkle" };
  if (id.includes("ballet")) return { grad: "linear-gradient(135deg,#3a4a6b,#27ae9f)", icon: "ballet" };
  if (id.includes("kids")) return { grad: "linear-gradient(135deg,#2bb3a2,#1f8b7f)", icon: "heart" };
  return { grad: "linear-gradient(135deg,#1f2a44,#3a4a6b)", icon: "stack" };
}

export default async function ExplorePage() {
  const savedKeys = await getSavedKeys();
  const saved = await getSaved();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <PageHeader icon="grid" eyebrow="Discover" title="Explore"
          subtitle="Browse everything Athletistry can do — and save anything to come back to." />

        {/* where do I start — a clear default path for anyone unsure */}
        <Link href="/programs" className="card card-hover block p-4 mt-5 border-l-2 border-teal">
          <p className="eyebrow">New here?</p>
          <p className="text-navy text-sm font-semibold mt-0.5">Not sure where to start? Begin with a program.</p>
          <p className="text-grey text-xs mt-1">Pick a ready-made plan and the app guides you day by day. You can switch any time.</p>
          <span className="text-teal text-sm mt-2 font-semibold inline-flex items-center gap-1">Choose a program<Icon name="chevron" className="w-4 h-4" /></span>
        </Link>

        {/* goal tiles */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href}
              className="relative h-28 rounded-2xl overflow-hidden flex items-end p-4 active:scale-[.98] transition"
              style={{ background: t.grad }}>
              <span className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <Icon name={t.icon} className="w-5 h-5" />
              </span>
              <span className="text-white font-bold leading-tight">{t.label}</span>
            </Link>
          ))}
        </div>

        {/* saved */}
        {saved.length === 0 && (
          <div className="card p-4 mt-8 bg-light">
            <p className="eyebrow">Saved</p>
            <p className="text-grey text-sm mt-1">Tap the bookmark on any program to save it here for quick access later.</p>
          </div>
        )}
        {saved.length > 0 && (
          <>
            <p className="eyebrow mt-8 mb-3">Saved</p>
            <div className="card divide-y divide-line overflow-hidden">
              {saved.map((s) => (
                <div key={s.itemKey} className="flex items-center gap-3 px-4 py-3">
                  <Link href={s.href} className="flex-1 min-w-0">
                    <span className="block text-navy text-sm font-semibold truncate">{s.title}</span>
                    {s.subtitle && <span className="block text-grey text-xs truncate">{s.subtitle}</span>}
                  </Link>
                  <SaveButton itemKey={s.itemKey} title={s.title} subtitle={s.subtitle ?? undefined}
                    href={s.href} kind={s.kind} initialSaved className="!bg-teal !text-white shrink-0" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* browse programs */}
        <p className="eyebrow mt-8 mb-3">Browse programs</p>
        <div className="grid md:grid-cols-2 gap-4">
          {PROGRAMS.map((p) => {
            const look = programLook(p.id);
            const key = `program:${p.id}`;
            return (
              <div key={p.id} className="card overflow-hidden p-0">
                <div className="relative h-24 flex items-center px-5" style={{ background: look.grad }}>
                  <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                    <Icon name={look.icon} className="w-6 h-6" />
                  </span>
                  <h3 className="text-white font-bold text-lg ml-3">{p.name}</h3>
                  <div className="absolute top-3 right-3">
                    <SaveButton itemKey={key} title={p.name} subtitle="Program" href="/programs"
                      kind="program" initialSaved={savedKeys.has(key)} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-grey text-sm">{p.tagline}</p>
                  <Link href="/programs" className="text-teal text-sm mt-3 font-semibold inline-flex items-center gap-1">
                    Open<Icon name="chevron" className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

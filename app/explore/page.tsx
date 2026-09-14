import NavBar from "@/components/NavBar";
import Icon, { type IconName } from "@/components/Icon";
import SaveButton from "@/components/SaveButton";
import Link from "next/link";
import { PROGRAMS } from "@/lib/programs";
import { getSaved, getSavedKeys } from "@/lib/saved-data";

export const dynamic = "force-dynamic";

const TILES: { href: string; label: string; note: string; icon: IconName }[] = [
  { href: "/programs", label: "Programs", note: "A structured path with a next session already chosen for you.", icon: "stack" },
  { href: "/workouts", label: "Guided Workouts", note: "Press play and follow a full session start to finish.", icon: "play" },
  { href: "/warmups", label: "Warm-Ups", note: "Ten minutes before class, targeted at what you are about to do.", icon: "warmup" },
  { href: "/circuit", label: "Circuit Training", note: "Timed work and rest when conditioning is the point.", icon: "circuit" },
  { href: "/ballet", label: "Train for Ballet", note: "Pick the step you want to improve and work backwards from it.", icon: "ballet" },
  { href: "/movement-map", label: "Movement Map", note: "Find the pattern behind the correction you keep getting.", icon: "target" },
  { href: "/plan", label: "Training Plan Builder", note: "Dated plan that climbs to your performance, then tapers.", icon: "calendar" },
  { href: "/generate", label: "Practice Generator", note: "A balanced legs, push, pull and core session for today.", icon: "bolt" },
  { href: "/my-workouts", label: "My Workouts", note: "The sessions you built and saved yourself.", icon: "grid" },
  { href: "/exercises", label: "Exercise Library", note: "Every exercise with video, searchable by level and category.", icon: "library" },
];

export default async function ExplorePage() {
  const [savedKeys, saved] = await Promise.all([getSavedKeys(), getSaved()]);
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page">
        <header className="page-lead animate-in"><div><h1>Train</h1><p className="mt-3">Everything that gives you something to do today, in one place.</p></div></header>

        <Link href="/programs" className="program-feature !min-h-[280px] block animate-in">
          <div className="relative z-[1] max-w-[720px]"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/48">Not sure where to begin?</p><h2 className="font-display text-[clamp(3rem,7vw,5.7rem)] leading-[.88] font-bold mt-3">Start with a path,<br />not another correction.</h2><p className="text-white/58 text-[11px] leading-relaxed max-w-lg mt-5">Choose a program and let the app tell you what comes next. You can still explore everything else without losing the thread.</p><span className="hero-cta !min-h-[44px] !text-[11px] mt-6">Choose a program <Icon name="chevron" className="w-4 h-4" /></span></div>
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap mt-9 mb-3"><div><p className="eyebrow">What do you need?</p><h2 className="font-display text-[34px] leading-none font-bold text-ink mt-1">Choose the question.</h2></div></div>
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
          {TILES.map((t, i) => <Link key={t.href} href={t.href} className={`program-tool-card card-hover block ${i === 0 ? "lg:col-span-2" : ""}`}><span className="w-9 h-9 rounded-full grid place-items-center bg-bluewash text-teal"><Icon name={t.icon} className="w-4 h-4" /></span><h3 className="font-display text-[24px] leading-none font-bold text-ink mt-5">{t.label}</h3><p className="text-grey text-[10px] leading-relaxed mt-2">{t.note}</p><span className="text-teal text-[9px] font-bold inline-flex items-center gap-1 mt-4">Open <Icon name="chevron" className="w-3 h-3" /></span></Link>)}
        </section>

        {saved.length > 0 && <section className="mt-9"><div className="flex items-end justify-between gap-4 mb-3"><div><p className="eyebrow">Saved</p><h2 className="font-display text-[31px] leading-none font-bold text-ink mt-1">Come back to these.</h2></div></div><div className="panel overflow-hidden">{saved.map((s) => <div key={s.itemKey} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0"><Link href={s.href} className="flex-1 min-w-0"><span className="block text-ink text-[11px] font-semibold truncate">{s.title}</span>{s.subtitle && <span className="block text-grey text-[9px] truncate mt-0.5">{s.subtitle}</span>}</Link><SaveButton itemKey={s.itemKey} title={s.title} subtitle={s.subtitle ?? undefined} href={s.href} kind={s.kind} initialSaved className="!bg-teal !text-white shrink-0" /></div>)}</div></section>}

        <section className="mt-9"><div className="flex items-end justify-between gap-4 mb-3"><div><p className="eyebrow">Program library</p><h2 className="font-display text-[31px] leading-none font-bold text-ink mt-1">Browse every program.</h2></div></div><div className="program-cover-grid">{PROGRAMS.map((p) => { const key=`program:${p.id}`; return <div key={p.id} className="program-cover"><div className="relative z-[2] flex justify-end"><SaveButton itemKey={key} title={p.name} subtitle="Program" href="/programs" kind="program" initialSaved={savedKeys.has(key)} /></div><div className="program-cover-bottom"><p className="text-[8px] uppercase tracking-[.14em] text-white/45">Program</p><h3 className="font-display text-[27px] leading-none font-bold text-white mt-2">{p.name}</h3><p className="text-white/48 text-[9px] leading-relaxed mt-2 line-clamp-2">{p.tagline}</p><Link href="/programs" className="text-[#82abea] text-[9px] font-bold inline-flex items-center gap-1 mt-3">Open <Icon name="chevron" className="w-3 h-3" /></Link></div></div>; })}</div></section>
      </main>
    </div>
  );
}

import NavBar from "@/components/NavBar";
import AnatomyModuleCard from "@/components/AnatomyModuleCard";
import ProgressRing from "@/components/ProgressRing";
import Icon from "@/components/Icon";
import Link from "next/link";
import { ANATOMY_MODULES } from "@/lib/anatomy";
import { getAnatomyProgress } from "@/lib/anatomy-data";
import SectionTabs from "@/components/SectionTabs";
import { LEARN_TOOLS } from "@/lib/nav-items";

export const dynamic = "force-dynamic";

export default async function AnatomyPage() {
  const passed = await getAnatomyProgress();
  const total = ANATOMY_MODULES.length;
  const done = ANATOMY_MODULES.filter((_, i) => passed.has(i)).length;
  const pct = Math.round((done / Math.max(total, 1)) * 100);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <header className="page-lead animate-in">
          <div><h1>Understand Anatomy</h1><p className="mt-3">Learn what the body is doing, why the movement works, and how to train it without forcing.</p></div>
        </header>

        <SectionTabs items={LEARN_TOOLS} label="Learn sections" />


        <section className="anatomy-hero animate-in">
          <div className="relative z-[1]">
            <p className="text-[9px] uppercase tracking-[.2em] font-bold text-white/48">Anatomy for dancers</p>
            <h2 className="font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[.9] font-bold mt-3">The body,<br />made legible.</h2>
            <p className="text-[11px] leading-relaxed text-white/58 max-w-lg mt-5">Each module connects anatomy to biomechanics, ballet technique, and functional strength so the information immediately changes how you train.</p>
            <div className="flex items-center gap-4 mt-6"><ProgressRing value={pct} size={92} /><div><p className="text-white text-[12px] font-semibold">{done} of {total} modules passed</p><p className="text-white/42 text-[9px] mt-1">Complete every module to earn Anatomy Scholar.</p></div></div>
          </div>
          <div className="anatomy-figure" aria-hidden="true" />
        </section>

        <section className="grid md:grid-cols-3 gap-3 mt-3">
          <div className="panel panel-pad"><Icon name="body" className="w-5 h-5 text-teal" /><p className="font-display text-[22px] font-bold leading-none text-ink mt-4">Anatomy</p><p className="text-grey text-[10px] leading-relaxed mt-2">Which structures create, guide, and limit the movement.</p></div>
          <div className="panel panel-pad"><Icon name="ballet" className="w-5 h-5 text-teal" /><p className="font-display text-[22px] font-bold leading-none text-ink mt-4">Ballet</p><p className="text-grey text-[10px] leading-relaxed mt-2">Where those structures show up in the technique you already practise.</p></div>
          <div className="panel panel-pad"><Icon name="dumbbell" className="w-5 h-5 text-teal" /><p className="font-display text-[22px] font-bold leading-none text-ink mt-4">Training</p><p className="text-grey text-[10px] leading-relaxed mt-2">How to build strength and control that transfer back into dancing.</p></div>
        </section>

        <div className="flex items-end justify-between gap-4 flex-wrap mt-9 mb-3">
          <div><p className="eyebrow">The course</p><h2 className="font-display text-[34px] leading-none font-bold text-ink mt-1">Study by region.</h2></div>
          <Link href="/achievements" className="text-teal text-[10px] font-semibold">See anatomy badges →</Link>
        </div>

        <section className="anatomy-course-grid stagger">
          {ANATOMY_MODULES.map((m, i) => <AnatomyModuleCard key={m.region} module={m} index={i} passed={passed.has(i)} defaultOpen={done === 0 && i === 0} />)}
        </section>

        <footer className="mt-10 text-center"><p className="font-display text-[25px] font-bold text-ink">Train smarter. Dance stronger.</p><p className="text-grey text-[10px] mt-1">Practice for many years.</p></footer>
      </main>
    </div>
  );
}

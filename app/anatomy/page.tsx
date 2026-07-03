import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import AnatomyModuleCard from "@/components/AnatomyModuleCard";
import Link from "next/link";
import { ANATOMY_MODULES } from "@/lib/anatomy";
import { getAnatomyProgress } from "@/lib/anatomy-data";

export const dynamic = "force-dynamic";

export default async function AnatomyPage() {
  const passed = await getAnatomyProgress();
  const total = ANATOMY_MODULES.length;
  const done = ANATOMY_MODULES.filter((_, i) => passed.has(i)).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="body" eyebrow="Strength for dancers" title="Understand Anatomy"
          subtitle="A region-by-region study of the dancer's body. Read a module, pass its quick quiz, and earn Anatomy badges." />

        {/* progress toward completing the course */}
        <div className="card p-4 mt-5 animate-in">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Your progress</p>
            <Link href="/achievements" className="text-teal text-xs font-semibold">See badges →</Link>
          </div>
          <p className="text-navy text-sm font-semibold mt-1">{done} of {total} modules passed</p>
          <div className="h-2 rounded-full bg-line overflow-hidden mt-2">
            <div className="h-full bg-teal rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-grey text-xs mt-2">
            {done === 0 ? "Open a module below, read the four lessons, then take the quick quiz."
              : done === total ? "Course complete — you've earned the Anatomy Scholar badge. Bravo."
              : "Keep going — pass every module to earn the Anatomy Scholar badge."}
          </p>
        </div>

        {/* how to read it */}
        <div className="card mt-4 p-4 border-l-2 border-teal animate-in">
          <p className="eyebrow">How it works</p>
          <p className="text-ink text-sm mt-2 leading-relaxed">
            Each module follows the same rhythm: the anatomy, the biomechanics, the ballet you already dance, and the
            functional strength that trains it. Tap a module to open it, then answer its two-question check to mark it passed.
            Module 1 sets the language, so it&apos;s best read in order.
          </p>
        </div>

        {/* modules — collapsible */}
        <p className="eyebrow mt-8 mb-3">The course</p>
        <div className="space-y-2">
          {ANATOMY_MODULES.map((m, i) => (
            <AnatomyModuleCard key={m.region} module={m} index={i} passed={passed.has(i)} defaultOpen={done === 0 && i === 0} />
          ))}
        </div>

        <p className="text-grey text-sm mt-10 mb-2 text-center">
          Train smarter. Dance stronger. Practice for many years.
        </p>
      </main>
    </div>
  );
}

import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import { ANATOMY_MODULES } from "@/lib/anatomy";

export const dynamic = "force-dynamic";

export default function AnatomyPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="body" eyebrow="Strength for dancers" title="Understand Anatomy"
          subtitle="The Dancer's Body — a region-by-region study of anatomy, biomechanics, and the ballet you already dance." />

        <div className="flex gap-6 mt-5 animate-in">
          <Stat n="10" label="Modules" />
          <Stat n="4" label="Lessons each" />
          <Stat n="8" label="Movement patterns" />
        </div>

        {/* how to read it */}
        <div className="card mt-6 p-4 border-l-2 border-teal animate-in">
          <p className="eyebrow">How to read this</p>
          <p className="text-ink text-sm mt-2 leading-relaxed">
            Every module follows the same rhythm: <b>the anatomy</b> (what&apos;s there), <b>the
            biomechanics</b> (how it moves), <b>the ballet</b> (where you already use it), and <b>the
            functional strength</b> (how you train it). Module 1 hands you the language — everything
            after assumes you have it, so it&apos;s best read in order.
          </p>
        </div>

        {/* course map */}
        <p className="eyebrow mt-8 mb-3">The course map</p>
        <div className="space-y-1.5">
          {ANATOMY_MODULES.map((m, i) => (
            <a key={m.region} href={`#m${i + 1}`} className="card card-hover flex items-center gap-3 p-3">
              <span className="w-8 h-8 rounded-full grad-brand text-white text-sm font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-navy text-sm">{m.region}</span>
                <span className="block text-grey text-xs truncate">{m.chips.slice(0, 4).join(" · ")}</span>
              </span>
              <span className="text-teal text-xs shrink-0">{m.g8}</span>
            </a>
          ))}
        </div>

        {/* modules */}
        {ANATOMY_MODULES.map((m, i) => (
          <section key={m.region} id={`m${i + 1}`} className="mt-10 scroll-mt-20 animate-in">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full grad-navy text-white text-base font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <p className="eyebrow">Module {String(i + 1).padStart(2, "0")}</p>
                <h2 className="text-2xl font-extrabold text-navy leading-tight">{m.region}</h2>
              </div>
            </div>
            <p className="text-grey text-sm mt-3 leading-relaxed">{m.essence}</p>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Lesson n="01" title="The anatomy" html={m.anatomy} />
              <Lesson n="02" title="The biomechanics" html={m.biomech} />
              <Lesson n="03" title="The ballet" html={m.ballet} chips={m.chips} />
              <FnLesson title={m.fnTitle} g8={m.g8} lead={m.fnLead} ex={m.ex} />
            </div>
          </section>
        ))}

        <p className="text-grey text-sm mt-10 mb-2 text-center">
          Train smarter. Dance stronger. Practice for many years.
        </p>
      </main>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-teal text-2xl font-extrabold">{n}</div>
      <div className="text-grey text-[11px] uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Lesson({ n, title, html, chips }: { n: string; title: string; html: string; chips?: string[] }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-semibold tracking-wide text-grey uppercase">
        <span className="text-teal">{n}</span> · {title}
      </p>
      <p className="text-ink text-sm leading-relaxed mt-2 [&_b]:text-tealdark [&_b]:font-semibold"
         dangerouslySetInnerHTML={{ __html: html }} />
      {chips && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chips.map((c) => (
            <span key={c} className="text-[11px] text-grey border border-line rounded-full px-2.5 py-1 italic">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function FnLesson({ title, g8, lead, ex }: { title: string; g8: string; lead: string; ex: string[] }) {
  return (
    <div className="card p-4 border-2 border-teal bg-light">
      <p className="text-[11px] font-semibold tracking-wide text-grey uppercase">
        <span className="text-teal">04</span> · {title}
      </p>
      <span className="inline-block mt-2 badge bg-teal text-white text-[11px]">Great 8 · {g8}</span>
      <p className="text-ink text-sm leading-relaxed mt-2">{lead}</p>
      <ul className="mt-2 space-y-1.5">
        {ex.map((e, i) => (
          <li key={i} className="text-ink text-sm leading-snug flex gap-2 [&_b]:text-tealdark [&_b]:font-semibold">
            <span className="text-teal shrink-0">▸</span>
            <span dangerouslySetInnerHTML={{ __html: e }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

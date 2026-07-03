"use client";

import { useState } from "react";
import type { AnatomyModule } from "@/lib/anatomy";
import AnatomyQuiz from "@/components/AnatomyQuiz";

// One collapsible anatomy module: tap the header to open its four lessons and a
// quick quiz. Keeps the page a tidy list instead of an endless scroll.
export default function AnatomyModuleCard({
  module: m, index, passed, defaultOpen = false,
}: {
  module: AnatomyModule; index: number; passed: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div id={`m${index + 1}`} className="card overflow-hidden scroll-mt-20">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 p-4 text-left">
        <span className={`w-9 h-9 rounded-full text-white text-base font-extrabold flex items-center justify-center shrink-0 ${passed ? "bg-teal" : "grad-navy"}`}>
          {passed ? "✓" : index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold tracking-wide text-grey uppercase">
            Module {String(index + 1).padStart(2, "0")}{passed ? " · passed" : ""}
          </span>
          <span className="block font-extrabold text-navy leading-tight">{m.region}</span>
          <span className="block text-grey text-xs mt-0.5 truncate">{m.chips.slice(0, 4).join(" · ")}</span>
        </span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={`shrink-0 text-grey transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 -mt-1">
          <p className="text-grey text-sm leading-relaxed">{m.essence}</p>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Lesson n="01" title="The anatomy" html={m.anatomy} />
            <Lesson n="02" title="The biomechanics" html={m.biomech} />
            <Lesson n="03" title="The ballet" html={m.ballet} chips={m.chips} />
            <FnLesson title={m.fnTitle} g8={m.g8} lead={m.fnLead} ex={m.ex} />
          </div>

          <p className="eyebrow mt-5 mb-2">Test yourself</p>
          <AnatomyQuiz moduleIndex={index} passed={passed} />
        </div>
      )}
    </div>
  );
}

function Lesson({ n, title, html, chips }: { n: string; title: string; html: string; chips?: string[] }) {
  return (
    <div className="rounded-xl border border-line p-4">
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
    <div className="rounded-xl border-2 border-teal bg-light p-4">
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

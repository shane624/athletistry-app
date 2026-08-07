"use client";

import { useState } from "react";
import type { AnatomyModule } from "@/lib/anatomy";
import AnatomyQuiz from "@/components/AnatomyQuiz";
import Icon from "@/components/Icon";

export default function AnatomyModuleCard({ module: m, index, passed, defaultOpen = false }: { module: AnatomyModule; index: number; passed: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article id={`m${index + 1}`} className={`panel overflow-hidden scroll-mt-24 ${open ? "md:col-span-2" : ""}`}>
      <button onClick={() => setOpen((v) => !v)} className="w-full min-h-[132px] flex items-start gap-4 p-4 text-left">
        <span className={`w-10 h-10 rounded-full grid place-items-center shrink-0 text-[11px] font-bold ${passed ? "bg-teal text-white" : "bg-light text-grey"}`}>{passed ? <Icon name="check" className="w-4 h-4" /> : String(index + 1).padStart(2,"0")}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[8px] font-bold tracking-[.15em] uppercase text-grey">Module {String(index + 1).padStart(2,"0")}{passed ? " · passed" : ""}</span>
          <span className="block font-display text-[26px] leading-none font-bold text-ink mt-2">{m.region}</span>
          <span className="block text-grey text-[9px] leading-relaxed mt-2 line-clamp-2">{m.essence}</span>
        </span>
        <span className={`mt-1 text-grey transition-transform ${open ? "rotate-90" : ""}`}><Icon name="chevron" className="w-4 h-4" /></span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-black/[.06]">
          <div className="grid sm:grid-cols-2 gap-2 mt-4">
            <Lesson n="01" title="The anatomy" html={m.anatomy} />
            <Lesson n="02" title="The biomechanics" html={m.biomech} />
            <Lesson n="03" title="The ballet" html={m.ballet} chips={m.chips} />
            <FnLesson title={m.fnTitle} g8={m.g8} lead={m.fnLead} ex={m.ex} />
          </div>
          <div className="mt-4 pt-4 border-t border-line"><p className="eyebrow mb-2">Test yourself</p><AnatomyQuiz moduleIndex={index} passed={passed} /></div>
        </div>
      )}
    </article>
  );
}

function Lesson({ n, title, html, chips }: { n: string; title: string; html: string; chips?: string[] }) {
  return <div className="rounded-[13px] border border-line bg-white/28 p-4"><p className="text-[8px] font-bold tracking-[.13em] text-grey uppercase"><span className="text-teal">{n}</span> · {title}</p><p className="text-ink text-[11px] leading-relaxed mt-2 [&_b]:text-tealdark [&_b]:font-semibold" dangerouslySetInnerHTML={{ __html: html }} />{chips && <div className="flex flex-wrap gap-1 mt-3">{chips.map((c) => <span key={c} className="text-[8px] text-grey border border-line rounded-full px-2 py-1">{c}</span>)}</div>}</div>;
}

function FnLesson({ title, g8, lead, ex }: { title: string; g8: string; lead: string; ex: string[] }) {
  return <div className="rounded-[13px] border border-teal/25 bg-bluewash p-4"><p className="text-[8px] font-bold tracking-[.13em] text-grey uppercase"><span className="text-teal">04</span> · {title}</p><span className="inline-block mt-2 rounded-full bg-teal px-2.5 py-1 text-[8px] font-bold text-white">Great 8 · {g8}</span><p className="text-ink text-[11px] leading-relaxed mt-2">{lead}</p><ul className="mt-2 space-y-1.5">{ex.map((e, i) => <li key={i} className="text-ink text-[10px] leading-snug flex gap-2 [&_b]:text-tealdark [&_b]:font-semibold"><span className="text-teal shrink-0">▸</span><span dangerouslySetInnerHTML={{ __html: e }} /></li>)}</ul></div>;
}

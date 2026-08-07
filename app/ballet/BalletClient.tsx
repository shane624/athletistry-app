"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateBalletWorkout, saveCustomDay, setActiveProgram, markOnboarded } from "@/lib/data";
import { BALLET_MOVES } from "@/lib/ballet";
import { EQUIPMENT_LABEL, type Equipment } from "@/lib/equipment";
import type { ExerciseRow } from "@/lib/types";
import ExerciseVideo from "@/components/ExerciseVideo";
import Icon from "@/components/Icon";
import Dots from "@/components/Dots";

const LEVELS = [{ v: 1, label: "Beginner" }, { v: 2, label: "Intermediate" }, { v: 3, label: "Advanced" }, { v: 4, label: "All levels" }];
const EQUIP: Equipment[] = ["band", "dumbbell", "barbell", "slant_board", "step", "partner"];

export default function BalletClient() {
  const router = useRouter();
  const [slug, setSlug] = useState(BALLET_MOVES[0].slug);
  const [maxLevel, setMaxLevel] = useState(4);
  useEffect(() => { const m = new URLSearchParams(window.location.search).get("move"); if (m && BALLET_MOVES.some((x) => x.slug === m)) setSlug(m); }, []);
  const [equipOpen, setEquipOpen] = useState(false);
  const [equip, setEquip] = useState<Set<Equipment>>(new Set());
  const [result, setResult] = useState<{ move: string; focus: string; exercises: ExerciseRow[] } | null>(null);
  const [busy, setBusy] = useState(true);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const move = BALLET_MOVES.find((m) => m.slug === slug)!;

  const build = useCallback(async () => {
    setBusy(true); setSavedMsg(null);
    const w = await generateBalletWorkout(slug, { maxLevel, equipment: equip.size ? [...equip] : undefined });
    setResult(w); setBusy(false);
  }, [slug, maxLevel, equip]);
  useEffect(() => { build(); }, [build]);

  function toggleEquip(e: Equipment) { setEquip((prev) => { const next = new Set(prev); next.has(e) ? next.delete(e) : next.add(e); return next; }); }

  async function useAsRoutine() {
    if (!result?.exercises.length) return;
    setBusy(true);
    const r = await saveCustomDay(0, result.exercises.map((e) => e.id));
    if (r.ok) { await setActiveProgram("custom"); await markOnboarded(); setSavedMsg("Loading your workout…"); router.push("/dashboard"); router.refresh(); }
    else { setSavedMsg("Couldn't load that. Try again."); setBusy(false); }
  }

  return (
    <div className="mt-7">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-3"><div><p className="eyebrow">Start with the movement</p><h2 className="font-display text-[32px] leading-none font-bold text-ink mt-1">What do you want to improve?</h2></div></div>
      <div data-tour="move" className="grid grid-cols-2 sm:grid-cols-4 gap-2 stagger">
        {BALLET_MOVES.map((m, i) => <button key={m.slug} onClick={() => { setSlug(m.slug); setSavedMsg(null); }} className={`min-h-[112px] text-left rounded-[15px] p-4 border transition relative overflow-hidden ${slug === m.slug ? "bg-navy text-white border-navy shadow-lg" : "panel text-ink hover:border-teal/35"}`}><span className={`text-[8px] uppercase tracking-[.15em] ${slug === m.slug ? "text-white/45" : "text-grey"}`}>Movement {String(i+1).padStart(2,"0")}</span><span className="block font-display text-[23px] leading-none font-bold mt-4">{m.name}</span>{slug === m.slug && <span className="absolute right-3 bottom-2 font-display italic text-[48px] text-white/[.05]">A</span>}</button>)}
      </div>

      <section data-tour="ballet-filters" className="panel panel-pad mt-3 animate-in">
        <div className="flex flex-wrap gap-x-8 gap-y-4 items-end justify-between">
          <div><p className="panel-title">Training level</p><div className="flex gap-1.5 mt-2 flex-wrap">{LEVELS.map((l) => <button key={l.v} onClick={() => setMaxLevel(l.v)} className={`rounded-full px-3 py-1.5 text-[10px] border transition ${maxLevel === l.v ? "bg-navy text-white border-navy" : "bg-white/35 text-grey border-line"}`}>{l.label}</button>)}</div></div>
          <button onClick={() => setEquipOpen((v) => !v)} className="text-[10px] text-teal font-semibold inline-flex items-center gap-1"><Icon name="dumbbell" className="w-3.5 h-3.5" /> {equip.size ? `${equip.size} equipment filters` : "Filter equipment"} {equipOpen ? "↑" : "↓"}</button>
        </div>
        {equipOpen && <div className="mt-4 pt-4 border-t border-line"><p className="text-[9px] text-grey">Select what you have available. Leave empty to see everything.</p><div className="flex flex-wrap gap-1.5 mt-3">{EQUIP.map((e) => <button key={e} onClick={() => toggleEquip(e)} className={`rounded-full px-3 py-1.5 text-[9px] border ${equip.has(e) ? "bg-teal text-white border-teal" : "bg-transparent border-line text-grey"}`}>{EQUIPMENT_LABEL[e]}</button>)}</div>{equip.size > 0 && <button className="text-teal text-[9px] mt-3 font-semibold" onClick={() => setEquip(new Set())}>Clear equipment</button>}</div>}
      </section>

      <section className="program-feature !min-h-[240px] mt-3 animate-in">
        <div className="relative z-[1] max-w-2xl"><p className="text-[8px] font-bold uppercase tracking-[.18em] text-white/48">{move.name} · what to build</p><h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[.9] font-bold mt-3">Train the qualities behind the step.</h2><p className="text-white/58 text-[11px] leading-relaxed mt-4 max-w-xl">{move.why}</p></div>
      </section>

      <div className="flex items-end justify-between gap-4 flex-wrap mt-8 mb-3"><div><p className="eyebrow">Your generated practice</p><h2 className="font-display text-[32px] leading-none font-bold text-ink mt-1">{busy ? "Building…" : `${move.name} · ${result?.exercises.length ?? 0} exercises`}</h2></div>{result?.exercises.length && !busy ? <button className="btn-primary !min-h-[40px] !px-4 !text-[10px]" onClick={useAsRoutine}>Use as today&apos;s workout <Icon name="chevron" className="w-3.5 h-3.5 ml-1" /></button> : null}</div>
      {savedMsg && <p className="text-grey text-[10px] mb-3">{savedMsg}</p>}

      {busy ? <div className="panel py-14 flex justify-center text-navy"><Dots /></div> : result?.exercises.length ? <div className="grid sm:grid-cols-2 gap-3 stagger">{result.exercises.map((ex) => <div key={ex.id} className="panel overflow-hidden animate-in">{openVid === ex.id ? <div className="p-3"><ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} /></div> : ex.youtube_id ? <button onClick={() => setOpenVid(ex.id)} className="relative aspect-video w-full overflow-hidden bg-black"><img src={`https://i.ytimg.com/vi/${ex.youtube_id}/hqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-70 grayscale-[.2]" /><span className="workout-play"><Icon name="play" className="w-5 h-5" /></span></button> : null}<div className="p-4"><p className="font-display text-[24px] leading-none font-bold text-ink">{ex.name}</p><p className="text-[9px] text-grey mt-2">Level {ex.level} · {ex.category}</p>{openVid !== ex.id && <button className="text-teal text-[9px] font-semibold mt-3" onClick={() => setOpenVid(ex.id)}>Watch technique →</button>}</div></div>)}</div> : result ? <div className="panel panel-pad"><p className="text-grey text-xs">No exercises match those filters. Try a higher level or fewer equipment limits.</p></div> : <div className="panel panel-pad"><p className="text-grey text-xs">Couldn&apos;t load that just now.</p><button className="btn-ghost text-[10px] mt-3" onClick={() => build()}>Try again</button></div>}
    </div>
  );
}

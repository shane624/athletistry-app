"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setActiveProgram, markOnboarded } from "@/lib/data";
import Icon, { type IconName } from "@/components/Icon";

interface P { id: string; name: string; tagline: string; dayCount: number; exerciseCount: number; }

function programEyebrow(id: string) {
  if (id === "the-practice") return "Anatomy-first · 90 days";
  if (id.includes("periodized")) return "Progressive strength · 24 weeks";
  if (id.includes("ballet")) return "Return to ballet · longevity";
  if (id.includes("kids")) return "Movement foundations · ages 6–13";
  return "Structured training";
}

export default function ProgramPicker({ programs, active, customActive }: { programs: P[]; active: string; first?: boolean; customActive?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const activeProgram = programs.find((p) => p.id === active) ?? programs[0];

  async function choose(id: string) {
    setBusy(id);
    await setActiveProgram(id);
    await markOnboarded();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      {activeProgram && (
        <section className="program-feature animate-in">
          <div className="relative z-[1] max-w-[760px]">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/50">Your current program</p>
            <h2 className="program-feature-title mt-4">{activeProgram.name}</h2>
            <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-white/66">{activeProgram.tagline}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-[10px] text-white/58">
              <span className="inline-flex items-center gap-1.5"><Icon name="calendar" className="w-4 h-4" /> {activeProgram.dayCount} training days</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="dumbbell" className="w-4 h-4" /> {activeProgram.exerciseCount} programmed exercises</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-7">
              <Link href="/dashboard" className="hero-cta !min-h-[46px] !text-[12px]">Continue program <Icon name="chevron" className="w-4 h-4" /></Link>
              <Link href="/progress" className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/15 px-5 text-[11px] font-semibold text-white/80 hover:bg-white/[.06]">View progress</Link>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-end justify-between gap-4 flex-wrap mt-9 mb-3">
        <div><p className="eyebrow">Training library</p><h2 className="font-display text-[34px] leading-none font-bold text-ink mt-1">Choose your path.</h2></div>
        <p className="text-grey text-[10px]">Switching programs keeps each program&apos;s logs separate.</p>
      </div>

      <div className="program-cover-grid stagger">
        {programs.map((p, idx) => {
          const isActive = p.id === active;
          return (
            <button key={p.id} {...(idx === 0 ? { "data-tour": "programs" } : {})} onClick={() => choose(p.id)} disabled={!!busy} className={`program-cover ${isActive ? "ring-2 ring-[#5c8fe0] ring-offset-2 ring-offset-transparent" : ""}`}>
              <div className="relative z-[1]">
                <div className="flex items-start justify-between gap-3"><p className="text-[8px] uppercase tracking-[.17em] text-white/48">{programEyebrow(p.id)}</p>{isActive && <span className="text-[8px] font-bold uppercase tracking-[.12em] text-[#87afe9]">Active</span>}</div>
              </div>
              <div className="program-cover-bottom">
                <h3 className="font-display text-[29px] leading-[.95] font-bold text-white">{p.name}</h3>
                <p className="text-[9px] leading-relaxed text-white/50 mt-2 line-clamp-2">{p.tagline}</p>
                <div className="flex gap-3 mt-4 text-[8px] text-white/48"><span>{p.dayCount} days</span><span>·</span><span>{p.exerciseCount} exercises</span></div>
                {busy === p.id && <p className="text-[9px] text-[#87afe9] mt-2">Switching…</p>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap mt-10 mb-3"><div><p className="eyebrow">Build around your life</p><h2 className="font-display text-[32px] leading-none font-bold text-ink mt-1">Training tools.</h2></div></div>
      <div className="grid md:grid-cols-3 gap-3">
        <Tool href="/build" icon="stack" title="Build Your Own" desc="Choose from the exercise library and make a repeatable routine with full logging." active={customActive} />
        <Tool href="/generate" icon="bolt" title="Practice Generator" desc="Generate a balanced session at the difficulty and equipment level you choose." />
        <Tool href="/circuit" icon="circuit" title="Circuit Training" desc="Conditioning formats with a built-in timer: intervals, Tabata, EMOM and AMRAP." />
      </div>
    </div>
  );
}

function Tool({ href, icon, title, desc, active }: { href: string; icon: IconName; title: string; desc: string; active?: boolean }) {
  return <Link href={href} className={`program-tool-card card-hover block ${active ? "ring-1 ring-teal" : ""}`}><span className="w-9 h-9 rounded-full grid place-items-center bg-bluewash text-teal"><Icon name={icon} className="w-4 h-4" /></span><h3 className="font-display text-[23px] leading-none font-bold text-ink mt-5">{title}</h3><p className="text-grey text-[10px] leading-relaxed mt-2">{desc}</p><span className="inline-flex items-center gap-1 text-teal text-[9px] font-bold mt-4">Open <Icon name="chevron" className="w-3 h-3" /></span></Link>;
}

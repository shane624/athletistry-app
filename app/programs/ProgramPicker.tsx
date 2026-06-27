"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setActiveProgram, markOnboarded } from "@/lib/data";
import Icon, { type IconName } from "@/components/Icon";

interface P { id: string; name: string; tagline: string; dayCount: number; exerciseCount: number; }

// per-program accent gradient + icon for the hero strip
function programLook(id: string): { grad: string; icon: IconName } {
  if (id.includes("practice")) return { grad: "linear-gradient(135deg,#1f2a44,#27ae9f)", icon: "sparkle" };
  if (id.includes("return") || id.includes("ballet")) return { grad: "linear-gradient(135deg,#3a4a6b,#27ae9f)", icon: "ballet" };
  if (id.includes("kid")) return { grad: "linear-gradient(135deg,#2bb3a2,#1f8b7f)", icon: "heart" };
  return { grad: "linear-gradient(135deg,#1f2a44,#3a4a6b)", icon: "stack" };
}

export default function ProgramPicker({ programs, active, first, customActive }: { programs: P[]; active: string; first?: boolean; customActive?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function choose(id: string) {
    setBusy(id);
    await setActiveProgram(id);
    // Always mark onboarded on selection so the welcome flow never repeats.
    await markOnboarded();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-5 stagger">
      {programs.map((p) => {
        const look = programLook(p.id);
        const isActive = p.id === active;
        return (
        <button
          key={p.id}
          onClick={() => choose(p.id)}
          disabled={!!busy}
          className={`text-left card card-hover overflow-hidden p-0 transition ${isActive ? "ring-2 ring-teal" : ""}`}
        >
          {/* gradient hero strip */}
          <div className="relative h-24 flex items-center px-5" style={{ background: look.grad }}>
            <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <Icon name={look.icon} className="w-6 h-6" />
            </span>
            <h3 className="text-white font-bold text-lg ml-3">{p.name}</h3>
            {isActive && <span className="absolute top-3 right-3 badge bg-white/25 text-white">Active</span>}
          </div>
          <div className="p-4">
            <p className="text-grey text-sm">{p.tagline}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="badge bg-light text-tealdark inline-flex items-center gap-1"><Icon name="calendar" className="w-3.5 h-3.5" />{p.dayCount} day{p.dayCount > 1 ? "s" : ""}</span>
              <span className="badge bg-light text-tealdark inline-flex items-center gap-1"><Icon name="dumbbell" className="w-3.5 h-3.5" />{p.exerciseCount} exercises</span>
            </div>
            {busy === p.id && <p className="text-teal text-xs mt-2">Switching…</p>}
          </div>
        </button>
        );
      })}

      <ActionCard href="/build" icon="stack" title="Build Your Own" active={customActive}
        desc="Pick exercises from the library and build your own routine. Full reps & weight tracking." cta="Open builder" />
      <ActionCard href="/generate" icon="bolt" title="Random Workout"
        desc="A balanced session on the spot — legs, push, pull and core — at the difficulty you choose." cta="Generate" />
      <ActionCard href="/circuit" icon="circuit" title="Circuit Training"
        desc="Timed conditioning — 1:1 intervals, Tabata, EMOM or AMRAP, with a built-in timer." cta="Choose a format" />
    </div>
  );
}

function ActionCard({ href, icon, title, desc, cta, active }: {
  href: string; icon: IconName; title: string; desc: string; cta: string; active?: boolean;
}) {
  return (
    <Link href={href} className={`card card-hover block p-5 transition ${active ? "ring-2 ring-teal" : ""}`}>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-2xl bg-light flex items-center justify-center text-teal shrink-0">
          <Icon name={icon} className="w-5 h-5" />
        </span>
        <h3 className="font-bold text-navy">{title}</h3>
        {active && <span className="badge bg-teal text-white ml-auto">Active</span>}
      </div>
      <p className="text-grey text-sm mt-3">{desc}</p>
      <p className="text-teal text-sm mt-3 font-semibold inline-flex items-center gap-1">{cta}<Icon name="chevron" className="w-4 h-4" /></p>
    </Link>
  );
}

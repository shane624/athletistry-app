"use client";

import { useState } from "react";
import Link from "next/link";
import { MOVEMENT_TYPES, type TypeId } from "@/lib/movement-map";
import Icon from "@/components/Icon";

// The dancer's Movement Map result — primary type, the pattern, the corrections
// they hear on repeat, one to stop chasing, one exercise, next pathway, and a
// shareable card.
export default function MovementMapResult({ primary, secondary }: { primary: TypeId; secondary: TypeId }) {
  const t = MOVEMENT_TYPES[primary];
  const s = MOVEMENT_TYPES[secondary];
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `I'm ${t.name} (with a bit of ${s.name}) on the Athletistry Movement Map — ${t.tagline} #AthletistryMovementMap`;
    try {
      if (navigator.share) { await navigator.share({ text }); return; }
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { /* user cancelled */ }
  }

  return (
    <div className="mt-5 stagger">
      {/* shareable hero card */}
      <div className="rounded-2xl overflow-hidden text-white animate-in" style={{ background: t.grad }}>
        <div className="p-6">
          <p className="text-white/75 text-xs font-semibold uppercase tracking-widest">Your Dancer Movement Type</p>
          <h1 className="text-3xl font-extrabold mt-1">{t.name}</h1>
          <p className="text-white/90 text-sm mt-2 italic">{t.tagline}</p>
          <p className="text-white/70 text-xs mt-4">with a secondary tendency toward <b className="text-white/90">{s.name}</b></p>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={share} className="bg-white text-navy font-bold rounded-xl px-4 py-2 text-sm inline-flex items-center gap-2 active:scale-95 transition">
              <Icon name="sparkle" className="w-4 h-4" /> {copied ? "Copied!" : "Share my type"}
            </button>
            <span className="text-white/60 text-xs">#AthletistryMovementMap</span>
          </div>
        </div>
      </div>

      {/* superpower */}
      <div className="card p-4 mt-4 animate-in border-l-2 border-teal">
        <p className="eyebrow">Your movement superpower</p>
        <p className="text-navy text-sm mt-1">{t.superpower}</p>
      </div>

      {/* the pattern */}
      <div className="card p-5 mt-4 animate-in">
        <p className="eyebrow">The pattern making ballet harder</p>
        <p className="text-navy text-base font-semibold mt-1 leading-snug">{t.pattern}</p>
        <p className="text-tealdark text-sm mt-3 font-medium">{t.message}</p>
      </div>

      {/* corrections you hear */}
      <div className="card p-5 mt-4 animate-in">
        <p className="eyebrow">Corrections you probably hear on repeat</p>
        <ul className="mt-2 space-y-1.5">
          {t.corrections.map((c) => (
            <li key={c} className="text-navy text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />{c}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-light p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-grey">Stop obsessing over — for now</p>
          <p className="text-navy text-sm mt-1">{t.stopObsessing}</p>
        </div>
      </div>

      {/* one exercise */}
      <div className="card p-5 mt-4 animate-in border-2 border-teal bg-light">
        <p className="eyebrow">One thing to try today</p>
        <p className="text-navy text-sm mt-1 leading-snug">{t.oneExercise}</p>
      </div>

      {/* next pathway */}
      <Link href={t.pathway.href} className="card card-hover block p-5 mt-4 animate-in">
        <p className="eyebrow">Your next Athletistry step</p>
        <p className="text-navy text-sm font-semibold mt-1">{t.pathway.label}</p>
        <p className="text-grey text-xs mt-1">{t.pathway.why}</p>
        <span className="text-teal text-sm font-semibold mt-2 inline-flex items-center gap-1">Go there<Icon name="chevron" className="w-4 h-4" /></span>
      </Link>

      <div className="flex items-center gap-3 mt-5">
        <Link href="/movement-map?retake=1" className="btn-ghost">Retake the assessment</Link>
      </div>

      <p className="text-grey text-xs mt-6">
        This is a movement-education screen, not a medical diagnosis. It reflects the patterns you reported today — retake it in a month to see what's changed.
      </p>
    </div>
  );
}

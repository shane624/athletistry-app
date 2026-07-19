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
  const [imgOk, setImgOk] = useState(true);

  const emblem = `/movement-map/${primary}.png`;
  const caption = `I'm ${t.name} on the Athletistry Movement Map — ${t.tagline}\n\nFind your Dancer Movement Type → athletistry.app/movement-map\n#AthletistryMovementMap`;

  // Native share sheet with the actual emblem image (posts to Instagram/Facebook
  // on mobile). Falls back to copying the caption.
  async function share() {
    try {
      const res = await fetch(emblem);
      const blob = await res.blob();
      const file = new File([blob], `athletistry-${primary}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({ files: [file], text: caption });
        return;
      }
      if (nav.share) { await nav.share({ text: caption }); return; }
      throw new Error("no share");
    } catch {
      try { await navigator.clipboard.writeText(caption); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* noop */ }
    }
  }

  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* noop */ }
  }

  return (
    <div className="mt-5 stagger">
      {/* shareable emblem card */}
      <div className="rounded-2xl overflow-hidden animate-in" style={{ background: t.grad }}>
        {imgOk ? (
          <img src={emblem} alt={`${t.name} — Athletistry Movement Map`} className="w-full block"
            onError={() => setImgOk(false)} />
        ) : (
          <div className="p-6 text-white">
            <p className="text-white/75 text-xs font-semibold uppercase tracking-widest">Your Dancer Movement Type</p>
            <h1 className="text-3xl font-extrabold mt-1">{t.name}</h1>
            <p className="text-white/90 text-sm mt-2 italic">{t.tagline}</p>
          </div>
        )}
      </div>

      {/* share actions */}
      <div className="flex items-center gap-2 mt-3 flex-wrap animate-in">
        <button onClick={share} className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2">
          <Icon name="sparkle" className="w-4 h-4" /> Share to Instagram / Facebook
        </button>
        <a href={emblem} download={`athletistry-${primary}.png`} className="btn-ghost py-2 px-4 text-sm">Save image</a>
        <button onClick={copyCaption} className="btn-ghost py-2 px-4 text-sm">{copied ? "Copied ✓" : "Copy caption"}</button>
      </div>
      <p className="text-grey text-xs mt-2">Secondary tendency: <b className="text-navy">{s.name}</b> · On desktop, save the image then upload it with the caption.</p>

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

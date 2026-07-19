"use client";

import Link from "next/link";
import { MOVEMENT_TYPES, type TypeId } from "@/lib/movement-map";
import type { PostureSummary } from "@/lib/posture-to-type";
import Icon from "@/components/Icon";

const SEV_STYLE: Record<string, string> = {
  notable: "bg-red-50 text-red-700 border-red-200",
  mild: "bg-amber-50 text-amber-700 border-amber-200",
};

// The camera-scan result: a single plain-language posture summary, the top
// priorities, what needs a photo/coach, and the Dancer Movement Type it fed.
export default function PoseScanResult({
  summary, primary, secondary, hideTypeLink = false,
}: { summary: PostureSummary; primary: TypeId; secondary: TypeId; hideTypeLink?: boolean }) {
  const t = MOVEMENT_TYPES[primary];

  return (
    <div className="mt-5 stagger">
      {/* headline summary */}
      <div className="card p-5 animate-in border-l-2 border-teal">
        <p className="eyebrow">Your posture read</p>
        <h2 className="text-navy text-xl font-extrabold mt-1 leading-snug">{summary.headline}</h2>
        <p className="text-navy text-sm mt-2 leading-relaxed">{summary.summary}</p>
      </div>

      {/* top priorities */}
      {summary.priorities.length > 0 && (
        <div className="card p-5 mt-4 animate-in">
          <p className="eyebrow">Your top priorities</p>
          <ol className="mt-3 space-y-3">
            {summary.priorities.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-teal text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-navy text-sm font-semibold flex items-center gap-2">
                    {p.label}
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${SEV_STYLE[p.severity] ?? "bg-light text-grey border-line"}`}>{p.severity}</span>
                  </p>
                  <p className="text-grey text-sm mt-0.5 leading-snug">{p.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* the type this fed */}
      {!hideTypeLink && (
        <Link href="/movement-map" className="card card-hover block p-5 mt-4 animate-in border-l-2 border-teal">
          <p className="eyebrow">This points to your movement type</p>
          <p className="text-navy text-base font-bold mt-1">{t.name}</p>
          <p className="text-grey text-xs mt-1">{t.tagline} · with a secondary tendency toward {MOVEMENT_TYPES[secondary].name}.</p>
          <span className="text-teal text-sm font-semibold mt-2 inline-flex items-center gap-1">See the full type + shareable card<Icon name="chevron" className="w-4 h-4" /></span>
        </Link>
      )}

      {/* needs a photo / coach */}
      {summary.needsPhoto.length > 0 && (
        <div className="card p-4 mt-4 bg-light animate-in">
          <p className="text-[11px] font-bold uppercase tracking-wide text-grey">A camera can&apos;t grade these</p>
          <p className="text-navy text-sm mt-1">
            {summary.needsPhoto.join(", ")} — check these with a side/rear photo or a coach&apos;s eye.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mt-5">
        <Link href="/movement-map/scan" className="btn-ghost">Retake the scan</Link>
      </div>

      <p className="text-grey text-xs mt-6">
        This is a movement-education screen, not a medical diagnosis. It reflects a single static snapshot from your camera — retake it in a month to see what&apos;s changed.
      </p>
    </div>
  );
}

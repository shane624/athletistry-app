"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTest, formatValue, shortDate, type Attempt, type Measure } from "@/lib/self-tests";
import { deleteSelfTestAttempt } from "@/lib/self-tests-actions";

// Every attempt at one test, newest first, with a small trend line per measure.
export default function SelfTestHistory({ testId, attempts }: { testId: string; attempts: Attempt[] }) {
  const test = getTest(testId)!;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (!attempts.length) {
    return <p className="text-grey text-sm mt-3">No results yet. Log your first one above, then retest in four weeks.</p>;
  }

  async function remove(id: string) {
    setBusy(id);
    await deleteSelfTestAttempt(id, testId);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mt-3">
      {attempts.length > 1 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {test.measures.map((m) => <Spark key={m.id} m={m} attempts={attempts} />)}
        </div>
      )}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {[...attempts].reverse().map((a) => (
          <li key={a.id} className="py-3 flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-grey">{shortDate(a.takenAt)}</p>
              {test.measures.filter((m) => a.values[m.id] !== undefined).map((m) => (
                <p key={m.id} className="text-sm text-navy mt-0.5"><span className="text-grey">{m.label}:</span> {formatValue(m, a.values[m.id])}</p>
              ))}
              {a.note && <p className="text-sm text-grey mt-1 italic">{a.note}</p>}
            </div>
            <button type="button" onClick={() => remove(a.id)} disabled={busy === a.id}
              className="text-xs text-grey underline underline-offset-2 shrink-0">{busy === a.id ? "Removing" : "Remove"}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// A tiny line of one measure over time. For choices, the best answer sits at the top.
function Spark({ m, attempts }: { m: Measure; attempts: Attempt[] }) {
  const pts = attempts.map((a) => a.values[m.id]).filter((v): v is number => v !== undefined);
  if (pts.length < 2) return null;
  const lo = m.kind === "choice" ? 0 : Math.min(...pts, m.min ?? 0);
  const hi = m.kind === "choice" ? Math.max(...(m.options ?? []).map((o) => o.value)) : Math.max(...pts, m.max ?? 0, 1);
  const W = 240, H = 56, pad = 6;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (pts.length - 1);
  const yv = (v: number) => {
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    const good = m.better === "higher" ? t : 1 - t;   // good results sit high
    return H - pad - good * (H - pad * 2);
  };
  const d = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${yv(v).toFixed(1)}`).join(" ");
  return (
    <div className="rounded-xl bg-light p-3">
      <p className="text-xs text-grey">{m.label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 mt-1" aria-hidden="true">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-teal" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((v, i) => <circle key={i} cx={x(i)} cy={yv(v)} r="3" className="fill-teal" />)}
      </svg>
      <p className="text-xs text-navy mt-1">First: {formatValue(m, pts[0])} · Latest: {formatValue(m, pts[pts.length - 1])}</p>
    </div>
  );
}

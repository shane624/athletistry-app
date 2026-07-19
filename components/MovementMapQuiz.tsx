"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAP_TESTS, type TypeId } from "@/lib/movement-map";
import { saveMovementMap } from "@/lib/movement-map-actions";
import Icon from "@/components/Icon";
import Dots from "@/components/Dots";

// The 5-test self-assessment. Each test: do the movement, then pick the pattern
// that best matches what you felt. Answers score toward the 6 movement types.
export default function MovementMapQuiz() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(TypeId | null)[]>(Array(MAP_TESTS.length).fill(null));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const test = MAP_TESTS[i];
  const last = i === MAP_TESTS.length - 1;
  const chosen = answers[i];

  function pick(type: TypeId) {
    setAnswers((a) => { const n = [...a]; n[i] = type; return n; });
  }

  async function next() {
    if (!chosen) return;
    if (!last) { setI(i + 1); return; }
    setSaving(true); setErr(null);
    const res = await saveMovementMap(answers);
    if (res.ok) { router.push("/movement-map?done=1"); router.refresh(); }
    else { setErr(res.error ?? "Couldn't save your result."); setSaving(false); }
  }

  return (
    <div className="mt-5">
      {/* progress */}
      <div className="flex items-center gap-1.5">
        {MAP_TESTS.map((_, n) => (
          <span key={n} className={`h-1.5 rounded-full flex-1 transition-colors ${n <= i ? "bg-teal" : "bg-line"}`} />
        ))}
      </div>
      <p className="eyebrow mt-3">Test {i + 1} of {MAP_TESTS.length}</p>
      <h2 className="text-xl font-extrabold text-navy mt-1">{test.title}</h2>

      {/* the movement to do (comparison-clip placeholder) */}
      <div className="card p-4 mt-3 bg-light">
        <p className="text-sm text-navy font-semibold">Do this: <span className="font-normal">{test.move}</span></p>
        <p className="text-grey text-sm mt-1">{test.watch}</p>
        <div className="mt-3 aspect-video w-full rounded-lg bg-navy/90 text-white/70 flex flex-col items-center justify-center text-center px-4">
          <Icon name="play" className="w-8 h-8 opacity-60" />
          <span className="text-xs mt-2">Demo clip coming soon — for now, do the movement once and notice what you feel.</span>
        </div>
      </div>

      {/* what matched */}
      <p className="text-sm font-semibold text-navy mt-5">Which is closest to what happened?</p>
      <div className="mt-2 space-y-2">
        {test.options.map((opt) => (
          <button key={opt.type} type="button" onClick={() => pick(opt.type)}
            className={`w-full text-left rounded-xl border p-3 text-sm transition ${chosen === opt.type ? "border-teal bg-light text-navy font-semibold" : "border-line text-navy"}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {err && <p className="text-red-600 text-sm mt-3">{err}</p>}

      <div className="flex items-center gap-3 mt-5">
        {i > 0 && <button onClick={() => setI(i - 1)} className="btn-ghost px-5">Back</button>}
        <button onClick={next} disabled={!chosen || saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
          {saving ? <Dots /> : last ? "See my Movement Map ✨" : "Next →"}
        </button>
      </div>
    </div>
  );
}

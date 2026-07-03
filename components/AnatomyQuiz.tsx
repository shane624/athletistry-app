"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ANATOMY_QUIZ } from "@/lib/anatomy-quiz";
import { recordAnatomyQuiz } from "@/lib/anatomy-actions";
import Dots from "@/components/Dots";

// A short knowledge check for one anatomy module. Pass = all correct. On pass
// it records progress (unlocks badges); wrong answers can be retried.
export default function AnatomyQuiz({ moduleIndex, passed = false }: { moduleIndex: number; passed?: boolean }) {
  const router = useRouter();
  const questions = ANATOMY_QUIZ[moduleIndex] ?? [];
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(passed);

  if (!questions.length) return null;

  const allAnswered = questions.every((_, i) => picks[i] != null);
  const correctCount = questions.filter((q, i) => picks[i] === q.answer).length;
  const allCorrect = correctCount === questions.length;

  async function check() {
    setChecked(true);
    if (questions.every((q, i) => picks[i] === q.answer)) {
      setSaving(true);
      const res = await recordAnatomyQuiz(moduleIndex);
      setSaving(false);
      if (res.ok) { setDone(true); router.refresh(); }
    }
  }

  function retry() { setChecked(false); setPicks({}); }

  if (done) {
    return (
      <div className="card p-4 bg-light border-2 border-teal">
        <p className="text-tealdark font-semibold text-sm">Quiz passed ✓</p>
        <p className="text-grey text-xs mt-1">Nice — this module counts toward your Anatomy badges. Check Achievements to see them.</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <p className="eyebrow">Quick check</p>
      <p className="text-grey text-xs mt-1 mb-3">Answer both to pass and earn progress toward your Anatomy badges.</p>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-semibold text-navy">{qi + 1}. {q.q}</p>
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => {
                const selected = picks[qi] === oi;
                const isRight = oi === q.answer;
                const show = checked && selected;
                let cls = "border-line";
                if (selected && !checked) cls = "border-teal bg-light";
                if (show && isRight) cls = "border-teal bg-light text-tealdark";
                if (show && !isRight) cls = "border-red-400 bg-red-50 text-red-700";
                if (checked && isRight && !selected) cls = "border-teal";
                return (
                  <button key={oi} type="button"
                    onClick={() => !checked && setPicks((p) => ({ ...p, [qi]: oi }))}
                    disabled={checked}
                    className={`w-full text-left text-sm rounded-lg border px-3 py-2 transition ${cls}`}>
                    {opt}
                    {show && isRight && " ✓"}
                    {show && !isRight && " ✗"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!checked ? (
        <button onClick={check} disabled={!allAnswered || saving}
          className="btn-primary w-full mt-4 disabled:opacity-50">
          {saving ? <Dots /> : "Check answers"}
        </button>
      ) : allCorrect ? (
        <p className="text-tealdark font-semibold text-sm mt-4 text-center">All correct — saving…</p>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-grey text-sm">{correctCount} of {questions.length} correct. Have another look above, then try again.</p>
          <button onClick={retry} className="btn-ghost mt-2">Try again</button>
        </div>
      )}
    </div>
  );
}

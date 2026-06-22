"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeLearning } from "@/lib/data";

// ---- quiz questions (must get all correct to unlock) ----
const QUIZ = [
  {
    q: "You want to build muscle size. Which rep range fits best?",
    options: ["3–5 reps, very heavy", "8–12 reps, moderate", "15–25 reps, light"],
    answer: 1,
  },
  {
    q: "Strength training is mainly about…",
    options: ["Lifting heavy for low reps with long rest", "High reps with almost no rest", "Stretching and mobility"],
    answer: 0,
  },
  {
    q: "Endurance training typically uses…",
    options: ["3–5 reps and 3-minute rests", "15–25+ reps with minimal rest", "1 heavy rep at a time"],
    answer: 1,
  },
  {
    q: "When should you stop an exercise?",
    options: ["Only when a set is finished, no matter what", "If you feel pain, dizziness, or anything unusual", "Never — push through everything"],
    answer: 1,
  },
];

export default function StartHereClient() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..3 content, 4 = quiz
  const total = 5;

  // quiz state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const allAnswered = QUIZ.every((_, i) => answers[i] !== undefined);
  const score = QUIZ.filter((qq, i) => answers[i] === qq.answer).length;
  const passed = score === QUIZ.length;

  async function finish() {
    setBusy(true);
    await completeLearning();
    router.push("/programs?first=1");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-4 py-8">
      <div className="card w-full max-w-xl p-6">
        {/* progress */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-teal" : "bg-line"}`} />
          ))}
        </div>
        <p className="text-teal font-semibold tracking-widest text-xs">START HERE</p>

        {/* ---- Step 0: how the app works ---- */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold text-navy mt-1">How Athletistry works</h1>
            <p className="text-ink text-sm leading-relaxed mt-3">
              This app is your training home base. A quick tour of what you can do:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="card p-3"><b>Follow a program</b> — pick a guided plan and the app tells you exactly what to do each day, with the right sets, reps, and tempo.</li>
              <li className="card p-3"><b>Generate a random workout</b> — choose a style and difficulty and get a balanced session on the spot.</li>
              <li className="card p-3"><b>Build &amp; save your own</b> — make routines from the exercise library and reuse them.</li>
              <li className="card p-3"><b>Watch &amp; track</b> — every exercise has a demo video; log your weights and reps and watch your progress climb.</li>
            </ul>
          </div>
        )}

        {/* ---- Step 1: add to home screen ---- */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-navy mt-1">Add it to your home screen</h1>
            <p className="text-ink text-sm leading-relaxed mt-3">
              For one-tap access that opens full-screen like a real app, add Athletistry to your phone&apos;s home screen.
            </p>
            <div className="card p-4 mt-3">
              <p className="font-semibold text-navy text-sm">On iPhone (Safari)</p>
              <ol className="text-sm text-ink mt-1 space-y-1 list-decimal list-inside">
                <li>Tap the <b>Share</b> icon (the square with an arrow).</li>
                <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                <li>Tap <b>Add</b>. The Athletistry icon appears on your home screen.</li>
              </ol>
            </div>
            <div className="card p-4 mt-3">
              <p className="font-semibold text-navy text-sm">On Android (Chrome)</p>
              <ol className="text-sm text-ink mt-1 space-y-1 list-decimal list-inside">
                <li>Tap the <b>⋮</b> menu (top right).</li>
                <li>Tap <b>Add to Home screen</b> / <b>Install app</b>.</li>
                <li>Confirm. The icon appears on your home screen.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ---- Step 2: training styles ---- */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-navy mt-1">Hypertrophy, Strength &amp; Endurance</h1>
            <p className="text-ink text-sm leading-relaxed mt-3">
              The same exercises train different things depending on how you load them. Knowing the
              difference helps you pick the right style for your goal.
            </p>
            <div className="space-y-3 mt-3">
              <div className="card p-3">
                <p className="font-semibold text-navy">Hypertrophy <span className="text-grey font-normal text-sm">— build muscle</span></p>
                <p className="text-sm text-ink mt-1">Moderate weight, <b>8–12 reps</b>, 3–4 sets, slow lowering, short rest. The goal is enough muscle fatigue to trigger growth.</p>
              </div>
              <div className="card p-3">
                <p className="font-semibold text-navy">Strength <span className="text-grey font-normal text-sm">— lift heavier</span></p>
                <p className="text-sm text-ink mt-1">Heavy weight, <b>3–5 reps</b>, long rest (~3 min) so you can hit full force each set. Intensity high, volume low.</p>
              </div>
              <div className="card p-3">
                <p className="font-semibold text-navy">Endurance <span className="text-grey font-normal text-sm">— work longer</span></p>
                <p className="text-sm text-ink mt-1">Lighter weight, <b>15–25+ reps</b>, minimal rest, often circuit-style. Trains your muscles to keep going.</p>
              </div>
            </div>
          </div>
        )}

        {/* ---- Step 3: ready for quiz ---- */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-navy mt-1">Quick quiz to unlock</h1>
            <p className="text-ink text-sm leading-relaxed mt-3">
              Answer 4 quick questions to make sure it all clicked. Get them all right and the
              workouts unlock. Don&apos;t worry — you can retry as many times as you like.
            </p>
            <div className="card p-4 mt-4 bg-light">
              <p className="text-sm text-ink">Tip: if you&apos;re unsure, flip back a step to review the training styles.</p>
            </div>
          </div>
        )}

        {/* ---- Step 4: quiz ---- */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-navy mt-1">Quiz</h1>
            <p className="text-grey text-sm mt-1">Pick the best answer for each.</p>
            <div className="space-y-4 mt-4">
              {QUIZ.map((item, i) => (
                <div key={i}>
                  <p className="font-medium text-navy text-sm">{i + 1}. {item.q}</p>
                  <div className="mt-2 space-y-1.5">
                    {item.options.map((opt, oi) => {
                      const chosen = answers[i] === oi;
                      const showRight = submitted && oi === item.answer;
                      const showWrong = submitted && chosen && oi !== item.answer;
                      return (
                        <button key={oi}
                          onClick={() => { if (!submitted) setAnswers((a) => ({ ...a, [i]: oi })); }}
                          className={`w-full text-left text-sm rounded-lg border px-3 py-2 transition ${
                            showRight ? "border-teal bg-light text-tealdark"
                            : showWrong ? "border-red-300 bg-red-50 text-red-700"
                            : chosen ? "border-teal bg-light" : "border-line hover:border-teal"
                          }`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {submitted && !passed && (
              <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2">
                You got {score}/{QUIZ.length}. Review and try again — fix the highlighted answers.
              </p>
            )}
            {submitted && passed && (
              <p className="mt-4 text-sm text-tealdark bg-light rounded-md px-3 py-2">
                Perfect — {score}/{QUIZ.length}! You&apos;re ready. Unlocking your workouts…
              </p>
            )}
          </div>
        )}

        {/* ---- nav buttons ---- */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <button
            className="btn-ghost"
            onClick={() => { setSubmitted(false); setStep((s) => Math.max(0, s - 1)); }}
            disabled={step === 0 || busy}
            style={{ opacity: step === 0 ? 0.4 : 1 }}
          >
            Back
          </button>

          {step < 4 && (
            <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
              {step === 3 ? "Start quiz" : "Next"}
            </button>
          )}

          {step === 4 && !submitted && (
            <button className="btn-primary" disabled={!allAnswered} onClick={() => setSubmitted(true)}>
              Submit answers
            </button>
          )}
          {step === 4 && submitted && !passed && (
            <button className="btn-primary" onClick={() => { setSubmitted(false); setAnswers({}); }}>
              Try again
            </button>
          )}
          {step === 4 && submitted && passed && (
            <button className="btn-primary" onClick={finish} disabled={busy}>
              {busy ? "Unlocking…" : "Unlock workouts →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

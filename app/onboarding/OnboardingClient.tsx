"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setActiveProgram, markOnboarded } from "@/lib/data";
import Icon, { type IconName } from "@/components/Icon";
import Dots from "@/components/Dots";

type Choice = { id: string; label: string; sub?: string; icon?: IconName };

const GOALS: Choice[] = [
  { id: "strength", label: "Get stronger for dancing", sub: "Build the strength your technique needs", icon: "dumbbell" },
  { id: "return", label: "Return to ballet", sub: "Ease back in safely after time away", icon: "ballet" },
  { id: "technique", label: "Improve specific moves", sub: "Plié, turnout, jumps, extensions", icon: "target" },
  { id: "kids", label: "For a young dancer (6–13)", sub: "Fun, bodyweight movement", icon: "heart" },
];

const DAYS: Choice[] = [
  { id: "2", label: "2 days a week", sub: "Busy schedule" },
  { id: "3", label: "3 days a week", sub: "A solid middle ground" },
  { id: "4", label: "4+ days a week", sub: "Serious and consistent" },
];

const EQUIP: Choice[] = [
  { id: "none", label: "Just my body", sub: "Bodyweight only" },
  { id: "some", label: "Bands & light weights", sub: "Some kit at home" },
  { id: "gym", label: "Full gym", sub: "Barbells and machines" },
];

const EVENT: Choice[] = [
  { id: "yes", label: "Yes, I have a date coming up", sub: "Performance, exam or comp" },
  { id: "no", label: "Not right now", sub: "Just training" },
];

// Map the answers to the best-fit program.
function recommend(a: Record<string, string>): { id: string; name: string; why: string } {
  if (a.goal === "kids") return { id: "kids", name: "Kids Movement (6–13)", why: "Fun, bodyweight movement built for young dancers." };
  if (a.goal === "return") return { id: "ballet50", name: "Ballet Return", why: "A gentle, mobility-first way back into ballet." };
  if (a.goal === "strength" && a.equip === "gym" && a.days === "4")
    return { id: "periodized24", name: "24-Week Periodized", why: "A serious, structured strength build for a full gym and 4 days a week." };
  if (a.goal === "technique" || a.goal === "strength")
    return { id: "the-practice", name: "The Practice", why: "A 90-day, anatomy-first journey — foundations, then building, then integration." };
  return { id: "fullbody3", name: "3-Day Full Body", why: "A balanced, repeatable plan that fits most schedules." };
}

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const steps: { key: string; title: string; sub: string; choices: Choice[] }[] = [
    { key: "goal", title: "What brings you here?", sub: "We'll point you at the right starting plan.", choices: GOALS },
    { key: "days", title: "How often can you train?", sub: "Be honest — consistency beats intensity.", choices: DAYS },
    { key: "equip", title: "What do you have to train with?", sub: "Every plan works with bodyweight too.", choices: EQUIP },
    { key: "event", title: "Anything you're working towards?", sub: "We can plan your training around it.", choices: EVENT },
  ];

  const rec = recommend(answers);
  const onResults = step >= steps.length;

  function pick(key: string, id: string) {
    setAnswers((a) => ({ ...a, [key]: id }));
    setStep((s) => s + 1);
  }

  async function start() {
    setBusy(true);
    await setActiveProgram(rec.id);
    await markOnboarded();
    router.push(answers.event === "yes" ? "/plan" : "/dashboard");
    router.refresh();
  }

  async function browse() {
    setBusy(true);
    await markOnboarded();
    router.push("/programs");
    router.refresh();
  }

  if (onResults) {
    return (
      <div className="animate-in">
        <p className="eyebrow">Your match</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">We&apos;d start you on…</h1>
        <div className="card p-5 mt-4 ring-2 ring-teal">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl grad-navy text-white flex items-center justify-center shrink-0">
              <Icon name="sparkle" className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-bold text-navy">{rec.name}</h2>
          </div>
          <p className="text-grey text-sm mt-3">{rec.why}</p>
        </div>

        {answers.event === "yes" && (
          <p className="text-grey text-sm mt-3">
            You mentioned an event — next we&apos;ll set it up in the Event Planner so the app tapers you before it.
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-5">
          <button className="btn-primary" onClick={start} disabled={busy}>
            {busy ? <Dots /> : `Start ${rec.name} →`}
          </button>
          <button className="btn-ghost" onClick={browse} disabled={busy}>See all programs instead</button>
        </div>
        <button className="text-grey text-sm mt-4 block" onClick={() => setStep(0)}>← Change my answers</button>
      </div>
    );
  }

  const cur = steps[step];
  return (
    <div className="animate-in">
      {/* progress dots */}
      <div className="flex gap-1.5 mb-5">
        {steps.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full flex-1 ${i <= step ? "bg-teal" : "bg-line"}`} />
        ))}
      </div>

      <p className="eyebrow">Step {step + 1} of {steps.length}</p>
      <h1 className="text-2xl font-extrabold text-navy mt-1">{cur.title}</h1>
      <p className="text-grey text-sm mt-1">{cur.sub}</p>

      <div className="grid gap-3 mt-5">
        {cur.choices.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(cur.key, c.id)}
            className="card card-hover p-4 text-left flex items-center gap-3"
          >
            {c.icon && (
              <span className="w-10 h-10 rounded-2xl bg-light text-teal flex items-center justify-center shrink-0">
                <Icon name={c.icon} className="w-5 h-5" />
              </span>
            )}
            <span>
              <span className="block font-bold text-navy">{c.label}</span>
              {c.sub && <span className="block text-grey text-sm">{c.sub}</span>}
            </span>
            <Icon name="chevron" className="w-5 h-5 text-teal ml-auto shrink-0" />
          </button>
        ))}
      </div>

      {step > 0 && (
        <button className="text-grey text-sm mt-5" onClick={() => setStep((s) => s - 1)}>← Back</button>
      )}
    </div>
  );
}

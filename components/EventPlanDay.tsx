import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import ExerciseVideo from "@/components/ExerciseVideo";
import ClearEventPlan from "@/components/ClearEventPlan";
import type { EventPlanToday } from "@/lib/event-plan-data";

const SESSION_ICON: Record<string, IconName> = {
  strength: "dumbbell", hypertrophy: "dumbbell", endurance: "circuit",
  cardio: "heart", tabata: "bolt", rest: "warmup",
};

// where a session sends the dancer to actually do it
function sessionLink(type: string): string {
  if (type === "tabata") return "/circuit?format=tabata";
  if (type === "cardio") return "/load";
  return "/generate";
}

export default function EventPlanDay({ plan }: { plan: EventPlanToday }) {
  const isRest = plan.sessionType === "rest" || plan.sessionType === "cardio";
  const icon = SESSION_ICON[plan.sessionType] ?? "warmup";

  return (
    <div>
      {/* plan banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4 animate-in">
        <div className="inline-flex items-center gap-2 text-sm">
          <span className="badge bg-teal text-white">Event plan</span>
          <span className="text-grey">{plan.label ?? "Your event plan is guiding Today"}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/load" className="text-teal text-sm font-semibold inline-flex items-center gap-1">
            <Icon name="calendar" className="w-4 h-4" /> View full plan
          </Link>
          <ClearEventPlan />
        </div>
      </div>

      {/* today's prescribed session */}
      <div className={`${isRest ? "bg-navy2" : "grad-navy"} text-white p-5 rounded-2xl animate-in`}>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Icon name={icon} className="w-6 h-6" />
          </span>
          <div>
            <p className="text-white/75 text-xs uppercase tracking-wide">Today&apos;s plan</p>
            <h1 className="text-xl font-extrabold mt-0.5">{plan.title}</h1>
          </div>
        </div>
        <p className="text-white/90 text-sm mt-3">{plan.detail}</p>

        {plan.sessionType !== "rest" && (
          <Link href={sessionLink(plan.sessionType)}
            className="mt-4 inline-flex items-center justify-center gap-2 bg-white text-navy font-bold rounded-2xl px-5 py-2.5 text-sm active:scale-[.98] transition">
            <Icon name="play" className="w-4 h-4" /> {plan.sessionType === "cardio" ? "Log your cardio" : "Start session"}
          </Link>
        )}
      </div>

      {/* the day's exercises (strength / hypertrophy / endurance) */}
      {plan.exercises.length > 0 && (
        <>
          <p className="eyebrow mt-6 mb-3">Today&apos;s exercises</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {plan.exercises.map((ex) => (
              <div key={ex.id} className="card p-4">
                <h3 className="font-semibold text-navy text-sm">{ex.name}</h3>
                <p className="text-xs text-grey mt-0.5">Level {ex.level} · {ex.category}</p>
                <div className="mt-2">
                  <ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-grey text-xs mt-4">
            Log these in the <Link href="/load" className="text-teal font-medium">Training Calendar</Link> so your load tracks against the plan&apos;s targets.
          </p>
        </>
      )}

      {isRest && (
        <p className="text-grey text-sm mt-4">Take it easy today — recovery is part of the plan. Your next session is around the corner.</p>
      )}
    </div>
  );
}

import NavBar from "@/components/NavBar";
import ExerciseCard from "@/components/ExerciseCard";
import EquipmentNeeded from "@/components/EquipmentNeeded";
import DaySelector from "@/components/DaySelector";
import DailyQuote from "@/components/DailyQuote";
import AchievementStrip from "@/components/AchievementStrip";
import WarmUp from "@/components/WarmUp";
import Greeting from "@/components/Greeting";
import CompleteWorkout from "@/components/CompleteWorkout";
import { getToday, getOnboarding } from "@/lib/data";
import { getDisplayName } from "@/lib/profile-data";
import { getAchievements } from "@/lib/achievements-data";
import { getAssessment } from "@/lib/load-data";
import { BLOCK_LABEL, BLOCK_WEEKS } from "@/lib/programs";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // first-login flow: disclaimer → Start Here (learn + quiz) → program choice → dashboard
  const ob = await getOnboarding();
  if (!ob.disclaimerAccepted) redirect("/welcome");
  if (!ob.learningCompleted) redirect("/start-here");
  if (!ob.onboarded) redirect("/programs?first=1");

  const today = await getToday();
  const displayName = await getDisplayName();
  const ach = await getAchievements();
  const { assessment } = await getAssessment();
  const blockColor =
    today.rx.block === "hypertrophy" ? "grad-navy"
    : today.rx.block === "strength" ? "grad-brand"
    : "bg-navy2";
  const isPeriodized = today.programType === "periodized";
  const isManual = today.scheduling === "manual";

  // session progress: how many exercises already have at least one logged set
  const totalEx = today.exercises.length;
  const startedEx = today.exercises.filter((ex) => Object.keys(today.logs[ex.id] ?? {}).length > 0).length;
  const pct = totalEx ? Math.round((startedEx / totalEx) * 100) : 0;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* greeting + program row */}
        <div className="flex items-end justify-between flex-wrap gap-2 mb-4 animate-in">
          <Greeting name={displayName} programName={today.programName} />
          <Link href="/programs" className="text-teal text-sm font-semibold whitespace-nowrap hover:text-tealdark">
            Switch program →
          </Link>
        </div>

        <AchievementStrip />

        {assessment.status !== "no-data" && (
          <Link href="/load" className="card card-hover block p-4 mb-5 animate-in">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">{assessment.taper ? "Taper week" : "Training calendar"}</p>
                <p className="text-navy text-sm font-semibold mt-0.5 truncate">{assessment.message}</p>
              </div>
              <span className="text-teal text-sm font-semibold whitespace-nowrap shrink-0">View →</span>
            </div>
          </Link>
        )}

        <DailyQuote />

        {/* today's session header */}
        <div className={`${blockColor} text-white p-5 animate-in`} style={{ borderRadius: "18px", boxShadow: "0 12px 34px rgba(31,42,68,.2)" }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-white/75 text-xs font-semibold tracking-wide uppercase">
                {today.phase
                  ? `Phase · ${today.phase}`
                  : `${BLOCK_WEEKS[today.rx.block] ?? ""} · ${BLOCK_LABEL[today.rx.block] ?? ""}`}
              </p>
              <h1 className="text-2xl font-extrabold mt-1">
                {isPeriodized ? `Week ${today.week} — ` : ""}{today.dayTitle.replace(/^Day \d+ — /, "")}
              </h1>
            </div>
            <div className="text-right text-sm">
              <span className="badge bg-white/20">{today.rx.sets} × {today.rx.repLow}–{today.rx.repHigh}</span>
              {today.rx.tempo !== "smooth" && (
                <span className="badge bg-white/20 ml-2">tempo {today.rx.tempo}</span>
              )}
            </div>
          </div>
          <p className="text-white/85 text-sm mt-3">{today.rx.notes}</p>

          {/* session progress bar */}
          {totalEx > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                <span>{startedEx} of {totalEx} exercises started</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white/90 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>

        {today.principle && (
          <div className="card mt-3 p-4 border-l-2 border-teal animate-in">
            <p className="eyebrow">The principle</p>
            <p className="text-navy text-sm mt-2 leading-relaxed">{today.principle}</p>
          </div>
        )}

        {isManual && (
          <DaySelector
            dayCount={today.dayCount}
            selected={today.dayIndex}
            titles={Array.from({ length: today.dayCount }, (_, i) => i)}
          />
        )}

        {totalEx > 0 && (
          <>
            <p className="eyebrow mt-6 mb-3">Warm-up first</p>
            <WarmUp />
            <EquipmentNeeded names={today.exercises.map((ex) => ex.name)} className="mb-4" />
            <p className="eyebrow mb-3">Today&apos;s exercises</p>
          </>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {today.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              rx={today.rx}
              programId={today.programId}
              week={today.week}
              dayIndex={today.dayIndex}
              timed={today.mode === "timed"}
              initialLogs={today.logs[ex.id] ?? {}}
            />
          ))}
        </div>

        {today.exercises.length === 0 && (
          <p className="text-grey mt-8 text-center">
            No exercises loaded. Make sure you ran <code>schema.sql</code> and <code>seed.sql</code> in Supabase.
          </p>
        )}

        {totalEx > 0 && (
          <CompleteWorkout
            levelIndex={ach.level.index}
            levelName={ach.level.name}
            nextLevelName={ach.nextLevel?.name}
          />
        )}
      </main>
    </div>
  );
}

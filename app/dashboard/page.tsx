import NavBar from "@/components/NavBar";
import ExerciseCard from "@/components/ExerciseCard";
import DaySelector from "@/components/DaySelector";
import { getToday, getOnboarding } from "@/lib/data";
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
  const blockColor =
    today.rx.block === "hypertrophy" ? "bg-navy"
    : today.rx.block === "strength" ? "bg-teal"
    : "bg-navy2";
  const isPeriodized = today.programType === "periodized";
  const isManual = today.scheduling === "manual";

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="text-grey text-sm">{today.programName}</p>
          <Link href="/programs" className="text-teal text-sm font-medium">Switch program →</Link>
        </div>

        <div className={`rounded-xl ${blockColor} text-white p-5`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-white/80 text-sm">{BLOCK_WEEKS[today.rx.block] ?? ""} · {BLOCK_LABEL[today.rx.block] ?? ""}</p>
              <h1 className="text-2xl font-bold">
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
        </div>

        {isManual && (
          <DaySelector
            dayCount={today.dayCount}
            selected={today.dayIndex}
            titles={Array.from({ length: today.dayCount }, (_, i) => i)}
          />
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-5">
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
      </main>
    </div>
  );
}

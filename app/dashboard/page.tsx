import NavBar from "@/components/NavBar";
import ExerciseCard from "@/components/ExerciseCard";
import { getToday } from "@/lib/data";
import { BLOCK_LABEL, BLOCK_WEEKS } from "@/lib/program";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const today = await getToday();
  const blockColor =
    today.rx.block === "hypertrophy" ? "bg-navy" : today.rx.block === "strength" ? "bg-teal" : "bg-navy2";

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className={`rounded-xl ${blockColor} text-white p-5`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-white/80 text-sm">{BLOCK_WEEKS[today.rx.block]} · {BLOCK_LABEL[today.rx.block]} block</p>
              <h1 className="text-2xl font-bold">Week {today.week} — {today.dayTitle}</h1>
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

        <div className="grid md:grid-cols-2 gap-4 mt-5">
          {today.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              rx={today.rx}
              week={today.week}
              dayIndex={today.dayIndex}
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

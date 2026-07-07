import NavBar from "@/components/NavBar";
import BuilderClient from "./BuilderClient";
import { listExercises, getCustomDays } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BuildPage() {
  const [allExercises, customDays] = await Promise.all([listExercises(), getCustomDays()]);
  // shape current routine as dayIndex -> exerciseIds
  const initial = customDays.map((d) => ({ dayIndex: d.dayIndex, exerciseIds: d.exercises.map((e) => e.id), groups: d.groups }));
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Build your own program</h1>
        <p className="text-grey text-sm mt-1">
          Pick exercises from the library into your own days. Save, then make it active to train and
          track reps &amp; weights just like the other programs.
        </p>
        <BuilderClient allExercises={allExercises} initial={initial} />
      </main>
    </div>
  );
}

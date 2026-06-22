import NavBar from "@/components/NavBar";
import ProgressClient from "./ProgressClient";
import { listExercises } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const exercises = await listExercises();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Progress</h1>
        <p className="text-grey text-sm mt-1">Pick an exercise to see your top set weight and total volume climb week to week.</p>
        <ProgressClient exercises={exercises} />
      </main>
    </div>
  );
}

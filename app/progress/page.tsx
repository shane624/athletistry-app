import NavBar from "@/components/NavBar";
import ProgressClient from "./ProgressClient";
import MuscleBalance from "@/components/MuscleBalance";
import { listExercises } from "@/lib/data";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const exercises = await listExercises();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let programId = "periodized24";
  if (user) {
    const { data } = await supabase.from("user_program_state").select("active_program").eq("user_id", user.id).single();
    programId = data?.active_program ?? "periodized24";
  }
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Progress</h1>
        <p className="text-grey text-sm mt-1">See which muscle groups you&apos;ve trained, and watch individual lifts climb week to week.</p>

        <div className="mt-5"><MuscleBalance /></div>

        <h2 className="text-lg font-bold text-navy mt-8">Lift progress</h2>
        <p className="text-grey text-sm mt-1">Pick an exercise to see your top set weight and total volume climb week to week (current program).</p>
        <ProgressClient exercises={exercises} programId={programId} />
      </main>
    </div>
  );
}

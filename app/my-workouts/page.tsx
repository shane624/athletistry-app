import NavBar from "@/components/NavBar";
import MyWorkoutsClient from "./MyWorkoutsClient";
import { listSavedWorkouts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MyWorkoutsPage() {
  const workouts = await listSavedWorkouts();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">My Workouts</h1>
        <p className="text-grey text-sm mt-1">
          Your saved routines. Load one to train it today with full reps &amp; weight tracking, or rename and delete.
        </p>
        <MyWorkoutsClient workouts={workouts} />
      </main>
    </div>
  );
}

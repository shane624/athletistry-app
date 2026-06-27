import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import MyWorkoutsClient from "./MyWorkoutsClient";
import { listSavedWorkouts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MyWorkoutsPage() {
  const workouts = await listSavedWorkouts();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="stack" eyebrow="Saved by you" title="My Workouts"
          subtitle="Your saved routines — load one to train today, or rename and delete." />
        <MyWorkoutsClient workouts={workouts} />
      </main>
    </div>
  );
}

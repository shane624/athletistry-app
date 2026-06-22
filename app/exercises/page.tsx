import NavBar from "@/components/NavBar";
import LibraryClient from "./LibraryClient";
import { listExercises } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const exercises = await listExercises();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Exercise Library</h1>
        <p className="text-grey text-sm mt-1">All {exercises.length} exercises. Search, filter by level, and watch any video inline.</p>
        <LibraryClient exercises={exercises} />
      </main>
    </div>
  );
}

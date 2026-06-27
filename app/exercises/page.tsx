import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import LibraryClient from "./LibraryClient";
import { listExercises } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const exercises = await listExercises();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <PageHeader icon="library" eyebrow="Reference" title="Exercise Library"
          subtitle={`All ${exercises.length} exercises — search, filter by level, watch any video.`} />
        <LibraryClient exercises={exercises} />
      </main>
    </div>
  );
}

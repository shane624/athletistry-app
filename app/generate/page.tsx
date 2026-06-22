import NavBar from "@/components/NavBar";
import GeneratorClient from "./GeneratorClient";

export const dynamic = "force-dynamic";

export default function GeneratePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Random Workout</h1>
        <p className="text-grey text-sm mt-1">
          Pick a training style and difficulty, and the app builds a balanced session for today —
          legs, push, pull, and core — following the Build Your Workout structure. Tap regenerate to
          roll a new one.
        </p>
        <GeneratorClient />
      </main>
    </div>
  );
}

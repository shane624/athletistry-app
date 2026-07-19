import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import MovementMapQuiz from "@/components/MovementMapQuiz";
import MovementMapResult from "@/components/MovementMapResult";
import { getMovementMap } from "@/lib/movement-map-data";
import { MAP_TESTS } from "@/lib/movement-map";

export const dynamic = "force-dynamic";

export default async function MovementMapPage({ searchParams }: { searchParams: { retake?: string } }) {
  const saved = await getMovementMap();
  const retaking = searchParams?.retake === "1";
  const showResult = saved && !retaking;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader icon="target" eyebrow="Find the pattern" title="The Movement Map"
          subtitle="Stop collecting corrections. Find the pattern causing them." />

        {showResult ? (
          <MovementMapResult primary={saved!.primary} secondary={saved!.secondary} />
        ) : (
          <>
            {!retaking && (
              <div className="card p-5 mt-5 border-l-2 border-teal animate-in">
                <p className="text-navy text-sm leading-relaxed">
                  Your corrections aren&apos;t separate problems — they&apos;re symptoms of one movement pattern. Take {MAP_TESTS.length} quick tests
                  (about 7 minutes) and discover your <b>Dancer Movement Type</b>: your superpower, the pattern making ballet harder, and exactly what to practise.
                </p>
                <p className="text-grey text-xs mt-2">A movement-education screen — not a medical diagnosis. Do each movement once and notice what you feel.</p>
              </div>
            )}
            <MovementMapQuiz />
          </>
        )}
      </main>
    </div>
  );
}

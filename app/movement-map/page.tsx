import Link from "next/link";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";
import MovementMapQuiz from "@/components/MovementMapQuiz";
import MovementMapResult from "@/components/MovementMapResult";
import PoseScanResult from "@/components/PoseScanResult";
import { getMovementMap } from "@/lib/movement-map-data";
import { buildPostureSummary } from "@/lib/posture-to-type";
import { MAP_TESTS, MOVEMENT_TYPES } from "@/lib/movement-map";
import { BALLET_MOVES, buildBalletLeaning } from "@/lib/ballet-moves";
import { getBalletResults } from "@/lib/ballet-data";

export const dynamic = "force-dynamic";

export default async function MovementMapPage({ searchParams }: { searchParams: { retake?: string; quiz?: string } }) {
  const saved = await getMovementMap();
  const ballet = await getBalletResults();
  const balletLean = ballet.length ? buildBalletLeaning(ballet.flatMap((r) => r.votes), ballet.length) : null;
  const retaking = searchParams?.retake === "1";
  const forceQuiz = searchParams?.quiz === "1";
  const showResult = saved && !retaking && !forceQuiz;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader icon="target" eyebrow="Find the pattern" title="The Movement Map"
          subtitle="Stop collecting corrections. Find the pattern causing them." />

        {showResult ? (
          <>
            {/* the shareable type + emblem, for either mode */}
            <MovementMapResult primary={saved!.primary} secondary={saved!.secondary} />
            {/* if it came from the camera scan, add the posture read below */}
            {saved!.mode === "scan" && saved!.findings && (
              <div className="mt-8">
                <PageHeader icon="body" eyebrow="From your camera scan" title="Your posture read" />
                <PoseScanResult summary={buildPostureSummary(saved!.findings)}
                  primary={saved!.primary} secondary={saved!.secondary} hideTypeLink />
              </div>
            )}
          </>
        ) : forceQuiz ? (
          <>
            <div className="card p-5 mt-5 border-l-2 border-teal animate-in">
              <p className="text-navy text-sm leading-relaxed">
                Take {MAP_TESTS.length} quick tests (about 7 minutes) and discover your <b>Dancer Movement Type</b>:
                your superpower, the pattern making ballet harder, and exactly what to practise.
              </p>
              <p className="text-grey text-xs mt-2">A movement-education screen — not a medical diagnosis. Do each movement once and notice what you feel.</p>
            </div>
            <MovementMapQuiz />
          </>
        ) : (
          <>
            <div className="card p-5 mt-5 border-l-2 border-teal animate-in">
              <p className="text-navy text-sm leading-relaxed">
                Your corrections aren&apos;t separate problems — they&apos;re symptoms of one movement pattern.
                Find your <b>Dancer Movement Type</b> two ways: let your camera read your alignment, or answer a few quick questions.
              </p>
            </div>

            {/* method chooser */}
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Link href="/movement-map/scan"
                className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-end min-h-[150px] active:scale-[.98] transition"
                style={{ background: "linear-gradient(135deg,#1f2a44,#27ae9f)" }}>
                <span className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Icon name="target" className="w-5 h-5" />
                </span>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Recommended</span>
                <span className="text-white font-bold text-lg leading-tight">Camera posture scan</span>
                <span className="text-white/85 text-xs mt-1">Your camera tracks your body points from 3 angles. ~1 min.</span>
              </Link>

              <Link href="/movement-map?quiz=1"
                className="card card-hover p-5 flex flex-col justify-end min-h-[150px]">
                <span className="w-10 h-10 rounded-xl bg-light flex items-center justify-center text-teal mb-auto">
                  <Icon name="sparkle" className="w-5 h-5" />
                </span>
                <span className="text-grey text-[11px] font-bold uppercase tracking-widest">Quick</span>
                <span className="text-navy font-bold text-lg leading-tight">Self-assessment quiz</span>
                <span className="text-grey text-xs mt-1">Answer 5 movement questions. ~7 min, no camera.</span>
              </Link>
            </div>

            <p className="text-grey text-xs mt-4">
              Both routes land on the same 6 Dancer Movement Types. The camera adds a plain-language posture summary and your top priorities.
            </p>
          </>
        )}

        {/* Ballet Movement Lab — dynamic tests that also feed the 6 types */}
        <Link href="/movement-map/ballet" className="card card-hover block p-4 mt-8 border-l-2 border-teal animate-in">
          <p className="eyebrow">Ballet Movement Lab</p>
          <p className="text-navy text-sm font-semibold mt-0.5">Assess développé, à la seconde, turnout, port de bras &amp; knee line on camera.</p>
          {balletLean
            ? <p className="text-grey text-xs mt-1">{ballet.length}/{BALLET_MOVES.length} movements done · leaning {MOVEMENT_TYPES[balletLean.primary].name}. Tap to continue →</p>
            : <p className="text-grey text-xs mt-1">Live-cue movement tests that reveal patterns a static scan can&apos;t. Tap to start →</p>}
        </Link>
      </main>
    </div>
  );
}

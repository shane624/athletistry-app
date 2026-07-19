import Link from "next/link";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";
import BalletMoveCoach from "@/components/BalletMoveCoach";
import { BALLET_MOVES, buildBalletLeaning } from "@/lib/ballet-moves";
import { getBalletResults } from "@/lib/ballet-data";
import { MOVEMENT_TYPES } from "@/lib/movement-map";

export const dynamic = "force-dynamic";

export default async function BalletLabPage({ searchParams }: { searchParams: { move?: string } }) {
  const moveId = searchParams?.move;
  const active = moveId ? BALLET_MOVES.find((m) => m.id === moveId) : null;

  if (active) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <PageHeader icon="target" eyebrow="Ballet Movement Lab" title={active.name}
            subtitle={active.view === "side" ? "Side-on to the camera." : "Facing the camera."} />
          <BalletMoveCoach moveId={active.id} />
        </main>
      </div>
    );
  }

  const results = await getBalletResults();
  const done = new Set(results.map((r) => r.moveId));
  const leaning = results.length ? buildBalletLeaning(results.flatMap((r) => r.votes), results.length) : null;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader icon="target" eyebrow="Ballet Movement Lab" title="Ballet Movement Lab"
          subtitle="Live camera coaching for the movements that reveal your pattern." />

        <div className="card p-4 mt-5 border-l-2 border-teal animate-in">
          <p className="text-navy text-sm leading-relaxed">
            Do each movement in front of your camera and it reads your alignment in real time — pelvis level, leg height,
            knee line, turnout and shoulder rise — capturing your best rep and feeding your <b>Dancer Movement Type</b>.
          </p>
          <p className="text-grey text-xs mt-2">A movement-education screen — not a medical diagnosis. A 2D camera reads alignment, not true hip rotation.</p>
        </div>

        {leaning && (
          <div className="card p-4 mt-4 bg-light animate-in">
            <p className="eyebrow">So far your movement tests lean</p>
            <p className="text-navy text-sm mt-1"><b>{MOVEMENT_TYPES[leaning.primary].name}</b> — {MOVEMENT_TYPES[leaning.primary].tagline}</p>
            <p className="text-grey text-xs mt-1">{results.length} of {BALLET_MOVES.length} movements done. <Link href="/movement-map" className="text-teal font-semibold">See your full type →</Link></p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {BALLET_MOVES.map((m) => {
            const complete = done.has(m.id);
            return (
              <Link key={m.id} href={`/movement-map/ballet?move=${m.id}`}
                className="card card-hover p-4 flex flex-col min-h-[130px]">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-light flex items-center justify-center text-teal">
                    <Icon name="target" className="w-5 h-5" />
                  </span>
                  {complete && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal text-white">Done ✓</span>}
                </div>
                <p className="text-navy font-bold mt-2">{m.name}</p>
                <p className="text-grey text-xs mt-1 flex-1">{m.tip}</p>
                <span className="text-teal text-sm font-semibold mt-2 inline-flex items-center gap-1">
                  {complete ? "Redo" : "Start"}<Icon name="chevron" className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

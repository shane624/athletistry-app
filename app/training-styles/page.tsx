import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default function TrainingStylesPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-teal font-semibold tracking-widest text-sm">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy mt-1">Hypertrophy, Strength &amp; Endurance</h1>
        <p className="text-ink text-sm leading-relaxed mt-3">
          The same exercises can train very different qualities depending on how you load them. Here&apos;s
          what each style is for and how to set it up — pick the one that matches your goal for this block.
        </p>

        <div className="card p-4 mt-5">
          <h2 className="text-lg font-semibold text-navy">Hypertrophy <span className="text-grey text-sm font-normal">— build muscle size</span></h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            Hypertrophy is the thickening of muscle fibres over time. The goal is to create enough muscle
            damage to trigger growth. You do this with moderate volume and intensity, a slow eccentric
            (lowering) phase, and shorter rests so the muscle can&apos;t fully recover between sets.
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Stat label="Reps" value="8–12" />
            <Stat label="Sets" value="3–4" />
            <Stat label="Tempo" value="slow eccentric" />
            <Stat label="Rest" value="short" />
          </div>
        </div>

        <div className="card p-4 mt-4">
          <h2 className="text-lg font-semibold text-navy">Strength <span className="text-grey text-sm font-normal">— lift heavier</span></h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            Strength is the maximal effort a muscle can exert on a joint. The goal here is mechanical
            tension — lifting heavy. Keep reps low and rest long so the muscle recovers more completely
            between sets and can produce maximal force each time. Volume is low, intensity is high. After a
            strength block, work in a deload to let the body recover.
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Stat label="Reps" value="3–5" />
            <Stat label="Sets" value="3–5" />
            <Stat label="Intensity" value="high" />
            <Stat label="Rest" value="3 min+" />
          </div>
        </div>

        <div className="card p-4 mt-4">
          <h2 className="text-lg font-semibold text-navy">Endurance <span className="text-grey text-sm font-normal">— work longer</span></h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            Endurance is how long a muscle can work before hitting failure. The goal is sustained work, so
            reps stay high and rest stays minimal. Rapidly switching between exercises or circuit-style
            training works well, as do high-rep, low-rest methods. Intensity is low while volume is pushed
            to the max.
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Stat label="Reps" value="15–25+" />
            <Stat label="Sets" value="3" />
            <Stat label="Intensity" value="low" />
            <Stat label="Rest" value="minimal" />
          </div>
        </div>

        <div className="card p-4 mt-5 bg-light">
          <h3 className="font-semibold text-navy">How to choose</h3>
          <p className="text-ink text-sm leading-relaxed mt-1">
            Bodies adapt to the same training over time, so the most effective plans cycle through these
            styles in blocks (phases) leading up to your goals. A common flow is hypertrophy to build a
            base, then strength to express it, with endurance work to support stamina. In the app, the
            Random Workout tool lets you pick any of these styles and instantly builds a balanced session
            using the right reps, sets, and rest.
          </p>
        </div>

        <p className="text-grey text-xs mt-6">
          For safety guidance, see the disclaimer. Always warm up, use an appropriate load, and stop if anything hurts.
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2 text-center">
      <div className="text-grey text-xs">{label}</div>
      <div className="font-semibold text-navy">{value}</div>
    </div>
  );
}

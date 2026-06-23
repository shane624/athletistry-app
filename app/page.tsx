import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <img
          src="/icon-512.png"
          alt="Athletistry"
          width={112}
          height={112}
          className="mx-auto rounded-2xl shadow-lg"
        />
        <p className="text-teal font-semibold tracking-widest mt-5">ATHLETISTRY</p>
        <h1 className="text-4xl md:text-5xl font-bold text-navy mt-2">
          Athletistry Training
        </h1>
        <div className="h-1 w-20 bg-teal mx-auto my-5 rounded" />
        <p className="text-grey leading-relaxed">
          Your training home base. Follow a guided program built for dancers, generate a
          balanced workout on the spot, or build and save your own. Watch a demo video for
          every exercise, log your weights and reps, and watch your progress climb week to week.
        </p>

        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link href="/login" className="btn-primary">Member log in</Link>
          <Link href="/dashboard" className="btn-ghost">Go to today&apos;s workout</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 text-left">
          <Feature title="Programs" desc="Periodized, full-body, ballet return & kids." />
          <Feature title="Random Workout" desc="A balanced session on demand." />
          <Feature title="Build & Save" desc="Make your own routines and reuse them." />
          <Feature title="Track Progress" desc="Log lifts and see them improve." />
        </div>
      </div>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <div className="font-semibold text-navy text-sm">{title}</div>
      <div className="text-grey text-xs mt-0.5">{desc}</div>
    </div>
  );
}

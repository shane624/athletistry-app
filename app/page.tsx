import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <p className="text-teal font-semibold tracking-widest">ATHLETISTRY</p>
        <h1 className="text-4xl md:text-5xl font-bold text-navy mt-2">
          24-Week Periodized Program
        </h1>
        <div className="h-1 w-20 bg-teal mx-auto my-5 rounded" />
        <p className="text-grey leading-relaxed">
          Hypertrophy, strength, and endurance — eight weeks each. Watch every exercise,
          log your weight and reps, and let the app apply the right sets, reps, and tempo
          for whatever week you're on.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/login" className="btn-primary">Log in / Sign up</Link>
          <Link href="/dashboard" className="btn-ghost">Go to today&apos;s workout</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-10 text-white">
          <div className="rounded-lg bg-navy p-4 text-sm font-semibold">Weeks 1–8<br/><span className="font-normal opacity-80">Hypertrophy</span></div>
          <div className="rounded-lg bg-teal p-4 text-sm font-semibold">Weeks 9–16<br/><span className="font-normal opacity-90">Strength</span></div>
          <div className="rounded-lg bg-navy2 p-4 text-sm font-semibold">Weeks 17–24<br/><span className="font-normal opacity-80">Endurance</span></div>
        </div>
      </div>
    </main>
  );
}

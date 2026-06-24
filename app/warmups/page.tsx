import NavBar from "@/components/NavBar";
import Link from "next/link";

export const dynamic = "force-dynamic";

const WARMUPS = [
  { slug: "standard", title: "Standard Warm-Up", desc: "Your everyday warm-up — prepare the body before training, class, or rehearsal.", yid: "nftG1M2IJPA", advanced: false },
  { slug: "advanced", title: "Advanced Warm-Up", desc: "A harder warm-up for stronger dancers. Work up to it as your conditioning improves.", yid: "Nt_zXCLKYc8", advanced: true },
];

export default function WarmupsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="eyebrow animate-in">Prepare your body</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1 animate-in">Warm-Ups</h1>
        <p className="text-grey text-sm mt-1 animate-in">
          Do a warm-up before training — and any time you need to prepare: before class, a
          performance, or an exam. Choose the level that suits you.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {WARMUPS.map((w) => (
            <Link key={w.slug} href={`/warmups/${w.slug}`}
              className="card card-hover overflow-hidden block border-2 border-line hover:border-teal transition animate-in">
              <div className="relative aspect-video w-full bg-black">
                <img src={`https://i.ytimg.com/vi/${w.yid}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                {w.advanced && (
                  <span className="absolute top-2 right-2 badge bg-navy text-white text-[10px]">Advanced</span>
                )}
                <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal/95 text-white shadow-lg">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy">{w.title}</h3>
                <p className="text-grey text-sm mt-1">{w.desc}</p>
                <p className="text-teal text-sm mt-2 font-medium">Play ▸</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="card mt-6 p-4 animate-in">
          <p className="eyebrow">When to use these</p>
          <p className="text-grey text-sm mt-2">
            Before a training session, before class or rehearsal, and before a performance or exam.
            A few minutes of warming up improves how you move and lowers injury risk.
          </p>
        </div>
      </main>
    </div>
  );
}

import NavBar from "@/components/NavBar";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const WARMUPS: Record<string, { title: string; desc: string; yid: string }> = {
  standard: { title: "Standard Warm-Up", desc: "Your everyday warm-up. Follow along to prepare your body before training, class, rehearsal, or a performance.", yid: "nftG1M2IJPA" },
  advanced: { title: "Advanced Warm-Up", desc: "A harder warm-up for stronger dancers. Build up to this as your conditioning improves — back off if anything feels too much.", yid: "Nt_zXCLKYc8" },
};

export default function WarmupPlayer({ params }: { params: { slug: string } }) {
  const w = WARMUPS[params.slug];
  if (!w) notFound();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/warmups" className="text-teal text-sm">← Warm-ups</Link>
        <h1 className="text-2xl font-bold text-navy mt-2">{w.title}</h1>
        <p className="text-grey text-sm mt-1">{w.desc}</p>
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${w.yid}?rel=0&playsinline=1`}
            title={w.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <a className="text-grey text-xs mt-3 inline-block" target="_blank" rel="noopener" href={`https://www.youtube.com/watch?v=${w.yid}`}>
          Open on YouTube ↗
        </a>
      </main>
    </div>
  );
}

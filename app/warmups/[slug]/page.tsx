import NavBar from "@/components/NavBar";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

const WARMUPS: Record<string, { title: string; desc: string; yid: string; level: string; note: string }> = {
  gentle: { title: "Gentle Warm-Up", desc: "An easier warm-up to prepare your body before training, class, rehearsal, or a performance.", yid: "nftG1M2IJPA", level: "Foundation", note: "Use this when you want to feel ready without spending too much energy before the main work." },
  winning: { title: "Winning Warm-Up", desc: "A harder warm-up for stronger dancers. Build toward it as your conditioning improves.", yid: "Nt_zXCLKYc8", level: "Advanced", note: "This version asks more of your conditioning. Back off or switch to the Gentle Warm-Up when today calls for less." },
};

export default function WarmupPlayer({ params }: { params: { slug: string } }) {
  const w = WARMUPS[params.slug];
  if (!w) notFound();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <Link href="/warmups" className="text-teal text-[10px] font-semibold">← Warm-ups</Link>
        <header className="page-lead !mb-5 mt-4 animate-in"><div><p className="eyebrow">{w.level} · preparation</p><h1 className="!text-[clamp(2.7rem,5vw,4.3rem)] mt-2">{w.title}</h1><p className="mt-3">{w.desc}</p></div></header>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-3 items-start">
          <section className="panel overflow-hidden animate-in"><div className="aspect-video w-full bg-black"><iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${w.yid}?rel=0&playsinline=1`} title={w.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="p-4 flex justify-between items-center gap-3 flex-wrap"><p className="text-grey text-[10px]">Move with the video at your own pace.</p><a className="text-teal text-[9px] font-semibold" target="_blank" rel="noopener" href={`https://www.youtube.com/watch?v=${w.yid}`}>Open on YouTube ↗</a></div></section>
          <aside className="space-y-3 animate-in"><div className="panel panel-pad"><Icon name="warmup" className="w-5 h-5 text-teal" /><p className="font-display text-[24px] leading-none font-bold text-ink mt-4">The goal is readiness.</p><p className="text-grey text-[10px] leading-relaxed mt-3">{w.note}</p></div><div className="panel panel-pad"><p className="panel-title">Remember</p><p className="font-display text-[22px] leading-[1.02] font-bold text-ink mt-3">Warm enough to move. Fresh enough to dance.</p></div></aside>
        </div>
      </main>
    </div>
  );
}

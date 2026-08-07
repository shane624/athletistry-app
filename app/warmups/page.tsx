import NavBar from "@/components/NavBar";
import Link from "next/link";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

const WARMUPS = [
  { slug: "gentle", title: "Gentle Warm-Up", desc: "An easier sequence to prepare the body before training, class, rehearsal, or a long day of dancing.", yid: "nftG1M2IJPA", level: "Foundation" },
  { slug: "winning", title: "Winning Warm-Up", desc: "A more demanding preparation for stronger dancers who are ready for a higher conditioning load.", yid: "Nt_zXCLKYc8", level: "Advanced" },
];

export default function WarmupsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <header className="page-lead animate-in"><div><h1>Warm-Ups</h1><p className="mt-3">Prepare the body to move well before you ask it to move hard.</p></div></header>
        <section data-tour="warmup-pick" className="workout-grid stagger">
          {WARMUPS.map((w) => (
            <Link key={w.slug} href={`/warmups/${w.slug}`} className="workout-cover card-hover block">
              <div className="workout-cover-media">
                <img src={`https://i.ytimg.com/vi/${w.yid}/hqdefault.jpg`} alt="" />
                <span className="workout-play"><Icon name="play" className="w-5 h-5 ml-0.5" /></span>
                <span className="absolute z-[2] left-4 bottom-3 text-[8px] uppercase tracking-[.16em] text-white/60">{w.level} · follow along</span>
              </div>
              <div className="p-5"><h2 className="font-display text-[31px] leading-none font-bold text-white">{w.title}</h2><p className="text-white/50 text-[10px] leading-relaxed mt-3">{w.desc}</p><span className="text-[#7ea8eb] text-[9px] font-bold mt-5 inline-flex items-center gap-1">Start warm-up <Icon name="chevron" className="w-3.5 h-3.5" /></span></div>
            </Link>
          ))}
        </section>
        <section className="panel panel-pad mt-6 animate-in"><p className="panel-title">When to use these</p><h2 className="font-display text-[26px] leading-none font-bold text-ink mt-3">Before class. Before training. Before it matters.</h2><p className="text-grey text-[10px] leading-relaxed mt-3 max-w-2xl">Use a warm-up before strength work, ballet class, rehearsal, performance, or an exam. The point is not to exhaust yourself. It is to arrive at the first real task ready to move.</p></section>
      </main>
    </div>
  );
}

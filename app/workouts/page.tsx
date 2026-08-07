import NavBar from "@/components/NavBar";
import Link from "next/link";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

const GUIDED = [
  { slug: "mobility", title: "Guided Mobility", desc: "A full follow-along mobility session for range, control and recovery.", yid: "8f_-UKE4yB8", duration: "30 min", focus: "Mobility" },
  { slug: "strength", title: "Guided Strength", desc: "A complete strength session built around controlled, dancer-specific loading.", yid: "5hPSNI7oiKQ", duration: "30 min", focus: "Strength" },
];

export default function WorkoutsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <header className="page-lead animate-in">
          <div><h1>Guided Workouts</h1><p className="mt-3">Press play and train. No planning, no second-guessing, just a clear session to follow.</p></div>
        </header>

        <section className="workout-grid stagger">
          {GUIDED.map((g) => (
            <Link key={g.slug} href={`/workouts/${g.slug}`} className="workout-cover card-hover block">
              <div className="workout-cover-media">
                <img src={`https://i.ytimg.com/vi/${g.yid}/hqdefault.jpg`} alt="" />
                <span className="workout-play"><Icon name="play" className="w-5 h-5 ml-0.5" /></span>
                <span className="absolute z-[2] left-4 bottom-3 text-[8px] uppercase tracking-[.16em] text-white/60">{g.focus} · {g.duration}</span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-[31px] leading-none font-bold text-white">{g.title}</h2>
                <p className="text-white/50 text-[10px] leading-relaxed mt-3">{g.desc}</p>
                <p className="text-[#7ea8eb] text-[9px] font-bold mt-5 inline-flex items-center gap-1">Start workout <Icon name="chevron" className="w-3.5 h-3.5" /></p>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid md:grid-cols-3 gap-3 mt-8">
          <Link href="/generate" className="program-tool-card card-hover"><Icon name="bolt" className="w-5 h-5 text-teal" /><h3 className="font-display text-[23px] leading-none font-bold text-ink mt-4">Generate a practice</h3><p className="text-grey text-[10px] leading-relaxed mt-2">Need something different today? Build a balanced session instantly.</p></Link>
          <Link href="/circuit" className="program-tool-card card-hover"><Icon name="circuit" className="w-5 h-5 text-teal" /><h3 className="font-display text-[23px] leading-none font-bold text-ink mt-4">Circuit training</h3><p className="text-grey text-[10px] leading-relaxed mt-2">Use timed formats when conditioning is the goal.</p></Link>
          <Link href="/warmups" className="program-tool-card card-hover"><Icon name="warmup" className="w-5 h-5 text-teal" /><h3 className="font-display text-[23px] leading-none font-bold text-ink mt-4">Warm up first</h3><p className="text-grey text-[10px] leading-relaxed mt-2">Prepare the body before loading or longer-range work.</p></Link>
        </section>
      </main>
    </div>
  );
}

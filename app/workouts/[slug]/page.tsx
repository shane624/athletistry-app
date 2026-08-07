import NavBar from "@/components/NavBar";
import Link from "next/link";
import { notFound } from "next/navigation";
import FinishSession from "@/components/FinishSession";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

const GUIDED: Record<string, { title: string; desc: string; yid: string; focus: string; outline: { title: string; duration: string }[] }> = {
  mobility: {
    title: "Guided Mobility Workout",
    desc: "Move through range with control. This session is designed to create usable mobility rather than chasing passive flexibility.",
    yid: "8f_-UKE4yB8", focus: "Mobility & control",
    outline: [
      { title: "Arrival & breath", duration: "4 min" }, { title: "Spine & shoulders", duration: "7 min" },
      { title: "Hips & turnout range", duration: "10 min" }, { title: "Integrated movement", duration: "9 min" },
    ],
  },
  strength: {
    title: "Guided Strength Workout",
    desc: "A full-body strength practice for dancers. Use a load that asks for effort while still allowing precise, repeatable movement.",
    yid: "5hPSNI7oiKQ", focus: "Strength & control",
    outline: [
      { title: "Warm-up", duration: "5 min" }, { title: "Lower body", duration: "9 min" },
      { title: "Upper body & trunk", duration: "9 min" }, { title: "Integrated finish", duration: "7 min" },
    ],
  },
};

export default function GuidedWorkout({ params }: { params: { slug: string } }) {
  const g = GUIDED[params.slug];
  if (!g) notFound();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <Link href="/workouts" className="text-teal text-[10px] font-semibold inline-flex items-center gap-1 mb-4">← Guided workouts</Link>
        <header className="page-lead !mb-5 animate-in"><div><p className="eyebrow">{g.focus}</p><h1 className="!text-[clamp(2.5rem,5vw,4rem)] mt-2">{g.title}</h1><p className="mt-3 max-w-2xl">{g.desc}</p></div></header>

        <div className="workout-detail-grid">
          <aside className="panel workout-outline animate-in">
            <div className="px-4 pt-4 pb-2"><p className="panel-title">Session outline</p><p className="text-grey text-[9px] mt-1">About 30 minutes</p></div>
            {g.outline.map((item, i) => <div key={item.title} className="workout-outline-row flex items-center gap-3"><span className={`w-7 h-7 rounded-full grid place-items-center text-[9px] font-bold ${i === 0 ? "bg-teal text-white" : "bg-light text-grey"}`}>{String(i + 1).padStart(2,"0")}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-ink truncate">{item.title}</p><p className="text-[8px] text-grey mt-0.5">{item.duration}</p></div><Icon name="chevron" className="w-3.5 h-3.5 text-grey" /></div>)}
          </aside>

          <div className="space-y-3">
            <section className="panel overflow-hidden animate-in">
              <div className="aspect-video w-full bg-black">
                <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${g.yid}?rel=0&playsinline=1`} title={g.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div><p className="panel-title">About this session</p><p className="text-grey text-[10px] mt-1">Follow at your own pace. Stop or modify anything that causes pain.</p></div>
                <a className="text-teal text-[9px] font-semibold" target="_blank" rel="noopener" href={`https://www.youtube.com/watch?v=${g.yid}`}>Open on YouTube ↗</a>
              </div>
            </section>
            <div className="panel panel-pad animate-in"><FinishSession kind="Guided workout" label="Complete this workout" defaultDuration={30} /></div>
          </div>
        </div>
      </main>
    </div>
  );
}

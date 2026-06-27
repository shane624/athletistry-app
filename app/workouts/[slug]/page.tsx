import NavBar from "@/components/NavBar";
import Link from "next/link";
import { notFound } from "next/navigation";
import FinishSession from "@/components/FinishSession";

export const dynamic = "force-dynamic";

const GUIDED: Record<string, { title: string; desc: string; yid: string }> = {
  mobility: { title: "Guided Mobility Workout", desc: "A full guided mobility session — follow along at your own pace. Move gently and stop if anything hurts.", yid: "8f_-UKE4yB8" },
  strength: { title: "Guided Strength Workout", desc: "A full guided strength session — follow along, using a load that's challenging but lets you keep good form.", yid: "5hPSNI7oiKQ" },
};

export default function GuidedWorkout({ params }: { params: { slug: string } }) {
  const g = GUIDED[params.slug];
  if (!g) notFound();
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/workouts" className="text-teal text-sm">← Guided workouts</Link>
        <h1 className="text-2xl font-bold text-navy mt-2">{g.title}</h1>
        <p className="text-grey text-sm mt-1">{g.desc}</p>
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${g.yid}?rel=0&playsinline=1`}
            title={g.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <a className="text-grey text-xs mt-3 inline-block" target="_blank" rel="noopener" href={`https://www.youtube.com/watch?v=${g.yid}`}>
          Open on YouTube ↗
        </a>

        <FinishSession kind="Guided workout" label="Complete this workout" defaultDuration={30} />
      </main>
    </div>
  );
}

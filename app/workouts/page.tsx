import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GUIDED = [
  { slug: "mobility", title: "Guided Mobility Workout", desc: "Follow along with a full guided mobility session.", yid: "8f_-UKE4yB8" },
  { slug: "strength", title: "Guided Strength Workout", desc: "Follow along with a full guided strength session.", yid: "5hPSNI7oiKQ" },
];

export default function WorkoutsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="play" eyebrow="Press play" title="Guided Workouts"
          subtitle="Full follow-along video sessions you can do anytime." />
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {GUIDED.map((g) => (
            <Link key={g.slug} href={`/workouts/${g.slug}`} className="card overflow-hidden block hover:border-teal border-2 border-line transition">
              <div className="aspect-video w-full bg-black">
                <img src={`https://i.ytimg.com/vi/${g.yid}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy">{g.title}</h3>
                <p className="text-grey text-sm mt-1">{g.desc}</p>
                <p className="text-teal text-sm mt-2 font-medium">Play ▸</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = { title: "Athletistry for Studios" };

export default function ForStudiosPage() {
  const features = [
    { icon: "users" as const, title: "Your whole roster, one screen", body: "Every dancer's rank, streak, and training status — dancers who aren't tracking or are over/under-training surface first." },
    { icon: "chart" as const, title: "Training-load tracking", body: "See at a glance who's overreaching, who's undertraining, and who isn't logging at all — before it becomes an injury or a plateau." },
    { icon: "calendar" as const, title: "Each dancer's calendar", body: "Open any dancer to see the days they trained, what they did, and how hard — their real week, not a guess." },
    { icon: "target" as const, title: "Movement screening", body: "Their Dancer Movement Type, camera posture scan, and Ballet Movement Lab results, all in one place." },
  ];
  return (
    <main className="min-h-screen">
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
        <p className="text-teal font-semibold tracking-widest">ATHLETISTRY FOR STUDIOS</p>
        <h1 className="text-4xl font-extrabold text-navy mt-3 leading-tight">See how your dancers are really training</h1>
        <p className="text-grey text-lg mt-4">
          Give your dancers the full Athletistry app, and get a coach&apos;s-eye view of every one of them —
          workload, calendar, and movement screening in one place.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <Link href="/studio/create" className="btn-primary py-3 px-6 inline-flex items-center gap-2">
            <Icon name="users" className="w-5 h-5" /> Create your studio
          </Link>
          <Link href="/studio/join" className="btn-ghost py-3 px-6">I have a studio code</Link>
        </div>
        <p className="text-grey text-sm mt-4">Free for your first 2 dancers · then $20 AUD per dancer / month.</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <span className="w-11 h-11 rounded-2xl bg-light flex items-center justify-center text-teal">
                <Icon name={f.icon} className="w-6 h-6" />
              </span>
              <h3 className="text-navy font-bold mt-3">{f.title}</h3>
              <p className="text-grey text-sm mt-1">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 mt-6 text-center">
          <h3 className="text-navy font-bold text-lg">How it works</h3>
          <p className="text-grey text-sm mt-2 max-w-xl mx-auto">
            Create your studio and you get a join code. Share it with your dancers — they use it to create their own
            Athletistry account, and they appear on your roster automatically. No invite emails, no spreadsheets.
          </p>
          <Link href="/studio/create" className="btn-primary py-3 px-6 mt-5 inline-block">Get started</Link>
          <p className="text-grey text-xs mt-3">Already have a login? <Link href="/login" className="text-teal">Log in</Link>.</p>
        </div>
      </section>
    </main>
  );
}

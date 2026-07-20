import Link from "next/link";
import NavBar from "@/components/NavBar";
import Icon from "@/components/Icon";
import StudentCalendar from "@/components/StudentCalendar";
import { redirect } from "next/navigation";
import { getStudentOverview } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

const LOAD_STYLE: Record<string, string> = {
  over: "bg-red-100 text-red-700", under: "bg-amber-100 text-amber-700",
  "on-track": "bg-emerald-100 text-emerald-700", taper: "bg-blue-100 text-blue-700",
  "event-week": "bg-violet-100 text-violet-700", "no-data": "bg-light text-grey",
};

function daysAgo(date: string | null): string {
  if (!date) return "never";
  const diff = Math.floor((Date.now() - new Date(date + "T00:00:00").getTime()) / 86400000);
  return diff <= 0 ? "today" : diff === 1 ? "yesterday" : `${diff}d ago`;
}

export default async function StudentOverviewPage({ params }: { params: { id: string; uid: string } }) {
  let s;
  try { s = await getStudentOverview(params.id, params.uid); }
  catch { redirect(`/studio/${params.id}`); }
  const o = s!;
  const maxTrimp = Math.max(1, ...o.load.weeks.map((w) => w.trimp));

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <Link href={`/studio/${params.id}`} className="text-grey hover:text-navy"><Icon name="chevron" className="w-5 h-5 rotate-180" /></Link>
          <p className="eyebrow">Dancer</p>
        </div>
        <h1 className="text-2xl font-extrabold text-navy mt-1">{o.name}</h1>
        <p className="text-grey text-sm break-all">{o.email}</p>

        {/* headline stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat value={o.rank} label="Rank" />
          <Stat value={`${o.currentStreak} wk`} label="Streak" />
          <Stat value={String(o.totalWorkouts)} label="Workouts" />
          <Stat value={daysAgo(o.lastActive)} label="Last active" alert={!o.load.tracking} />
        </div>

        {/* Training load — the coaching signal */}
        <div className="card p-5 mt-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Training load</p>
            {!o.load.tracking
              ? <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">Not tracking</span>
              : <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${LOAD_STYLE[o.load.status] ?? "bg-light text-grey"}`}>{o.load.label}</span>}
          </div>
          {!o.load.tracking ? (
            <p className="text-navy text-sm mt-2">
              {o.load.lastTracked
                ? `No sessions logged recently — last tracked ${daysAgo(o.load.lastTracked)}. Encourage them to log class/rehearsal time + effort so you can watch their workload.`
                : "This dancer hasn't logged any training sessions yet, so there's no workload to assess."}
            </p>
          ) : (
            <>
              <p className="text-navy text-sm mt-2">{o.load.message}</p>
              <div className="flex items-end gap-1.5 mt-4 h-20">
                {o.load.weeks.map((w) => (
                  <div key={w.week} className="flex-1 flex flex-col items-center justify-end">
                    <div className="w-full rounded-t bg-teal/80" style={{ height: `${Math.round((w.trimp / maxTrimp) * 100)}%` }} title={`${w.trimp} load`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-grey text-[11px] mt-1">
                <span>{o.load.weeks.length}-week load</span>
                {o.load.changePct !== null && <span>{o.load.changePct >= 0 ? "+" : ""}{o.load.changePct}% vs last week</span>}
              </div>
            </>
          )}
        </div>

        {/* Training calendar */}
        <div className="mt-4">
          <StudentCalendar sessions={o.calendar.sessions} events={o.calendar.events} />
        </div>

        {/* Movement type */}
        {o.movement && (
          <div className="card p-4 mt-4">
            <p className="eyebrow">Dancer Movement Type</p>
            <p className="text-navy text-sm mt-1"><b>{o.movement.primary}</b> · secondary {o.movement.secondary}</p>
          </div>
        )}

        {/* Ballet Lab */}
        {o.ballet.length > 0 && (
          <div className="card p-4 mt-4">
            <p className="eyebrow">Ballet Movement Lab</p>
            <ul className="mt-2 space-y-1.5">
              {o.ballet.map((b, i) => (
                <li key={i} className="text-sm flex justify-between gap-3">
                  <span className="text-navy font-medium">{b.move}</span>
                  <span className="text-grey text-right">{b.headline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card p-4 mt-4">
          <p className="eyebrow">Program</p>
          <p className="text-navy text-sm mt-1">{o.program}</p>
        </div>

        <p className="text-grey text-xs mt-6">This dancer joined your studio and is sharing their training data. Data is read-only.</p>
      </main>
    </div>
  );
}

function Stat({ value, label, alert }: { value: string; label: string; alert?: boolean }) {
  return (
    <div className="card p-3 text-center">
      <div className={`text-lg font-extrabold ${alert ? "text-red-600" : "text-navy"}`}>{value}</div>
      <div className="text-grey text-[11px] mt-0.5">{label}</div>
    </div>
  );
}

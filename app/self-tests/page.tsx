import Link from "next/link";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";
import SectionTabs from "@/components/SectionTabs";
import { PROGRESS_TOOLS } from "@/lib/nav-items";
import { getSelfTestAttempts } from "@/lib/self-tests-data";
import { SELF_TESTS, RETEST_DAYS, atGoal, daysSince, formatValue, shortDate, trend, type Attempt } from "@/lib/self-tests";

export const dynamic = "force-dynamic";

export default async function SelfTestsPage() {
  const attempts = await getSelfTestAttempts();
  const byTest = new Map<string, Attempt[]>();
  for (const a of attempts) byTest.set(a.testId, [...(byTest.get(a.testId) ?? []), a]);

  const done = SELF_TESTS.filter((t) => byTest.has(t.id)).length;
  const due = SELF_TESTS.filter((t) => {
    const list = byTest.get(t.id);
    return list && daysSince(list[list.length - 1].takenAt) >= RETEST_DAYS;
  }).length;
  const improved = SELF_TESTS.filter((t) => {
    const list = byTest.get(t.id);
    if (!list || list.length < 2) return false;
    return t.measures.some((m) => trend(m, list[0].values[m.id], list[list.length - 1].values[m.id]) === "better");
  }).length;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-compact">
        <PageHeader icon="target" eyebrow="From The Dancer's Playbook" title="The 10 self-tests"
          subtitle="Test once, write it down, retest every four weeks. The corrections you've heard for years, measured." />
        <SectionTabs items={PROGRESS_TOOLS} label="Progress sections" />

        <div className="grid grid-cols-3 gap-3 mt-5 animate-in">
          <Stat value={`${done}/10`} label="Tests taken" />
          <Stat value={String(improved)} label="Improved" />
          <Stat value={String(due)} label="Due to retest" />
        </div>

        {done === 0 && (
          <div className="card p-5 mt-4 border-l-2 border-teal animate-in">
            <p className="text-navy text-sm leading-relaxed">
              Start with <b>the balance test</b>. It takes ten seconds and has a built-in timer.
              Do all ten this week, then come back in four weeks and do them again.
            </p>
            <p className="text-grey text-xs mt-2">General education for healthy dancers, not medical advice. Stop any test that causes pain.</p>
          </div>
        )}

        <ul className="mt-5 space-y-2">
          {SELF_TESTS.map((t) => {
            const list = byTest.get(t.id) ?? [];
            const latest = list[list.length - 1];
            const first = list[0];
            const isDue = latest && daysSince(latest.takenAt) >= RETEST_DAYS;
            const goal = latest ? t.measures.every((m) => atGoal(m, latest.values[m.id]) !== false) : false;
            const better = list.length > 1 && t.measures.some((m) => trend(m, first.values[m.id], latest.values[m.id]) === "better");
            return (
              <li key={t.id}>
                <Link href={`/self-tests/${t.id}`} className="card card-hover p-4 flex items-center gap-4">
                  <span className="w-9 text-center text-teal font-bold tabular-nums">{t.n}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-navy font-semibold">{t.title}</span>
                    <span className="block text-xs text-grey mt-0.5 truncate">
                      {latest
                        ? `${shortDate(latest.takenAt)} · ${t.measures.map((m) => formatValue(m, latest.values[m.id])).filter((v) => v !== "None").join(" · ")}`
                        : `"${t.correction}"`}
                    </span>
                  </span>
                  {latest ? (
                    <span className={`badge text-[11px] shrink-0 ${isDue ? "text-teal" : "text-grey"}`}>
                      {isDue ? "Retest due" : better ? "Improved" : goal ? "On track" : `${list.length} logged`}
                    </span>
                  ) : (
                    <span className="badge text-[11px] shrink-0 text-grey">Not taken</span>
                  )}
                  <Icon name="chevron" className="w-4 h-4 text-grey shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="text-grey text-xs mt-6">Want the anatomy behind each test and the four-week plan? It&apos;s all in The Dancer&apos;s Playbook.</p>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-bold text-navy tabular-nums">{value}</p>
      <p className="text-xs text-grey mt-1">{label}</p>
    </div>
  );
}

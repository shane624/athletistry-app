import Link from "next/link";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import SelfTestLogger from "@/components/SelfTestLogger";
import SelfTestHistory from "@/components/SelfTestHistory";
import { getSelfTestAttempts } from "@/lib/self-tests-data";
import { SELF_TESTS, RETEST_DAYS, daysSince, getTest } from "@/lib/self-tests";

export const dynamic = "force-dynamic";

export default async function SelfTestPage({ params }: { params: { id: string } }) {
  const test = getTest(params.id);
  if (!test) notFound();
  const attempts = await getSelfTestAttempts(test.id);
  const latest = attempts[attempts.length - 1];
  const wait = latest ? RETEST_DAYS - daysSince(latest.takenAt) : 0;
  const next = SELF_TESTS.find((t) => t.n === test.n + 1);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-compact">
        <Link href="/self-tests" className="text-sm text-teal font-semibold">All self-tests</Link>
        <div className="mt-3">
          <PageHeader icon="target" eyebrow={`Self-test ${test.n} of 10 · "${test.correction}"`} title={test.title} />
        </div>

        <section className="card p-5 mt-5 animate-in">
          <p className="eyebrow">How to do it</p>
          <ol className="mt-3 space-y-2">
            {test.how.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-navy leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-light text-teal text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-navy leading-relaxed mt-4"><b>What it tells you:</b> {test.tells}</p>
          <p className="text-sm text-navy leading-relaxed mt-2"><b>What to work on:</b> {test.focus}</p>
        </section>

        {latest && wait > 0 && (
          <p className="text-xs text-grey mt-4">Last tested {daysSince(latest.takenAt)} days ago. Best results come from retesting after four weeks ({wait} days to go), but you can log any time.</p>
        )}

        <SelfTestLogger testId={test.id} />

        <section className="mt-8">
          <p className="eyebrow">Your results</p>
          <SelfTestHistory testId={test.id} attempts={attempts} />
        </section>

        {next && (
          <Link href={`/self-tests/${next.id}`} className="card card-hover p-4 mt-6 flex items-center justify-between">
            <span className="text-sm text-grey">Next: <span className="text-navy font-semibold">{next.title}</span></span>
            <span className="text-teal text-sm font-semibold">Go</span>
          </Link>
        )}
      </main>
    </div>
  );
}


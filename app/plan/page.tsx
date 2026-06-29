import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import PlanClient from "./PlanClient";
import RejoinEventPlan from "@/components/RejoinEventPlan";
import { getLoadData } from "@/lib/load-data";
import { getPausedEventPlan } from "@/lib/event-plan-data";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  // pull recent logged classes so we can pre-fill the schedule
  const { sessions } = await getLoadData();
  const paused = await getPausedEventPlan();
  // keep only class-like sessions, most recent ~21 days, to infer a typical week
  const recent = sessions
    .filter((s) => ["class", "rehearsal"].includes(s.kind))
    .slice(0, 30)
    .map((s) => ({ date: s.session_date, mins: s.duration_min, rpe: s.rpe }));

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="target" eyebrow="Plan around your dancing" title="Training Plan Builder"
          subtitle="Tell us your event and your classes — we build a dated, day-by-day plan that climbs, then tapers." />
        {paused.paused && (
          <div className="mt-5">
            <RejoinEventPlan label={paused.label} daysLeft={paused.daysLeft} />
            <p className="text-grey text-xs -mt-3 mb-1">Or build a new plan below — it will replace the paused one.</p>
          </div>
        )}
        <PlanClient loggedClasses={recent} />
      </main>
    </div>
  );
}

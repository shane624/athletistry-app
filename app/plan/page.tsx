import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import PlanClient from "./PlanClient";
import RejoinEventPlan from "@/components/RejoinEventPlan";
import { getLoadData } from "@/lib/load-data";
import { getEventPlanStatus } from "@/lib/event-plan-data";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  // pull recent logged classes so we can pre-fill the schedule
  const { sessions } = await getLoadData();
  const planStatus = await getEventPlanStatus();
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

        {planStatus.status === "active" && (
          <div className="card p-4 mt-5 border-l-2 border-teal">
            <p className="eyebrow">Plan active</p>
            <p className="text-navy text-sm font-semibold mt-0.5">
              {planStatus.label ?? "Your event plan"} is running your Today screen · {planStatus.daysLeft} day{planStatus.daysLeft === 1 ? "" : "s"} left
            </p>
            <a href="/dashboard" className="text-teal text-sm font-semibold mt-2 inline-block">Go to Today →</a>
            <p className="text-grey text-xs mt-2">Building a new plan below will replace it.</p>
          </div>
        )}

        {planStatus.status === "paused" && planStatus.daysLeft > 0 && (
          <div className="mt-5">
            <RejoinEventPlan label={planStatus.label} daysLeft={planStatus.daysLeft} />
            <p className="text-grey text-xs -mt-3 mb-1">Or build a new plan below — it will replace the paused one.</p>
          </div>
        )}

        {planStatus.status === "paused" && planStatus.daysLeft === 0 && (
          <div className="card p-4 mt-5 bg-light">
            <p className="text-navy text-sm font-semibold">Your last plan has finished</p>
            <p className="text-grey text-xs mt-1">Its dates have all passed. Build a fresh plan below for your next event.</p>
          </div>
        )}

        <PlanClient loggedClasses={recent} />
      </main>
    </div>
  );
}

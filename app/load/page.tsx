import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import { getAssessment, getLoadData } from "@/lib/load-data";
import { getEventPlanDays } from "@/lib/event-plan-data";
import LoadClient from "./LoadClient";
import Calendar from "./Calendar";

export const dynamic = "force-dynamic";

export default async function LoadPage() {
  const { assessment, weeks, nextEvent } = await getAssessment();
  const { sessions, events } = await getLoadData();
  const eventPlan = await getEventPlanDays();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="calendar" eyebrow="Train like an athlete" title="Training Calendar"
          subtitle="Log every session as time + effort (RPE). The app tracks your weekly load and tapers you before an event." />
        <LoadClient
          assessment={assessment}
          weeks={weeks}
          sessions={sessions}
          events={events}
          nextEventName={nextEvent?.name || nextEvent?.kind || null}
        />

        <div className="mt-8">
          <p className="eyebrow mb-1">Your schedule</p>
          <p className="text-grey text-sm mb-3">
            {eventPlan.active
              ? <>Your <b className="text-navy">{eventPlan.label ?? "event plan"}</b> is laid out below — tap a ◆ day to see its workout, or any other day to plan a class.</>
              : <>Your week at a glance. Tap a day to <b className="text-navy">plan ahead</b> — add an upcoming class or event. (To record something you&apos;ve done, use “Log a session” above.)</>}
          </p>
          <Calendar sessions={sessions} events={events} planDays={eventPlan.days} />
        </div>
      </main>
    </div>
  );
}

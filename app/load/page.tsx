import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import { getAssessment, getLoadData } from "@/lib/load-data";
import LoadClient from "./LoadClient";
import Calendar from "./Calendar";

export const dynamic = "force-dynamic";

export default async function LoadPage() {
  const { assessment, weeks, nextEvent } = await getAssessment();
  const { sessions, events } = await getLoadData();

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
          <p className="eyebrow mb-3">Your schedule</p>
          <Calendar sessions={sessions} events={events} />
        </div>
      </main>
    </div>
  );
}

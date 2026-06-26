import NavBar from "@/components/NavBar";
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
        <p className="eyebrow">Train like an athlete</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">Training Calendar</h1>
        <p className="text-grey text-sm mt-1">
          Log every session — gym, class, or rehearsal — as duration and effort (RPE). The app tracks
          your weekly load and guides the ~10% weekly build, then tapers you two weeks out from an event.
        </p>
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

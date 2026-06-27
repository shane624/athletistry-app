import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import PlanClient from "./PlanClient";

export const dynamic = "force-dynamic";

export default function PlanPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="target" eyebrow="Plan around your dancing" title="Event Planner"
          subtitle="Enter a performance or exam — we map the weeks back, building then tapering so you arrive fresh." />
        <PlanClient />
      </main>
    </div>
  );
}

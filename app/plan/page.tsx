import NavBar from "@/components/NavBar";
import PlanClient from "./PlanClient";

export const dynamic = "force-dynamic";

export default function PlanPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="eyebrow">Plan around your dancing</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">Event Planner</h1>
        <p className="text-grey text-sm mt-1">
          Enter your next performance, competition or exam. We&apos;ll map the weeks back from it —
          build through the meso phase, then taper the last two weeks so you arrive fresh and strong.
        </p>
        <PlanClient />
      </main>
    </div>
  );
}

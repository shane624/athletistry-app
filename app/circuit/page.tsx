import { Suspense } from "react";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import CircuitClient from "./CircuitClient";

export const dynamic = "force-dynamic";

export default function CircuitPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="circuit" eyebrow="Conditioning" title="Circuit Training"
          subtitle="Pick a format — the app builds a timed circuit and runs the clock for you." />
        <Suspense fallback={<p className="text-grey text-sm mt-5">Loading…</p>}>
          <CircuitClient />
        </Suspense>
      </main>
    </div>
  );
}

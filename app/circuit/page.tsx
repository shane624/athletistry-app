import { Suspense } from "react";
import NavBar from "@/components/NavBar";
import CircuitClient from "./CircuitClient";

export const dynamic = "force-dynamic";

export default function CircuitPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="eyebrow">Conditioning</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">Circuit Training</h1>
        <p className="text-grey text-sm mt-1">
          Pick a format and the app builds a timed circuit — legs, push, pull, and core, or a single
          focus. Big movements first, then accessories. Press start and follow the clock.
        </p>
        <Suspense fallback={<p className="text-grey text-sm mt-5">Loading…</p>}>
          <CircuitClient />
        </Suspense>
      </main>
    </div>
  );
}

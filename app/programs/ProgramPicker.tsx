"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setActiveProgram, markOnboarded } from "@/lib/data";

interface P { id: string; name: string; tagline: string; dayCount: number; exerciseCount: number; }

export default function ProgramPicker({ programs, active, first, customActive }: { programs: P[]; active: string; first?: boolean; customActive?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function choose(id: string) {
    setBusy(id);
    await setActiveProgram(id);
    // Always mark onboarded on selection so the welcome flow never repeats.
    await markOnboarded();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-5">
      {programs.map((p) => (
        <button
          key={p.id}
          onClick={() => choose(p.id)}
          disabled={!!busy}
          className={`text-left card p-5 border-2 transition ${
            p.id === active ? "border-teal bg-light" : "border-line hover:border-teal"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">{p.name}</h3>
            {p.id === active && <span className="badge bg-teal text-white">Active</span>}
          </div>
          <p className="text-grey text-sm mt-1">{p.tagline}</p>
          <p className="text-grey text-xs mt-2">{p.dayCount} day{p.dayCount > 1 ? "s" : ""} · {p.exerciseCount} exercises</p>
          {busy === p.id && <p className="text-teal text-xs mt-2">Switching…</p>}
        </button>
      ))}

      {/* Build Your Own */}
      <Link href="/build" className={`text-left card p-5 border-2 transition block ${customActive ? "border-teal bg-light" : "border-line hover:border-teal"}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-navy">Build Your Own</h3>
          {customActive && <span className="badge bg-teal text-white">Active</span>}
        </div>
        <p className="text-grey text-sm mt-1">Pick exercises from the library and build your own routine. Full reps &amp; weight tracking.</p>
        <p className="text-teal text-xs mt-2 font-medium">Open builder →</p>
      </Link>

      {/* Random Workout Generator */}
      <Link href="/generate" className="text-left card p-5 border-2 border-line hover:border-teal transition block">
        <h3 className="font-semibold text-navy">Random Workout</h3>
        <p className="text-grey text-sm mt-1">Generate a balanced session on the spot — legs, push, pull, and core — at the difficulty you choose.</p>
        <p className="text-teal text-xs mt-2 font-medium">Generate →</p>
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setActiveProgram, markOnboarded } from "@/lib/data";

interface P { id: string; name: string; tagline: string; dayCount: number; exerciseCount: number; }

export default function ProgramPicker({ programs, active, first }: { programs: P[]; active: string; first?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function choose(id: string) {
    setBusy(id);
    await setActiveProgram(id);
    if (first) await markOnboarded();
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
    </div>
  );
}

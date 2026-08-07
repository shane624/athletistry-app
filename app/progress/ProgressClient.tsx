"use client";

import { useState } from "react";
import { getProgress } from "@/lib/data";
import type { ExerciseRow } from "@/lib/types";
import ProgressChart from "@/components/ProgressChart";

export default function ProgressClient({ exercises, programId }: { exercises: ExerciseRow[]; programId: string }) {
  const [selected, setSelected] = useState<number | "">("");
  const [data, setData] = useState<{ week: number; topWeight: number; volume: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function pick(id: number) {
    setSelected(id);
    if (!id) { setData(null); return; }
    setLoading(true);
    const series = await getProgress(programId, id);
    setData(series);
    setLoading(false);
  }

  return (
    <div className="mt-4 grid lg:grid-cols-[290px_minmax(0,1fr)] gap-3 items-start">
      <div className="panel panel-pad">
        <p className="panel-title">Exercise</p>
        <select className="input mt-3" value={selected} onChange={(e) => pick(Number(e.target.value))}>
          <option value="">Choose an exercise…</option>
          {exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <p className="text-grey text-[10px] leading-relaxed mt-3">Progress is shown from sets logged inside your current program.</p>
      </div>
      <div className="panel panel-pad min-h-[330px]">
        {loading ? <p className="text-grey text-sm">Loading…</p> : data ? <ProgressChart data={data} /> : (
          <div className="min-h-[280px] grid place-items-center text-center px-6">
            <div><p className="font-display text-2xl font-bold text-ink">Your strength has a story.</p><p className="text-grey text-xs mt-2 max-w-sm">Choose an exercise and the app will plot your top load and total volume week by week.</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

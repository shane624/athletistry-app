"use client";

import { useState } from "react";
import { getProgress } from "@/lib/data";
import type { ExerciseRow } from "@/lib/types";
import ProgressChart from "@/components/ProgressChart";

export default function ProgressClient({ exercises }: { exercises: ExerciseRow[] }) {
  const [selected, setSelected] = useState<number | "">("");
  const [data, setData] = useState<{ week: number; topWeight: number; volume: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function pick(id: number) {
    setSelected(id);
    setLoading(true);
    const series = await getProgress(id);
    setData(series);
    setLoading(false);
  }

  return (
    <div className="mt-4">
      <select
        className="input max-w-sm"
        value={selected}
        onChange={(e) => pick(Number(e.target.value))}
      >
        <option value="">Choose an exercise…</option>
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      <div className="card p-4 mt-4">
        {loading ? <p className="text-grey">Loading…</p> : data ? <ProgressChart data={data} /> : <p className="text-grey">Select an exercise above.</p>}
      </div>
    </div>
  );
}

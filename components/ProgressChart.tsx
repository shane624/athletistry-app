"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Pt { week: number; topWeight: number; volume: number; }

export default function ProgressChart({ data }: { data: Pt[] }) {
  if (!data.length) {
    return <p className="text-grey">No logged sets yet for this exercise.</p>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--c-line)" strokeDasharray="3 3" />
          <XAxis dataKey="week" stroke="var(--c-grey)" tickFormatter={(w) => `W${w}`} />
          <YAxis yAxisId="left" stroke="var(--c-teal)" />
          <YAxis yAxisId="right" orientation="right" stroke="var(--c-grey)" />
          <Tooltip contentStyle={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: 12, color: "var(--c-ink)" }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="topWeight" name="Top weight" stroke="var(--c-teal)" strokeWidth={2.5} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="volume" name="Volume" stroke="var(--c-grey)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

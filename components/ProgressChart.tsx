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
          <CartesianGrid stroke="#d6e0df" strokeDasharray="3 3" />
          <XAxis dataKey="week" stroke="#5b6470" tickFormatter={(w) => `W${w}`} />
          <YAxis yAxisId="left" stroke="#27ae9f" />
          <YAxis yAxisId="right" orientation="right" stroke="#1f2a44" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="topWeight" name="Top weight" stroke="#27ae9f" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="volume" name="Volume" stroke="#1f2a44" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Pt { week: number; topWeight: number; volume: number; }

// Rebuilt to match ActivityTrend.tsx rather than ship Recharts' defaults.
//
// What changed and why: the built-in <Legend> is gone (it rendered in Recharts'
// own font, which read as a different product sitting next to the hand-drawn
// SVG trend); volume moved to a soft filled area behind top weight so the two
// series stop competing as equal-weight lines; the second Y axis is gone
// because two axes on one card invited comparisons between units that don't
// compare; grid lines are horizontal only; and the tooltip is the app's own
// panel treatment instead of a white box.

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const top = payload.find((p: any) => p.dataKey === "topWeight")?.value;
  const vol = payload.find((p: any) => p.dataKey === "volume")?.value;
  return (
    <div className="toast-card px-3.5 py-2.5 text-left">
      <p className="eyebrow">Week {label}</p>
      <p className="text-ink text-[15px] font-display font-bold leading-none mt-1.5">
        {top ?? "—"} <span className="text-grey text-[10px] font-sans font-semibold">kg top set</span>
      </p>
      <p className="text-grey text-[10px] mt-1.5">{vol != null ? `${Intl.NumberFormat("en-AU").format(vol)} kg total volume` : "No volume logged"}</p>
    </div>
  );
}

export default function ProgressChart({ data }: { data: Pt[] }) {
  if (!data.length) {
    return (
      <div className="text-center py-10">
        <p className="text-ink text-[13px] font-semibold">Nothing logged for this exercise yet</p>
        <p className="text-grey text-[11px] mt-1.5 max-w-[34ch] mx-auto leading-relaxed">
          Log a set on today&apos;s session and your top weight will start plotting here week by week.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 4, left: -14 }}>
          <defs>
            <linearGradient id="volumeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--c-teal)" stopOpacity=".16" />
              <stop offset="1" stopColor="var(--c-teal)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--c-line)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="week"
            tickFormatter={(w) => `W${w}`}
            stroke="var(--c-line)"
            tick={{ fill: "var(--c-grey)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fill: "var(--c-grey)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--c-line)", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="volume"
            stroke="none"
            fill="url(#volumeArea)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="topWeight"
            stroke="var(--c-teal)"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            dot={{ r: 3.5, fill: "var(--c-surface)", stroke: "var(--c-teal)", strokeWidth: 2.5 }}
            activeDot={{ r: 5.5, fill: "var(--c-teal)", stroke: "var(--c-surface)", strokeWidth: 2.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

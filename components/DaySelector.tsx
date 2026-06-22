"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSelectedDay } from "@/lib/data";

export default function DaySelector({ dayCount, selected, titles }: { dayCount: number; selected: number; titles: number[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pick(i: number) {
    if (i === selected || busy) return;
    setBusy(true);
    await setSelectedDay(i);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex gap-2 flex-wrap mt-4">
      {titles.map((i) => (
        <button
          key={i}
          onClick={() => pick(i)}
          className={`rounded-full px-4 py-1.5 text-sm border ${
            i === selected ? "bg-teal text-white border-teal" : "bg-white border-line hover:bg-rowalt"
          }`}
        >
          Day {i + 1}
        </button>
      ))}
    </div>
  );
}

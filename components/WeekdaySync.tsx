"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { setSelectedDay } from "@/lib/data";

// For weekday-scheduled programs, the server picks the day using its own clock
// (UTC on Vercel), which can be wrong for the dancer's timezone — e.g. Monday
// morning in Australia is still Sunday in UTC. This corrects the day to the
// dancer's LOCAL weekday and refreshes if it differs.
//
// Mapping mirrors weekdayDayIndex() in lib/data.ts:
//   Mon=0, Tue=1, Thu=2, Fri=3 (others fall back to 0).
const LOCAL_MAP: Record<number, number> = { 1: 0, 2: 1, 4: 2, 5: 3 };

export default function WeekdaySync({ currentDay, dayCount }: { currentDay: number; dayCount: number }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const localDow = new Date().getDay();              // 0=Sun..6=Sat, LOCAL
    const want = Math.min(LOCAL_MAP[localDow] ?? 0, dayCount - 1);
    if (want !== currentDay) {
      setSelectedDay(want).then(() => router.refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

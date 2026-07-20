"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";

interface Session { date: string; kind: string; durationMin: number; rpe: number }
interface Ev { date: string; kind: string; name: string }

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function effort(rpe: number): string {
  return rpe >= 8 ? "hard" : rpe >= 6 ? "moderate" : rpe >= 4 ? "easy" : "light";
}
function cap(s: string): string { return s ? s[0].toUpperCase() + s.slice(1) : s; }

export default function StudentCalendar({ sessions, events }: { sessions: Session[]; events: Ev[] }) {
  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [sel, setSel] = useState<string | null>(iso(today.getFullYear(), today.getMonth(), today.getDate()));

  const sessByDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) { if (!map.has(s.date)) map.set(s.date, []); map.get(s.date)!.push(s); }
    return map;
  }, [sessions]);
  const evByDay = useMemo(() => {
    const map = new Map<string, Ev[]>();
    for (const e of events) { if (!map.has(e.date)) map.set(e.date, []); map.get(e.date)!.push(e); }
    return map;
  }, [events]);

  // Monday-first grid
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());
  function prev() { const nm = m - 1; if (nm < 0) { setM(11); setY(y - 1); } else setM(nm); }
  function next() { const nm = m + 1; if (nm > 11) { setM(0); setY(y + 1); } else setM(nm); }

  const selSessions = sel ? sessByDay.get(sel) ?? [] : [];
  const selEvents = sel ? evByDay.get(sel) ?? [] : [];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Training calendar</p>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="p-1 text-grey hover:text-navy"><Icon name="chevron" className="w-4 h-4 rotate-180" /></button>
          <span className="text-navy text-sm font-semibold w-32 text-center">{MONTHS[m]} {y}</span>
          <button onClick={next} className="p-1 text-grey hover:text-navy"><Icon name="chevron" className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mt-3 text-center">
        {WEEK.map((w) => <div key={w} className="text-grey text-[10px] font-bold uppercase py-1">{w}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const key = iso(y, m, d);
          const hasS = sessByDay.has(key);
          const hasE = evByDay.has(key);
          const isToday = key === todayIso;
          const isSel = key === sel;
          return (
            <button key={i} onClick={() => setSel(key)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative ${
                isSel ? "bg-teal text-white" : isToday ? "bg-light text-navy font-bold" : "text-navy hover:bg-light"}`}>
              <span>{d}</span>
              <span className="flex gap-0.5 mt-0.5 h-1.5">
                {hasS && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-white" : "bg-teal"}`} />}
                {hasE && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-white/70" : "bg-amber-500"}`} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-2 text-[11px] text-grey">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal" /> Session</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Event</span>
      </div>

      {/* selected-day detail */}
      <div className="mt-3 border-t border-line pt-3">
        {sel && (selSessions.length > 0 || selEvents.length > 0) ? (
          <ul className="space-y-1.5">
            {selEvents.map((e, i) => (
              <li key={`e${i}`} className="text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-navy font-semibold">{e.name || cap(e.kind)}</span>
                <span className="text-grey text-xs">event</span>
              </li>
            ))}
            {selSessions.map((s, i) => (
              <li key={`s${i}`} className="text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                <span className="text-navy font-semibold">{cap(s.kind)}</span>
                <span className="text-grey text-xs">{s.durationMin} min · {effort(s.rpe)} effort</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-grey text-sm">{sel ? "Nothing logged this day." : "Pick a day to see what they logged."}</p>
        )}
      </div>
    </div>
  );
}

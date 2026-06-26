"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logSession, deleteSession, addEvent, deleteEvent } from "@/lib/load-actions";
import { sessionTrimp, type LoadAssessment, type WeekLoad } from "@/lib/load";
import Dots from "@/components/Dots";

interface SessionRow { id: number; session_date: string; kind: string; duration_min: number; rpe: number; note: string | null; start_time: string | null; }
interface EventRow { id: number; event_date: string; kind: string; name: string; }

const KINDS = [
  { v: "workout", label: "Workout" },
  { v: "class", label: "Class" },
  { v: "rehearsal", label: "Rehearsal" },
  { v: "cross", label: "Cross-training" },
];

const statusColor: Record<string, string> = {
  "on-track": "grad-brand", "under": "bg-navy2", "over": "bg-amber-500",
  "taper": "grad-navy", "event-week": "bg-teal", "no-data": "bg-navy2",
};

export default function LoadClient({ assessment, weeks, sessions, events, nextEventName }: {
  assessment: LoadAssessment; weeks: WeekLoad[]; sessions: SessionRow[]; events: EventRow[]; nextEventName: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // session form
  const [dur, setDur] = useState("");
  const [rpe, setRpe] = useState(6);
  const [kind, setKind] = useState("workout");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // event form
  const [evDate, setEvDate] = useState("");
  const [evKind, setEvKind] = useState("performance");
  const [evName, setEvName] = useState("");

  async function submitSession(e: React.FormEvent) {
    e.preventDefault();
    if (!dur) return;
    setBusy(true);
    await logSession({ durationMin: Number(dur), rpe, kind, date });
    setDur(""); setBusy(false);
    router.refresh();
  }
  async function removeSession(id: number) { setBusy(true); await deleteSession(id); setBusy(false); router.refresh(); }

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!evDate) return;
    setBusy(true);
    await addEvent({ date: evDate, kind: evKind, name: evName });
    setEvDate(""); setEvName(""); setBusy(false);
    router.refresh();
  }
  async function removeEvent(id: number) { setBusy(true); await deleteEvent(id); setBusy(false); router.refresh(); }

  const a = assessment;
  const maxTrimp = Math.max(1, ...weeks.map((w) => w.trimp), a.targetTrimp ?? 0);
  const recentWeeks = weeks.slice(-8);

  return (
    <div className="mt-5 space-y-6">
      {/* STATUS */}
      <div className={`${statusColor[a.status] ?? "bg-navy2"} text-white rounded-xl p-5 animate-in`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
            {a.taper ? "Taper" : a.status === "event-week" ? "Event week" : "This week's load"}
            {nextEventName && a.weeksToEvent != null ? ` · ${nextEventName} in ${a.weeksToEvent} wk` : ""}
          </p>
          {a.thisWeek && <span className="badge bg-white/20">{a.thisWeek.trimp} TRIMP</span>}
        </div>
        <p className="text-lg font-bold mt-2">{a.message}</p>
        {a.targetTrimp != null && (
          <p className="text-white/85 text-sm mt-2">
            Target this week: <b>~{a.targetTrimp} TRIMP</b>
            {a.thisWeek ? ` · you're at ${a.thisWeek.trimp}` : ""}
            {a.changePct != null ? ` (${a.changePct > 0 ? "+" : ""}${a.changePct}% vs last week)` : ""}
          </p>
        )}
      </div>

      {/* WEEKLY HISTORY */}
      {recentWeeks.length > 0 && (
        <div className="card p-5 animate-in">
          <p className="eyebrow">Weekly load (last {recentWeeks.length} weeks)</p>
          <div className="flex items-end gap-2 mt-4 h-32">
            {recentWeeks.map((w) => (
              <div key={w.week} className="flex-1 flex flex-col items-center justify-end">
                <span className="text-[10px] text-grey">{w.trimp}</span>
                <div className="w-full grad-brand rounded-t" style={{ height: `${Math.max((w.trimp / maxTrimp) * 100, 3)}%` }} title={`${w.week}: ${w.trimp} TRIMP`} />
                <span className="text-[9px] text-grey mt-1">{w.week.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="text-grey text-xs mt-3">Each bar is a week's total load (sum of duration × RPE). Aim for a gentle, steady climb — about 10% a week.</p>
        </div>
      )}

      {/* LOG A SESSION */}
      <div className="card p-5 animate-in">
        <p className="eyebrow">Log a session</p>
        <form onSubmit={submitSession} className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <button key={k.v} type="button" onClick={() => setKind(k.v)}
                className={`rounded-full px-3 py-1.5 text-sm border ${kind === k.v ? "bg-teal text-white border-teal" : "bg-white border-line text-grey"}`}>
                {k.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-grey">Date</label>
              <input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-grey">Minutes</label>
              <input className="input mt-1 w-28" inputMode="numeric" placeholder="e.g. 60" value={dur} onChange={(e) => setDur(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-grey">Effort (RPE): <b className="text-navy">{rpe}</b> / 10</label>
            <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-teal mt-1" />
            <div className="flex justify-between text-[10px] text-grey"><span>1 easy</span><span>10 max</span></div>
          </div>
          {dur && <p className="text-grey text-sm">This session = <b className="text-navy">{sessionTrimp(Number(dur) || 0, rpe)} TRIMP</b></p>}
          <button className="btn-primary" disabled={busy || !dur}>{busy ? <Dots /> : "Log session"}</button>
        </form>
      </div>

      {/* RECENT SESSIONS */}
      {sessions.length > 0 && (
        <div className="card p-5 animate-in">
          <p className="eyebrow">Recent sessions</p>
          <div className="mt-3 space-y-1.5">
            {sessions.slice(0, 12).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0">
                <span className="text-navy">{s.session_date.slice(5)} · <span className="capitalize">{s.kind}</span></span>
                <span className="text-grey">{s.duration_min}min · RPE {s.rpe} · {sessionTrimp(s.duration_min, s.rpe)} TRIMP</span>
                <button className="text-grey hover:text-red-600 text-xs" onClick={() => removeSession(s.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENTS */}
      <div className="card p-5 animate-in">
        <p className="eyebrow">Performances, comps &amp; exams</p>
        <p className="text-grey text-sm mt-1">Add an event and the app tapers your load in the two weeks before it.</p>
        <form onSubmit={submitEvent} className="mt-3 flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-xs text-grey">Date</label>
            <input type="date" className="input mt-1" value={evDate} onChange={(e) => setEvDate(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-grey">Type</label>
            <select className="input mt-1" value={evKind} onChange={(e) => setEvKind(e.target.value)}>
              <option value="performance">Performance</option>
              <option value="competition">Competition</option>
              <option value="exam">Exam</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-grey">Name (optional)</label>
            <input className="input mt-1" placeholder="e.g. Eisteddfod" value={evName} onChange={(e) => setEvName(e.target.value)} />
          </div>
          <button className="btn-primary" disabled={busy || !evDate}>{busy ? <Dots /> : "Add"}</button>
        </form>
        {events.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0">
                <span className="text-navy">{ev.event_date} · <span className="capitalize">{ev.kind}</span>{ev.name ? ` · ${ev.name}` : ""}</span>
                <button className="text-grey hover:text-red-600 text-xs" onClick={() => removeEvent(ev.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

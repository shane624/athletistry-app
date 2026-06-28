"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logSession, deleteSession, updateSession, addEvent, deleteEvent } from "@/lib/load-actions";
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

  // inline edit of a logged session
  const [editId, setEditId] = useState<number | null>(null);
  const [eDur, setEDur] = useState("");
  const [eRpe, setERpe] = useState(6);
  function startEdit(s: SessionRow) { setEditId(s.id); setEDur(String(s.duration_min)); setERpe(s.rpe); }
  function cancelEdit() { setEditId(null); }
  async function saveEdit(id: number) {
    setBusy(true);
    await updateSession({ id, durationMin: Number(eDur) || 0, rpe: eRpe });
    setEditId(null); setBusy(false);
    router.refresh();
  }

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

  // --- this week, day by day (Mon–Sun) so the dancer sees daily load change ---
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const monday = new Date(now);
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(now.getDate() - dow);
  monday.setHours(0, 0, 0, 0);
  const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const weekDays = DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d);
    const trimp = sessions
      .filter((s) => s.session_date === key)
      .reduce((sum, s) => sum + sessionTrimp(s.duration_min, s.rpe), 0);
    const isToday = key === dayKey(now);
    return { label, key, trimp, isToday };
  });
  const maxDay = Math.max(1, ...weekDays.map((d) => d.trimp));
  const weekDayTotal = weekDays.reduce((s, d) => s + d.trimp, 0);

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

      {/* THIS WEEK, DAY BY DAY */}
      <div className="card p-5 animate-in">
        <div className="flex items-center justify-between">
          <p className="eyebrow">This week, day by day</p>
          <span className="text-grey text-xs">{weekDayTotal} TRIMP total</span>
        </div>
        <div className="flex items-end gap-2 mt-4">
          {weekDays.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center">
              <span className="text-[10px] text-grey h-3.5">{d.trimp > 0 ? d.trimp : ""}</span>
              {/* fixed-height bar track; the fill grows from the bottom */}
              <div className="w-full h-24 flex items-end mt-1">
                <div
                  className={`w-full rounded-t ${d.trimp > 0 ? "bg-teal" : "bg-line"} ${d.isToday ? "ring-2 ring-teal ring-offset-1 ring-offset-transparent" : ""}`}
                  style={{ height: d.trimp > 0 ? `${Math.max((d.trimp / maxDay) * 100, 8)}%` : "4px" }}
                  title={`${d.label}: ${d.trimp} TRIMP`}
                />
              </div>
              <span className={`text-[10px] mt-1.5 ${d.isToday ? "text-teal font-bold" : "text-grey"}`}>{d.label}</span>
            </div>
          ))}
        </div>
        <p className="text-grey text-xs mt-3">
          {weekDayTotal > 0
            ? "Each bar is that day's load (duration × RPE). Spread hard days out and keep an easy day or two."
            : "No sessions logged this week yet — add one below and it'll show here."}
        </p>
      </div>

      {/* WEEKLY HISTORY */}
      {recentWeeks.length > 0 && (
        <div className="card p-5 animate-in">
          <p className="eyebrow">Weekly load (last {recentWeeks.length} weeks)</p>
          <div className="flex items-end gap-2 mt-4">
            {recentWeeks.map((w) => (
              <div key={w.week} className="flex-1 flex flex-col items-center">
                <span className="text-[10px] text-grey h-3.5">{w.trimp}</span>
                <div className="w-full h-28 flex items-end mt-1">
                  <div className="w-full bg-teal rounded-t" style={{ height: `${Math.max((w.trimp / maxTrimp) * 100, 4)}%` }} title={`${w.week}: ${w.trimp} TRIMP`} />
                </div>
                <span className="text-[9px] text-grey mt-1.5">{w.week.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="text-grey text-xs mt-3">Each bar is a week's total load (sum of duration × RPE). Aim for a gentle, steady climb — about 10% a week.</p>
        </div>
      )}

      {/* LOG A SESSION */}
      <div className="card p-5 animate-in">
        <p className="eyebrow">Log a session</p>
        <p className="text-grey text-sm mt-1">Record something you&apos;ve <b className="text-navy">already done</b> — a class, rehearsal or gym session — so it counts toward your load. To plan ahead instead, tap a day on the calendar below.</p>
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
              <div key={s.id} className="text-sm py-1.5 border-b border-line last:border-0">
                {editId === s.id ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-navy w-20">{s.session_date.slice(5)} · <span className="capitalize">{s.kind}</span></span>
                    <input className="input w-16 py-1" inputMode="numeric" value={eDur}
                      onChange={(e) => setEDur(e.target.value.replace(/[^0-9]/g, ""))} />
                    <span className="text-grey text-xs">min</span>
                    <label className="text-grey text-xs">RPE</label>
                    <input type="range" min={1} max={10} value={eRpe} onChange={(e) => setERpe(Number(e.target.value))} className="accent-teal w-24" />
                    <span className="text-navy font-semibold w-4">{eRpe}</span>
                    <button className="text-teal font-semibold text-xs ml-auto" onClick={() => saveEdit(s.id)} disabled={busy}>Save</button>
                    <button className="text-grey text-xs" onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-navy">{s.session_date.slice(5)} · <span className="capitalize">{s.kind}</span></span>
                    <span className="text-grey">{s.duration_min}min · RPE {s.rpe} · {sessionTrimp(s.duration_min, s.rpe)} TRIMP</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <button className="text-teal hover:text-tealdark text-xs" onClick={() => startEdit(s)}>Edit</button>
                      <button className="text-grey hover:text-red-600 text-xs" onClick={() => removeSession(s.id)}>✕</button>
                    </span>
                  </div>
                )}
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

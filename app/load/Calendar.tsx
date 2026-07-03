"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logSession, logRecurring, deleteSession } from "@/lib/load-actions";
import { CLASS_GROUPS, CLASS_PRESETS, classColor, classLabel, classPreset } from "@/lib/classes";
import { sessionTrimp } from "@/lib/load";
import Dots from "@/components/Dots";
import ExerciseVideo from "@/components/ExerciseVideo";

interface SessionRow { id: number; session_date: string; kind: string; duration_min: number; rpe: number; note: string | null; start_time: string | null; }
interface EventRow { id: number; event_date: string; kind: string; name: string; }
interface PlanExercise { id: number; name: string; youtube_id: string; cloudinary_id?: string | null; level: number; category: string; }
interface PlanDay { date: string; sessionType: string; title: string; detail: string; exercises: PlanExercise[]; }

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// short label + colour for a plan session chip
const PLAN_LABEL: Record<string, string> = {
  strength: "Strength", hypertrophy: "Hypertrophy", endurance: "Endurance",
  cardio: "Cardio", tabata: "Tabata", rest: "Rest",
};
const PLAN_COLOR: Record<string, string> = {
  strength: "#1f8b7f", hypertrophy: "#27ae9f", endurance: "#56c2b0",
  cardio: "#4aa3df", tabata: "#e0833a", rest: "#9aa3b5",
};

export default function Calendar({ sessions, events, planDays = [] }: { sessions: SessionRow[]; events: EventRow[]; planDays?: PlanDay[] }) {
  const router = useRouter();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [addDay, setAddDay] = useState<string | null>(null); // YYYY-MM-DD being added to
  const [viewPlan, setViewPlan] = useState<PlanDay | null>(null); // plan day being viewed
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // add-form state
  const [kind, setKind] = useState("ballet");
  const [time, setTime] = useState("");
  // kept as strings so the fields can be cleared/retyped; clamped when used
  const [dur, setDur] = useState("90");
  const [rpe, setRpe] = useState(6);
  const [search, setSearch] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [weeks, setWeeks] = useState("8");

  // group sessions/events by date
  const byDay = new Map<string, SessionRow[]>();
  for (const s of sessions) { (byDay.get(s.session_date) ?? byDay.set(s.session_date, []).get(s.session_date)!).push(s); }
  const evByDay = new Map<string, EventRow[]>();
  for (const e of events) { (evByDay.get(e.event_date) ?? evByDay.set(e.event_date, []).get(e.event_date)!).push(e); }
  const planByDay = new Map<string, PlanDay>();
  for (const p of planDays) planByDay.set(p.date, p);

  // build the grid: weeks of 7, Monday-first
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function openAdd(dateISO: string) {
    setAddDay(dateISO);
    const p = classPreset(kind);
    if (p) { setDur(String(p.defaultMin)); setRpe(p.defaultRpe); }
  }
  function pickKind(k: string) {
    setKind(k);
    const p = classPreset(k);
    if (p) { setDur(String(p.defaultMin)); setRpe(p.defaultRpe); }
  }

  function closeModal() { setAddDay(null); setTime(""); setSearch(""); setRecurring(false); }

  async function saveClass() {
    if (!addDay) return;
    const durMin = Math.max(1, Math.min(600, Number(dur) || 0));
    const wk = Math.max(1, Math.min(52, Number(weeks) || 1));
    setBusy(true);
    if (recurring) {
      await logRecurring({ kind, durationMin: durMin, rpe, date: addDay, startTime: time || undefined, weeks: wk });
    } else {
      await logSession({ kind, durationMin: durMin, rpe, date: addDay, startTime: time || undefined });
    }
    setBusy(false); closeModal();
    router.refresh();
  }
  async function removeSession(id: number) { setBusy(true); await deleteSession(id); setBusy(false); router.refresh(); }

  // filtered preset groups for the search bar
  const q = search.trim().toLowerCase();
  const filteredGroups = CLASS_GROUPS
    .map((g) => ({ title: g.title, items: g.items.filter((it) => !q || it.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);

  const todayISO = ymd(today);

  return (
    <div className="card p-4 animate-in">
      {/* month nav */}
      <div className="flex items-center justify-between">
        <button className="btn-ghost py-1.5 px-3 text-sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>←</button>
        <p className="font-extrabold text-navy">{MONTHS[month]} {year}</p>
        <button className="btn-ghost py-1.5 px-3 text-sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>→</button>
      </div>

      {/* dow header */}
      <div className="grid grid-cols-7 gap-1 mt-3 text-center">
        {DOW.map((d) => <div key={d} className="text-[11px] text-grey font-semibold">{d}</div>)}
      </div>

      {/* grid */}
      <div className="grid grid-cols-7 gap-1 mt-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = ymd(date);
          const daySessions = byDay.get(iso) ?? [];
          const dayEvents = evByDay.get(iso) ?? [];
          const planDay = planByDay.get(iso);
          const isToday = iso === todayISO;
          return (
            <button
              key={i}
              onClick={() => { if (planDay && planDay.sessionType !== "rest") { setOpenVid(null); setViewPlan(planDay); } else { openAdd(iso); } }}
              className={`min-h-[58px] rounded-lg border p-1 text-left align-top transition hover:border-teal ${
                isToday ? "border-teal bg-light" : "border-line bg-white"
              }`}
            >
              <div className={`text-[11px] font-semibold ${isToday ? "text-teal" : "text-grey"}`}>{date.getDate()}</div>
              <div className="mt-0.5 space-y-0.5">
                {planDay && planDay.sessionType !== "rest" && (
                  <div className="text-[8px] font-bold text-white rounded px-1 py-0.5 truncate"
                    style={{ background: PLAN_COLOR[planDay.sessionType] ?? "#27ae9f" }}
                    title={`Plan: ${planDay.title}`}>
                    ◆ {PLAN_LABEL[planDay.sessionType] ?? "Session"}
                  </div>
                )}
                {dayEvents.map((e) => (
                  <div key={"e" + e.id} className="text-[8px] font-bold text-white rounded px-1 py-0.5 truncate" style={{ background: "#1f2a44" }} title={e.name || e.kind}>
                    ★ {e.name || e.kind}
                  </div>
                ))}
                {daySessions.slice(0, 3).map((s) => (
                  <div key={s.id} className="text-[8px] text-white rounded px-1 py-0.5 truncate" style={{ background: classColor(s.kind) }} title={`${classLabel(s.kind)} · ${s.duration_min}min · RPE ${s.rpe}`}>
                    {classLabel(s.kind)}
                  </div>
                ))}
                {daySessions.length > 3 && <div className="text-[8px] text-grey">+{daySessions.length - 3}</div>}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-grey text-xs mt-3">Tap any day to add a class{planDays.length ? ", or a ◆ plan day to see its workout" : ""}. ★ = event (taper plans around it).</p>

      {/* plan-day view modal — shows the prescribed session + exercises + videos */}
      {viewPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(31,42,68,.6)" }} onClick={() => setViewPlan(null)}>
          <div className="card w-full max-w-md p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">{viewPlan.date}</p>
                <p className="font-extrabold text-navy mt-0.5">{viewPlan.title}</p>
              </div>
              <button className="text-grey" onClick={() => setViewPlan(null)}>✕</button>
            </div>
            {viewPlan.detail && <p className="text-grey text-sm mt-2">{viewPlan.detail}</p>}

            {viewPlan.exercises.length > 0 ? (
              <div className="mt-4 space-y-3">
                {viewPlan.exercises.map((ex) => (
                  <div key={ex.id} className="card p-3">
                    <h3 className="font-semibold text-navy text-sm">{ex.name}</h3>
                    <p className="text-xs text-grey mt-0.5">Level {ex.level} · {ex.category}</p>
                    <div className="mt-2">
                      {openVid === ex.id ? (
                        <ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} />
                      ) : (
                        <button className="btn-ghost text-sm" onClick={() => setOpenVid(ex.id)}>Watch ▸</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grey text-sm mt-4">
                {viewPlan.sessionType === "cardio" ? "Steady-state cardio — log it once you're done."
                  : viewPlan.sessionType === "tabata" ? "A Tabata circuit — open Circuit Training to run it."
                  : "No specific exercises for this session."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* add modal */}
      {addDay && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(31,42,68,.6)" }} onClick={closeModal}>
          <div className="card w-full max-w-md p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-navy">Add to {addDay}</p>
              <button className="text-grey" onClick={closeModal}>✕</button>
            </div>

            <p className="eyebrow mt-4">Class or activity</p>
            <input
              className="input mt-2"
              placeholder="Search… ballet, swimming, gym…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-3 space-y-3">
              {filteredGroups.map((g) => (
                <div key={g.title}>
                  <p className="text-grey text-[11px] font-semibold uppercase tracking-wide">{g.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {g.items.map((p) => (
                      <button key={p.kind} onClick={() => pickKind(p.kind)}
                        className={`rounded-full px-3 py-1.5 text-sm border ${kind === p.kind ? "text-white border-transparent" : "bg-white border-line text-grey"}`}
                        style={kind === p.kind ? { background: p.color } : {}}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && <p className="text-grey text-sm">No match — log it as “Other sport”.</p>}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <div>
                <label className="text-xs text-grey">Start time</label>
                <input type="time" className="input mt-1" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-grey">Minutes</label>
                <input className="input mt-1 w-24" inputMode="numeric" value={dur}
                  onChange={(e) => setDur(e.target.value.replace(/[^0-9]/g, ""))}
                  onBlur={() => setDur(String(Math.max(1, Math.min(600, Number(dur) || 0))))} />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-grey">Effort (RPE): <b className="text-navy">{rpe}</b> / 10</label>
              <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-teal mt-1" />
              <div className="flex justify-between text-[11px] text-grey"><span>1 easy</span><span>10 max</span></div>
            </div>

            <p className="text-grey text-sm mt-2">This class = <b className="text-navy">{sessionTrimp(Number(dur) || 0, rpe)} TRIMP</b></p>

            {/* existing items on that day */}
            {(byDay.get(addDay) ?? []).length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="eyebrow">Already on this day</p>
                <div className="mt-2 space-y-1">
                  {(byDay.get(addDay) ?? []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-navy">{s.start_time ? s.start_time + " · " : ""}{classLabel(s.kind)} · {s.duration_min}min · RPE {s.rpe}</span>
                      <button className="text-grey hover:text-red-600 text-xs" onClick={() => removeSession(s.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* recurring */}
            <div className="mt-4 border-t border-line pt-3">
              <label className="flex items-center gap-2 text-sm text-navy font-medium cursor-pointer">
                <input type="checkbox" className="accent-teal w-4 h-4" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
                Repeat weekly (same weekday)
              </label>
              {recurring && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-grey">for</span>
                  <input className="input w-16" inputMode="numeric" value={weeks}
                    onChange={(e) => setWeeks(e.target.value.replace(/[^0-9]/g, ""))}
                    onBlur={() => setWeeks(String(Math.max(1, Math.min(52, Number(weeks) || 1))))} />
                  <span className="text-sm text-grey">weeks</span>
                </div>
              )}
            </div>

            <button className="btn-primary w-full mt-4" disabled={busy || !dur} onClick={saveClass}>
              {busy ? <Dots /> : recurring ? `Add ${classLabel(kind)} × ${weeks} weeks` : `Add ${classLabel(kind)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCustomDay, setActiveProgram, markOnboarded, saveWorkout } from "@/lib/data";
import type { ExerciseRow } from "@/lib/types";

interface DayState { dayIndex: number; exerciseIds: number[]; }

export default function BuilderClient({ allExercises, initial }: { allExercises: ExerciseRow[]; initial: DayState[] }) {
  const router = useRouter();
  const byId = useMemo(() => new Map(allExercises.map((e) => [e.id, e])), [allExercises]);
  const [days, setDays] = useState<DayState[]>(
    initial.length ? initial : [{ dayIndex: 0, exerciseIds: [] }]
  );
  const [activeDay, setActiveDay] = useState(0);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const day = days.find((d) => d.dayIndex === activeDay) ?? days[0];
  const chosen = new Set(day.exerciseIds);
  const filtered = allExercises.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));

  function update(fn: (d: DayState) => DayState) {
    setDays((ds) => ds.map((d) => (d.dayIndex === activeDay ? fn(d) : d)));
  }
  function add(id: number) { if (!chosen.has(id)) update((d) => ({ ...d, exerciseIds: [...d.exerciseIds, id] })); }
  function remove(id: number) { update((d) => ({ ...d, exerciseIds: d.exerciseIds.filter((x) => x !== id) })); }
  function move(id: number, dir: -1 | 1) {
    update((d) => {
      const arr = [...d.exerciseIds];
      const i = arr.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, exerciseIds: arr };
    });
  }
  function addDay() {
    const next = Math.max(...days.map((d) => d.dayIndex)) + 1;
    setDays((ds) => [...ds, { dayIndex: next, exerciseIds: [] }]);
    setActiveDay(next);
  }

  async function saveAll() {
    setSaving(true); setMsg(null);
    for (const d of days) await saveCustomDay(d.dayIndex, d.exerciseIds);
    setSaving(false);
    setMsg("Saved ✓");
    setTimeout(() => setMsg(null), 1500);
  }
  async function saveAndActivate() {
    setSaving(true); setMsg(null);
    for (const d of days) await saveCustomDay(d.dayIndex, d.exerciseIds);
    await setActiveProgram("custom");
    await markOnboarded();
    router.push("/dashboard");
    router.refresh();
  }
  async function saveNamed() {
    if (!day.exerciseIds.length) { setMsg("Add some exercises first."); return; }
    const name = window.prompt(`Name this workout (Day ${activeDay + 1}):`);
    if (!name) return;
    setSaving(true); setMsg(null);
    const res = await saveWorkout(name, day.exerciseIds, "custom");
    setMsg(res.ok ? `Saved “${name}” to My Workouts ✓` : (res.error ?? "Could not save"));
    setSaving(false);
  }

  return (
    <div className="mt-5">
      <div className="card p-3 mb-4 bg-light flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-navy">Want a timed conditioning day instead? Try a circuit — intervals, Tabata, EMOM or AMRAP with a built-in timer.</p>
        <a href="/circuit" className="btn-ghost text-sm shrink-0">Open Circuit builder →</a>
      </div>

      {/* day tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        {days.map((d) => (
          <button key={d.dayIndex} onClick={() => setActiveDay(d.dayIndex)}
            className={`rounded-full px-4 py-1.5 text-sm border ${d.dayIndex === activeDay ? "bg-teal text-white border-teal" : "bg-white border-line"}`}>
            Day {d.dayIndex + 1}
          </button>
        ))}
        <button onClick={addDay} className="rounded-full px-3 py-1.5 text-sm border border-line text-teal">+ Add day</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        {/* current day's routine */}
        <div className="card p-4">
          <h3 className="font-semibold text-navy">Day {activeDay + 1} — your routine</h3>
          {day.exerciseIds.length === 0 && <p className="text-grey text-sm mt-2">No exercises yet. Add some from the library →</p>}
          <ul className="mt-2 space-y-2">
            {day.exerciseIds.map((id) => {
              const e = byId.get(id);
              if (!e) return null;
              return (
                <li key={id} className="flex items-center gap-2 border border-line rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm">{e.name} <span className="text-grey text-xs">· L{e.level}</span></span>
                  <button onClick={() => move(id, -1)} className="text-grey px-1" aria-label="Up">↑</button>
                  <button onClick={() => move(id, 1)} className="text-grey px-1" aria-label="Down">↓</button>
                  <button onClick={() => remove(id)} className="text-red-600 px-1" aria-label="Remove">✕</button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* library to add from */}
        <div className="card p-4">
          <h3 className="font-semibold text-navy">Add from library</h3>
          <input className="input mt-2" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
          <ul className="mt-2 space-y-1 max-h-80 overflow-y-auto">
            {filtered.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-rowalt">
                <span className="text-sm">{e.name} <span className="text-grey text-xs">· L{e.level} · {e.category}</span></span>
                <button onClick={() => add(e.id)} disabled={chosen.has(e.id)}
                  className={`text-sm px-2 py-1 rounded-md ${chosen.has(e.id) ? "text-grey" : "text-teal hover:bg-light"}`}>
                  {chosen.has(e.id) ? "Added" : "+ Add"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5 flex-wrap">
        <button className="btn-primary" onClick={saveAndActivate} disabled={saving}>
          {saving ? "Saving…" : "Save & make active"}
        </button>
        <button className="btn-ghost" onClick={saveNamed} disabled={saving}>Save as workout</button>
        <button className="btn-ghost" onClick={saveAll} disabled={saving}>Save routine</button>
        {msg && <span className="text-tealdark text-sm">{msg}</span>}
      </div>
    </div>
  );
}

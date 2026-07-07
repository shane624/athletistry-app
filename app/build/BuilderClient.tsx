"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCustomDay, setActiveProgram, markOnboarded, saveWorkout } from "@/lib/data";
import type { ExerciseRow } from "@/lib/types";
import ExercisePicker from "@/components/ExercisePicker";

// Each slot in a day is one exercise instance (duplicates allowed) with an
// optional superset group id (same id = done back-to-back).
interface Item { key: string; exerciseId: number; group: number | null; }
interface DayState { dayIndex: number; items: Item[]; }

// server passes the saved routine as ids (+ optional parallel groups) per day
interface InitialDay { dayIndex: number; exerciseIds: number[]; groups?: (number | null)[]; }

let KEY = 1;
const newKey = () => `k${KEY++}`;

export default function BuilderClient({ allExercises, initial }: { allExercises: ExerciseRow[]; initial: InitialDay[] }) {
  const router = useRouter();
  const byId = useMemo(() => new Map(allExercises.map((e) => [e.id, e])), [allExercises]);

  const [days, setDays] = useState<DayState[]>(() => {
    const seed = initial.length ? initial : [{ dayIndex: 0, exerciseIds: [] as number[] }];
    return seed.map((d) => ({
      dayIndex: d.dayIndex,
      items: (d.exerciseIds ?? []).map((id, i) => ({ key: newKey(), exerciseId: id, group: d.groups?.[i] ?? null })),
    }));
  });
  const [activeDay, setActiveDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // keys chosen for a superset

  const day = days.find((d) => d.dayIndex === activeDay) ?? days[0];

  function update(fn: (d: DayState) => DayState) {
    setDays((ds) => ds.map((d) => (d.dayIndex === activeDay ? fn(d) : d)));
  }
  function add(id: number) { update((d) => ({ ...d, items: [...d.items, { key: newKey(), exerciseId: id, group: null }] })); }
  function removeAt(i: number) { update((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) })); }
  function move(i: number, dir: -1 | 1) {
    update((d) => {
      const arr = [...d.items];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, items: arr };
    });
  }
  function addDay() {
    const next = Math.max(...days.map((d) => d.dayIndex)) + 1;
    setDays((ds) => [...ds, { dayIndex: next, items: [] }]);
    setActiveDay(next);
    setSelected(new Set());
  }

  // count per exercise (for the picker's "added N×" badge)
  const counts = useMemo(() => {
    const c: Record<number, number> = {};
    for (const it of day.items) c[it.exerciseId] = (c[it.exerciseId] ?? 0) + 1;
    return c;
  }, [day.items]);

  // ---- supersets ----
  function toggleSelect(key: string) {
    setSelected((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }
  function makeSuperset() {
    if (selected.size < 2) return;
    const gid = Math.max(0, ...day.items.map((it) => it.group ?? 0)) + 1;
    update((d) => ({ ...d, items: d.items.map((it) => selected.has(it.key) ? { ...it, group: gid } : it) }));
    setSelected(new Set());
  }
  function ungroup(gid: number) {
    update((d) => ({ ...d, items: d.items.map((it) => it.group === gid ? { ...it, group: null } : it) }));
  }

  function daySave(d: DayState) {
    return saveCustomDay(d.dayIndex, d.items.map((it) => it.exerciseId), d.items.map((it) => it.group));
  }

  async function saveAll() {
    setSaving(true); setMsg(null);
    for (const d of days) await daySave(d);
    setSaving(false);
    setMsg("Saved ✓");
    setTimeout(() => setMsg(null), 1500);
  }
  async function saveAndActivate() {
    setSaving(true); setMsg(null);
    for (const d of days) await daySave(d);
    await setActiveProgram("custom");
    await markOnboarded();
    router.push("/dashboard");
    router.refresh();
  }
  async function saveNamed() {
    if (!day.items.length) { setMsg("Add some exercises first."); return; }
    const name = window.prompt(`Name this workout (Day ${activeDay + 1}):`);
    if (!name) return;
    setSaving(true); setMsg(null);
    const res = await saveWorkout(name, day.items.map((it) => it.exerciseId), "custom");
    setMsg(res.ok ? `Saved “${name}” to My Workouts ✓` : (res.error ?? "Could not save"));
    setSaving(false);
  }

  const supersetColor = (gid: number) => `hsl(${(gid * 57) % 360} 70% 45%)`;

  return (
    <div className="mt-5">
      <div className="card p-3 mb-4 bg-light flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-navy">Want a timed conditioning day instead? Try a circuit — intervals, Tabata, EMOM or AMRAP with a built-in timer.</p>
        <a href="/circuit" className="btn-ghost text-sm shrink-0">Open Circuit builder →</a>
      </div>

      {/* day tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        {days.map((d) => (
          <button key={d.dayIndex} onClick={() => { setActiveDay(d.dayIndex); setSelected(new Set()); }}
            className={`rounded-full px-4 py-1.5 text-sm border ${d.dayIndex === activeDay ? "bg-teal text-white border-teal" : "bg-white border-line"}`}>
            Day {d.dayIndex + 1}
          </button>
        ))}
        <button onClick={addDay} className="rounded-full px-3 py-1.5 text-sm border border-line text-teal">+ Add day</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        {/* current day's routine */}
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-navy">Day {activeDay + 1} — your routine</h3>
            {selected.size >= 2
              ? <button onClick={makeSuperset} className="text-teal text-xs font-bold">Make superset ({selected.size})</button>
              : day.items.length >= 2 && <span className="text-grey text-[11px]">Tick 2+ to superset</span>}
          </div>
          {day.items.length === 0 && <p className="text-grey text-sm mt-2">No exercises yet. Tap from the library to add them (you can add the same one more than once).</p>}
          <ul className="mt-2 space-y-2">
            {day.items.map((it, i) => {
              const e = byId.get(it.exerciseId);
              if (!e) return null;
              const grouped = it.group != null;
              const prevGrouped = i > 0 && day.items[i - 1].group === it.group && grouped;
              return (
                <li key={it.key}
                  className={`flex items-center gap-1 border rounded-lg pl-2 pr-1 py-1 ${grouped ? "" : "border-line"}`}
                  style={grouped ? { borderColor: supersetColor(it.group!), borderLeftWidth: 3 } : undefined}>
                  <input type="checkbox" className="accent-teal w-4 h-4 mx-1 shrink-0"
                    checked={selected.has(it.key)} onChange={() => toggleSelect(it.key)} aria-label={`Select ${e.name} for a superset`} />
                  <span className="flex-1 text-sm min-w-0">
                    {grouped && !prevGrouped && <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: supersetColor(it.group!) }}>Superset · do back to back</span>}
                    {e.name} <span className="text-grey text-xs">· L{e.level}</span>
                  </span>
                  {grouped && <button onClick={() => ungroup(it.group!)} className="text-grey text-[11px] px-1 shrink-0" aria-label="Ungroup superset">ungroup</button>}
                  <button onClick={() => move(i, -1)} className="text-grey w-9 h-9 inline-flex items-center justify-center" aria-label={`Move ${e.name} up`}>↑</button>
                  <button onClick={() => move(i, 1)} className="text-grey w-9 h-9 inline-flex items-center justify-center" aria-label={`Move ${e.name} down`}>↓</button>
                  <button onClick={() => removeAt(i)} className="text-red-600 w-9 h-9 inline-flex items-center justify-center" aria-label={`Remove ${e.name}`}>✕</button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* library to add from */}
        <div className="card p-4">
          <h3 className="font-semibold text-navy mb-3">Add from library</h3>
          <ExercisePicker allExercises={allExercises} counts={counts} onAdd={add} />
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

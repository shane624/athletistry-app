"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadSavedWorkout, deleteSavedWorkout, renameSavedWorkout } from "@/lib/data";
import type { ExerciseRow } from "@/lib/types";

interface W { id: number; name: string; style: string; exercises: ExerciseRow[]; }

export default function MyWorkoutsClient({ workouts }: { workouts: W[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  async function load(id: number) {
    setBusy(id);
    const res = await loadSavedWorkout(id);
    if (res.ok) { router.push("/dashboard"); router.refresh(); }
    else { setBusy(null); alert(res.error); }
  }
  async function remove(id: number) {
    if (!confirm("Delete this saved workout?")) return;
    setBusy(id);
    await deleteSavedWorkout(id);
    router.refresh();
    setBusy(null);
  }
  async function rename(id: number) {
    if (!newName.trim()) { setRenaming(null); return; }
    await renameSavedWorkout(id, newName);
    setRenaming(null); setNewName("");
    router.refresh();
  }

  if (!workouts.length) {
    return (
      <div className="card p-6 mt-5 text-center">
        <p className="text-grey text-sm">No saved workouts yet.</p>
        <p className="text-grey text-sm mt-1">
          Build one in <a href="/build" className="text-teal">Build Your Own</a> or generate one in{" "}
          <a href="/generate" className="text-teal">Random Workout</a>, then tap “Save as workout”.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {workouts.map((w) => (
        <div key={w.id} className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {renaming === w.id ? (
                <div className="flex gap-2 items-center">
                  <input className="input py-1.5" value={newName} placeholder={w.name}
                    onChange={(e) => setNewName(e.target.value)} />
                  <button className="btn-primary py-1.5 text-sm" onClick={() => rename(w.id)}>Save</button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-navy">{w.name}</h3>
                  <p className="text-grey text-xs mt-0.5 capitalize">{w.style} · {w.exercises.length} exercises</p>
                </>
              )}
              <p className="text-grey text-sm mt-2 truncate">{w.exercises.map((e) => e.name).join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button className="btn-primary text-sm py-1.5" disabled={busy === w.id} onClick={() => load(w.id)}>
              {busy === w.id ? "Loading…" : "Train this today"}
            </button>
            <button className="btn-ghost text-sm py-1.5" onClick={() => { setRenaming(w.id); setNewName(w.name); }}>Rename</button>
            <button className="btn-ghost text-sm py-1.5 text-red-600" onClick={() => remove(w.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

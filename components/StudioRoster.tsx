"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { regenerateCode, renameStudio, deleteStudio, removeStudent } from "@/lib/studio-actions";

interface StudioSummary { id: string; name: string; joinCode: string; memberCount: number; createdAt: string }
interface RosterStudent {
  id: string; name: string; email: string; joinedAt: string;
  lastActive: string | null; totalWorkouts: number; currentStreak: number; rank: string;
  movementType: string | null; loadStatus: string; loadLabel: string; weeklyTrimp: number | null;
  tracking: boolean; lastTracked: string | null;
}

const LOAD_STYLE: Record<string, string> = {
  over: "bg-red-100 text-red-700 border-red-200",
  under: "bg-amber-100 text-amber-700 border-amber-200",
  "on-track": "bg-emerald-100 text-emerald-700 border-emerald-200",
  taper: "bg-blue-100 text-blue-700 border-blue-200",
  "event-week": "bg-violet-100 text-violet-700 border-violet-200",
  "no-data": "bg-light text-grey border-line",
};

function daysAgo(date: string | null): string {
  if (!date) return "never";
  const diff = Math.floor((Date.now() - new Date(date + "T00:00:00").getTime()) / 86400000);
  return diff <= 0 ? "today" : diff === 1 ? "yesterday" : `${diff}d ago`;
}

export default function StudioRoster({ studio, students }: { studio: StudioSummary; students: RosterStudent[] }) {
  const router = useRouter();
  const [code, setCode] = useState(studio.joinCode);
  const [name, setName] = useState(studio.name);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const joinLink = typeof window !== "undefined" ? `${window.location.origin}/studio?code=${code}` : "";
  const notTracking = students.filter((s) => !s.tracking).length;
  const flagged = students.filter((s) => s.tracking && (s.loadStatus === "over" || s.loadStatus === "under")).length;

  async function copy() {
    try { await navigator.clipboard.writeText(joinLink); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* noop */ }
  }
  async function regen() {
    if (!window.confirm("Generate a new code? The old code and link will stop working.")) return;
    setBusy(true); const res = await regenerateCode(studio.id); setBusy(false);
    if (res.ok && res.code) setCode(res.code);
  }
  async function saveName() {
    setBusy(true); const res = await renameStudio(studio.id, name.trim()); setBusy(false);
    if (res.ok) { setEditing(false); router.refresh(); }
  }
  async function remove(s: RosterStudent) {
    if (!window.confirm(`Remove ${s.name} from ${studio.name}? Their account and data are untouched.`)) return;
    setBusy(true); await removeStudent(studio.id, s.id); setBusy(false); router.refresh();
  }
  async function destroy() {
    if (!window.confirm(`Delete "${studio.name}"? This removes the roster. Dancers keep their accounts and data.`)) return;
    setBusy(true); const res = await deleteStudio(studio.id); setBusy(false);
    if (res.ok) router.push("/studio");
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link href="/studio" className="text-grey hover:text-navy"><Icon name="chevron" className="w-5 h-5 rotate-180" /></Link>
        <p className="eyebrow">Studio</p>
      </div>
      {editing ? (
        <div className="flex gap-2 mt-1">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" />
          <button onClick={saveName} disabled={busy} className="btn-primary px-4">Save</button>
        </div>
      ) : (
        <h1 className="text-2xl font-extrabold text-navy mt-1 flex items-center gap-2">
          {studio.name}
          <button onClick={() => setEditing(true)} className="text-grey hover:text-teal" title="Rename"><Icon name="settings" className="w-4 h-4" /></button>
        </h1>
      )}

      {/* Join code panel */}
      <div className="card p-4 mt-4">
        <p className="eyebrow">Invite your dancers</p>
        <p className="text-grey text-xs mt-1">Share this code (or link). When they join, you&apos;ll see their training here.</p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-2xl font-mono font-extrabold tracking-widest text-navy">{code}</span>
          <button onClick={copy} className="btn-ghost py-1.5 px-3 text-sm">{copied ? "Copied ✓" : "Copy link"}</button>
          <button onClick={regen} disabled={busy} className="btn-ghost py-1.5 px-3 text-sm">New code</button>
        </div>
      </div>

      {/* At-a-glance */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Stat n={students.length} label="Dancers" />
        <Stat n={notTracking} label="Not tracking" accent={notTracking > 0} />
        <Stat n={flagged} label="Over / under" accent={flagged > 0} />
      </div>

      {/* Roster */}
      <div className="mt-5 space-y-2">
        {students.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/studio/${studio.id}/student/${s.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-navy">{s.name}</span>
                  {!s.tracking
                    ? <span className="text-[11px] font-bold px-1.5 py-0.5 rounded border bg-red-100 text-red-700 border-red-200">Not tracking</span>
                    : <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${LOAD_STYLE[s.loadStatus] ?? "bg-light text-grey border-line"}`}>{s.loadLabel}</span>}
                </div>
                <p className="text-grey text-xs mt-0.5 break-all">{s.email}</p>
              </Link>
              <button onClick={() => remove(s)} disabled={busy} className="text-grey hover:text-red-600 text-xs shrink-0">Remove</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
              <Cell label="Rank" value={s.rank} />
              <Cell label="Streak" value={`${s.currentStreak} wk`} />
              <Cell label="Last active" value={daysAgo(s.lastActive)} alert={!s.tracking} />
              <Cell label="Type" value={s.movementType ?? "—"} />
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-navy text-sm font-semibold">No dancers yet</p>
            <p className="text-grey text-sm mt-1">Share your code <span className="font-mono">{code}</span> and they&apos;ll appear here once they join.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <button onClick={destroy} disabled={busy} className="text-red-600 text-sm hover:underline">Delete this studio</button>
      </div>
    </div>
  );
}

function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <div className={`text-2xl font-extrabold ${accent ? "text-red-600" : "text-navy"}`}>{n}</div>
      <div className="text-grey text-xs mt-0.5">{label}</div>
    </div>
  );
}
function Cell({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-lg bg-light py-2 px-1">
      <div className={`text-sm font-semibold ${alert ? "text-red-600" : "text-navy"}`}>{value}</div>
      <div className="text-grey text-[11px]">{label}</div>
    </div>
  );
}

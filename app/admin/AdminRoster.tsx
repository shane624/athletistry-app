"use client";

import { useState } from "react";
import { disableMemberAction, enableMemberAction } from "@/lib/admin-actions";
import Dots from "@/components/Dots";

interface MemberRow {
  id: string; email: string; name: string; joinedAt: string | null;
  disabled: boolean; lastActive: string | null; totalWorkouts: number;
  currentStreak: number; rank: string; programName: string;
}

function daysAgo(date: string | null): string {
  if (!date) return "never";
  const d = new Date(date + "T00:00:00");
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  return `${diff}d ago`;
}

export default function AdminRoster({ initial }: { initial: MemberRow[] }) {
  const [rows, setRows] = useState<MemberRow[]>(initial);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = rows.filter((m) =>
    !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.email.toLowerCase().includes(q.toLowerCase())
  );

  async function toggle(m: MemberRow) {
    const verb = m.disabled ? "re-enable" : "disable";
    if (!window.confirm(`${verb === "disable" ? "Disable" : "Re-enable"} ${m.name || m.email}?\n\n${
      verb === "disable" ? "They won't be able to log in. Their data is kept." : "They'll be able to log in again."
    }`)) return;
    setBusy(m.id);
    const res = m.disabled ? await enableMemberAction(m.id) : await disableMemberAction(m.id);
    if (res.ok) {
      setRows((rs) => rs.map((r) => r.id === m.id ? { ...r, disabled: !r.disabled } : r));
    } else {
      window.alert(res.error || "Action failed.");
    }
    setBusy(null);
  }

  return (
    <div className="mt-6">
      <input
        className="input max-w-sm"
        placeholder="Search by name or email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-4 space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className={`card p-4 ${m.disabled ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-navy">{m.name || "—"}</span>
                  {m.disabled
                    ? <span className="badge bg-grey text-white text-[10px]">Disabled</span>
                    : <span className="badge bg-teal text-white text-[10px]">{m.rank}</span>}
                </div>
                <div className="text-grey text-xs mt-0.5 break-all">{m.email}</div>
              </div>
              <button
                onClick={() => toggle(m)}
                disabled={busy === m.id}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg shrink-0 ${
                  m.disabled ? "bg-teal text-white hover:bg-tealdark" : "border border-line text-grey hover:border-red-300 hover:text-red-600"
                }`}
              >
                {busy === m.id ? <Dots /> : m.disabled ? "Re-enable" : "Remove access"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
              <Cell label="Last active" value={daysAgo(m.lastActive)} alert={!m.disabled && (!m.lastActive || daysAgo(m.lastActive).includes("d ago") && parseInt(daysAgo(m.lastActive)) >= 14)} />
              <Cell label="Streak" value={`${m.currentStreak} wk`} />
              <Cell label="Workouts" value={String(m.totalWorkouts)} />
              <Cell label="Program" value={m.programName} />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-grey text-sm text-center py-8">No members match that search.</p>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-lg bg-rowalt py-2 px-1">
      <div className={`text-sm font-semibold ${alert ? "text-red-600" : "text-navy"}`}>{value}</div>
      <div className="text-grey text-[11px]">{label}</div>
    </div>
  );
}

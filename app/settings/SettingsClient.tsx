"use client";

import { useState } from "react";
import { saveSettings } from "@/lib/settings-actions";

interface Props {
  initial: { displayName: string; startDate: string; reminders: boolean; weekOverride: number | null };
}

export default function SettingsClient({ initial }: Props) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [reminders, setReminders] = useState(initial.reminders);
  const [override, setOverride] = useState<string>(initial.weekOverride?.toString() ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setMsg("This browser doesn't support notifications.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setReminders(true);
      new Notification("Athletistry", { body: "Reminders enabled. We'll nudge you on training days while the app is open." });
    } else {
      setMsg("Notification permission was not granted.");
    }
  }

  async function save() {
    setBusy(true); setMsg(null);
    const res = await saveSettings({
      displayName,
      startDate,
      reminders,
      weekOverride: override ? Math.min(Math.max(parseInt(override), 1), 24) : null,
    });
    setMsg(res.ok ? "Saved." : res.error ?? "Error");
    setBusy(false);
  }

  return (
    <div className="space-y-5 mt-5">
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-navy">Profile & program</h2>
        <label className="block text-sm">Display name
          <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label className="block text-sm">Program start date
          <input className="input mt-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="text-xs text-grey">The app derives your current week (1–24) from this date.</span>
        </label>
        <label className="block text-sm">Manual week override (optional)
          <input className="input mt-1" type="number" min={1} max={24} placeholder="leave blank to auto-calculate"
            value={override} onChange={(e) => setOverride(e.target.value)} />
        </label>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-navy">Reminders</h2>
        <p className="text-sm text-grey">
          Browser notifications nudge you on training days while the app is open and permitted.
          For reminders even when the app is closed, use the calendar export below.
        </p>
        <button type="button" className="btn-ghost" onClick={enableNotifications}>
          {reminders ? "Notifications enabled ✓" : "Enable browser notifications"}
        </button>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-navy">Calendar integration</h2>
        <p className="text-sm text-grey">
          Download all 24 weeks of training days as a calendar file (Mon/Tue/Thu/Fri) with a
          3-hour-ahead alert on each. Import into Apple Calendar, Google Calendar, or Outlook.
        </p>
        <a className="btn-primary inline-block" href="/api/calendar">Download .ics calendar</a>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
        {msg && <span className="text-sm text-grey">{msg}</span>}
      </div>
    </div>
  );
}

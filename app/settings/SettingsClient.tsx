"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { saveSettings } from "@/lib/settings-actions";

interface Props {
  email: string;
  initial: { displayName: string; startDate: string; reminders: boolean; weekOverride: number | null };
}

export default function SettingsClient({ email, initial }: Props) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [reminders, setReminders] = useState(initial.reminders);
  const [override, setOverride] = useState<string>(initial.weekOverride?.toString() ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function enableNotifications() {
    if (!("Notification" in window)) { setMsg("This browser doesn't support notifications."); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setReminders(true);
      new Notification("Athletistry", { body: "Training reminders are enabled." });
      setMsg("Notifications enabled. Save your settings to keep this preference.");
    } else setMsg("Notification permission was not granted.");
  }

  async function save() {
    setBusy(true); setMsg(null);
    const res = await saveSettings({ displayName, startDate, reminders, weekOverride: override ? Math.min(Math.max(parseInt(override), 1), 24) : null });
    setMsg(res.ok ? "Saved." : res.error ?? "Error");
    setBusy(false);
  }

  return (
    <div className="settings-grid animate-in">
      <div className="space-y-3">
        <section className="panel settings-section">
          <div className="px-4 pt-4 pb-2"><p className="panel-title">Account</p></div>
          <div className="settings-row">
            <span className="settings-icon"><Icon name="user" className="w-4 h-4" /></span>
            <div><p className="text-[11px] font-semibold text-ink">Display name</p><p className="text-[9px] text-grey mt-0.5">Shown around the app</p></div>
            <input className="input !min-h-[38px] !py-1.5 !text-[12px] max-w-[230px]" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="settings-row">
            <span className="settings-icon"><Icon name="book" className="w-4 h-4" /></span>
            <div className="min-w-0"><p className="text-[11px] font-semibold text-ink">Email</p><p className="text-[9px] text-grey mt-0.5 truncate">{email || "Signed-in account"}</p></div>
            <span className="text-[9px] text-grey">Account</span>
          </div>
          <Link href="/reset-password" className="settings-row hover:bg-white/30 transition">
            <span className="settings-icon"><Icon name="settings" className="w-4 h-4" /></span>
            <div><p className="text-[11px] font-semibold text-ink">Change password</p><p className="text-[9px] text-grey mt-0.5">Reset your sign-in password</p></div>
            <Icon name="chevron" className="w-4 h-4 text-grey" />
          </Link>
        </section>

        <section className="panel settings-section">
          <div className="px-4 pt-4 pb-2"><p className="panel-title">Training</p></div>
          <div className="settings-row">
            <span className="settings-icon"><Icon name="calendar" className="w-4 h-4" /></span>
            <div><p className="text-[11px] font-semibold text-ink">Program start date</p><p className="text-[9px] text-grey mt-0.5">Sets your current training week</p></div>
            <input className="input !min-h-[38px] !py-1.5 !text-[12px] max-w-[170px]" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="settings-row">
            <span className="settings-icon"><Icon name="target" className="w-4 h-4" /></span>
            <div><p className="text-[11px] font-semibold text-ink">Manual week override</p><p className="text-[9px] text-grey mt-0.5">Optional · weeks 1–24</p></div>
            <input className="input !min-h-[38px] !py-1.5 !text-[12px] !w-[90px]" type="number" min={1} max={24} placeholder="Auto" value={override} onChange={(e) => setOverride(e.target.value)} />
          </div>
        </section>

        <section className="panel settings-section">
          <div className="px-4 pt-4 pb-2"><p className="panel-title">Notifications</p></div>
          <button type="button" onClick={enableNotifications} className="settings-row w-full text-left hover:bg-white/30 transition">
            <span className="settings-icon"><Icon name="sparkle" className="w-4 h-4" /></span>
            <div><p className="text-[11px] font-semibold text-ink">Browser reminders</p><p className="text-[9px] text-grey mt-0.5">Training-day nudges while supported</p></div>
            <span className={`text-[9px] font-semibold ${reminders ? "text-teal" : "text-grey"}`}>{reminders ? "Enabled" : "Enable"}</span>
          </button>
        </section>
      </div>

      <aside className="space-y-3">
        <section className="panel panel-pad">
          <p className="panel-title">Calendar</p>
          <p className="font-display text-[25px] font-bold leading-none text-ink mt-3">Take your practice with you.</p>
          <p className="text-grey text-[10px] leading-relaxed mt-3">Export the 24-week training schedule as an .ics file for Apple Calendar, Google Calendar, or Outlook.</p>
          <a className="btn-ghost !min-h-[38px] !px-4 !text-[10px] mt-4 w-full" href="/api/calendar"><Icon name="calendar" className="w-4 h-4 mr-2" /> Download calendar</a>
        </section>
        <section className="panel panel-pad">
          <p className="panel-title">Profile</p>
          <p className="text-grey text-[10px] leading-relaxed mt-2">See your current program, training rank, and member profile in one place.</p>
          <Link href="/profile" className="text-teal text-[10px] font-semibold inline-flex items-center gap-1 mt-3">View profile <Icon name="chevron" className="w-3.5 h-3.5" /></Link>
        </section>
        <button className="btn-primary w-full" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        {msg && <p className="text-[10px] text-grey text-center">{msg}</p>}
      </aside>
    </div>
  );
}

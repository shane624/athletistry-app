"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { createStudio, joinStudio, leaveStudio } from "@/lib/studio-actions";

interface StudioSummary { id: string; name: string; joinCode: string; memberCount: number; createdAt: string }
interface JoinedStudio { id: string; name: string }

export default function StudioHub({ owned, joined, initialCode }: { owned: StudioSummary[]; joined: JoinedStudio[]; initialCode: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true); setMsg(null);
    const res = await createStudio(name.trim());
    setBusy(false);
    if (res.ok && res.id) router.push(`/studio/${res.id}`);
    else setMsg({ ok: false, text: res.error || "Couldn't create the studio." });
  }
  async function join() {
    if (!code.trim() || busy) return;
    setBusy(true); setMsg(null);
    const res = await joinStudio(code.trim());
    setBusy(false);
    if (res.ok) { setMsg({ ok: true, text: `Joined ${res.studioName}. They can now see your training.` }); setCode(""); router.refresh(); }
    else setMsg({ ok: false, text: res.error || "Couldn't join." });
  }
  async function leave(id: string, sname: string) {
    if (!window.confirm(`Leave ${sname}? They'll no longer see your training.`)) return;
    setBusy(true);
    await leaveStudio(id);
    setBusy(false); router.refresh();
  }

  return (
    <div className="mt-5 space-y-8">
      {/* Owner section */}
      <section>
        <p className="eyebrow mb-2">Your studios</p>
        {owned.length > 0 && (
          <div className="space-y-2 mb-3">
            {owned.map((s) => (
              <Link key={s.id} href={`/studio/${s.id}`} className="card card-hover flex items-center justify-between p-4">
                <div>
                  <p className="text-navy font-bold">{s.name}</p>
                  <p className="text-grey text-xs mt-0.5">{s.memberCount} {s.memberCount === 1 ? "dancer" : "dancers"} · code <span className="font-mono text-navy">{s.joinCode}</span></p>
                </div>
                <Icon name="chevron" className="w-5 h-5 text-teal" />
              </Link>
            ))}
          </div>
        )}
        <div className="card p-4">
          <p className="text-navy text-sm font-semibold">Create a studio</p>
          <p className="text-grey text-xs mt-0.5">You&apos;ll get a join code to share with your dancers.</p>
          <div className="flex gap-2 mt-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Studio name"
              className="input flex-1" onKeyDown={(e) => e.key === "Enter" && create()} />
            <button onClick={create} disabled={busy || !name.trim()} className="btn-primary px-4 disabled:opacity-50">Create</button>
          </div>
        </div>
      </section>

      {/* Student section */}
      <section>
        <p className="eyebrow mb-2">Join a studio</p>
        <div className="card p-4">
          <p className="text-navy text-sm font-semibold">Enter your studio&apos;s code</p>
          <p className="text-grey text-xs mt-0.5">Joining lets that studio see your dashboard and training. You can leave any time.</p>
          <div className="flex gap-2 mt-3">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. K7P4Q2"
              className="input flex-1 font-mono tracking-widest" onKeyDown={(e) => e.key === "Enter" && join()} />
            <button onClick={join} disabled={busy || !code.trim()} className="btn-primary px-4 disabled:opacity-50">Join</button>
          </div>
          {msg && <p className={`text-sm mt-2 ${msg.ok ? "text-tealdark" : "text-red-600"}`}>{msg.text}</p>}
        </div>

        {joined.length > 0 && (
          <div className="space-y-2 mt-3">
            {joined.map((s) => (
              <div key={s.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="text-navy font-bold">{s.name}</p>
                  <p className="text-grey text-xs mt-0.5">Sharing your training with this studio.</p>
                </div>
                <button onClick={() => leave(s.id, s.name)} disabled={busy}
                  className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-line text-grey hover:border-red-300 hover:text-red-600">Leave</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

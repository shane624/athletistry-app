"use client";

import { useState } from "react";
import { startMemberCheckout, openMemberPortal } from "@/lib/member-billing-actions";
import type { MemberInterval } from "@/lib/stripe";

export default function MemberCheckout({ active, plan, authed, configured }: { active: boolean; plan: string | null; authed: boolean; configured: boolean }) {
  const [interval, setInterval] = useState<MemberInterval>("yearly");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function subscribe() {
    if (!authed) { window.location.href = "/login"; return; }
    setBusy(true); setMsg(null);
    const res = await startMemberCheckout(interval);
    setBusy(false);
    if (res.ok && res.url) window.location.href = res.url;
    else setMsg(res.error || "Couldn't start checkout.");
  }
  async function manage() {
    setBusy(true); setMsg(null);
    const res = await openMemberPortal();
    setBusy(false);
    if (res.ok && res.url) window.location.href = res.url;
    else setMsg(res.error || "Couldn't open billing.");
  }

  if (active) {
    return (
      <div className="panel panel-pad text-center animate-in">
        <p className="eyebrow">Membership</p>
        <p className="font-display text-[26px] font-bold text-ink mt-2">You&apos;re a member ✓</p>
        <p className="text-grey text-sm mt-1">Your {plan === "yearly" ? "annual" : "monthly"} membership is active. Thank you for training with us.</p>
        <button onClick={manage} disabled={busy} className="btn-ghost mt-5 px-5">Manage billing</button>
        {msg && <p className="text-red-600 text-sm mt-3">{msg}</p>}
      </div>
    );
  }

  const opts: { key: MemberInterval; label: string; price: string; sub: string; note?: string }[] = [
    { key: "monthly", label: "Monthly", price: "$19.95", sub: "per month, USD" },
    { key: "yearly", label: "Yearly", price: "$199.95", sub: "per year, USD", note: "2 months free" },
  ];

  return (
    <div className="animate-in">
      <div className="grid sm:grid-cols-2 gap-3">
        {opts.map((o) => {
          const sel = interval === o.key;
          return (
            <button key={o.key} onClick={() => setInterval(o.key)}
              className={`text-left rounded-[22px] border p-5 transition ${sel ? "border-teal bg-bluewash" : "border-line bg-white/50 hover:border-teal/40"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[.14em] text-grey">{o.label}</span>
                {o.note && <span className="text-[10px] font-bold text-tealdark bg-white rounded-full px-2 py-0.5 border border-line">{o.note}</span>}
              </div>
              <p className="font-display text-[34px] font-bold text-ink leading-none mt-2">{o.price}</p>
              <p className="text-grey text-xs mt-1">{o.sub}</p>
              <span className={`mt-3 inline-flex w-5 h-5 rounded-full border-2 ${sel ? "border-teal bg-teal" : "border-line"}`} />
            </button>
          );
        })}
      </div>
      <button onClick={subscribe} disabled={busy || !configured} className="btn-primary w-full mt-4 py-3 disabled:opacity-50">
        {busy ? "Starting…" : authed ? `Subscribe — ${interval === "yearly" ? "$199.95/yr" : "$19.95/mo"}` : "Sign in to subscribe"}
      </button>
      {!configured && <p className="text-grey text-xs mt-2 text-center">Membership billing isn&apos;t switched on yet.</p>}
      {msg && <p className="text-red-600 text-sm mt-2 text-center">{msg}</p>}
      <p className="text-grey text-[11px] mt-3 text-center">Secure checkout by Stripe · cancel anytime</p>
    </div>
  );
}

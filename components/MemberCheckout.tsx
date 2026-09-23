"use client";

import { useState } from "react";
import { startMemberCheckout, openMemberPortal } from "@/lib/member-billing-actions";
import type { MemberInterval } from "@/lib/stripe";
import { createClient } from "@/lib/supabase-browser";

export default function MemberCheckout({ active, plan, authed, configured, initialPlan }: { active: boolean; plan: string | null; authed: boolean; configured: boolean; initialPlan?: MemberInterval }) {
  const [interval, setInterval] = useState<MemberInterval>(initialPlan ?? "yearly");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Account step (for visitors who aren't signed in yet).
  const [mode, setMode] = useState<"create" | "login">("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function goToCheckout(newAccount: boolean) {
    const res = await startMemberCheckout(interval, newAccount);
    if (res.ok && res.url) { window.location.href = res.url; return; }
    setBusy(false);
    setMsg(res.error || "Couldn't start checkout.");
  }

  async function subscribe() {
    setBusy(true); setMsg(null);
    await goToCheckout(false);
  }

  async function createAndPay(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const em = email.trim().toLowerCase();
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      if (mode === "create") {
        const r = await fetch("/api/member/register", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: em, password }),
        });
        const d = await r.json();
        if (!r.ok || !d.ok) {
          if (d.exists) setMode("login");
          setMsg(d.error || "Couldn't create your account.");
          setBusy(false);
          return;
        }
      }
      const { error } = await createClient().auth.signInWithPassword({ email: em, password });
      if (error) { setMsg(mode === "login" ? "That email and password don't match." : "Account created — please log in to continue."); setBusy(false); return; }
      await goToCheckout(mode === "create");
    } catch {
      setMsg("Something went wrong. Please try again.");
      setBusy(false);
    }
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
      {authed ? (
        <button onClick={subscribe} disabled={busy || !configured} className="btn-primary w-full mt-4 py-3 disabled:opacity-50">
          {busy ? "Starting…" : `Subscribe — ${interval === "yearly" ? "$199.95/yr" : "$19.95/mo"}`}
        </button>
      ) : (
        <form onSubmit={createAndPay} className="panel panel-pad mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{mode === "create" ? "Step 1 · Create your account" : "Step 1 · Log in"}</p>
            <span className="text-grey text-[11px]">Step 2 · Payment</span>
          </div>
          {mode === "create" && (
            <input className="input" type="text" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          )}
          <input className="input" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className="input" type="password" placeholder={mode === "create" ? "Choose a password (6+ characters)" : "Password"} required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "create" ? "new-password" : "current-password"} />
          <button className="btn-primary w-full py-3 disabled:opacity-50" disabled={busy || !configured}>
            {busy ? "Starting…" : `Continue to payment — ${interval === "yearly" ? "$199.95/yr" : "$19.95/mo"}`}
          </button>
          <p className="text-grey text-xs text-center">
            {mode === "create" ? (
              <>Already have an account? <button type="button" className="text-teal" onClick={() => { setMode("login"); setMsg(null); }}>Log in instead</button></>
            ) : (
              <>New here? <button type="button" className="text-teal" onClick={() => { setMode("create"); setMsg(null); }}>Create an account</button></>
            )}
          </p>
        </form>
      )}
      {!configured && <p className="text-grey text-xs mt-2 text-center">Membership billing isn&apos;t switched on yet.</p>}
      {msg && <p className="text-red-600 text-sm mt-2 text-center">{msg}</p>}
      <p className="text-grey text-[11px] mt-3 text-center">Secure checkout by Stripe · cancel anytime</p>
    </div>
  );
}

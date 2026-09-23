"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptRetentionOffer, confirmCancel, type CancelReason, type RetentionOffer } from "@/lib/member-retention-actions";

const REASONS: { key: CancelReason; label: string }[] = [
  { key: "too_expensive", label: "It's too expensive right now" },
  { key: "not_using", label: "I'm not using it enough" },
  { key: "injury_break", label: "I'm injured or taking a break" },
  { key: "missing_features", label: "It's missing something I need" },
  { key: "switching", label: "I'm switching to something else" },
  { key: "other", label: "Something else" },
];

const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "the end of your billing period";

type Step = "reason" | "offer" | "done-offer" | "done-cancel";

export default function CancelFlow({ plan, periodEnd, offerUsed }: { plan: string | null; periodEnd: string | null; offerUsed: boolean }) {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; body: string } | null>(null);

  const monthly = plan !== "yearly";
  // Which offer fits the reason (one-time only).
  const offer: RetentionOffer | "yearly" | null = offerUsed ? null
    : reason === "too_expensive" ? (monthly ? "discount" : null)
    : reason === "injury_break" ? "pause_2"
    : reason === "not_using" ? "pause_1"
    : reason === "missing_features" || reason === "other" ? (monthly ? "discount" : "pause_1")
    : null;

  async function take(o: RetentionOffer) {
    if (!reason) return;
    setBusy(true); setMsg(null);
    const r = await acceptRetentionOffer(o, reason, detail);
    setBusy(false);
    if (!r.ok) { setMsg(r.error || "Something went wrong."); return; }
    setResult(o === "discount"
      ? { title: "Done — 50% off for 3 months.", body: "Your next three monthly payments are half price. Nothing else changes." }
      : { title: `Billing paused until ${fmt(r.until)}.`, body: "You won't be charged during the pause, and you keep full access — perfect for gentle work and rehab. Billing resumes automatically." });
    setStep("done-offer");
  }

  async function cancel() {
    if (!reason) return;
    setBusy(true); setMsg(null);
    const r = await confirmCancel(reason, detail);
    setBusy(false);
    if (!r.ok) { setMsg(r.error || "Something went wrong."); return; }
    setResult({ title: "Your membership is cancelled.", body: `You keep full access until ${fmt(r.until ?? periodEnd)}. You won't be charged again. Changed your mind? You can resume anytime before then from the Membership page.` });
    setStep("done-cancel");
  }

  if (step === "done-offer" || step === "done-cancel") {
    return (
      <div className="card p-7 text-center animate-in">
        <p className="eyebrow">{step === "done-offer" ? "Thank you for staying" : "Membership"}</p>
        <h2 className="font-display text-[30px] font-bold text-ink mt-2">{result?.title}</h2>
        <p className="text-grey text-sm mt-3 max-w-md mx-auto">{result?.body}</p>
        <div className="flex gap-2 justify-center mt-6 flex-wrap">
          <Link href="/dashboard" className="btn-primary">Back to training</Link>
          <Link href="/pricing" className="btn-ghost">Membership</Link>
        </div>
      </div>
    );
  }

  if (step === "reason") {
    return (
      <div className="card p-6 sm:p-7 animate-in">
        <p className="eyebrow">Step 1 of 2</p>
        <h2 className="font-display text-[26px] font-bold text-ink mt-1">What&apos;s making you want to leave?</h2>
        <p className="text-grey text-sm mt-1">Your answer goes straight to Shane and shapes what we build next.</p>
        <div className="grid gap-2 mt-5">
          {REASONS.map((r) => (
            <button key={r.key} onClick={() => setReason(r.key)}
              className={`text-left rounded-2xl border px-4 py-3.5 text-[15px] transition ${reason === r.key ? "border-teal bg-bluewash text-ink font-semibold" : "border-line bg-surface text-ink hover:border-teal/40"}`}>
              {r.label}
            </button>
          ))}
        </div>
        <textarea className="input mt-4 min-h-[88px]" placeholder="Anything you'd like to add? (optional)" value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={1000} />
        <div className="flex gap-2 mt-5 flex-wrap">
          <button className="btn-primary" disabled={!reason} onClick={() => setStep("offer")}>Continue</button>
          <Link href="/pricing" className="btn-ghost">Never mind, keep my membership</Link>
        </div>
      </div>
    );
  }

  // step === "offer"
  return (
    <div className="grid gap-4 animate-in">
      {offer === "discount" && (
        <div className="grad-navy rounded-[28px] p-7 text-white">
          <p className="hero-kicker">A one-time offer</p>
          <h2 className="font-display text-[34px] font-bold uppercase leading-none mt-2">Stay for half price</h2>
          <p className="text-[#c8d8ec] text-sm mt-3 max-w-md">Keep everything for <b className="text-white">50% off your next 3 months</b> — about $9.98 a month. No catch; it goes back to normal after that.</p>
          <button className="hero-cta mt-5" disabled={busy} onClick={() => take("discount")}>{busy ? "Applying…" : "Yes — give me 50% off"}</button>
        </div>
      )}
      {(offer === "pause_1" || offer === "pause_2") && (
        <div className="grad-navy rounded-[28px] p-7 text-white">
          <p className="hero-kicker">{reason === "injury_break" ? "Look after that body" : "Take a breather"}</p>
          <h2 className="font-display text-[34px] font-bold uppercase leading-none mt-2">Pause instead of cancelling</h2>
          <p className="text-[#c8d8ec] text-sm mt-3 max-w-md">
            Stop payments for a while and <b className="text-white">keep your access</b>, streaks and history. Billing restarts automatically — or cancel later if you still want to.
          </p>
          <div className="flex gap-2 mt-5 flex-wrap">
            <button className="hero-cta" disabled={busy} onClick={() => take("pause_1")}>{busy ? "Pausing…" : "Pause 1 month"}</button>
            <button className="hero-cta !bg-white/15 !text-white" disabled={busy} onClick={() => take("pause_2")}>Pause 2 months</button>
          </div>
        </div>
      )}
      {reason === "not_using" && (
        <div className="card p-5">
          <p className="font-bold text-ink">Short on time?</p>
          <p className="text-grey text-sm mt-1">The Practice Generator builds a balanced session on demand at your level, and circuits can be as short as 8 minutes.</p>
          <Link href="/generate" className="text-teal text-sm font-semibold mt-2 inline-block">Try a quick session →</Link>
        </div>
      )}
      {reason === "too_expensive" && !monthly && (
        <div className="card p-5">
          <p className="font-bold text-ink">You&apos;re already on the best rate.</p>
          <p className="text-grey text-sm mt-1">Yearly works out to $16.66 a month. If you cancel, you keep access until {fmt(periodEnd)}.</p>
        </div>
      )}

      <div className="card p-6">
        <p className="eyebrow">Step 2 of 2</p>
        <h3 className="font-display text-[22px] font-bold text-ink mt-1">Still want to cancel?</h3>
        <p className="text-grey text-sm mt-1">You&apos;ll keep full access until {fmt(periodEnd)} and won&apos;t be charged again. Your history and progress stay saved if you come back.</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Link href="/pricing" className="btn-primary">Keep my membership</Link>
          <button className="btn-ghost !text-red-600 hover:!border-red-300" disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Cancel membership"}</button>
        </div>
        <button className="text-grey text-xs mt-4 underline" onClick={() => setStep("reason")}>← Back</button>
      </div>
      {msg && <p className="text-red-600 text-sm text-center">{msg}</p>}
    </div>
  );
}

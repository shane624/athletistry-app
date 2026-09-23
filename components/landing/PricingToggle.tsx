"use client";

// Adapted from 21st.dev "Pricing Section with Frequency Toggle" (efferd):
// monthly/yearly toggle with an animated price and savings badge. Rebuilt
// without NumberFlow/radix; the CTA carries the chosen plan into /pricing.
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

type Freq = "monthly" | "yearly";
const PRICE = { monthly: { big: "$19.95", per: "/month", sub: "Billed monthly · cancel anytime" }, yearly: { big: "$16.66", per: "/month", sub: "$199.95 billed yearly · 2 months free" } };

export default function PricingToggle({ included, headClass }: { included: string[]; headClass: string }) {
  const [freq, setFreq] = useState<Freq>("yearly");
  const p = PRICE[freq];

  return (
    <div className="max-w-[560px] mx-auto">
      {/* frequency toggle */}
      <div className="relative mx-auto w-max grid grid-cols-2 p-1 rounded-full bg-white border border-[rgba(31,39,49,.12)] shadow-[0_8px_24px_rgba(22,33,48,.06)]">
        {(["monthly", "yearly"] as Freq[]).map((f) => (
          <button key={f} onClick={() => setFreq(f)} className={`relative z-10 px-6 py-2 text-[14px] font-bold capitalize transition-colors ${freq === f ? "text-white" : "text-[#4a4f56]"}`}>
            {freq === f && <motion.span layoutId="lp-freq" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-[#0d72d8] to-[#075bb4]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            {f}
          </button>
        ))}
      </div>

      <div className="relative mt-8 rounded-[28px] bg-[#073464] text-white p-8 sm:p-10 shadow-[0_24px_65px_rgba(7,52,100,.35)] overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#0d72d8]/40 blur-3xl" aria-hidden />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold tracking-[.18em] uppercase text-[#9cc6f5]">Athletistry membership</p>
            <div className="flex items-end gap-1.5 mt-3 h-[64px]">
              <AnimatePresence mode="wait">
                <motion.span key={freq} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }}
                  className={`${headClass} text-[64px] font-bold leading-none`}>{p.big}</motion.span>
              </AnimatePresence>
              <span className="text-[#c8d8ec] text-[15px] mb-2">{p.per}</span>
            </div>
            <p className="text-[#c8d8ec] text-[14px] mt-2">{p.sub} · USD</p>
          </div>
          <AnimatePresence>
            {freq === "yearly" && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="shrink-0 bg-[#0d72d8] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">Save 16%</motion.span>
            )}
          </AnimatePresence>
        </div>

        <ul className="relative grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-7 text-[14px] text-[#e3ecf7]">
          {included.map((i) => (
            <li key={i} className="flex gap-2.5"><span className="text-[#9cc6f5] font-bold">✓</span>{i}</li>
          ))}
        </ul>

        <Link href={`/pricing?plan=${freq}`} className="lp-btn-white w-full justify-center mt-8 py-4 text-[16px]">
          Sign up — {freq === "yearly" ? "$199.95/yr" : "$19.95/mo"}
        </Link>
        <p className="relative text-center text-[#9fb4cf] text-[12px] mt-3">Create your account, then secure checkout by Stripe.</p>
      </div>
    </div>
  );
}

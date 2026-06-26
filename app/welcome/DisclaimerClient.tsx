"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptDisclaimer } from "@/lib/data";
import Dots from "@/components/Dots";

export default function DisclaimerClient() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function accept() {
    if (!checked || busy) return;
    setBusy(true);
    await acceptDisclaimer();
    router.push("/start-here");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="card w-full max-w-xl p-6">
        <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy text-center mt-1">Before you begin</h1>
        <p className="text-grey text-sm text-center mb-3">Please read and accept the disclaimer below.</p>

        <div className="max-h-[46vh] overflow-y-auto border border-line rounded-xl p-4 text-sm leading-relaxed text-ink space-y-3">
          <p><b>Not medical advice.</b> Athletistry and this app provide general fitness and movement information for educational purposes only. It is not medical advice and is not a substitute for guidance from a qualified physician, physiotherapist, or other licensed health professional.</p>
          <p><b>Consult a professional first.</b> Consult your doctor before starting this or any exercise program, especially if you are pregnant, recovering from injury or surgery, have a heart condition, high blood pressure, joint problems, or any other medical condition, or have been inactive for some time. Do not begin if a health professional has advised you not to exercise.</p>
          <p><b>Exercise carries risk.</b> Physical exercise involves inherent risks, including muscle strains, sprains, falls, and in rare cases serious injury or other health events. You voluntarily assume all risks associated with performing any exercise shown in this app.</p>
          <p><b>Listen to your body.</b> Warm up first, use a weight and range of motion appropriate for you, and maintain good form. <b>Stop immediately</b> and seek medical attention if you feel pain, dizziness, shortness of breath, chest pain, faintness, or any unusual symptom. Never train through sharp or joint pain.</p>
          <p><b>Your responsibility.</b> You are solely responsible for exercising safely and within your own limits. Use of this app is entirely at your own risk.</p>
          <p><b>Children &amp; minors.</b> The Kids program is intended for general youth movement and must be performed under the direct supervision of a responsible adult. A parent or guardian accepts these terms on the child&apos;s behalf and is responsible for the child&apos;s safety. Stop any activity that causes a child discomfort.</p>
          <p><b>Results vary.</b> No specific result or outcome is guaranteed. Individual results depend on many factors outside Athletistry&apos;s control.</p>
          <p><b>No liability.</b> To the fullest extent permitted by law, Athletistry and its owners, staff, and affiliates accept no liability for any injury, loss, or damage arising from use of this app or participation in any exercise it describes. By continuing you agree to release and hold them harmless.</p>
        </div>

        <label className="flex items-start gap-3 mt-4 text-sm cursor-pointer">
          <input type="checkbox" className="w-5 h-5 mt-0.5 shrink-0" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>I have read and understood this disclaimer, I am medically cleared to exercise (or accept on behalf of a participating child as their parent/guardian), and I accept all risks and these terms.</span>
        </label>

        <button className="btn-primary w-full mt-4 disabled:opacity-50" disabled={!checked || busy} onClick={accept}>
          {busy ? <Dots /> : "Agree & continue"}
        </button>
      </div>
    </div>
  );
}

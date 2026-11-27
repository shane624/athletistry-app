"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getTest, type Measure, type Values } from "@/lib/self-tests";
import { logSelfTest } from "@/lib/self-tests-actions";
import Dots from "@/components/Dots";

// Log one attempt at a self-test. Timed measures get a stopwatch that starts on
// press and stops on the next press, so a dancer with their eyes closed only
// has to find the button once.
export default function SelfTestLogger({ testId }: { testId: string }) {
  const test = getTest(testId)!;
  const router = useRouter();
  const [values, setValues] = useState<Values>({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (id: string, v: number | undefined) =>
    setValues((s) => { const n = { ...s }; if (v === undefined) delete n[id]; else n[id] = v; return n; });

  async function save() {
    setSaving(true); setMsg(null);
    const res = await logSelfTest(testId, values, note);
    setSaving(false);
    if (res.ok) {
      setValues({}); setNote("");
      setMsg({ ok: true, text: "Saved. Retest in four weeks to see the change." });
      router.refresh();
    } else setMsg({ ok: false, text: res.error ?? "Couldn't save that result." });
  }

  return (
    <div className="card p-5 mt-5 animate-in">
      <p className="eyebrow">Log a result</p>
      <div className="mt-3 space-y-5">
        {test.measures.map((m) => (
          <MeasureInput key={m.id} m={m} value={values[m.id]} onChange={(v) => set(m.id, v)} timer={!!test.timer} />
        ))}
        <label className="block">
          <span className="text-sm font-semibold text-navy">Note (optional)</span>
          <input className="input mt-1.5" value={note} maxLength={500}
            placeholder="Anything you noticed, e.g. which side felt harder"
            onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <button type="button" className="btn-primary" disabled={saving || Object.keys(values).length === 0} onClick={save}>
          {saving ? <Dots /> : "Save result"}
        </button>
        {msg && <p className={`text-sm ${msg.ok ? "text-teal" : "text-red-600"}`} role="status">{msg.text}</p>}
      </div>
    </div>
  );
}

function MeasureInput({ m, value, onChange, timer }: { m: Measure; value: number | undefined; onChange: (v: number | undefined) => void; timer: boolean }) {
  if (m.kind === "choice") {
    return (
      <fieldset>
        <legend className="text-sm font-semibold text-navy">{m.label}</legend>
        <div className="mt-2 space-y-2">
          {m.options!.map((o) => {
            const on = value === o.value;
            return (
              <button key={o.value} type="button" onClick={() => onChange(on ? undefined : o.value)} aria-pressed={on}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition active:scale-[.99] ${on ? "border-teal bg-light text-navy font-semibold" : "border-line text-navy"}`}>
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (m.kind === "count") {
    const v = value ?? 0;
    return (
      <div>
        <p className="text-sm font-semibold text-navy">{m.label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: (m.max ?? 8) - (m.min ?? 1) + 1 }, (_, i) => (m.min ?? 1) + i).map((n) => (
            <button key={n} type="button" onClick={() => onChange(v === n ? undefined : n)} aria-pressed={v === n}
              className={`w-11 h-11 rounded-xl border text-sm font-semibold transition active:scale-95 ${v === n ? "border-teal bg-teal text-white" : "border-line text-navy"}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <SecondsInput m={m} value={value} onChange={onChange} timer={timer} />;
}

function SecondsInput({ m, value, onChange, timer }: { m: Measure; value: number | undefined; onChange: (v: number | undefined) => void; timer: boolean }) {
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState(0);
  const t0 = useRef(0);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function press() {
    if (!running) {
      setRunning(true); t0.current = performance.now();
      const loop = () => { setShown((performance.now() - t0.current) / 1000); raf.current = requestAnimationFrame(loop); };
      loop();
    } else {
      cancelAnimationFrame(raf.current); setRunning(false);
      const s = Math.round(((performance.now() - t0.current) / 1000) * 10) / 10;
      setShown(s); onChange(s);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-navy">{m.label}</p>
      {timer && (
        <div className="mt-2 rounded-xl bg-light p-4 text-center">
          <p className="text-4xl font-bold tabular-nums text-navy">{(running ? shown : value ?? shown).toFixed(1)}<span className="text-base text-grey ml-1">s</span></p>
          <button type="button" onPointerDown={(e) => { e.preventDefault(); press(); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(); } }}
            className={`mt-3 w-full min-h-[56px] rounded-xl font-semibold text-white transition active:scale-[.98] ${running ? "bg-teal" : "bg-navy"}`}>
            {running ? "I wobbled" : value !== undefined ? "Time it again" : "Start, then close your eyes"}
          </button>
        </div>
      )}
      <label className="mt-2 flex items-center gap-2 text-sm text-grey">
        <span>{timer ? "Or type it:" : "Seconds:"}</span>
        <span className="w-28 inline-block"><input type="number" inputMode="decimal" min={0} step={0.1} className="input"
          value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} /></span>
        <span>s</span>
      </label>
    </div>
  );
}

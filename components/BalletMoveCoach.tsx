"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { framing, averageFrames, type LM, type PoseFrame, type Finding } from "@/lib/posture-metrics";
import { getBalletMove, type Cue, type MoveResult } from "@/lib/ballet-moves";
import { MOVEMENT_TYPES, type TypeId } from "@/lib/movement-map";
import { saveBalletResult } from "@/lib/ballet-actions";

const MP_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task";
const SMOOTH_MAX = 40; // frames of the held rep to median-average

const BONES: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24], [11, 13], [13, 15], [12, 14], [14, 16],
  [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32],
];
const HOLD_MS = 2000;
const BASE_MS = 1500;
const STILL_EPS = 0.014;

type Phase = "intro" | "starting" | "baseline" | "assess" | "saving" | "done" | "error";

export default function BalletMoveCoach({ moveId }: { moveId: string }) {
  const move = getBalletMove(moveId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const aspectRef = useRef(4 / 3);
  const latestFrameRef = useRef<PoseFrame | null>(null);
  const baselineRef = useRef<PoseFrame | null>(null);
  const bestRef = useRef<{ peak: number; frame: PoseFrame } | null>(null);
  const smoothRef = useRef<PoseFrame[]>([]); // held-rep clip buffer
  const baseBufRef = useRef<PoseFrame[]>([]); // neutral clip buffer
  const motionRef = useRef<{ x: number; y: number }[] | null>(null);
  const stableRef = useRef<{ key: string; since: number }>({ key: "none", since: 0 });
  const busyRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("intro");
  const [cues, setCues] = useState<Cue[]>([]);
  const [hint, setHint] = useState("");
  const [holdPct, setHoldPct] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [result, setResult] = useState<MoveResult | null>(null);

  const draw = useCallback((lms: PoseFrame | null) => {
    const cv = canvasRef.current, vid = videoRef.current;
    if (!cv || !vid) return;
    const w = vid.videoWidth || 640, h = vid.videoHeight || 480;
    if (cv.width !== w) cv.width = w;
    if (cv.height !== h) cv.height = h;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (!lms) return;
    const px = (p: LM) => ({ x: p.x * w, y: p.y * h });
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3;
    for (const [a, b] of BONES) {
      const pa = lms[a], pb = lms[b]; if (!pa || !pb) continue;
      const A = px(pa), B = px(pb);
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    ctx.fillStyle = "#27ae9f";
    for (const p of lms) { if (!p) continue; const P = px(p); ctx.beginPath(); ctx.arc(P.x, P.y, 4, 0, Math.PI * 2); ctx.fill(); }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try { landmarkerRef.current?.close?.(); } catch { /* noop */ }
    landmarkerRef.current = null;
  }, []);

  const finalize = useCallback(async (frame: PoseFrame) => {
    if (busyRef.current || !move) return;
    busyRef.current = true;
    setPhase("saving");
    stopCamera();
    const res = move.score(frame, aspectRef.current, baselineRef.current);
    try { await saveBalletResult(move.id, res); } catch { /* still show */ }
    setResult(res);
    setPhase("done");
  }, [move, stopCamera]);

  const loop = useCallback(() => {
    const vid = videoRef.current, lk = landmarkerRef.current;
    if (vid && lk && vid.readyState >= 2 && !busyRef.current && move) {
      try {
        const res = lk.detectForVideo(vid, performance.now());
        const lms: PoseFrame | null = res?.landmarks?.[0] ?? null;
        if (lms) latestFrameRef.current = lms;
        draw(lms);
        const aspect = (vid.videoWidth || 640) / (vid.videoHeight || 480);
        aspectRef.current = aspect;

        const fr = lms ? framing(lms) : { ready: false, hint: "Step into view so your whole body shows" };

        // stillness
        let still = true;
        if (lms) {
          const key = [11, 12, 23, 24, 27, 28].map((i) => lms[i]);
          const prev = motionRef.current;
          if (prev) { let s = 0; for (let i = 0; i < key.length; i++) s += Math.hypot(key[i].x - prev[i].x, key[i].y - prev[i].y); still = s / key.length < STILL_EPS; }
          motionRef.current = key.map((p) => ({ x: p.x, y: p.y }));
        }

        const now = performance.now();

        if (!lms || !fr.ready) {
          setHint((h) => (h === (fr.hint || "") ? h : (fr.hint || "")));
          setCues((c) => (c.length ? [] : c));
          setHoldPct((p) => (p ? 0 : p)); setCountdown((c) => (c !== null ? null : c));
          stableRef.current = { key: "none", since: now };
        } else if (phase === "baseline") {
          // hold a neutral, still, framed pose to bank the baseline
          setHint((h) => (h === "" ? h : ""));
          setCues((c) => (c.length ? [] : c));
          if (still) {
            if (stableRef.current.key !== "base") { stableRef.current = { key: "base", since: now }; baseBufRef.current = []; }
            baseBufRef.current.push(lms.map((p) => ({ ...p })) as PoseFrame);
            if (baseBufRef.current.length > SMOOTH_MAX) baseBufRef.current.shift();
            const held = now - stableRef.current.since;
            setHoldPct((p) => { const v = Math.min(1, held / BASE_MS); return Math.abs(p - v) > 0.03 ? v : p; });
            if (held >= BASE_MS) { baselineRef.current = averageFrames(baseBufRef.current); bestRef.current = null; smoothRef.current = []; stableRef.current = { key: "none", since: now }; setHoldPct(0); setPhase("assess"); }
          } else { stableRef.current = { key: "none", since: now }; baseBufRef.current = []; setHoldPct((p) => (p ? 0 : p)); }
        } else if (phase === "assess") {
          const ev = move.evaluate(lms, aspect, baselineRef.current);
          setCues(ev.cues);
          setHint((h) => (h === ev.hint ? h : ev.hint));
          if (ev.valid) {
            const clone = lms.map((p) => ({ ...p })) as PoseFrame;
            // track the best rep seen this attempt (fallback if hold is brief)
            if (!bestRef.current || ev.peak > bestRef.current.peak) bestRef.current = { peak: ev.peak, frame: clone };
            if (still) {
              if (stableRef.current.key !== "hold") { stableRef.current = { key: "hold", since: now }; smoothRef.current = []; }
              smoothRef.current.push(clone);
              if (smoothRef.current.length > SMOOTH_MAX) smoothRef.current.shift();
              const held = now - stableRef.current.since;
              setHoldPct((p) => { const v = Math.min(1, held / HOLD_MS); return Math.abs(p - v) > 0.03 ? v : p; });
              setCountdown((c) => { const s = Math.max(1, Math.ceil((HOLD_MS - held) / 1000)); return c === s ? c : s; });
              if (held >= HOLD_MS) finalize(averageFrames(smoothRef.current.length ? smoothRef.current : [bestRef.current!.frame]));
            } else { stableRef.current = { key: "none", since: now }; smoothRef.current = []; setHoldPct((p) => (p ? 0 : p)); setCountdown((c) => (c !== null ? null : c)); }
          } else {
            smoothRef.current = [];
            setHoldPct((p) => (p ? 0 : p)); setCountdown((c) => (c !== null ? null : c));
            stableRef.current = { key: "none", since: now };
          }
        }
      } catch { /* skip frame */ }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, move, phase, finalize]);

  const start = useCallback(async () => {
    if (!move) return;
    setPhase("starting"); setErrMsg(""); setResult(null);
    baselineRef.current = null; bestRef.current = null; motionRef.current = null;
    smoothRef.current = []; baseBufRef.current = [];
    stableRef.current = { key: "none", since: 0 }; busyRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      const vid = videoRef.current!; vid.srcObject = stream; await vid.play();
      const vision: any = await import(/* webpackIgnore: true */ MP_URL as any);
      const fileset = await vision.FilesetResolver.forVisionTasks(MP_WASM);
      let lk: any;
      try { lk = await vision.PoseLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: MODEL, delegate: "GPU" }, runningMode: "VIDEO", numPoses: 1 }); }
      catch { lk = await vision.PoseLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: MODEL, delegate: "CPU" }, runningMode: "VIDEO", numPoses: 1 }); }
      landmarkerRef.current = lk;
      setPhase(move.needsBaseline ? "baseline" : "assess");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setErrMsg(e?.name === "NotAllowedError" ? "Camera access was blocked. Allow the camera and try again." : "Couldn't start the camera on this device.");
      setPhase("error"); stopCamera();
    }
  }, [move, loop, stopCamera]);

  // Manual override — never let the framing check fully block the dancer.
  const manualCapture = useCallback(() => {
    if (busyRef.current || !move) return;
    if (phase === "baseline") {
      if (latestFrameRef.current) {
        baselineRef.current = latestFrameRef.current.map((p) => ({ ...p })) as PoseFrame;
        smoothRef.current = []; bestRef.current = null;
        stableRef.current = { key: "none", since: performance.now() }; setHoldPct(0);
        setPhase("assess");
      }
      return;
    }
    const frame = smoothRef.current.length ? averageFrames(smoothRef.current)
      : (bestRef.current?.frame ?? latestFrameRef.current);
    if (frame) finalize(frame);
  }, [move, phase, finalize]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  if (!move) return <div className="card p-5 mt-5"><p className="text-navy text-sm">That movement wasn&apos;t found. <Link href="/movement-map/ballet" className="text-teal font-semibold">Back to the Lab</Link>.</p></div>;

  // ---- result ----
  if (phase === "done" && result) {
    const top = result.votes[0] as TypeId | undefined;
    return (
      <div className="mt-5 stagger">
        <div className="card p-5 animate-in border-l-2 border-teal">
          <p className="eyebrow">{move.name} · result</p>
          <h2 className="text-navy text-xl font-extrabold mt-1">{result.headline}</h2>
        </div>
        <div className="card p-5 mt-4 animate-in">
          <p className="eyebrow">What the camera saw</p>
          <ul className="mt-2 space-y-2">
            {result.findings.map((fd: Finding) => (
              <li key={fd.key} className="flex items-start gap-2">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${fd.severity === "ok" ? "bg-emerald-400" : fd.severity === "notable" ? "bg-red-500" : "bg-amber-400"}`} />
                <div><p className="text-navy text-sm font-semibold">{fd.label}</p><p className="text-grey text-sm">{fd.note}</p></div>
              </li>
            ))}
          </ul>
        </div>
        {top && (
          <div className="card p-4 mt-4 bg-light animate-in">
            <p className="text-[11px] font-bold uppercase tracking-wide text-grey">This leans toward</p>
            <p className="text-navy text-sm mt-1"><b>{MOVEMENT_TYPES[top].name}</b> — {MOVEMENT_TYPES[top].tagline}</p>
          </div>
        )}
        <div className="flex items-center gap-3 mt-5">
          <Link href="/movement-map/ballet" className="btn-primary py-2.5 px-5">Try another movement</Link>
          <button onClick={start} className="btn-ghost py-2.5 px-4">Retake this one</button>
        </div>
        <p className="text-grey text-xs mt-4">A movement-education screen — not a medical diagnosis. Results feed your Dancer Movement Type.</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="card p-5 mt-5">
        <p className="text-navy text-sm">{errMsg}</p>
        <div className="flex gap-3 mt-4"><button onClick={start} className="btn-primary py-2 px-4 text-sm">Try again</button>
          <Link href="/movement-map/ballet" className="btn-ghost py-2 px-4 text-sm">Back to the Lab</Link></div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="card p-5 mt-5 border-l-2 border-teal animate-in">
        <p className="eyebrow">{move.view === "side" ? "Side-on movement" : "Front-facing movement"}</p>
        <p className="text-navy text-base font-bold mt-1">{move.name}</p>
        <p className="text-navy text-sm mt-2 leading-relaxed">{move.setup}</p>
        <p className="text-grey text-sm mt-2">{move.tip}</p>
        <p className="text-grey text-xs mt-3">Prop your device up and step back so your whole body is in frame. It captures your best rep on its own.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={start} className="btn-primary py-2.5 px-5 inline-flex items-center gap-2"><Icon name="target" className="w-4 h-4" /> Start</button>
          <Link href="/movement-map/ballet" className="btn-ghost py-2.5 px-4">Back</Link>
        </div>
      </div>
    );
  }

  // camera stage (baseline / assess / starting / saving)
  const showCountdown = phase === "assess" && countdown !== null;
  return (
    <div className="mt-5 animate-in">
      <div className="relative rounded-2xl overflow-hidden bg-navy" style={{ aspectRatio: "4 / 3" }}>
        <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* live cue chips */}
        {phase === "assess" && cues.length > 0 && (
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
            {cues.filter((c) => c.key !== "height" && c.key !== "amount").map((c) => (
              <span key={c.key} className={`text-[11px] font-bold px-2 py-1 rounded-full backdrop-blur ${c.ok ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                {c.ok ? "✓" : "✗"} {c.label}
              </span>
            ))}
          </div>
        )}

        {/* status line */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-center">
          <span className="text-white text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 backdrop-blur">
            {phase === "starting" ? "Starting camera…" : phase === "saving" ? "Reading your movement…"
              : hint ? hint
              : phase === "baseline" ? "Stand still, arms down — banking your neutral…"
              : "Hold your position…"}
          </span>
        </div>

        {(phase === "baseline" || phase === "assess") && holdPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/15">
            <div className="h-full bg-teal transition-[width] duration-75" style={{ width: `${Math.round(holdPct * 100)}%` }} />
          </div>
        )}
        {showCountdown && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-7xl font-extrabold" style={{ textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>{countdown}</span>
          </div>
        )}
      </div>

      <div className="card p-4 mt-3">
        <p className="eyebrow">{move.name}{phase === "baseline" ? " · neutral" : ""}</p>
        <p className="text-navy text-sm mt-1">{phase === "baseline" ? "First, stand relaxed with your arms down and hold still for a moment." : move.setup}</p>
        {(phase === "baseline" || phase === "assess") && (
          <>
            <button onClick={manualCapture} className="btn-ghost w-full py-2.5 mt-3 text-sm">
              {phase === "baseline" ? "Use this as my neutral" : "Capture now"}
            </button>
            <p className="text-grey text-xs mt-2 text-center">It captures on its own once you hold still — this is a manual backup.</p>
          </>
        )}
      </div>
    </div>
  );
}

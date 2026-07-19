"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { analyzeAll, orientationKind, framing, type Captures, type LM, type PoseFrame } from "@/lib/posture-metrics";
import { postureToScores, buildPostureSummary, type PostureSummary } from "@/lib/posture-to-type";
import { saveMovementScan } from "@/lib/movement-map-actions";
import type { TypeId } from "@/lib/movement-map";
import PoseScanResult from "@/components/PoseScanResult";

const MP_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

const BONES: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [11, 13], [13, 15], [12, 14], [14, 16],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 31], [28, 32],
];

type ViewId = "front" | "side" | "back";
const ORDER: ViewId[] = ["front", "side", "back"];
const VIEW_LABEL: Record<ViewId, string> = { front: "Front", side: "Side", back: "Back" };
const CUE: Record<ViewId, string> = {
  front: "Face the camera — feet hip-width, arms relaxed by your sides.",
  side: "Turn side-on (either side) to the camera, eyes forward.",
  back: "Turn your back to the camera and stand naturally.",
};
const SHORT: Record<ViewId, string> = { front: "Face the camera", side: "Turn side-on", back: "Turn your back to the camera" };
const HOLD_MS = 2600;
const STILL_EPS = 0.012;

type Phase = "intro" | "starting" | "scanning" | "saving" | "done" | "error";

export default function PoseCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const latestRef = useRef<PoseFrame | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const aspectRef = useRef(4 / 3);

  const [phase, setPhase] = useState<Phase>("intro");
  const [frameHint, setFrameHint] = useState("Step into view so your whole body shows");
  const [aligned, setAligned] = useState(false);   // pose matches the current target
  const [holdPct, setHoldPct] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [moving, setMoving] = useState(false);
  const [capturedViews, setCapturedViews] = useState<ViewId[]>([]);
  const [flash, setFlash] = useState<ViewId | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const capturesRef = useRef<Captures>({});
  const motionRef = useRef<{ x: number; y: number }[] | null>(null);
  const stableRef = useRef<{ key: string; since: number }>({ key: "none", since: 0 });
  const busyRef = useRef(false);
  const [result, setResult] = useState<{ summary: PostureSummary; primary: TypeId; secondary: TypeId } | null>(null);

  const nextTarget = (): ViewId | null => ORDER.find((v) => !capturesRef.current[v]) ?? null;

  // --- overlay ---
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
    const smx = (lms[11].x + lms[12].x) / 2 * w;
    ctx.strokeStyle = "rgba(39,174,159,0.55)"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(smx, 0); ctx.lineTo(smx, h); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3;
    for (const [a, b] of BONES) {
      const pa = lms[a], pb = lms[b];
      if (!pa || !pb) continue;
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

  const finish = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase("saving");
    stopCamera();
    const findings = analyzeAll(capturesRef.current, aspectRef.current);
    const score = postureToScores(findings);
    const summary = buildPostureSummary(findings);
    try { await saveMovementScan(score.primary, score.secondary, findings); } catch { /* still show */ }
    setResult({ summary, primary: score.primary, secondary: score.secondary });
    setPhase("done");
  }, [stopCamera]);

  const commitCapture = useCallback((view: ViewId, lms: PoseFrame) => {
    if (capturesRef.current[view]) return;
    capturesRef.current[view] = lms.map((p) => ({ ...p })) as PoseFrame;
    const done = ORDER.filter((v) => capturesRef.current[v]);
    setCapturedViews(done);
    setFlash(view); setTimeout(() => setFlash(null), 650);
    stableRef.current = { key: "none", since: performance.now() };
    motionRef.current = null; setHoldPct(0); setCountdown(null); setAligned(false);
    if (done.length === ORDER.length) finish();
  }, [finish]);

  // --- loop: framing → target match → stillness → countdown → capture ---
  const loop = useCallback(() => {
    const vid = videoRef.current, lk = landmarkerRef.current;
    if (vid && lk && vid.readyState >= 2 && !busyRef.current) {
      try {
        const res = lk.detectForVideo(vid, performance.now());
        const lms: PoseFrame | null = res?.landmarks?.[0] ?? null;
        latestRef.current = lms;
        draw(lms);

        const fr = lms ? framing(lms) : { ready: false, hint: "Step into view so your whole body shows" };
        setFrameHint((h) => (h === fr.hint ? h : fr.hint));

        const target = nextTarget();
        const aspect = (vid.videoWidth || 640) / (vid.videoHeight || 480);
        aspectRef.current = aspect;
        const kind = lms && fr.ready ? orientationKind(lms, aspect) : { kind: "unknown" as const, faceVis: 0 };

        // Match the pose to the angle we're waiting for. We rely ONLY on the
        // reliable side-vs-wide signal plus the guided order — face visibility
        // is untrustworthy from behind (MediaPipe hallucinates the face), so
        // front and back are simply the 1st and 3rd "wide" steps in sequence.
        let match = false;
        if (target && lms && fr.ready) {
          if (target === "side") match = kind.kind === "side";
          else match = kind.kind === "wide"; // front (step 1) or back (step 3)
        }
        setAligned((a) => (a === match ? a : match));

        // stillness
        let still = true;
        if (lms) {
          const key = [11, 12, 23, 24, 27, 28].map((i) => lms[i]);
          const prev = motionRef.current;
          if (prev) {
            let sum = 0;
            for (let i = 0; i < key.length; i++) sum += Math.hypot(key[i].x - prev[i].x, key[i].y - prev[i].y);
            still = sum / key.length < STILL_EPS;
          }
          motionRef.current = key.map((p) => ({ x: p.x, y: p.y }));
        }
        setMoving((m) => { const v = match && !still; return m === v ? m : v; });

        const now = performance.now();
        const stateKey = match ? (target as string) : "none";
        if (stateKey !== stableRef.current.key || !still) stableRef.current = { key: stateKey, since: now };
        const held = now - stableRef.current.since;

        if (match && still && target) {
          const pct = Math.min(1, held / HOLD_MS);
          setHoldPct((p) => (Math.abs(p - pct) > 0.03 ? pct : p));
          setCountdown((c) => { const s = Math.max(1, Math.ceil((HOLD_MS - held) / 1000)); return c === s ? c : s; });
          if (held >= HOLD_MS) commitCapture(target, lms!);
        } else {
          setHoldPct((p) => (p !== 0 ? 0 : p));
          setCountdown((c) => (c !== null ? null : c));
        }
      } catch { /* frame skipped */ }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, commitCapture]);

  const start = useCallback(async () => {
    setPhase("starting"); setErrMsg("");
    capturesRef.current = {}; setCapturedViews([]); setCountdown(null); setAligned(false);
    stableRef.current = { key: "none", since: 0 }; motionRef.current = null; busyRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      const vid = videoRef.current!;
      vid.srcObject = stream;
      await vid.play();

      const vision: any = await import(/* webpackIgnore: true */ MP_URL as any);
      const fileset = await vision.FilesetResolver.forVisionTasks(MP_WASM);
      let lk: any;
      try {
        lk = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate: "GPU" }, runningMode: "VIDEO", numPoses: 1,
        });
      } catch {
        lk = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate: "CPU" }, runningMode: "VIDEO", numPoses: 1,
        });
      }
      landmarkerRef.current = lk;
      setPhase("scanning");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setErrMsg(e?.name === "NotAllowedError"
        ? "Camera access was blocked. Allow the camera in your browser and try again — or use the quick self-assessment instead."
        : "Couldn't start the camera scan on this device. You can use the quick self-assessment instead.");
      setPhase("error");
      stopCamera();
    }
  }, [loop, stopCamera]);

  // manual backup: force-capture the current target with the latest frame
  const manualCapture = useCallback(() => {
    const lms = latestRef.current;
    const target = nextTarget();
    if (lms && target) commitCapture(target, lms);
  }, [commitCapture]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ---- render ----
  if (phase === "done" && result) {
    return <PoseScanResult summary={result.summary} primary={result.primary} secondary={result.secondary} />;
  }

  if (phase === "error") {
    return (
      <div className="card p-5 mt-5">
        <p className="text-navy text-sm">{errMsg}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={start} className="btn-primary py-2 px-4 text-sm">Try the camera again</button>
          <Link href="/movement-map?quiz=1" className="btn-ghost py-2 px-4 text-sm">Use the self-assessment</Link>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="card p-5 mt-5 border-l-2 border-teal animate-in">
        <p className="eyebrow">Camera posture scan</p>
        <p className="text-navy text-sm mt-1 leading-relaxed">
          Your camera tracks your body points and reads your alignment. It guides you through three angles —
          <b> front, then side, then back</b> — and captures each one on its own once you hold still. Takes about a minute.
        </p>
        <ul className="mt-3 space-y-1.5">
          {["Nothing is recorded or uploaded — the scan runs entirely on your device.",
            "Prop your phone/laptop up, then step back until your whole body is in frame — no need to touch it.",
            "Follow the prompts: face the camera, turn side-on, then turn your back. Each captures automatically."].map((s) => (
            <li key={s} className="text-grey text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />{s}
            </li>
          ))}
        </ul>
        <div className="flex gap-3 mt-4">
          <button onClick={start} className="btn-primary py-2.5 px-5 inline-flex items-center gap-2">
            <Icon name="target" className="w-4 h-4" /> Start camera scan
          </button>
          <Link href="/movement-map?quiz=1" className="btn-ghost py-2.5 px-4">Prefer a quick quiz?</Link>
        </div>
        <p className="text-grey text-xs mt-3">A movement-education screen — not a medical diagnosis.</p>
      </div>
    );
  }

  // scanning stage
  const target = ORDER.find((v) => !capturedViews.includes(v)) ?? null;
  const targetLabel = target ? VIEW_LABEL[target] : null;
  const framed = !frameHint;
  const pill = !framed
    ? (frameHint || "Finding your position…")
    : !target
      ? "All angles captured"
      : moving
        ? "Hold still…"
        : countdown !== null
          ? `Hold ${targetLabel} — capturing in ${countdown}…`
          : SHORT[target];

  return (
    <div className="mt-5 animate-in">
      <div className="relative rounded-2xl overflow-hidden bg-navy" style={{ aspectRatio: "4 / 3" }}>
        <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur">
          <span className={`w-2 h-2 rounded-full ${!framed ? "bg-amber-400" : aligned ? "bg-emerald-400" : "bg-white/70"}`} />
          <span className="text-white text-xs font-medium">{pill}</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {ORDER.map((v) => {
            const got = capturedViews.includes(v);
            return (
              <span key={v} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${got ? "bg-teal text-white" : target === v ? "bg-white text-navy" : "bg-white/25 text-white"}`}>
                {VIEW_LABEL[v]}{got ? " ✓" : ""}
              </span>
            );
          })}
        </div>

        {phase === "scanning" && aligned && !moving && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/15">
            <div className="h-full bg-teal transition-[width] duration-75" style={{ width: `${Math.round(holdPct * 100)}%` }} />
          </div>
        )}

        {phase === "scanning" && countdown !== null && !flash && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-7xl font-extrabold" style={{ textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>{countdown}</span>
          </div>
        )}

        {flash && <div className="absolute inset-0 bg-white/70 animate-in" style={{ animationDuration: "120ms" }} />}

        {(phase === "starting" || phase === "saving") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <p className="text-white text-sm font-medium animate-pulse">
              {phase === "starting" ? "Starting camera + loading the model…" : "Reading your alignment…"}
            </p>
          </div>
        )}
      </div>

      <div className="card p-4 mt-3">
        <p className="eyebrow">Step {Math.min(capturedViews.length + 1, ORDER.length)} of {ORDER.length}{target ? ` · ${targetLabel} view` : ""}</p>
        <p className="text-navy text-sm mt-1">
          {target ? CUE[target] : "All angles captured — reading your alignment…"}
        </p>
        {target && (
          <>
            <button
              onClick={manualCapture}
              disabled={phase !== "scanning"}
              className="btn-ghost w-full py-2.5 mt-3 disabled:opacity-40 text-sm"
            >
              Capture {targetLabel?.toLowerCase()} now
            </button>
            <p className="text-grey text-xs mt-2 text-center">It captures on its own once you hold still — the button is just a manual backup.</p>
          </>
        )}
      </div>
    </div>
  );
}

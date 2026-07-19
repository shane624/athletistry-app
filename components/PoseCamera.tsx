"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { analyzeAll, detectOrientation, type Captures, type LM, type PoseFrame } from "@/lib/posture-metrics";
import { postureToScores, buildPostureSummary, type PostureSummary } from "@/lib/posture-to-type";
import { saveMovementScan } from "@/lib/movement-map-actions";
import type { TypeId } from "@/lib/movement-map";
import PoseScanResult from "@/components/PoseScanResult";

const MP_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// Which body-point pairs to draw as a skeleton.
const BONES: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [11, 13], [13, 15], [12, 14], [14, 16],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 31], [28, 32],
];

type ViewId = "front" | "side" | "back";
const VIEW_LABEL: Record<ViewId, string> = { front: "Front", side: "Side", back: "Back" };
const ALL_VIEWS: ViewId[] = ["front", "side", "back"];
const HOLD_MS = 900; // hold an angle steady this long before it auto-captures

type Phase = "intro" | "starting" | "scanning" | "saving" | "done" | "error";

export default function PoseCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const latestRef = useRef<PoseFrame | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [detView, setDetView] = useState<ViewId | "unknown">("unknown");
  const [holdPct, setHoldPct] = useState(0);
  const [capturedViews, setCapturedViews] = useState<ViewId[]>([]);
  const [flash, setFlash] = useState<ViewId | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const capturesRef = useRef<Captures>({});
  const stableRef = useRef<{ view: ViewId | "unknown"; since: number }>({ view: "unknown", since: 0 });
  const busyRef = useRef(false); // guards against double-capture / finishing
  const [result, setResult] = useState<{ summary: PostureSummary; primary: TypeId; secondary: TypeId } | null>(null);

  // --- draw the landmark overlay ---
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

    // plumb line through the shoulder midpoint
    const smx = (lms[11].x + lms[12].x) / 2 * w;
    ctx.strokeStyle = "rgba(39,174,159,0.55)"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(smx, 0); ctx.lineTo(smx, h); ctx.stroke();
    ctx.setLineDash([]);

    // bones
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3;
    for (const [a, b] of BONES) {
      const pa = lms[a], pb = lms[b];
      if (!pa || !pb) continue;
      const A = px(pa), B = px(pb);
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    // points
    ctx.fillStyle = "#27ae9f";
    for (const p of lms) {
      if (!p) continue;
      const P = px(p);
      ctx.beginPath(); ctx.arc(P.x, P.y, 4, 0, Math.PI * 2); ctx.fill();
    }
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
    const findings = analyzeAll(capturesRef.current);
    const score = postureToScores(findings);
    const summary = buildPostureSummary(findings);
    try { await saveMovementScan(score.primary, score.secondary, findings); } catch { /* still show */ }
    setResult({ summary, primary: score.primary, secondary: score.secondary });
    setPhase("done");
  }, [stopCamera]);

  // store a captured view, flash it, and finish once all three are in
  const commitCapture = useCallback((view: ViewId, lms: PoseFrame) => {
    if (capturesRef.current[view]) return;
    capturesRef.current[view] = lms.map((p) => ({ ...p })) as PoseFrame;
    const done = ALL_VIEWS.filter((v) => capturesRef.current[v]);
    setCapturedViews(done);
    setFlash(view); setTimeout(() => setFlash(null), 650);
    stableRef.current = { view: "unknown", since: performance.now() }; // require a fresh hold
    setHoldPct(0);
    if (done.length === ALL_VIEWS.length) finish();
  }, [finish]);

  // --- detection + auto-capture loop ---
  const loop = useCallback(() => {
    const vid = videoRef.current, lk = landmarkerRef.current;
    if (vid && lk && vid.readyState >= 2 && !busyRef.current) {
      try {
        const res = lk.detectForVideo(vid, performance.now());
        const lms: PoseFrame | null = res?.landmarks?.[0] ?? null;
        latestRef.current = lms;
        draw(lms);

        const view = lms ? detectOrientation(lms).view : "unknown";
        setDetView((prev) => (prev === view ? prev : view));

        const now = performance.now();
        if (view !== stableRef.current.view) stableRef.current = { view, since: now };
        const held = now - stableRef.current.since;

        if (lms && view !== "unknown" && !capturesRef.current[view]) {
          const pct = Math.min(1, held / HOLD_MS);
          setHoldPct((p) => (Math.abs(p - pct) > 0.03 ? pct : p));
          if (held >= HOLD_MS) commitCapture(view, lms);
        } else {
          setHoldPct((p) => (p !== 0 ? 0 : p));
        }
      } catch { /* frame skipped */ }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, commitCapture]);

  // --- start camera + model ---
  const start = useCallback(async () => {
    setPhase("starting"); setErrMsg("");
    capturesRef.current = {}; setCapturedViews([]);
    stableRef.current = { view: "unknown", since: 0 }; busyRef.current = false;
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
          baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
          runningMode: "VIDEO", numPoses: 1,
        });
      } catch {
        lk = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate: "CPU" },
          runningMode: "VIDEO", numPoses: 1,
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

  // manual fallback: capture whatever's currently detected
  const manualCapture = useCallback(() => {
    const lms = latestRef.current;
    if (lms && detView !== "unknown" && !capturesRef.current[detView]) commitCapture(detView, lms);
  }, [detView, commitCapture]);

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
          Your camera tracks your body points and reads your alignment from three angles — front, side, and back.
          It knows which way you&apos;re facing, so you just <b>turn slowly</b> and it captures each angle on its own. Takes about a minute.
        </p>
        <ul className="mt-3 space-y-1.5">
          {["Nothing is recorded or uploaded — the scan runs entirely on your device.",
            "Prop your phone/laptop so your whole body is in frame, ~2–3m back, in fitted clothing.",
            "Slowly turn a full circle — front, side, then back auto-capture as you hold each."].map((s) => (
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

  // starting / scanning / saving — camera stage
  const detLabel = detView === "unknown" ? null : VIEW_LABEL[detView];
  const detCaptured = detView !== "unknown" && capturedViews.includes(detView);
  const remaining = ALL_VIEWS.filter((v) => !capturedViews.includes(v)).map((v) => VIEW_LABEL[v].toLowerCase());

  return (
    <div className="mt-5 animate-in">
      <div className="relative rounded-2xl overflow-hidden bg-navy" style={{ aspectRatio: "4 / 3" }}>
        <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* detected-orientation pill + hold ring */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur">
          <span className={`w-2 h-2 rounded-full ${detView === "unknown" ? "bg-amber-400" : detCaptured ? "bg-teal" : "bg-emerald-400"}`} />
          <span className="text-white text-xs font-medium">
            {detView === "unknown" ? "Step fully into frame" : detCaptured ? `${detLabel} captured ✓` : `Facing: ${detLabel}`}
          </span>
        </div>

        {/* captured-view chips */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {ALL_VIEWS.map((v) => {
            const got = capturedViews.includes(v);
            return (
              <span key={v} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${got ? "bg-teal text-white" : detView === v ? "bg-white text-navy" : "bg-white/25 text-white"}`}>
                {VIEW_LABEL[v]}{got ? " ✓" : ""}
              </span>
            );
          })}
        </div>

        {/* hold-to-capture progress bar */}
        {phase === "scanning" && detView !== "unknown" && !detCaptured && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/15">
            <div className="h-full bg-teal transition-[width] duration-75" style={{ width: `${Math.round(holdPct * 100)}%` }} />
          </div>
        )}

        {/* capture flash */}
        {flash && <div className="absolute inset-0 bg-white/70 animate-in" style={{ animationDuration: "120ms" }} />}

        {(phase === "starting" || phase === "saving") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <p className="text-white text-sm font-medium animate-pulse">
              {phase === "starting" ? "Starting camera + loading the model…" : "Reading your alignment…"}
            </p>
          </div>
        )}
      </div>

      {/* guidance + manual fallback */}
      <div className="card p-4 mt-3">
        <p className="eyebrow">{capturedViews.length} of {ALL_VIEWS.length} angles captured</p>
        <p className="text-navy text-sm mt-1">
          {capturedViews.length === 0
            ? "Stand tall, feet hip-width, arms relaxed. Face the camera to capture your front, then slowly turn."
            : remaining.length
              ? `Nice — now turn to show your ${remaining.join(" and ")}. Hold each angle steady and it captures automatically.`
              : "All angles captured — reading your alignment…"}
        </p>
        <button
          onClick={manualCapture}
          disabled={phase !== "scanning" || detView === "unknown" || detCaptured}
          className="btn-ghost w-full py-2.5 mt-3 disabled:opacity-40 text-sm"
        >
          {detView === "unknown" || detCaptured ? "Waiting for a clear angle…" : `Capture ${detLabel?.toLowerCase()} now`}
        </button>
        <p className="text-grey text-xs mt-2 text-center">It captures on its own — the button is just a manual backup.</p>
      </div>
    </div>
  );
}

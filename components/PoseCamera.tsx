"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { analyzeAll, type Captures, type LM, type PoseFrame } from "@/lib/posture-metrics";
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
const VIEWS: { id: ViewId; title: string; cue: string }[] = [
  { id: "front", title: "Front view", cue: "Face the camera. Stand tall, feet hip-width, arms relaxed by your sides." },
  { id: "side", title: "Side view", cue: "Turn 90° so one side faces the camera. Eyes forward, arms by your sides." },
  { id: "back", title: "Back view", cue: "Turn to face away from the camera. Stand naturally and still." },
];

type Phase = "intro" | "starting" | "scanning" | "saving" | "done" | "error";

export default function PoseCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const latestRef = useRef<PoseFrame | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);            // index into VIEWS
  const [detected, setDetected] = useState(false); // body currently in frame
  const [errMsg, setErrMsg] = useState("");
  const capturesRef = useRef<Captures>({});
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
    const sm = { x: (lms[11].x + lms[12].x) / 2 * w, y: 0 };
    ctx.strokeStyle = "rgba(39,174,159,0.55)"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(sm.x, 0); ctx.lineTo(sm.x, h); ctx.stroke();
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

  // --- detection loop ---
  const loop = useCallback(() => {
    const vid = videoRef.current, lk = landmarkerRef.current;
    if (vid && lk && vid.readyState >= 2) {
      try {
        const res = lk.detectForVideo(vid, performance.now());
        const lms: PoseFrame | null = res?.landmarks?.[0] ?? null;
        latestRef.current = lms;
        setDetected(!!lms);
        draw(lms);
      } catch { /* frame skipped */ }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  // --- start camera + model ---
  const start = useCallback(async () => {
    setPhase("starting"); setErrMsg("");
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
      setPhase("scanning"); setStep(0);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setErrMsg(e?.name === "NotAllowedError"
        ? "Camera access was blocked. Allow the camera in your browser and try again — or use the quick self-assessment instead."
        : "Couldn't start the camera scan on this device. You can use the quick self-assessment instead.");
      setPhase("error");
      stopCamera();
    }
  }, [loop]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try { landmarkerRef.current?.close?.(); } catch { /* noop */ }
    landmarkerRef.current = null;
  }, []);

  // --- capture the current view + advance / finish ---
  const capture = useCallback(async () => {
    const lms = latestRef.current;
    if (!lms) return;
    const view = VIEWS[step].id;
    capturesRef.current[view] = lms.map((p) => ({ ...p })) as PoseFrame;

    if (step < VIEWS.length - 1) { setStep(step + 1); return; }

    // all three captured → analyse
    setPhase("saving");
    stopCamera();
    const findings = analyzeAll(capturesRef.current);
    const score = postureToScores(findings);
    const summary = buildPostureSummary(findings);
    try { await saveMovementScan(score.primary, score.secondary, findings); } catch { /* still show result */ }
    setResult({ summary, primary: score.primary, secondary: score.secondary });
    setPhase("done");
  }, [step, stopCamera]);

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
          It takes about a minute. Prop your phone or laptop so your <b>whole body</b> is in frame, stand about 2–3m back, and wear fitted clothing so the joints are visible.
        </p>
        <ul className="mt-3 space-y-1.5">
          {["Nothing is recorded or uploaded — the scan runs entirely on your device.",
            "You'll capture 3 quick standing photos-worth of body points.",
            "You get a plain-language posture summary + your top priorities."].map((s) => (
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

  // starting / scanning / saving — show the camera stage
  const current = VIEWS[step];
  return (
    <div className="mt-5 animate-in">
      <div className="relative rounded-2xl overflow-hidden bg-navy" style={{ aspectRatio: "4 / 3" }}>
        <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* status pill */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur">
          <span className={`w-2 h-2 rounded-full ${detected ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span className="text-white text-xs font-medium">{detected ? "Body detected" : "Step fully into frame"}</span>
        </div>

        {/* progress dots */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {VIEWS.map((v, i) => (
            <span key={v.id} className={`w-2 h-2 rounded-full ${i < step ? "bg-teal" : i === step ? "bg-white" : "bg-white/35"}`} />
          ))}
        </div>

        {(phase === "starting" || phase === "saving") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <p className="text-white text-sm font-medium animate-pulse">
              {phase === "starting" ? "Starting camera + loading the model…" : "Reading your alignment…"}
            </p>
          </div>
        )}
      </div>

      {/* cue + capture */}
      <div className="card p-4 mt-3">
        <p className="eyebrow">Step {step + 1} of {VIEWS.length} · {current.title}</p>
        <p className="text-navy text-sm mt-1">{current.cue}</p>
        <button
          onClick={capture}
          disabled={phase !== "scanning" || !detected}
          className="btn-primary w-full py-3 mt-3 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Icon name="target" className="w-4 h-4" />
          {step < VIEWS.length - 1 ? `Capture ${current.title.toLowerCase()}` : "Capture & get my results"}
        </button>
        <p className="text-grey text-xs mt-2 text-center">Hold still until the body points settle, then capture.</p>
      </div>
    </div>
  );
}

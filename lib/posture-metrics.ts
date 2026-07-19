// Posture metrics — turns raw MediaPipe pose landmarks into plain-language
// postural FINDINGS. Pure module (no React, no browser APIs) so it can be
// unit-tested in node and reused on client or server.
//
// Honesty note: a single 2D webcam can measure gross alignment (shoulder/hip
// level, plumb-line offsets, knee gaps, forward head) reliably. It CANNOT
// measure true foot pronation, scapular winging, or exact spinal curves.
// Those are surfaced as "needs a photo or a coach's eye", never faked.

// ---- Landmark model -------------------------------------------------------

export interface LM { x: number; y: number; z?: number; visibility?: number }
export type PoseFrame = LM[]; // 33 MediaPipe BlazePose landmarks

// MediaPipe Pose landmark indices we use.
export const P = {
  NOSE: 0,
  LEFT_EAR: 7, RIGHT_EAR: 8,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
  LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT: 31, RIGHT_FOOT: 32,
} as const;

export type Severity = "ok" | "mild" | "notable" | "unknown";
export type ViewId = "front" | "side" | "back";

// ---- Temporal smoothing ---------------------------------------------------
// Median-average a short buffer of frames captured while the dancer held still.
// Median (not mean) rejects the odd jittery frame, giving a far steadier read
// than a single-frame snapshot — the payoff of capturing a clip, not a photo.
function median(a: number[]): number {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function averageFrames(frames: PoseFrame[]): PoseFrame {
  if (frames.length <= 1) return frames[0] ?? [];
  const n = Math.max(...frames.map((f) => f.length));
  const out: LM[] = [];
  for (let i = 0; i < n; i++) {
    const xs: number[] = [], ys: number[] = [], zs: number[] = [], vs: number[] = [];
    for (const f of frames) {
      const p = f[i]; if (!p) continue;
      xs.push(p.x); ys.push(p.y);
      if (p.z !== undefined) zs.push(p.z);
      if (p.visibility !== undefined) vs.push(p.visibility);
    }
    out.push({
      x: median(xs), y: median(ys),
      z: zs.length ? median(zs) : undefined,
      visibility: vs.length ? median(vs) : undefined,
    });
  }
  return out;
}

export interface Finding {
  key: string;
  region: "feet" | "knees" | "hips" | "shoulders" | "head" | "spine" | "whole";
  label: string;      // short name of the check
  severity: Severity;
  note: string;       // plain-language result
  view: ViewId;
}

// ---- Small helpers --------------------------------------------------------

function ok(f: PoseFrame, i: number): boolean {
  const p = f?.[i];
  return !!p && (p.visibility === undefined || p.visibility > 0.5);
}
function mid(a: LM, b: LM): LM { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
function dist(a: LM, b: LM): number { return Math.hypot(a.x - b.x, a.y - b.y); }

// Perpendicular distance from point p to the line through a and b (all in the
// normalised image plane). Used for plumb-line / stacking offsets.
function perpOffset(p: LM, a: LM, b: LM): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1e-6;
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len;
}

function grade(ratio: number, mildAt: number, notableAt: number): Severity {
  if (ratio >= notableAt) return "notable";
  if (ratio >= mildAt) return "mild";
  return "ok";
}

// MediaPipe normalises x by width and y by height, so horizontal offsets must
// be multiplied by the frame aspect (w/h) before being compared to vertical
// distances — otherwise every horizontal deviation reads ~25% too small.
function sx(p: LM, aspect: number): LM { return { x: p.x * aspect, y: p.y }; }
function visOf(p?: LM): number { return p ? (p.visibility ?? 1) : 0; }

function torsoA(f: PoseFrame, aspect: number): number {
  const sh = mid(f[P.LEFT_SHOULDER], f[P.RIGHT_SHOULDER]);
  const hp = mid(f[P.LEFT_HIP], f[P.RIGHT_HIP]);
  return dist(sx(sh, aspect), sx(hp, aspect)) || 1e-6;
}

// ---- Frontal analysis (used for BOTH front and back views) ----------------
// Level checks + knee gap. From behind, the same joints are visible, so the
// same maths applies; we only relabel foot/scapula notes per view.

export function analyzeFrontal(f: PoseFrame, view: "front" | "back", aspect = 1): Finding[] {
  const out: Finding[] = [];
  const scale = torsoA(f, aspect);

  // Shoulder level
  if (ok(f, P.LEFT_SHOULDER) && ok(f, P.RIGHT_SHOULDER)) {
    const r = Math.abs(f[P.LEFT_SHOULDER].y - f[P.RIGHT_SHOULDER].y) / scale;
    const sev = grade(r, 0.05, 0.10);
    const lower = f[P.LEFT_SHOULDER].y > f[P.RIGHT_SHOULDER].y ? "left" : "right";
    out.push({
      key: "shoulder-level", region: "shoulders", view,
      label: view === "back" ? "Scapula / shoulder level" : "Shoulder level",
      severity: sev,
      note: sev === "ok" ? "Shoulders sit level." : `Your ${lower} shoulder sits lower${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Hip level
  if (ok(f, P.LEFT_HIP) && ok(f, P.RIGHT_HIP)) {
    const r = Math.abs(f[P.LEFT_HIP].y - f[P.RIGHT_HIP].y) / scale;
    const sev = grade(r, 0.04, 0.09);
    const lower = f[P.LEFT_HIP].y > f[P.RIGHT_HIP].y ? "left" : "right";
    out.push({
      key: "hip-level", region: "hips", view, label: "Hip level",
      severity: sev,
      note: sev === "ok" ? "Hips sit level." : `Your ${lower} hip drops lower — a hike/drop pattern${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Head tilt — ears off level (lateral neck tilt).
  if (ok(f, P.LEFT_EAR) && ok(f, P.RIGHT_EAR)) {
    const r = Math.abs(f[P.LEFT_EAR].y - f[P.RIGHT_EAR].y) / scale;
    const sev = grade(r, 0.05, 0.10);
    const low = f[P.LEFT_EAR].y > f[P.RIGHT_EAR].y ? "left" : "right";
    out.push({
      key: "head-tilt", region: "head", view, label: "Head tilt",
      severity: sev,
      note: sev === "ok" ? "Head sits level." : `Your head tilts toward the ${low}${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Knee alignment (valgus / varus) — compare knee gap to ankle gap.
  if (ok(f, P.LEFT_KNEE) && ok(f, P.RIGHT_KNEE) && ok(f, P.LEFT_ANKLE) && ok(f, P.RIGHT_ANKLE)) {
    const kneeGap = Math.abs(f[P.LEFT_KNEE].x - f[P.RIGHT_KNEE].x);
    const ankleGap = Math.abs(f[P.LEFT_ANKLE].x - f[P.RIGHT_ANKLE].x) || 1e-6;
    const ratio = kneeGap / ankleGap; // <1 knees together (valgus), >1 knees apart (varus)
    let sev: Severity = "ok"; let note = "Knees track over the ankles.";
    if (ratio < 0.55) { sev = ratio < 0.4 ? "notable" : "mild"; note = "Knees fall inward relative to the ankles (valgus / knock-knee tendency)."; }
    else if (ratio > 1.6) { sev = ratio > 2.0 ? "notable" : "mild"; note = "Knees sit wider than the ankles (varus / bow-leg tendency)."; }
    out.push({ key: "knee-track", region: "knees", view, label: "Knee alignment", severity: sev, note });
  }

  // Whole-body lateral shift — nose over the base of support.
  if (ok(f, P.NOSE) && ok(f, P.LEFT_ANKLE) && ok(f, P.RIGHT_ANKLE)) {
    const base = mid(f[P.LEFT_ANKLE], f[P.RIGHT_ANKLE]);
    const r = Math.abs(f[P.NOSE].x - base.x) * aspect / scale;
    const sev = grade(r, 0.10, 0.20);
    const side = f[P.NOSE].x > base.x ? "right" : "left";
    out.push({
      key: "lateral-shift", region: "whole", view, label: "Overall balance",
      severity: sev,
      note: sev === "ok" ? "Weight looks centred over your base." : `Your upper body shifts to the ${side} of your base${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Foot turnout / symmetry — toe direction vs the ankle (a proxy for how much
  // each foot turns out, and whether it's even). Not true hip rotation.
  if (ok(f, P.LEFT_ANKLE) && ok(f, P.RIGHT_ANKLE) && ok(f, P.LEFT_FOOT) && ok(f, P.RIGHT_FOOT)) {
    const lenL = dist(sx(f[P.LEFT_ANKLE], aspect), sx(f[P.LEFT_FOOT], aspect)) || 1e-6;
    const lenR = dist(sx(f[P.RIGHT_ANKLE], aspect), sx(f[P.RIGHT_FOOT], aspect)) || 1e-6;
    const turnL = (f[P.LEFT_ANKLE].x - f[P.LEFT_FOOT].x) * aspect / lenL;  // + = left toe points out
    const turnR = (f[P.RIGHT_FOOT].x - f[P.RIGHT_ANKLE].x) * aspect / lenR; // + = right toe points out
    const asym = Math.abs(turnL - turnR);
    const both = (turnL + turnR) / 2;
    let sev: Severity = "ok"; let note = "Feet turn out evenly.";
    if (asym > 0.2) { sev = asym > 0.35 ? "notable" : "mild"; note = "Your feet turn out unevenly — one is more turned out than the other."; }
    else if (both > 0.85) { sev = "mild"; note = "Both feet are forced very turned out — often from cranking the feet rather than the hips."; }
    out.push({ key: "foot-turnout", region: "feet", view, label: "Foot turnout & symmetry", severity: sev, note });
  }

  // Pronation is a separate thing the camera genuinely can't grade.
  out.push({
    key: "foot-arch", region: "feet", view, label: view === "back" ? "Foot & heel (pronation)" : "Foot & arch (pronation)",
    severity: "unknown",
    note: "Pronation/supination can't be read from body points — check this with a side/rear photo or a coach.",
  });

  return out;
}

// ---- Sagittal analysis (side view) ----------------------------------------
// On a true profile the FAR-side landmarks are unreliable, so we read the
// silhouette from the near (camera-facing) side only — averaging L/R would
// cancel out the very forward-head / rounded-shoulder offset we're measuring.
// Horizontal offsets are aspect-corrected and phrased by magnitude.

export function analyzeSagittal(f: PoseFrame, aspect = 1): Finding[] {
  const out: Finding[] = [];
  const scale = torsoA(f, aspect);

  // Pick the more-visible side and read every joint from it, consistently.
  const leftVis = visOf(f[P.LEFT_SHOULDER]) + visOf(f[P.LEFT_HIP]) + visOf(f[P.LEFT_KNEE]) + visOf(f[P.LEFT_ANKLE]);
  const rightVis = visOf(f[P.RIGHT_SHOULDER]) + visOf(f[P.RIGHT_HIP]) + visOf(f[P.RIGHT_KNEE]) + visOf(f[P.RIGHT_ANKLE]);
  const L = leftVis >= rightVis;
  const ear = L ? f[P.LEFT_EAR] : f[P.RIGHT_EAR];
  const sh = L ? f[P.LEFT_SHOULDER] : f[P.RIGHT_SHOULDER];
  const hp = L ? f[P.LEFT_HIP] : f[P.RIGHT_HIP];
  const kn = L ? f[P.LEFT_KNEE] : f[P.RIGHT_KNEE];
  const an = L ? f[P.LEFT_ANKLE] : f[P.RIGHT_ANKLE];

  // Forward head — ear horizontal offset from the shoulder.
  if (ear) {
    const r = Math.abs(ear.x - sh.x) * aspect / scale;
    const sev = grade(r, 0.14, 0.26);
    out.push({
      key: "forward-head", region: "head", view: "side", label: "Head over shoulders",
      severity: sev,
      note: sev === "ok" ? "Head stacks over the shoulders." : `Your head sits forward of your shoulders${sev === "notable" ? " (notable forward-head)" : ""}.`,
    });
  }

  // Forward / rounded shoulders — shoulder offset from the hip plumb line.
  {
    const r = Math.abs(sh.x - hp.x) * aspect / scale;
    const sev = grade(r, 0.12, 0.24);
    out.push({
      key: "forward-shoulders", region: "shoulders", view: "side", label: "Shoulders over hips",
      severity: sev,
      note: sev === "ok" ? "Shoulders stack over the hips." : `Your shoulders roll forward of your hips${sev === "notable" ? " (notable rounding)" : ""}.`,
    });
  }

  // Knee stacking / hyperextension — knee offset from the ankle→hip line.
  {
    const r = perpOffset(sx(kn, aspect), sx(an, aspect), sx(hp, aspect)) / scale;
    const sev = grade(r, 0.08, 0.16);
    out.push({
      key: "knee-stack", region: "knees", view: "side", label: "Knee stacking",
      severity: sev,
      note: sev === "ok" ? "Knees stack over the ankles." : `Your knees don't stack over the ankle–hip line — possible hyperextension or a soft-knee lean${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Pelvic sway — hips drifting forward of the ankles (sway-back tendency).
  {
    const r = Math.abs(hp.x - an.x) * aspect / scale;
    const sev = grade(r, 0.12, 0.22);
    out.push({
      key: "pelvic-sway", region: "hips", view: "side", label: "Hips over ankles",
      severity: sev,
      note: sev === "ok" ? "Hips stack over the ankles." : `Your hips push forward of your ankles — a sway-back lean${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Pelvic tilt + spinal curves — not reliable from 2D pose points.
  out.push({
    key: "pelvic-tilt", region: "hips", view: "side", label: "Pelvic tilt",
    severity: "unknown",
    note: "Anterior/posterior pelvic tilt needs a side photo or a coach — body points can't grade it.",
  });
  out.push({
    key: "spine-curves", region: "spine", view: "side", label: "Lordosis / kyphosis",
    severity: "unknown",
    note: "Low-back (lordosis) and upper-back (kyphosis) curves need a side photo — flagged, not graded.",
  });

  return out;
}

// ---- Combine the three captured views -------------------------------------

export interface Captures {
  front?: PoseFrame | null;
  side?: PoseFrame | null;
  back?: PoseFrame | null;
}

export function analyzeAll(cap: Captures, aspect = 1): Finding[] {
  const out: Finding[] = [];
  if (cap.front) out.push(...analyzeFrontal(cap.front, "front", aspect));
  if (cap.side) out.push(...analyzeSagittal(cap.side, aspect));
  if (cap.back) out.push(...analyzeFrontal(cap.back, "back", aspect));
  return out;
}

// Findings that actually flagged something (ignore ok + unknown).
export function flagged(findings: Finding[]): Finding[] {
  return findings.filter((f) => f.severity === "mild" || f.severity === "notable");
}

// ---- Auto orientation detection -------------------------------------------
// Works out whether the dancer is facing front, side, or back from the pose,
// so the camera can capture each angle on its own.
//   • Side: the shoulders overlap, so shoulder width collapses.
//   • Front vs back: MediaPipe returns RAW (un-mirrored) image coords, so when
//     facing the camera the person's LEFT shoulder sits at a higher x than their
//     RIGHT shoulder (sign > 0); facing away it flips (sign < 0). Face-landmark
//     visibility confirms it (high when we can see the face).

function avgVis(f: PoseFrame, idxs: number[]): number {
  let sum = 0, n = 0;
  for (const i of idxs) { const v = f?.[i]?.visibility; if (v !== undefined) { sum += v; n++; } }
  return n ? sum / n : 1; // if a model doesn't report visibility, assume visible
}

// ---- Framing / "is the whole body in shot" check --------------------------
// Lets the scan run hands-free from across the room: it only captures once the
// full body is inside the frame, and otherwise coaches the dancer to fix it.

export interface Framing { ready: boolean; hint: string }

export function framing(f: PoseFrame): Framing {
  // Presence-based, NOT coordinate-based. MediaPipe extrapolates landmark
  // positions past the frame edge even when a joint is clearly in shot, so
  // judging "cut off" by x/y position gives false positives. Instead: if the
  // model confidently sees a joint, it's in frame. It won't confidently detect
  // a joint that's genuinely off-screen, so real cut-offs still get caught.
  const seen = (a: number, b: number) => ok(f, a) || ok(f, b); // at least one side (works from a profile)

  if (!seen(P.LEFT_SHOULDER, P.RIGHT_SHOULDER) || !seen(P.LEFT_HIP, P.RIGHT_HIP)) {
    return { ready: false, hint: "Step into view so your whole body shows" };
  }
  if (!seen(P.LEFT_ANKLE, P.RIGHT_ANKLE) || !seen(P.LEFT_KNEE, P.RIGHT_KNEE)) {
    return { ready: false, hint: "Step back so your legs and feet are in view" };
  }
  if (!(ok(f, P.NOSE) || ok(f, P.LEFT_EAR) || ok(f, P.RIGHT_EAR))) {
    return { ready: false, hint: "Make sure your head is in the frame too" };
  }

  // Only remaining guard: are they far too small in the frame? (very loose)
  const headY = [P.NOSE, P.LEFT_EAR, P.RIGHT_EAR].filter((i) => ok(f, i)).map((i) => f[i].y);
  const ankleY = [P.LEFT_ANKLE, P.RIGHT_ANKLE].filter((i) => ok(f, i)).map((i) => f[i].y);
  const top = headY.length ? Math.min(...headY) : 0;
  const bottom = ankleY.length ? Math.max(...ankleY) : 1;
  if (bottom - top < 0.2) return { ready: false, hint: "Come a little closer" };

  return { ready: true, hint: "" };
}

// Coarse orientation: the ONE thing a single camera reads reliably is whether
// the shoulders are square-on (wide) or edge-on (side). Front vs back is left
// to the capture sequence, which is far more robust than guessing from pixels.
// Also returns face visibility so the caller can sanity-check a back view.
export function orientationKind(f: PoseFrame, aspect = 1): { kind: "side" | "wide" | "unknown"; faceVis: number } {
  if (!f[P.LEFT_SHOULDER] || !f[P.RIGHT_SHOULDER] || !f[P.LEFT_HIP] || !f[P.RIGHT_HIP]) {
    return { kind: "unknown", faceVis: 0 };
  }
  const shMid = mid(f[P.LEFT_SHOULDER], f[P.RIGHT_SHOULDER]);
  const hpMid = mid(f[P.LEFT_HIP], f[P.RIGHT_HIP]);
  const torsoH = Math.hypot((shMid.x - hpMid.x) * aspect, shMid.y - hpMid.y) || 1e-6;
  const shoulderW = Math.abs(f[P.LEFT_SHOULDER].x - f[P.RIGHT_SHOULDER].x) * aspect / torsoH;
  const faceVis = avgVis(f, [P.NOSE, 2, 5, 9, 10]);
  return { kind: shoulderW < 0.5 ? "side" : "wide", faceVis };
}

// `aspect` = frame width / height. MediaPipe normalises x by width and y by
// height, so horizontal distances must be multiplied by aspect to be compared
// against vertical ones — otherwise a front view can masquerade as a side.
export function detectOrientation(f: PoseFrame, aspect = 1): { view: ViewId | "unknown"; confidence: number } {
  if (!ok(f, P.LEFT_SHOULDER) || !ok(f, P.RIGHT_SHOULDER) || !f[P.LEFT_HIP] || !f[P.RIGHT_HIP]) {
    return { view: "unknown", confidence: 0 };
  }
  const shMid = mid(f[P.LEFT_SHOULDER], f[P.RIGHT_SHOULDER]);
  const hpMid = mid(f[P.LEFT_HIP], f[P.RIGHT_HIP]);
  const torsoH = Math.hypot((shMid.x - hpMid.x) * aspect, shMid.y - hpMid.y) || 1e-6;
  const shoulderW = Math.abs(f[P.LEFT_SHOULDER].x - f[P.RIGHT_SHOULDER].x) * aspect / torsoH;

  // Shoulders collapsed onto each other → we're looking at a side.
  if (shoulderW < 0.5) {
    const conf = Math.min(1, (0.5 - shoulderW) / 0.3 + 0.4);
    return { view: "side", confidence: conf };
  }

  // Otherwise front or back.
  const sign = f[P.LEFT_SHOULDER].x - f[P.RIGHT_SHOULDER].x; // >0 front, <0 back
  const faceVis = avgVis(f, [P.NOSE, 2, 5, 9, 10]); // nose, inner eyes, mouth corners
  const frontScore = (sign > 0 ? 1 : 0) + (faceVis > 0.6 ? 1 : 0);
  const backScore = (sign < 0 ? 1 : 0) + (faceVis < 0.45 ? 1 : 0);
  if (frontScore >= backScore) return { view: "front", confidence: Math.min(1, 0.5 + frontScore * 0.25) };
  return { view: "back", confidence: Math.min(1, 0.5 + backScore * 0.25) };
}

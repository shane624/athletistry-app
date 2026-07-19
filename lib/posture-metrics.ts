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

// Body scale = shoulder-mid to hip-mid distance. Everything is normalised by
// this so findings are independent of how close the dancer stands.
function torso(f: PoseFrame): number {
  const sh = mid(f[P.LEFT_SHOULDER], f[P.RIGHT_SHOULDER]);
  const hp = mid(f[P.LEFT_HIP], f[P.RIGHT_HIP]);
  return dist(sh, hp) || 1e-6;
}

function grade(ratio: number, mildAt: number, notableAt: number): Severity {
  if (ratio >= notableAt) return "notable";
  if (ratio >= mildAt) return "mild";
  return "ok";
}

// ---- Frontal analysis (used for BOTH front and back views) ----------------
// Level checks + knee gap. From behind, the same joints are visible, so the
// same maths applies; we only relabel foot/scapula notes per view.

export function analyzeFrontal(f: PoseFrame, view: "front" | "back"): Finding[] {
  const out: Finding[] = [];
  const scale = torso(f);

  // Shoulder level
  if (ok(f, P.LEFT_SHOULDER) && ok(f, P.RIGHT_SHOULDER)) {
    const r = Math.abs(f[P.LEFT_SHOULDER].y - f[P.RIGHT_SHOULDER].y) / scale;
    const sev = grade(r, 0.06, 0.12);
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
    const sev = grade(r, 0.05, 0.1);
    const lower = f[P.LEFT_HIP].y > f[P.RIGHT_HIP].y ? "left" : "right";
    out.push({
      key: "hip-level", region: "hips", view, label: "Hip level",
      severity: sev,
      note: sev === "ok" ? "Hips sit level." : `Your ${lower} hip drops lower — a hike/drop pattern${sev === "notable" ? " (notable)" : ""}.`,
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
    const r = Math.abs(f[P.NOSE].x - base.x) / scale;
    const sev = grade(r, 0.12, 0.22);
    const side = f[P.NOSE].x > base.x ? "right" : "left";
    out.push({
      key: "lateral-shift", region: "whole", view, label: "Overall balance",
      severity: sev,
      note: sev === "ok" ? "Weight looks centred over your base." : `Your upper body shifts to the ${side} of your base${sev === "notable" ? " (notable)" : ""}.`,
    });
  }

  // Foot / arch — cannot be judged from pose landmarks; flag honestly.
  out.push({
    key: "foot-arch", region: "feet", view, label: view === "back" ? "Foot & heel (pronation)" : "Foot & arch (pronation)",
    severity: "unknown",
    note: "Pronation/supination can't be read from body points — check this with a side/rear photo or a coach.",
  });

  return out;
}

// ---- Sagittal analysis (side view) ----------------------------------------
// We don't know which way the dancer faces, so joints are averaged L/R and we
// report plumb-line offsets by magnitude (phrased as "sits forward of").

export function analyzeSagittal(f: PoseFrame): Finding[] {
  const out: Finding[] = [];
  const scale = torso(f);
  const ear = ok(f, P.LEFT_EAR) && ok(f, P.RIGHT_EAR) ? mid(f[P.LEFT_EAR], f[P.RIGHT_EAR]) : (ok(f, P.LEFT_EAR) ? f[P.LEFT_EAR] : f[P.RIGHT_EAR]);
  const sh = mid(f[P.LEFT_SHOULDER], f[P.RIGHT_SHOULDER]);
  const hp = mid(f[P.LEFT_HIP], f[P.RIGHT_HIP]);
  const kn = mid(f[P.LEFT_KNEE], f[P.RIGHT_KNEE]);
  const an = mid(f[P.LEFT_ANKLE], f[P.RIGHT_ANKLE]);

  // Forward head — ear horizontal offset from the shoulder.
  if (ear) {
    const r = Math.abs(ear.x - sh.x) / scale;
    const sev = grade(r, 0.18, 0.32);
    out.push({
      key: "forward-head", region: "head", view: "side", label: "Head over shoulders",
      severity: sev,
      note: sev === "ok" ? "Head stacks over the shoulders." : `Your head sits forward of your shoulders${sev === "notable" ? " (notable forward-head)" : ""}.`,
    });
  }

  // Forward / rounded shoulders — shoulder offset from the hip plumb line.
  {
    const r = Math.abs(sh.x - hp.x) / scale;
    const sev = grade(r, 0.16, 0.3);
    out.push({
      key: "forward-shoulders", region: "shoulders", view: "side", label: "Shoulders over hips",
      severity: sev,
      note: sev === "ok" ? "Shoulders stack over the hips." : `Your shoulders roll forward of your hips${sev === "notable" ? " (notable rounding)" : ""}.`,
    });
  }

  // Knee stacking / hyperextension — knee offset from the ankle→hip line.
  {
    const r = perpOffset(kn, an, hp) / scale;
    const sev = grade(r, 0.1, 0.2);
    out.push({
      key: "knee-stack", region: "knees", view: "side", label: "Knee stacking",
      severity: sev,
      note: sev === "ok" ? "Knees stack over the ankles." : `Your knees don't stack over the ankle–hip line — possible hyperextension or a soft-knee lean${sev === "notable" ? " (notable)" : ""}.`,
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

export function analyzeAll(cap: Captures): Finding[] {
  const out: Finding[] = [];
  if (cap.front) out.push(...analyzeFrontal(cap.front, "front"));
  if (cap.side) out.push(...analyzeSagittal(cap.side));
  if (cap.back) out.push(...analyzeFrontal(cap.back, "back"));
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

export function detectOrientation(f: PoseFrame): { view: ViewId | "unknown"; confidence: number } {
  if (!ok(f, P.LEFT_SHOULDER) || !ok(f, P.RIGHT_SHOULDER) || !f[P.LEFT_HIP] || !f[P.RIGHT_HIP]) {
    return { view: "unknown", confidence: 0 };
  }
  const scale = torso(f);
  const shoulderW = Math.abs(f[P.LEFT_SHOULDER].x - f[P.RIGHT_SHOULDER].x) / scale;

  // Shoulders collapsed onto each other → we're looking at a side.
  if (shoulderW < 0.55) {
    const conf = Math.min(1, (0.55 - shoulderW) / 0.35 + 0.4);
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

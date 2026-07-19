// Ballet Movement Lab — dynamic, movement-specific assessment from pose
// landmarks. Each move exposes a live `evaluate()` (drives on-screen cues and
// finds the best rep) and a `score()` (grades the captured best-rep frame into
// findings + Dancer-Movement-Type votes). Pure module — node-testable.
//
// Honesty: a single 2D camera reads joint *alignment* well (pelvis level, leg
// height, knee line, shoulder rise, foot direction). It cannot measure true
// hip rotation or 3D depth, so turnout is a foot-direction proxy, not degrees.

import { P, type PoseFrame, type LM, type Finding, type Severity } from "@/lib/posture-metrics";
import { TYPE_ORDER, type TypeId } from "@/lib/movement-map";

// ---- shared helpers -------------------------------------------------------
function mid(a: LM, b: LM): LM { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
function d(a: LM, b: LM): number { return Math.hypot(a.x - b.x, a.y - b.y); }
function sx(p: LM, a: number): LM { return { x: p.x * a, y: p.y }; }
function vis(p?: LM): number { return p ? (p.visibility ?? 1) : 0; }
function has(f: PoseFrame, ...idx: number[]): boolean { return idx.every((i) => vis(f[i]) > 0.5); }
function perp(p: LM, a: LM, b: LM): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1e-6;
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len;
}
function torsoA(f: PoseFrame, a: number): number {
  return d(sx(mid(f[P.LEFT_SHOULDER], f[P.RIGHT_SHOULDER]), a), sx(mid(f[P.LEFT_HIP], f[P.RIGHT_HIP]), a)) || 1e-6;
}
function grade(r: number, mild: number, notable: number): Severity {
  return r >= notable ? "notable" : r >= mild ? "mild" : "ok";
}
// severity → how many type votes it contributes
function votesFor(sev: Severity, type: TypeId): TypeId[] {
  return sev === "notable" ? [type, type] : sev === "mild" ? [type] : [];
}

// ---- public shapes --------------------------------------------------------
export interface Cue { key: string; label: string; ok: boolean; detail: string }
export interface MoveEval { valid: boolean; peak: number; cues: Cue[]; hint: string }
export interface MoveResult { findings: Finding[]; votes: TypeId[]; headline: string }
export interface BalletMove {
  id: string;
  name: string;
  view: "front" | "side";
  setup: string;
  tip: string;
  needsBaseline?: boolean;   // capture a neutral frame first (port de bras)
  evaluate: (f: PoseFrame, aspect: number, baseline?: PoseFrame | null) => MoveEval;
  score: (f: PoseFrame, aspect: number, baseline?: PoseFrame | null) => MoveResult;
}

// =========================================================================
// 1) DÉVELOPPÉ DEVANT (front) — pelvis level as the leg rises + knee in line
// =========================================================================
// Working leg is chosen by the higher KNEE (knees track reliably even when the
// devant foot points at the camera and MediaPipe loses the ankle). The ankle is
// used for extension/knee-line only when it's actually tracked.
function devMetrics(f: PoseFrame, a: number) {
  const scale = torsoA(f, a);
  const hipMidY = (f[P.LEFT_HIP].y + f[P.RIGHT_HIP].y) / 2;
  const workL = f[P.LEFT_KNEE].y <= f[P.RIGHT_KNEE].y; // higher knee = working leg
  const wKnee = workL ? f[P.LEFT_KNEE] : f[P.RIGHT_KNEE];
  const wHip = workL ? f[P.LEFT_HIP] : f[P.RIGHT_HIP];
  const wAnk = workL ? f[P.LEFT_ANKLE] : f[P.RIGHT_ANKLE];
  const ankleOk = vis(wAnk) > 0.4;
  const liftPt = ankleOk ? wAnk : wKnee;                          // measure from ankle if tracked, else knee
  const lift = (hipMidY - liftPt.y) / scale;                     // >0 = above hip line
  const pelvis = Math.abs(f[P.LEFT_HIP].y - f[P.RIGHT_HIP].y) / scale;
  const kneeOff = ankleOk ? perp(sx(wKnee, a), sx(wHip, a), sx(wAnk, a)) / scale : 0;
  return { lift, pelvis, kneeOff, ankleOk };
}
const developpe: BalletMove = {
  id: "developpe", name: "Développé devant", view: "front",
  setup: "Stand facing the camera. Slowly développé your working leg to the front, as high as stays controlled.",
  tip: "The test is whether your pelvis stays level as the leg lifts — not how high the leg goes.",
  evaluate(f, a) {
    if (!has(f, P.LEFT_HIP, P.RIGHT_HIP, P.LEFT_KNEE, P.RIGHT_KNEE)) return { valid: false, peak: 0, cues: [], hint: "Step back so your hips and both knees are in frame." };
    const { lift, pelvis, kneeOff, ankleOk } = devMetrics(f, a);
    const valid = lift > 0.05;
    return {
      valid, peak: lift,
      hint: valid ? "" : "Lift your working leg to the front — at least knee height.",
      cues: [
        { key: "pelvis", label: "Pelvis level", ok: pelvis < 0.09, detail: pelvis < 0.09 ? "Hips staying level" : "Hip hiking to help the lift" },
        ...(ankleOk ? [{ key: "knee", label: "Knee in line", ok: kneeOff < 0.12, detail: kneeOff < 0.12 ? "Knee tracks the line" : "Knee drifting off the hip–ankle line" }] : []),
        { key: "height", label: "Leg height", ok: true, detail: `${Math.round(Math.max(0, lift) * 100)}% of torso above hip` },
      ],
    };
  },
  score(f, a) {
    const { pelvis, kneeOff, ankleOk } = devMetrics(f, a);
    const pSev = grade(pelvis, 0.09, 0.16);
    const findings: Finding[] = [
      { key: "dev-pelvis", region: "hips", view: "front", label: "Pelvis level in développé", severity: pSev,
        note: pSev === "ok" ? "Your pelvis stayed level as the leg rose." : `Your pelvis hikes to lift the leg${pSev === "notable" ? " (notable)" : ""} — the height is coming from the trunk.` },
    ];
    const votes = [...votesFor(pSev, "hiker")];
    if (ankleOk) {
      const kSev = grade(kneeOff, 0.12, 0.2);
      findings.push({ key: "dev-knee", region: "knees", view: "front", label: "Working-knee alignment", severity: kSev,
        note: kSev === "ok" ? "Your working knee tracked in line." : `Your working knee drifts off the hip–ankle line${kSev === "notable" ? " (notable)" : ""}.` });
      votes.push(...votesFor(kSev, "collapser"));
    }
    return { findings, votes, headline: pSev !== "ok" ? "Pelvis is helping the lift" : "Level développé" };
  },
};

// =========================================================================
// 2) À LA SECONDE (front) — leg to the side without hiking the hip
// =========================================================================
function secondeMetrics(f: PoseFrame, a: number) {
  const scale = torsoA(f, a);
  const hipMidX = (f[P.LEFT_HIP].x + f[P.RIGHT_HIP].x) / 2;
  const hipMidY = (f[P.LEFT_HIP].y + f[P.RIGHT_HIP].y) / 2;
  const workL = Math.abs(f[P.LEFT_ANKLE].x - hipMidX) >= Math.abs(f[P.RIGHT_ANKLE].x - hipMidX);
  const wAnk = workL ? f[P.LEFT_ANKLE] : f[P.RIGHT_ANKLE];
  const lateral = Math.abs(wAnk.x - hipMidX) * a / scale;
  const height = (hipMidY - wAnk.y) / scale;
  const pelvis = Math.abs(f[P.LEFT_HIP].y - f[P.RIGHT_HIP].y) / scale;
  return { lateral, height, pelvis };
}
const seconde: BalletMove = {
  id: "seconde", name: "À la seconde", view: "front",
  setup: "Facing the camera, take your working leg out to the side (à la seconde), as high as stays square.",
  tip: "Watch whether the hip hikes up to gain height — the placement should come from the leg, not the pelvis.",
  evaluate(f, a) {
    if (!has(f, P.LEFT_HIP, P.RIGHT_HIP, P.LEFT_ANKLE, P.RIGHT_ANKLE)) return { valid: false, peak: 0, cues: [], hint: "Step back so your whole body is in frame." };
    const { lateral, height, pelvis } = secondeMetrics(f, a);
    const valid = lateral > 0.25;
    return {
      valid, peak: lateral + Math.max(0, height),
      hint: valid ? "" : "Take the leg further out to the side.",
      cues: [
        { key: "pelvis", label: "Hips square", ok: pelvis < 0.09, detail: pelvis < 0.09 ? "Pelvis staying level" : "Hip hiking to lift the leg" },
        { key: "height", label: "Leg height", ok: true, detail: `${Math.round(Math.max(0, height) * 100)}% of torso above hip` },
      ],
    };
  },
  score(f, a) {
    const { pelvis } = secondeMetrics(f, a);
    const sev = grade(pelvis, 0.09, 0.16);
    const findings: Finding[] = [
      { key: "sec-pelvis", region: "hips", view: "front", label: "Hip level à la seconde", severity: sev,
        note: sev === "ok" ? "Your pelvis stayed square as the leg went out." : `Your working hip hikes to lift the leg à la seconde${sev === "notable" ? " (notable)" : ""}.` },
    ];
    return { findings, votes: votesFor(sev, "hiker"), headline: sev !== "ok" ? "Hip hikes to place the leg" : "Level à la seconde" };
  },
};

// =========================================================================
// 3) TURNOUT (front) — foot-direction proxy + left/right symmetry
// =========================================================================
function turnoutMetrics(f: PoseFrame, a: number) {
  const lenL = d(sx(f[P.LEFT_ANKLE], a), sx(f[P.LEFT_FOOT], a)) || 1e-6;
  const lenR = d(sx(f[P.RIGHT_ANKLE], a), sx(f[P.RIGHT_FOOT], a)) || 1e-6;
  const turnL = (f[P.LEFT_ANKLE].x - f[P.LEFT_FOOT].x) * a / lenL;   // + = left toe out
  const turnR = (f[P.RIGHT_FOOT].x - f[P.RIGHT_ANKLE].x) * a / lenR; // + = right toe out
  return { turnL, turnR, asym: Math.abs(turnL - turnR), both: (turnL + turnR) / 2 };
}
const turnout: BalletMove = {
  id: "turnout", name: "Standing turnout", view: "front",
  setup: "Stand facing the camera in first position and turn out from the hips, holding still.",
  tip: "This reads your foot direction and whether both sides match — a proxy for turnout, not true hip rotation.",
  evaluate(f, a) {
    if (!has(f, P.LEFT_ANKLE, P.RIGHT_ANKLE, P.LEFT_FOOT, P.RIGHT_FOOT)) return { valid: false, peak: 0, cues: [], hint: "Make sure both feet are visible in frame." };
    const { asym, both } = turnoutMetrics(f, a);
    return {
      valid: true, peak: both,
      hint: "",
      cues: [
        { key: "even", label: "Even both sides", ok: asym < 0.2, detail: asym < 0.2 ? "Turnout matches L/R" : "One side turns out more than the other" },
        { key: "amount", label: "Turnout", ok: true, detail: both > 0.85 ? "Very turned out (check it's from the hips)" : `${Math.round(Math.max(0, both) * 100)}% (foot-direction proxy)` },
      ],
    };
  },
  score(f, a) {
    const { asym, both } = turnoutMetrics(f, a);
    const aSev = grade(asym, 0.2, 0.35);
    const forced = both > 0.85;
    const findings: Finding[] = [
      { key: "turnout-even", region: "feet", view: "front", label: "Turnout symmetry", severity: aSev,
        note: aSev === "ok" ? "Your turnout looks even side to side." : `Your turnout is uneven — one foot turns out more${aSev === "notable" ? " (notable)" : ""}.` },
    ];
    if (forced) findings.push({ key: "turnout-forced", region: "feet", view: "front", label: "Forced turnout", severity: "mild",
      note: "Both feet are very turned out — check it's coming from the hips, not cranked from the floor." });
    const votes = [...votesFor(aSev, "twister"), ...(forced ? (["gripper"] as TypeId[]) : [])];
    return { findings, votes, headline: aSev !== "ok" ? "Turnout is uneven" : forced ? "Turnout may be forced" : "Even turnout" };
  },
};

// =========================================================================
// 4) PORT DE BRAS (front, needs a neutral baseline) — shoulders stay down
// =========================================================================
function pdbMetrics(f: PoseFrame, a: number, baseline?: PoseFrame | null) {
  const scale = torsoA(f, a);
  const shMidY = (f[P.LEFT_SHOULDER].y + f[P.RIGHT_SHOULDER].y) / 2;
  const wristMinY = Math.min(f[15]?.y ?? 1, f[16]?.y ?? 1); // 15/16 = wrists
  const armsUp = wristMinY < shMidY;
  const baseSh = baseline ? (baseline[P.LEFT_SHOULDER].y + baseline[P.RIGHT_SHOULDER].y) / 2 : shMidY;
  const elevation = (baseSh - shMidY) / scale; // >0 = shoulders rose from neutral
  return { shMidY, wristMinY, armsUp, elevation };
}
const portDeBras: BalletMove = {
  id: "portdebras", name: "Port de bras", view: "front", needsBaseline: true,
  setup: "Facing the camera, start with arms down. Then raise both arms overhead slowly.",
  tip: "We first note your relaxed shoulder height, then check the shoulders don't ride up as the arms lift.",
  evaluate(f, a, baseline) {
    if (!has(f, P.LEFT_SHOULDER, P.RIGHT_SHOULDER) || vis(f[15]) < 0.5 || vis(f[16]) < 0.5) return { valid: false, peak: 0, cues: [], hint: "Keep your shoulders and wrists in frame." };
    const { armsUp, elevation, shMidY, wristMinY } = pdbMetrics(f, a, baseline);
    return {
      valid: armsUp, peak: shMidY - wristMinY,
      hint: armsUp ? "" : "Raise both arms overhead.",
      cues: [
        { key: "shoulders", label: "Shoulders stay down", ok: elevation < 0.07, detail: elevation < 0.07 ? "Shoulders staying set" : "Shoulders riding up with the arms" },
        { key: "arms", label: "Arms overhead", ok: armsUp, detail: armsUp ? "Arms lifted" : "Lift the arms higher" },
      ],
    };
  },
  score(f, a, baseline) {
    const { elevation } = pdbMetrics(f, a, baseline);
    const sev = grade(elevation, 0.07, 0.14);
    const findings: Finding[] = [
      { key: "pdb-shoulders", region: "shoulders", view: "front", label: "Shoulder elevation in port de bras", severity: sev,
        note: sev === "ok" ? "Your shoulders stayed down as the arms lifted." : `Your shoulders ride up as the arms lift${sev === "notable" ? " (notable)" : ""}.` },
    ];
    return { findings, votes: votesFor(sev, "hiker"), headline: sev !== "ok" ? "Shoulders rise with the arms" : "Quiet shoulders" };
  },
};

// =========================================================================
// 5) KNEE LINE (side) — hyperextension / stacking, standing
// =========================================================================
function kneeMetrics(f: PoseFrame, a: number) {
  const scale = torsoA(f, a);
  const leftVis = vis(f[P.LEFT_HIP]) + vis(f[P.LEFT_KNEE]) + vis(f[P.LEFT_ANKLE]);
  const rightVis = vis(f[P.RIGHT_HIP]) + vis(f[P.RIGHT_KNEE]) + vis(f[P.RIGHT_ANKLE]);
  const L = leftVis >= rightVis;
  const hp = L ? f[P.LEFT_HIP] : f[P.RIGHT_HIP];
  const kn = L ? f[P.LEFT_KNEE] : f[P.RIGHT_KNEE];
  const an = L ? f[P.LEFT_ANKLE] : f[P.RIGHT_ANKLE];
  return { off: perp(sx(kn, a), sx(an, a), sx(hp, a)) / scale };
}
const kneeLine: BalletMove = {
  id: "kneeline", name: "Knee line (side)", view: "side",
  setup: "Turn side-on to the camera and stand tall with straight legs.",
  tip: "Side-on, we check whether your knee stacks over the ankle–hip line or pushes back into hyperextension.",
  evaluate(f, a) {
    const side = (l: number, r: number) => vis(f[l]) > 0.5 || vis(f[r]) > 0.5;
    if (!side(P.LEFT_HIP, P.RIGHT_HIP) || !side(P.LEFT_KNEE, P.RIGHT_KNEE) || !side(P.LEFT_ANKLE, P.RIGHT_ANKLE)) {
      return { valid: false, peak: 0, cues: [], hint: "Turn side-on with your whole leg in frame." };
    }
    const { off } = kneeMetrics(f, a);
    return {
      valid: true, peak: 1,
      hint: "",
      cues: [{ key: "stack", label: "Knee stacks over ankle", ok: off < 0.08, detail: off < 0.08 ? "Knee stacks cleanly" : "Knee pushes off the line (hyperextension)" }],
    };
  },
  score(f, a) {
    const { off } = kneeMetrics(f, a);
    const sev = grade(off, 0.08, 0.16);
    const findings: Finding[] = [
      { key: "knee-line", region: "knees", view: "side", label: "Knee line (hyperextension)", severity: sev,
        note: sev === "ok" ? "Your knee stacked over the ankle." : `Your knee pushes back off the ankle–hip line — a hyperextension tendency${sev === "notable" ? " (notable)" : ""}.` },
    ];
    return { findings, votes: votesFor(sev, "rangeChaser"), headline: sev !== "ok" ? "Knees hyperextend" : "Clean knee line" };
  },
};

export const BALLET_MOVES: BalletMove[] = [developpe, seconde, turnout, portDeBras, kneeLine];
export function getBalletMove(id: string): BalletMove | undefined { return BALLET_MOVES.find((m) => m.id === id); }

// ---- aggregate the completed moves into a Dancer-Movement-Type leaning -----
export interface BalletLeaning { primary: TypeId; secondary: TypeId; counts: Record<TypeId, number>; moveCount: number }
export function buildBalletLeaning(allVotes: TypeId[], moveCount: number): BalletLeaning {
  const counts = Object.fromEntries(TYPE_ORDER.map((t) => [t, 0])) as Record<TypeId, number>;
  for (const v of allVotes) counts[v] += 1;
  const ranked = [...TYPE_ORDER].sort((a, b) => counts[b] - counts[a]);
  return { primary: ranked[0], secondary: ranked[1], counts, moveCount };
}

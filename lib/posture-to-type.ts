// Bridges the camera posture scan into the 6 Dancer Movement Types, and builds
// the dancer-facing result: one plain-language summary + the top priorities.
// Pure module — safe on client or server, testable in node.

import { TYPE_ORDER, type TypeId } from "@/lib/movement-map";
import { flagged, type Finding, type Severity } from "@/lib/posture-metrics";

const WEIGHT: Record<Severity, number> = { ok: 0, unknown: 0, mild: 1, notable: 2 };

// Which movement type a flagged finding points toward. Some depend on the
// direction encoded in the finding note (valgus vs varus).
function findingType(f: Finding): TypeId {
  switch (f.key) {
    case "hip-level":         return "hiker";        // pelvis hikes / drops to help
    case "shoulder-level":    return "hiker";        // a shoulder rides up
    case "head-tilt":         return "twister";      // asymmetry = a spiral/twist
    case "lateral-shift":     return "twister";      // rearranging the base to balance
    case "foot-turnout":
      return /forced|cranking/.test(f.note) ? "gripper" : "twister"; // forced = grip; uneven = twist
    case "forward-head":      return "collapser";    // postural collapse forward
    case "forward-shoulders": return "collapser";
    case "knee-stack":        return "rangeChaser";  // hyperextension / laxity
    case "pelvic-sway":       return "rangeChaser";  // sway-back / hangs on ligaments
    case "knee-track":
      return /wider|varus|bow/.test(f.note) ? "gripper" : "collapser";
    default:                  return "controller";
  }
}

export interface PostureScore {
  primary: TypeId;
  secondary: TypeId;
  scores: Record<TypeId, number>;
  clean: boolean; // little or nothing flagged
}

export function postureToScores(findings: Finding[]): PostureScore {
  const scores = Object.fromEntries(TYPE_ORDER.map((t) => [t, 0])) as Record<TypeId, number>;
  const flags = flagged(findings);
  for (const f of flags) scores[findingType(f)] += WEIGHT[f.severity];

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  // Controller is ONLY chosen when nothing at all flagged (clean, disciplined
  // posture) — never as a fallback that swallows a single real finding.
  const clean = total === 0;
  if (clean) scores.controller += 2;

  // Tie-break by whichever type has the most DISTINCT findings, so a single
  // notable doesn't automatically outrank a spread of related mild ones.
  const distinct = Object.fromEntries(TYPE_ORDER.map((t) => [t, 0])) as Record<TypeId, number>;
  for (const f of flags) distinct[findingType(f)] += 1;
  const ranked = [...TYPE_ORDER].sort((a, b) => scores[b] - scores[a] || distinct[b] - distinct[a]);
  return { primary: ranked[0], secondary: ranked[1], scores, clean };
}

// ---- Corrective priorities ------------------------------------------------

const CORRECTIVE: Record<string, string> = {
  "hip-level": "Level the pelvis — single-leg balance work and side-lying hip abduction so one hip stops hiking.",
  "shoulder-level": "Even out the shoulders — scapular setting drills and unilateral pulls on the low side.",
  "lateral-shift": "Re-centre over your base — slow weight-shift drills feeling both feet evenly loaded.",
  "forward-head": "Bring the head back over the shoulders — chin-nods and deep-neck-flexor holds.",
  "forward-shoulders": "Open the chest — thoracic extension over a roller and wall slides for the mid-back.",
  "knee-stack": "Own the knee position — control the last few degrees of extension; avoid locking/hyperextending in balances.",
  "knee-track": "Track the knees over the toes — banded squats and glute-med work so the knees stop falling in.",
  "head-tilt": "Level the head — mirror checks and gentle neck-lengthening; watch for always turning/tilting one way.",
  "foot-turnout": "Even out turnout from the hips — banded external rotation on both legs; stop cranking the feet on the floor.",
  "pelvic-sway": "Stack ribs over pelvis over ankles — glute and deep-core work to stop hanging back on your ligaments.",
};

export interface PostureSummary {
  headline: string;
  summary: string;
  priorities: { label: string; action: string; severity: Severity; region: string }[];
  needsPhoto: string[]; // items the camera couldn't grade
}

export function buildPostureSummary(findings: Finding[]): PostureSummary {
  const flags = flagged(findings).sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity]);
  const unknowns = findings.filter((f) => f.severity === "unknown");

  const priorities = flags.slice(0, 3).map((f) => ({
    label: f.label,
    action: CORRECTIVE[f.key] ?? f.note,
    severity: f.severity,
    region: f.region,
  }));

  let headline: string;
  let summary: string;
  if (flags.length === 0) {
    headline = "Clean, balanced posture";
    summary = "From the body points captured, your alignment looks well-centred — shoulders and hips level, head stacked, knees tracking. Your work is less about fixing posture and more about keeping this control automatic under load and speed.";
  } else {
    const notable = flags.filter((f) => f.severity === "notable");
    const parts = flags.slice(0, 3).map((f) => f.note.replace(/\s*\(notable\)/, "").replace(/\.$/, "").toLowerCase());
    headline = notable.length ? "A clear dominant pattern" : "A few things to tidy up";
    summary = `The scan flagged ${flags.length} thing${flags.length > 1 ? "s" : ""}: ${parts.join("; ")}. `
      + (notable.length
          ? "These aren't separate faults — they usually stem from one organising pattern, so start with the priorities below rather than chasing each correction."
          : "Nothing dramatic — a short focused block on the priorities below will clean these up.");
  }

  return {
    headline,
    summary,
    priorities,
    needsPhoto: unknowns.map((u) => u.label),
  };
}

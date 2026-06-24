// Ballet-move → exercise cross-reference. Pure module (safe for client/server).
//
// Each move lists the exercises FROM THE LIBRARY that build what the move
// needs, plus the qualities it trains. Members pick a move they want to
// improve and generate a targeted workout. We start with the four moves that
// have dedicated content (plié, fondu, frappé, rond de jambe).
//
// `exercises` are matched against the library by exact name. Keep names in
// sync with the exercises table.

export interface BalletMove {
  slug: string;
  name: string;          // display, with accents
  focus: string;         // what the move needs, one line
  why: string;           // short explanation for the UI
  exercises: string[];   // library exercise names that benefit this move
}

export const BALLET_MOVES: BalletMove[] = [
  {
    slug: "plie",
    name: "Plié",
    focus: "Turnout, quad & glute strength, deep knee control",
    why: "A strong plié comes from controlled turnout and the strength to bend and rise without collapsing. Build the squat pattern, the quads, and the rotators.",
    exercises: [
      "Turnout Developer",
      "Turnout Developer Plank",
      "Adductor Isometric Squat Hold",
      "Deep Knee Bend",
      "Slant Board Squat",
      "Barbell Back Squat",
      "Kneeling Quadricep Extensions",
    ],
  },
  {
    slug: "fondu",
    name: "Fondu",
    focus: "Single-leg control, calf & ankle strength, smooth descent",
    why: "Fondu is a single-leg melt and rise — it demands ankle stability, calf strength, and control through the standing leg. Train single-leg strength and the calves.",
    exercises: [
      "Single Leg Deadlift",
      "Single Leg Hip Flexor Raise",
      "Bent Knee Calf Raise",
      "Angled Calf Raise",
      "Anterior Tibialis Raises",
      "Hip Extension Lunge",
      "Adductor Isometric Squat Hold",
    ],
  },
  {
    slug: "frappe",
    name: "Frappé",
    focus: "Quick, sharp lower-leg articulation; ankle & shin strength",
    why: "Frappé is fast, striking lower-leg action. Build ankle and shin strength and explosive single-leg power so the strike is crisp and controlled.",
    exercises: [
      "Anterior Tibialis Raises",
      "Angled Calf Raise",
      "Bent Knee Calf Raise",
      "Battu Strength",
      "L-Sit Battu",
      "Side Hop To Reverse Lunge",
    ],
  },
  {
    slug: "rond-de-jambe",
    name: "Rond de Jambe",
    focus: "Turnout, hip mobility & control through a full circle",
    why: "Rond de jambe traces a controlled circle — it needs rotator strength, hip control, and the stability to keep the standing side still. Train turnout and hip control.",
    exercises: [
      "Reverse Lunge To Rond De Jambe",
      "Turnout Developer",
      "Turnout Developer Plank",
      "Single Leg Hip Flexor Raise",
      "Side Lunge To A La Second",
      "Extension Developer Side",
    ],
  },
];

export function balletMove(slug: string): BalletMove | undefined {
  return BALLET_MOVES.find((m) => m.slug === slug);
}

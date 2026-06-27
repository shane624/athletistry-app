// Equipment tags per exercise. Pure module (client/server safe). Lets dancers
// filter to what they have — e.g. a traveller with only a resistance band, or
// someone with no slant board / barbell.

export type Equipment = "bodyweight" | "band" | "dumbbell" | "barbell" | "slant_board" | "step" | "partner";

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  bodyweight: "Bodyweight",
  band: "Resistance band",
  dumbbell: "Dumbbell",
  barbell: "Barbell",
  slant_board: "Slant board",
  step: "Step / box",
  partner: "Partner",
};

// Exercise name (lowercase) -> equipment it requires. If an exercise needs
// nothing, it's "bodyweight". Anything not listed defaults to bodyweight.
const MAP: Record<string, Equipment> = {
  "barbell back squat": "barbell",
  "barbell bench press": "barbell",
  "barbell overhead strict press": "barbell",
  "barbell clean": "barbell",
  "barbell snatch": "barbell",
  "barbell hip extension lunge": "barbell",
  "seated barbell overhead press": "barbell",
  "deadlift": "barbell",
  "band deadlift": "band",
  "band row": "band",
  "lat press downs": "band",
  "lat pulls": "band",
  "dumbbell bench row": "dumbbell",
  "slant board squat": "slant_board",
  "chair elevated hip extension lunge": "step",
  "step elevated hip extension lunge": "step",
  "assisted negative dips": "step",
  "tricep chest dip": "step",
  "strong partner": "partner",
  "overhead press in second": "dumbbell",
  // everything else is bodyweight by default
};

export function equipmentFor(name: string): Equipment {
  return MAP[name.trim().toLowerCase()] ?? "bodyweight";
}

/** True if the exercise can be done with the allowed equipment set. Bodyweight
 *  is always allowed. */
export function fitsEquipment(name: string, allowed: Set<Equipment>): boolean {
  const eq = equipmentFor(name);
  if (eq === "bodyweight") return true;
  return allowed.has(eq);
}

/** The distinct kit a list of exercises needs — for a "what you'll need" list.
 *  Bodyweight is excluded (nothing to gather). If everything is bodyweight,
 *  returns []. Order follows EQUIPMENT_LABEL for consistency. */
export function equipmentNeeded(names: string[]): Equipment[] {
  const set = new Set<Equipment>();
  for (const n of names) {
    const eq = equipmentFor(n);
    if (eq !== "bodyweight") set.add(eq);
  }
  return (Object.keys(EQUIPMENT_LABEL) as Equipment[]).filter((e) => e !== "bodyweight" && set.has(e));
}

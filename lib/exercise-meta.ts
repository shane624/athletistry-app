// Classifies exercises for circuit building:
//  • compound vs isolation (compounds lead a circuit, isolation comes after)
//  • "big leg" vs lower-leg accessory (the legs slot must lead with a big movement)
// Pure module. Works off category + name patterns so it covers new exercises too.

import type { ExerciseRow } from "@/lib/types";

// categories that are LOWER-LEG / small accessory work — never the main legs pick
const LOWER_LEG_CATS = new Set(["calf"]);
// names that are clearly isolation even if the category looks compound
const ISOLATION_NAME = /calf raise|tibialis|quadricep extension|hip flexor raise|curl\b|cross body extension|extension developer|port de bras|battu|developer/i;
// names that are clearly big compound leg movements
const BIG_LEG_NAME = /squat|deadlift|lunge|clean|snatch|hip extension|step|deep knee|hop/i;

// the "great 8" slot categories considered COMPOUND
const COMPOUND_CATS = new Set(["squat", "hinge", "lunge", "push", "shoulder", "pull"]);

/** Is this exercise a big compound movement (leads a circuit)? */
export function isCompound(ex: { name: string; category: string }): boolean {
  if (ISOLATION_NAME.test(ex.name)) return false;
  if (LOWER_LEG_CATS.has(ex.category)) return false;
  if (BIG_LEG_NAME.test(ex.name)) return true;
  return COMPOUND_CATS.has(ex.category);
}

/** Is this a large-muscle leg movement (a valid LEGS pick)? */
export function isBigLeg(ex: { name: string; category: string }): boolean {
  if (LOWER_LEG_CATS.has(ex.category)) return false;
  if (ISOLATION_NAME.test(ex.name)) return false;
  return ["squat", "hinge", "lunge"].includes(ex.category) || BIG_LEG_NAME.test(ex.name);
}

/** Is this lower-leg / small accessory (only added alongside a compound)? */
export function isAccessory(ex: { name: string; category: string }): boolean {
  return LOWER_LEG_CATS.has(ex.category) || ISOLATION_NAME.test(ex.name);
}

/** Sort a list so compounds come first, isolation/accessory after. */
export function compoundFirst(list: ExerciseRow[]): ExerciseRow[] {
  return [...list].sort((a, b) => Number(isCompound(b)) - Number(isCompound(a)));
}

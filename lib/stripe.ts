// Server-only Stripe client + billing constants. Never import into a client
// component — this reads the secret key.
import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY).");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const FREE_SEATS = 2;                        // dancers included free
export const priceId = () => process.env.STRIPE_PRICE_ID || "";  // $20 AUD / dancer / month
export const stripeConfigured = () => !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID;

/** Billable (paid) seats for a given student count. */
export function billableSeats(studentCount: number): number {
  return Math.max(0, studentCount - FREE_SEATS);
}
export function isActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

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
export const priceId = () => process.env.STRIPE_PRICE_ID || "";  // $20 AUD / dancer / month (studio seats)
export const stripeConfigured = () => !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID;

// ---- Member (individual) subscription — $19.95/mo or $199.95/yr USD ----
export type MemberInterval = "monthly" | "yearly";
export function memberPrice(interval: MemberInterval): string {
  return interval === "yearly"
    ? process.env.STRIPE_PRICE_MEMBER_YEARLY || ""
    : process.env.STRIPE_PRICE_MEMBER_MONTHLY || "";
}
export const memberBillingConfigured = () =>
  !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_MEMBER_MONTHLY && !!process.env.STRIPE_PRICE_MEMBER_YEARLY;
export const MEMBER_PRICE = { monthly: "$19.95", yearly: "$199.95" }; // display only (USD)

/** Billable (paid) seats for a given student count. */
export function billableSeats(studentCount: number): number {
  return Math.max(0, studentCount - FREE_SEATS);
}
export function isActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

"use server";

// Member retention: in-app cancel flow. Offers are applied directly to the
// member's own Stripe subscription (looked up by their stored customer id),
// never to anything passed in from the client.
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe, memberBillingConfigured } from "@/lib/stripe";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type CancelReason = "too_expensive" | "not_using" | "injury_break" | "missing_features" | "switching" | "other";
export type RetentionOffer = "discount" | "pause_1" | "pause_2";
type Result = { ok: boolean; error?: string; until?: string | null };

const REASONS: CancelReason[] = ["too_expensive", "not_using", "injury_break", "missing_features", "switching", "other"];
const COUPON_ID = "ATHLETISTRY_STAY_50_3M"; // 50% off for 3 months

async function context() {
  if (!memberBillingConfigured()) throw new Error("Membership billing isn't set up yet.");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const p = profile as any;
  if (!p?.stripe_customer_id) throw new Error("No membership found on this account.");
  const stripe = getStripe();
  const subs = await stripe.subscriptions.list({ customer: p.stripe_customer_id, status: "all", limit: 10 });
  const sub = subs.data.find((s) => ["active", "trialing", "past_due"].includes(s.status));
  if (!sub) throw new Error("No active membership to change.");
  return { user, admin, profile: p, stripe, sub: sub as any };
}

function periodEnd(sub: any): string | null {
  const ts = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

async function log(admin: any, userId: string, reason: CancelReason, detail: string, outcome: string, plan: string | null) {
  try {
    await admin.from("member_cancellations").insert({ user_id: userId, reason, detail: detail.slice(0, 1000) || null, outcome, plan });
  } catch { /* logging must never block the member */ }
}

async function ensureCoupon(stripe: ReturnType<typeof getStripe>) {
  try { await stripe.coupons.retrieve(COUPON_ID); }
  catch {
    await stripe.coupons.create({ id: COUPON_ID, percent_off: 50, duration: "repeating", duration_in_months: 3, name: "Stay with Athletistry — 50% off 3 months" });
  }
}

/** Accept a retention offer instead of cancelling. Each member can claim one offer, once. */
export async function acceptRetentionOffer(offer: RetentionOffer, reason: CancelReason, detail = ""): Promise<Result> {
  try {
    if (!REASONS.includes(reason)) return { ok: false, error: "Pick a reason first." };
    const { user, admin, profile, stripe, sub } = await context();
    if (profile.retention_offer_used_at) return { ok: false, error: "You've already used your one-time offer." };

    if (offer === "discount") {
      if (profile.subscription_plan === "yearly") return { ok: false, error: "The discount applies to monthly memberships." };
      await ensureCoupon(stripe);
      await stripe.subscriptions.update(sub.id, { discounts: [{ coupon: COUPON_ID }], cancel_at_period_end: false });
      await admin.from("profiles").update({ retention_offer_used_at: new Date().toISOString(), cancel_at_period_end: false }).eq("id", user.id);
      await log(admin, user.id, reason, detail, "discount", profile.subscription_plan);
      return { ok: true };
    }

    // Pause billing for 1 or 2 months. Access continues so they can keep up gentle work / rehab.
    const months = offer === "pause_2" ? 2 : 1;
    const resumes = new Date(); resumes.setMonth(resumes.getMonth() + months);
    await stripe.subscriptions.update(sub.id, {
      pause_collection: { behavior: "void", resumes_at: Math.floor(resumes.getTime() / 1000) },
      cancel_at_period_end: false,
    });
    await admin.from("profiles").update({
      retention_offer_used_at: new Date().toISOString(), paused_until: resumes.toISOString(), cancel_at_period_end: false,
    }).eq("id", user.id);
    await log(admin, user.id, reason, detail, offer, profile.subscription_plan);
    return { ok: true, until: resumes.toISOString() };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Something went wrong." };
  }
}

/** Cancel at the end of the paid period — they keep access until then. */
export async function confirmCancel(reason: CancelReason, detail = ""): Promise<Result> {
  try {
    if (!REASONS.includes(reason)) return { ok: false, error: "Pick a reason first." };
    const { user, admin, profile, stripe, sub } = await context();
    const updated: any = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
      cancellation_details: { comment: detail.slice(0, 500) || undefined, feedback: stripeFeedback(reason) },
    } as any);
    const until = periodEnd(updated);
    await admin.from("profiles").update({ cancel_at_period_end: true, current_period_end: until }).eq("id", user.id);
    await log(admin, user.id, reason, detail, "cancelled", profile.subscription_plan);
    return { ok: true, until };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Something went wrong." };
  }
}

/** Undo a scheduled cancellation (or end a pause early). */
export async function resumeMembership(): Promise<Result> {
  try {
    const { user, admin, stripe, sub } = await context();
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false, pause_collection: "" as any });
    await admin.from("profiles").update({ cancel_at_period_end: false, paused_until: null }).eq("id", user.id);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Something went wrong." };
  }
}

function stripeFeedback(r: CancelReason): string {
  switch (r) {
    case "too_expensive": return "too_expensive";
    case "not_using": return "unused";
    case "missing_features": return "missing_features";
    case "switching": return "switched_service";
    case "injury_break": return "other";
    default: return "other";
  }
}

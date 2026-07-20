"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe, priceId, billableSeats, stripeConfigured } from "@/lib/stripe";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function ownerContext(studioId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: studio } = await admin.from("studios")
    .select("id, name, owner_id, stripe_customer_id, stripe_subscription_id, subscription_status").eq("id", studioId).maybeSingle();
  if (!studio || (studio as any).owner_id !== user.id) return null;
  return { admin, studio: studio as any, user };
}

function origin(): string {
  const h = headers();
  return h.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.athletistry.app";
}

/** Owner: start a subscription so they can add dancers beyond the free 2. */
export async function startStudioCheckout(studioId: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!stripeConfigured()) return { ok: false, error: "Billing isn't set up yet." };
  const ctx = await ownerContext(studioId);
  if (!ctx) return { ok: false, error: "Not authorized." };
  const { admin, studio, user } = ctx;
  const stripe = getStripe();

  // ensure a Stripe customer
  let customerId = studio.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email || undefined, name: studio.name, metadata: { studioId } });
    customerId = customer.id;
    await admin.from("studios").update({ stripe_customer_id: customerId }).eq("id", studioId);
  }

  const { count } = await admin.from("studio_members").select("user_id", { count: "exact", head: true }).eq("studio_id", studioId);
  const qty = Math.max(1, billableSeats(count ?? 0));

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId(), quantity: qty }],
    success_url: `${origin()}/studio/${studioId}?billing=success`,
    cancel_url: `${origin()}/studio/${studioId}?billing=cancel`,
    metadata: { studioId },
    subscription_data: { metadata: { studioId } },
    allow_promotion_codes: true,
  });
  return session.url ? { ok: true, url: session.url } : { ok: false, error: "Couldn't start checkout." };
}

/** Owner: open the Stripe billing portal to change or cancel the subscription. */
export async function openBillingPortal(studioId: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!stripeConfigured()) return { ok: false, error: "Billing isn't set up yet." };
  const ctx = await ownerContext(studioId);
  if (!ctx) return { ok: false, error: "Not authorized." };
  const customerId = ctx.studio.stripe_customer_id as string | null;
  if (!customerId) return { ok: false, error: "No billing account yet — subscribe first." };
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin()}/studio/${studioId}` });
  return { ok: true, url: session.url };
}

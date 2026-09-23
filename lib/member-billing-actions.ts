"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe, memberPrice, memberBillingConfigured, type MemberInterval } from "@/lib/stripe";

/* eslint-disable @typescript-eslint/no-explicit-any */

function origin(): string {
  const h = headers();
  return h.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.athletistry.app";
}

/** Start a membership checkout (monthly or yearly). Requires the caller be signed in. */
export async function startMemberCheckout(interval: MemberInterval, newAccount = false): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!memberBillingConfigured()) return { ok: false, error: "Membership billing isn't set up yet." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to subscribe." };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id, display_name").eq("id", user.id).maybeSingle();
  const stripe = getStripe();

  let customerId = (profile as any)?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email || undefined, name: (profile as any)?.display_name || undefined, metadata: { userId: user.id } });
    customerId = customer.id;
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: memberPrice(interval), quantity: 1 }],
    // Brand-new accounts land on the welcome flow; existing ones back on pricing.
    success_url: `${origin()}/api/member/confirm?session_id={CHECKOUT_SESSION_ID}${newAccount ? "&next=welcome" : ""}`,
    cancel_url: `${origin()}/pricing?billing=cancel${newAccount ? "&required=1" : ""}`,
    metadata: { kind: "member", userId: user.id, plan: interval },
    subscription_data: { metadata: { kind: "member", userId: user.id, plan: interval } },
    allow_promotion_codes: true,
  });
  return session.url ? { ok: true, url: session.url } : { ok: false, error: "Couldn't start checkout." };
}

/** Open the Stripe billing portal for the member to manage/cancel. */
export async function openMemberPortal(): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!memberBillingConfigured()) return { ok: false, error: "Membership billing isn't set up yet." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
  const customerId = (profile as any)?.stripe_customer_id as string | null;
  if (!customerId) return { ok: false, error: "No membership yet — subscribe first." };
  const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: `${origin()}/pricing` });
  return { ok: true, url: session.url };
}

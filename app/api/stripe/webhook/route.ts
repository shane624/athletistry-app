import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Stripe webhook — keeps studios.subscription_status in sync with Stripe.
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return new Response("not configured", { status: 400 });

  const stripe = getStripe();
  const body = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createAdminClient();
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (s.metadata?.studioId) {
          await admin.from("studios").update({
            stripe_customer_id: s.customer,
            stripe_subscription_id: s.subscription,
            subscription_status: "active",
          }).eq("id", s.metadata.studioId);
        } else if (s.metadata?.kind === "member" && s.metadata?.userId) {
          await admin.from("profiles").update({
            stripe_customer_id: s.customer,
            subscription_status: "active",
            subscription_plan: s.metadata.plan ?? null,
          }).eq("id", s.metadata.userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;
        // Newer Stripe API versions moved current_period_end onto the subscription items.
        const endTs = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
        const periodEnd = endTs ? new Date(endTs * 1000).toISOString() : null;
        // Studios are matched by subscription id; members by customer id.
        await admin.from("studios").update({ subscription_status: status }).eq("stripe_subscription_id", sub.id);
        await admin.from("profiles").update({ subscription_status: status, current_period_end: periodEnd }).eq("stripe_customer_id", sub.customer);
        // Retention state (separate write so it can't break the core sync if the
        // retention migration hasn't been run yet).
        const resumes = sub.pause_collection?.resumes_at;
        await admin.from("profiles").update({
          cancel_at_period_end: event.type === "customer.subscription.deleted" ? false : !!sub.cancel_at_period_end,
          paused_until: resumes ? new Date(resumes * 1000).toISOString() : null,
        }).eq("stripe_customer_id", sub.customer);
        break;
      }
    }
  } catch {
    return new Response("handler error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}

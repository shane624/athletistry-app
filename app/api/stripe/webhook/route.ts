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
        const studioId = s.metadata?.studioId;
        if (studioId) {
          await admin.from("studios").update({
            stripe_customer_id: s.customer,
            stripe_subscription_id: s.subscription,
            subscription_status: "active",
          }).eq("id", studioId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object;
        await admin.from("studios").update({ subscription_status: sub.status })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await admin.from("studios").update({ subscription_status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
    }
  } catch {
    return new Response("handler error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}

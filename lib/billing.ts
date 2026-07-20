// Seat enforcement + Stripe quantity sync. Plain server module (NOT "use
// server"). Called from studio actions when the roster changes.
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe, FREE_SEATS, billableSeats, isActive } from "@/lib/stripe";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function studentCount(admin: ReturnType<typeof createAdminClient>, studioId: string): Promise<number> {
  const { count } = await admin.from("studio_members").select("user_id", { count: "exact", head: true }).eq("studio_id", studioId);
  return count ?? 0;
}

/** Can this studio add ONE more student now? Free up to FREE_SEATS, else needs an active subscription. */
export async function canAddStudent(studioId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: studio } = await admin.from("studios").select("subscription_status").eq("id", studioId).maybeSingle();
  const count = await studentCount(admin, studioId);
  if (count < FREE_SEATS) return true;
  return isActive((studio as any)?.subscription_status);
}

/** After a join/leave/remove, set the Stripe subscription quantity to match billable seats. */
export async function syncSeats(studioId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: studio } = await admin.from("studios")
    .select("stripe_subscription_id, subscription_status").eq("id", studioId).maybeSingle();
  const sub = studio as any;
  if (!sub?.stripe_subscription_id || !isActive(sub.subscription_status)) return;
  const count = await studentCount(admin, studioId);
  const qty = Math.max(1, billableSeats(count)); // stay >= 1 while subscribed
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    const item = subscription.items.data[0];
    if (item && item.quantity !== qty) {
      await stripe.subscriptionItems.update(item.id, { quantity: qty, proration_behavior: "create_prorations" });
    }
  } catch { /* the webhook will reconcile; never block a roster change on Stripe */ }
}

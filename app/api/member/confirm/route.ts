import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Stripe Checkout returns here on success. We verify the session with Stripe
// directly and activate the membership immediately, so the member isn't
// bounced back to /pricing while the webhook is still in flight.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const next = url.searchParams.get("next") === "welcome" ? "/welcome" : "/pricing?billing=success";
  const home = (path: string) => NextResponse.redirect(new URL(path, url.origin));

  if (!sessionId) return home("/pricing");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return home("/login");

  try {
    const session: any = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    const paid = session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
    // Only ever activate the account that started this checkout.
    if (paid && session.metadata?.kind === "member" && session.metadata?.userId === user.id) {
      const sub = session.subscription || {};
      const endTs = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
      await createAdminClient().from("profiles").update({
        stripe_customer_id: session.customer,
        subscription_status: sub.status || "active",
        subscription_plan: session.metadata.plan ?? null,
        current_period_end: endTs ? new Date(endTs * 1000).toISOString() : null,
      }).eq("id", user.id);
    }
  } catch {
    // Fall through — the webhook will still activate the membership.
  }
  return home(next);
}

// Member subscription reader. Plain server module (NOT "use server").
import { createClient } from "@/lib/supabase-server";
import { isActive, memberBillingConfigured } from "@/lib/stripe";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MemberSubscription {
  status: string;
  plan: string | null;         // 'monthly' | 'yearly'
  active: boolean;
  currentPeriodEnd: string | null;
  hasCustomer: boolean;
  configured: boolean;
  cancelAtPeriodEnd: boolean;  // cancellation scheduled — access until currentPeriodEnd
  pausedUntil: string | null;  // billing paused until this date (access continues)
  offerUsed: boolean;          // retention offer already claimed once
}

const EMPTY = (configured: boolean): MemberSubscription => ({
  status: "none", plan: null, active: false, currentPeriodEnd: null, hasCustomer: false, configured,
  cancelAtPeriodEnd: false, pausedUntil: null, offerUsed: false,
});

export async function getMemberSubscription(): Promise<MemberSubscription> {
  const configured = memberBillingConfigured();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return EMPTY(configured);
  // select("*") so this keeps working whether or not the retention migration has run yet.
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const p = data as any;
  if (!p) return EMPTY(configured);
  const pausedUntil = p.paused_until && new Date(p.paused_until) > new Date() ? p.paused_until : null;
  return {
    status: p.subscription_status ?? "none",
    plan: p.subscription_plan ?? null,
    active: isActive(p.subscription_status),
    currentPeriodEnd: p.current_period_end ?? null,
    hasCustomer: !!p.stripe_customer_id,
    configured,
    cancelAtPeriodEnd: !!p.cancel_at_period_end,
    pausedUntil,
    offerUsed: !!p.retention_offer_used_at,
  };
}

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
}

export async function getMemberSubscription(): Promise<MemberSubscription> {
  const configured = memberBillingConfigured();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "none", plan: null, active: false, currentPeriodEnd: null, hasCustomer: false, configured };
  const { data } = await supabase.from("profiles")
    .select("subscription_status, subscription_plan, current_period_end, stripe_customer_id")
    .eq("id", user.id).maybeSingle();
  const p = data as any;
  return {
    status: p?.subscription_status ?? "none",
    plan: p?.subscription_plan ?? null,
    active: isActive(p?.subscription_status),
    currentPeriodEnd: p?.current_period_end ?? null,
    hasCustomer: !!p?.stripe_customer_id,
    configured,
  };
}

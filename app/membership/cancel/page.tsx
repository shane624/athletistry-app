import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import CancelFlow from "@/components/CancelFlow";
import { getMemberSubscription } from "@/lib/member-billing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cancel membership — Athletistry" };

export default async function CancelMembershipPage() {
  const sub = await getMemberSubscription();
  // Nothing to cancel (or already cancelled / paused) → back to the membership page.
  if (!sub.active || sub.cancelAtPeriodEnd) redirect("/pricing");

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <PageHeader icon="settings" eyebrow="Membership" title="Before you go"
          subtitle="Two quick questions — and there may be a better option than cancelling." />
        <div className="mt-6">
          <CancelFlow plan={sub.plan} periodEnd={sub.currentPeriodEnd} offerUsed={sub.offerUsed} />
        </div>
      </main>
    </div>
  );
}

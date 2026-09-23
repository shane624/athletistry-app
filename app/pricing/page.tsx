import NavBar from "@/components/NavBar";
import Icon, { type IconName } from "@/components/Icon";
import MemberCheckout from "@/components/MemberCheckout";
import { createClient } from "@/lib/supabase-server";
import { getMemberSubscription } from "@/lib/member-billing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Membership — Athletistry" };

const PERKS: { icon: IconName; title: string; body: string }[] = [
  { icon: "grid", title: "Every program & workout", body: "The Practice, ballet strength, circuits, warm-ups and the full guided library." },
  { icon: "target", title: "Movement Map & Ballet Lab", body: "Camera posture scan, your Dancer Movement Type, and live-cue ballet assessments." },
  { icon: "chart", title: "Progress & load tracking", body: "Streaks, ranks, weekly load and a training calendar that keeps you honest." },
  { icon: "book", title: "Anatomy & training science", body: "The why behind every correction — learn the body, not just the shape." },
];

export default async function PricingPage({ searchParams }: { searchParams?: { required?: string; billing?: string; plan?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sub = await getMemberSubscription();

  return (
    <div className="min-h-screen">
      {user ? <NavBar /> : null}
      <main className="app-page app-page-narrow">
        <header className="text-center pt-4">
          {!user && <p className="text-teal font-semibold tracking-widest">ATHLETISTRY</p>}
          <h1 className="font-display text-[44px] leading-[1.02] font-bold text-ink mt-2">Train smarter.<br />Dance stronger.</h1>
          <p className="text-grey mt-3 max-w-md mx-auto">Full access to Athletistry — anatomy-first ballet training, movement screening, and progress tracking.</p>
        </header>

        {searchParams?.required && !sub.active && (
          <div className="panel panel-pad mt-6 text-center border-l-2 border-teal">
            <p className="text-ink text-sm font-semibold">Your account is ready — choose a plan to unlock training.</p>
            {searchParams?.billing === "cancel" && <p className="text-grey text-xs mt-1">Checkout was cancelled. You can pick up where you left off.</p>}
          </div>
        )}

        <section className="mt-8">
          <MemberCheckout active={sub.active} plan={sub.plan} authed={!!user} configured={sub.configured}
            initialPlan={searchParams?.plan === "monthly" ? "monthly" : "yearly"}
            cancelAtPeriodEnd={sub.cancelAtPeriodEnd} pausedUntil={sub.pausedUntil} periodEnd={sub.currentPeriodEnd} />
        </section>

        <section className="grid sm:grid-cols-2 gap-3 mt-8">
          {PERKS.map((p) => (
            <div key={p.title} className="panel panel-pad">
              <span className="w-10 h-10 rounded-2xl bg-bluewash flex items-center justify-center text-tealdark"><Icon name={p.icon} className="w-5 h-5" /></span>
              <h3 className="font-display text-[19px] font-bold text-ink mt-3">{p.title}</h3>
              <p className="text-grey text-sm mt-1">{p.body}</p>
            </div>
          ))}
        </section>

        <p className="text-grey text-[11px] text-center mt-8">
          Prices in USD. Your membership renews automatically until cancelled — manage or cancel anytime from this page.
          {!user && <> Already a member? <a href="/login" className="text-teal">Log in</a>.</>}
        </p>
      </main>
    </div>
  );
}

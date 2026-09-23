import Link from "next/link";
import { Oswald } from "next/font/google";
import { createClient } from "@/lib/supabase-server";
import Reveal from "@/components/landing/Reveal";
import TestimonialMarquee from "@/components/landing/TestimonialMarquee";
import PricingToggle from "@/components/landing/PricingToggle";

// Landing page — styled after athletistry.au: condensed silver-gradient
// headlines, royal blue, paper/marble grounds, glass cards. Every CTA drives
// to /pricing (account creation → Stripe checkout).
const head = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Athletistry — Ballet should make sense",
  description: "The training app for dancers: anatomy-first programs, camera posture and ballet assessments, load tracking and progress. By former Principal Artist Shane Wuerthner.",
};

const CF = "https://res.cloudinary.com/dsbtk5hpq/video/upload";
const frame = (id: string, w = 300, h = 400, t = 3) => `${CF}/so_${t},w_${w},h_${h},c_fill,g_auto/${id}.jpg`;

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="lp min-h-screen overflow-x-hidden bg-[#f7f7f5] text-[#24272c]">
      <style>{LP_CSS}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-[rgba(31,39,49,.08)]">
        <div className="max-w-[1240px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="w-9 h-9 rounded-xl" />
            <span className={`${head.className} leading-[.9] text-[#24272c]`}>
              <span className="block text-[9px] tracking-[.3em] text-[#70757b]">THE</span>
              <span className="block text-[15px] font-bold tracking-[.12em]">ATHLETISTRY</span>
              <span className="block text-[9px] tracking-[.3em] text-[#075bb4]">APP</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-semibold text-[#24272c]">
            <a href="#inside" className="hover:text-[#075bb4]">What&apos;s Inside</a>
            <a href="#pathway" className="hover:text-[#075bb4]">The 90 Days</a>
            <a href="#shane" className="hover:text-[#075bb4]">About Shane</a>
            <a href="#pricing" className="hover:text-[#075bb4]">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="lp-btn">Open the app</Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex text-[14px] font-semibold px-3 py-2 hover:text-[#075bb4]">Log in</Link>
                <Link href="/pricing" className="lp-btn">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative">
        <div className="lp-marble absolute inset-0" aria-hidden />
        <div className="relative max-w-[1240px] mx-auto px-5 pt-12 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          <div>
            <p className="lp-eyebrow">Where athleticism and artistry meet</p>
            <h1 className={`${head.className} lp-h1 mt-4`}>
              <span className="lp-steel">Ballet should</span><br />
              <span className="text-[#075bb4]">make sense.</span>
            </h1>
            <p className="text-[18px] leading-relaxed text-[#4a4f56] mt-6 max-w-[520px]">
              Most dancers collect corrections that never hold. Athletistry puts the anatomy beneath the technique in your pocket —
              programs, camera assessments and progress tracking that turn every correction into something you can <em>train</em>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="lp-btn lp-btn-lg">Become a member</Link>
              <a href="#inside" className="lp-btn-ghost lp-btn-lg">See what&apos;s inside</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="lp-chip">Built by a former Principal Artist</span>
              <span className="lp-chip">58+ demo videos</span>
              <span className="lp-chip">From $16.66/mo, billed yearly</span>
            </div>
          </div>

          {/* collage: two phones + photo frames */}
          <div className="relative h-[520px] sm:h-[560px]">
            <div className="lp-photo absolute left-0 top-6 w-[42%] aspect-[3/4] rotate-[-4deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame("Arabesque_Port_De_Bras_klohgx", 420, 560)} alt="Arabesque port de bras demonstration" />
            </div>
            <div className="lp-photo absolute left-[8%] bottom-4 w-[36%] aspect-[3/4] rotate-[3deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame("Side_Lunge_To_A_La_Second_zefu7a", 380, 500)} alt="Side lunge to à la seconde" />
            </div>
            <div className="absolute right-0 top-0 scale-[.92] sm:scale-100 origin-top-right">
              <PhoneMockup />
            </div>
            <div className="lp-glass absolute right-[46%] sm:right-[52%] top-[42%] px-4 py-3 rotate-[-2deg] hidden sm:block">
              <p className={`${head.className} text-[20px] font-bold tracking-wide text-[#24272c] leading-none`}>TRAIN SMARTER.</p>
              <p className={`${head.className} text-[20px] font-bold tracking-wide text-[#075bb4] leading-none mt-1`}>DANCE STRONGER.</p>
            </div>
          </div>
        </div>

        {/* pillars */}
        <div className="relative border-y border-[rgba(31,39,49,.1)] bg-white/70 backdrop-blur">
          <div className="max-w-[1240px] mx-auto grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(31,39,49,.1)]">
            {[
              ["Classical foundations", "Technique built to last"],
              ["Modern performance science", "Strength, biomechanics and resilience"],
              ["Purposeful artistry", "Movement that communicates"],
            ].map(([t, s]) => (
              <div key={t} className="py-6 text-center">
                <p className="font-bold text-[16px]">{t}</p>
                <p className="text-[#70757b] text-[13px] mt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE REAL CHALLENGE ──────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-5 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-start">
        <div className="lg:sticky lg:top-28">
          <p className="lp-eyebrow">The real challenge</p>
          <h2 className={`${head.className} lp-h2 mt-3`}><span className="lp-steel">It is not<br />motivation.</span></h2>
          <p className="text-[17px] leading-relaxed text-[#4a4f56] mt-5 max-w-[480px]">
            Most dancers already care deeply. The difficult part is knowing how to train properly, how to make corrections
            stick, and how to improve without sacrificing health or artistry. That&apos;s what the app is built to solve.
          </p>
          <Link href="/pricing" className="lp-btn mt-7 inline-flex">Start training properly</Link>
        </div>
        <div className="grid gap-4">
          {[
            ["↗", "Build strength without losing artistry", "Programs designed around ballet — physical training that improves the dancing instead of competing with it."],
            ["◎", "Improve technique without injury", "Know the anatomy, load and movement strategy behind every correction — then track your weekly load so you build safely."],
            ["✓", "Practise with purpose", "Every exercise has a demo video, cues and a reason. You always know what you're changing and why it matters."],
            ["∞", "Progress without burnout", "Streaks, ranks and a training calendar that keep you consistent — plus tapering for exams and performances."],
          ].map(([i, t, d], n) => (
            <Reveal key={t} index={n} className="lp-card flex gap-4 p-6">
              <span className="shrink-0 w-11 h-11 rounded-full bg-[#073464] text-white flex items-center justify-center text-[18px]">{i}</span>
              <div>
                <p className="font-bold text-[17px]">{t}</p>
                <p className="text-[#5b6068] text-[15px] mt-1 leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHAT'S INSIDE (blue) ────────────────────────── */}
      <section id="inside" className="lp-blue text-white scroll-mt-16">
        <div className="max-w-[1240px] mx-auto px-5 py-20 md:py-28">
          <p className="lp-eyebrow !text-[#9cc6f5]">What&apos;s inside</p>
          <h2 className={`${head.className} lp-h2 mt-3 lp-silver`}>Your whole training<br />system. One app.</h2>
          <p className="text-[#c8d8ec] text-[17px] leading-relaxed mt-5 max-w-[620px]">
            Everything Shane uses with dancers in the studio — programs, assessments, anatomy and tracking — organised so you
            always know what to do today.
          </p>

          {/* bento — adapted from 21st.dev "Feature Bento" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 md:auto-rows-[250px]">
            <Reveal className="md:col-span-2 md:row-span-2 relative rounded-[28px] overflow-hidden group min-h-[340px] flex flex-col justify-end p-8 md:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame("Extension_Developer_Side_lhzg5h", 900, 700, 3)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041d38] via-[#073464]/70 to-transparent" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-[12px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" /> Live camera coaching
                </span>
                <h3 className={`${head.className} text-[clamp(2.2rem,4.5vw,3.4rem)] font-bold uppercase leading-[.95] mt-4`}>Movement Map &amp;<br />Ballet Movement Lab</h3>
                <p className="text-[#d7e3f1] text-[16px] leading-relaxed mt-3 max-w-[520px]">
                  Your camera reads posture front, side and back to find your Dancer Movement Type — then coaches développé, à la seconde,
                  turnout and port de bras live, capturing your best rep so you can re-test and see change.
                </p>
              </div>
            </Reveal>
            <Reveal index={1} className="rounded-[28px] p-7 flex flex-col justify-between bg-gradient-to-br from-[#0d72d8] to-[#073464] relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/20 rounded-full blur-2xl" />
              <p className="text-[11px] font-bold tracking-[.18em] uppercase text-[#cfe3fa] relative">Demo library</p>
              <div className="relative">
                <p className={`${head.className} text-[64px] font-bold leading-none`}>58+</p>
                <p className="text-[#d7e3f1] font-medium mt-1">looping demo videos — one for every exercise</p>
              </div>
            </Reveal>
            <Reveal index={2} className="lp-glass-dark p-7 flex flex-col justify-between">
              <p className="text-[11px] font-bold tracking-[.18em] uppercase text-[#9cc6f5]">Assess</p>
              <div>
                <p className={`${head.className} text-[64px] font-bold leading-none lp-silver`}>6</p>
                <p className="text-[#d7e3f1] font-medium mt-1">Dancer Movement Types, each with its own training priorities</p>
              </div>
            </Reveal>
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} index={i % 3} className="lp-glass-dark p-7 flex flex-col">
                <p className="text-[11px] font-bold tracking-[.18em] uppercase text-[#9cc6f5]">{f.tag}</p>
                <p className="font-bold text-[19px] mt-2">{f.t}</p>
                <p className="text-[#c8d8ec] text-[15px] mt-2 leading-relaxed">{f.d}</p>
              </Reveal>
            ))}
            <Reveal index={1} className="md:col-span-2">
              <Link href="/pricing" className="group h-full min-h-[200px] rounded-[28px] p-7 bg-white text-[#073464] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-[.18em] bg-[#e8f1fb] px-3 py-1.5 rounded-full">Join now</span>
                  <span className="w-10 h-10 rounded-full bg-[#075bb4] text-white flex items-center justify-center text-[18px] group-hover:rotate-45 transition-transform">↗</span>
                </div>
                <p className={`${head.className} text-[34px] font-bold uppercase leading-[.95]`}>Get full<br />access</p>
              </Link>
            </Reveal>
          </div>

          {/* video strip */}
          <div className="mt-12 flex gap-3 overflow-x-auto pb-2 lp-noscroll">
            {STRIP.map((id) => (
              <div key={id} className="relative shrink-0 w-[150px] aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame(id, 300, 400)} alt="" className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2.5 right-2 text-[11px] font-semibold leading-tight">{id.replace(/_[a-z0-9]{6}$/, "").replace(/_/g, " ")}</span>
                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/85 text-[#073464] text-[10px] flex items-center justify-center">▶</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3 items-center">
            <Link href="/pricing" className="lp-btn-white lp-btn-lg">Get full access</Link>
            <span className="text-[#c8d8ec] text-[14px]">Cancel anytime · Works on phone, tablet and desktop</span>
          </div>
        </div>
      </section>

      {/* ── 90 DAYS ─────────────────────────────────────── */}
      <section id="pathway" className="max-w-[1240px] mx-auto px-5 py-20 md:py-28 scroll-mt-16">
        <p className="lp-eyebrow">Inside the app</p>
        <h2 className={`${head.className} lp-h2 mt-3`}><span className="lp-steel">Your first<br />ninety days.</span></h2>
        <p className="text-[17px] leading-relaxed text-[#4a4f56] mt-5 max-w-[560px]">
          The Practice is a 90-day, anatomy-first pathway. It starts the day you join: understand it, apply it, then own it.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            ["Days 1–30", "Understand", "Learn the anatomy and mechanics beneath the technique — where turnout really comes from, what limits an extension, what a balance is asking of you. Then scan your posture to find your Dancer Movement Type."],
            ["Days 31–60", "Apply", "Train it. Guided strength sessions, turnout work and ballet-specific drills with a demo for every move — this is where corrections you've had for years finally start to hold."],
            ["Days 61–90", "Own it", "Re-test in the Ballet Movement Lab, watch your numbers move, and learn to correct your own dancing — so progress keeps going long after the ninety days."],
          ].map(([d, t, s], i) => (
            <Reveal key={t} index={i} className="lp-card p-7 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#075bb4] to-[#0d72d8]" style={{ opacity: 0.4 + i * 0.3 }} />
              <p className="text-[11px] font-bold tracking-[.18em] uppercase text-[#075bb4]">{d}</p>
              <p className={`${head.className} text-[30px] font-bold uppercase mt-2 leading-none`}>{t}</p>
              <p className="text-[#5b6068] text-[15px] mt-3 leading-relaxed">{s}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SHANE ───────────────────────────────────────── */}
      <section id="shane" className="relative scroll-mt-16">
        <div className="lp-marble absolute inset-0 opacity-70" aria-hidden />
        <div className="relative max-w-[1240px] mx-auto px-5 py-20 md:py-28 grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-center">
          <div className="lp-photo aspect-[4/5] max-w-[420px] mx-auto w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frame("Overhead_Press_In_Second_obq3sm", 640, 800, 4)} alt="Shane Wuerthner demonstrating in the studio" />
          </div>
          <div>
            <p className="lp-eyebrow">Founder and head coach</p>
            <h2 className={`${head.className} lp-h2 mt-3`}><span className="lp-steel">From first position<br />to </span><span className="text-[#075bb4]">principal artist.</span></h2>
            <p className="text-[17px] leading-relaxed text-[#4a4f56] mt-5">
              Shane Wuerthner trained at the Kirov Academy, danced with Vienna State Ballet and San Francisco Ballet, and became a
              Principal Artist with Queensland Ballet. He then moved into strength and conditioning — and built Athletistry to
              combine classical technique, biomechanics and physical preparation.
            </p>
            <p className="text-[17px] leading-relaxed text-[#4a4f56] mt-4">
              This app is that system: the way Shane makes complex ballet ideas clear, practical and immediately useful — available every day, not just at a workshop.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-7">
              {[
                ["Principal Artist", "Queensland Ballet"],
                ["International career", "Vienna, San Francisco and beyond"],
                ["Performance science", "Strength & conditioning for dancers"],
                ["Global education", "Classes, workshops and online training"],
              ].map(([t, s]) => (
                <div key={t} className="lp-card p-4">
                  <p className="font-bold text-[15px]">{t}</p>
                  <p className="text-[#70757b] text-[13px] mt-0.5">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <Reveal className="max-w-[1240px] mx-auto px-5 text-center">
          <p className="lp-eyebrow">What dancers and teachers say about Shane&apos;s coaching</p>
          <h2 className={`${head.className} lp-h2 mt-3`}><span className="lp-steel">Challenged in the right way.</span></h2>
        </Reveal>
        <div className="mt-10">
          <TestimonialMarquee items={TESTIMONIALS} />
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" className="relative scroll-mt-16">
        <div className="lp-marble absolute inset-0" aria-hidden />
        <div className="relative max-w-[1000px] mx-auto px-5 py-20 md:py-28">
          <p className="lp-eyebrow text-center">Membership</p>
          <h2 className={`${head.className} lp-h2 mt-3 text-center`}><span className="lp-steel">One membership.</span><br /><span className="text-[#075bb4]">Everything included.</span></h2>
          <Reveal className="mt-10">
            <PricingToggle included={INCLUDED} headClass={head.className} />
          </Reveal>
          <p className="text-center text-[#70757b] text-[13px] mt-8">
            Prices in USD. Run a dance studio? <Link href="/studio/create" className="text-[#075bb4] font-semibold">Set up your studio</Link> — your first 2 dancers are free.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="max-w-[820px] mx-auto px-5 py-20">
        <h2 className={`${head.className} lp-h2 text-center !text-[clamp(2rem,4.5vw,3rem)]`}><span className="lp-steel">Questions</span></h2>
        <div className="mt-8 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="lp-card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center gap-4 cursor-pointer font-bold text-[16px] list-none">
                {q}<span className="text-[#075bb4] text-[22px] leading-none transition group-open:rotate-45">+</span>
              </summary>
              <p className="text-[#5b6068] text-[15px] leading-relaxed mt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section className="lp-blue text-white">
        <div className="max-w-[1240px] mx-auto px-5 py-20 md:py-24 text-center">
          <p className="lp-eyebrow !text-[#9cc6f5]">Your next step</p>
          <h2 className={`${head.className} lp-h2 mt-3 lp-silver`}>Train smarter.<br />Dance stronger.</h2>
          <p className="text-[#c8d8ec] text-[17px] mt-5 max-w-[520px] mx-auto">Create your account in under a minute and start today&apos;s session.</p>
          <Link href="/pricing" className="lp-btn-white lp-btn-lg mt-8 inline-flex">Sign up now</Link>
          <p className="text-[#9fb4cf] text-[13px] mt-4">Remember to practise… for many years.</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-[#15181d] text-[#9aa1ab] pb-24 sm:pb-0">
        <div className="max-w-[1240px] mx-auto px-5 py-10 flex flex-col sm:flex-row gap-6 justify-between text-[14px]">
          <p className="max-w-[380px]">Classical ballet values and modern performance science, for dancers who want to understand their technique and keep improving for many years.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/pricing" className="hover:text-white">Membership</Link>
            <Link href="/login" className="hover:text-white">Log in</Link>
            <Link href="/studio/create" className="hover:text-white">For studios</Link>
            <a href="https://athletistry.au" className="hover:text-white">athletistry.au</a>
          </div>
        </div>
        <p className="text-center text-[12px] pb-8">© {new Date().getFullYear()} Athletistry. All rights reserved.</p>
      </footer>

      {/* mobile sticky CTA */}
      {!user && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 p-3 bg-white/90 backdrop-blur-xl border-t border-[rgba(31,39,49,.1)]" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
          <Link href="/pricing" className="lp-btn w-full justify-center py-3.5">Sign up — from $16.66/mo</Link>
        </div>
      )}
    </main>
  );
}

function PhoneMockup() {
  return (
    <div className="w-[250px] rounded-[40px] bg-[#15181d] p-2.5 shadow-[0_30px_70px_rgba(22,33,48,.35)]">
      <div className="rounded-[32px] overflow-hidden bg-[#f7f7f5]">
        <div className="bg-gradient-to-br from-[#073464] to-[#075bb4] text-white px-4 pt-7 pb-4">
          <p className="text-[9px] font-bold tracking-[.25em] text-[#9cc6f5]">ATHLETISTRY</p>
          <p className="font-bold text-[16px] mt-0.5">Today&apos;s session</p>
          <div className="flex gap-1.5 mt-3">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center ${i < 3 ? "bg-white text-[#073464] font-bold" : "bg-white/15"}`}>{d}</span>
            ))}
          </div>
        </div>
        <div className="p-3 space-y-2.5">
          <div className="bg-white rounded-xl p-3 border border-[rgba(31,39,49,.08)]">
            <p className="text-[9px] font-bold tracking-[.18em] text-[#075bb4]">MOVEMENT TYPE</p>
            <p className="font-bold text-[13px] mt-1">The Stabiliser</p>
            <div className="h-1.5 rounded-full bg-[#e6ecf3] mt-2"><div className="h-full w-[68%] rounded-full bg-[#075bb4]" /></div>
          </div>
          {[
            ["Turnout_Developer_mnankw", "Turnout Developer", "3 × 10 each side"],
            ["Extension_Developer_Side_lhzg5h", "Extension Developer", "3 × 8 · tempo 3-1-1"],
            ["Single_Leg_Deadlift_ek9hy9", "Single-Leg Deadlift", "4 × 12"],
          ].map(([id, n, s]) => (
            <div key={id} className="bg-white rounded-xl p-2 flex items-center gap-2.5 border border-[rgba(31,39,49,.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame(id, 96, 96, 2)} alt="" className="w-11 h-11 rounded-lg object-cover" />
              <div><p className="font-bold text-[12px]">{n}</p><p className="text-[#70757b] text-[10px]">{s}</p></div>
            </div>
          ))}
          <div className="rounded-xl bg-[#073464] text-white text-center text-[12px] font-bold py-2.5">Start session</div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { tag: "Train", t: "Guided programs", d: "The Practice (90-day anatomy-first pathway), ballet strength blocks, circuits and warm-ups — sets, reps, tempo and rest timers built in." },
  { tag: "Turn", t: "Pirouette Axis", d: "An interactive tool to understand and build a vertical, stacked turning axis." },
  { tag: "Track", t: "Load & calendar", d: "Log classes and training, see weekly load, plan a taper before exams and performances, and keep your streak alive." },
  { tag: "Learn", t: "Anatomy & training science", d: "The why behind every correction — explained clearly, with a demo video for every exercise." },
];

const STRIP = [
  "Arabesque_Kicks_kv1lnm", "Extension_Developer_Front_whwdnd", "Reverse_Lunge_To_Rond_De_Jambe_t4cflc", "Turnout_Developer_Plank_kpjhl3",
  "Cross_Body_Extensions_rzy7id", "Battu_Strength_tmimr9", "Side_Split_Walkouts_htgtcc", "Nordic_Hamstring_Curls_gsuqa7", "Hanstand_bmykyp",
];

const TESTIMONIALS = [
  { quote: "Technically challenging, but it did not leave me feeling defeated, just challenged in a good way. I took your tips into the studio and saw immediate success with the students.", name: "Heather Rusch", role: "Teacher" },
  { quote: "When you explained and showed us the physiology behind movements, everything became so much clearer. The specific exercises and corrections were incredibly useful.", name: "Susan", role: "Adult dancer" },
  { quote: "Many adult classes do not include this level of correction. The breakdowns, anatomy and training exercises helped me understand how to improve.", name: "Lauren", role: "Dancer and teacher" },
];

const INCLUDED = [
  "Every program, workout and warm-up",
  "Movement Map posture scan + Dancer Movement Type",
  "Ballet Movement Lab live assessments",
  "Pirouette Axis tool",
  "58+ exercise demo videos",
  "Training calendar, load and taper planning",
  "Ranks, streaks and achievements",
  "Anatomy and training-science library",
];

const FAQ: [string, string][] = [
  ["Who is Athletistry for?", "Adult dancers, teachers, vocational and serious students — anyone who wants to understand their technique and train the body that produces it."],
  ["Can I cancel anytime?", "Yes. Manage or cancel your membership in one click from the Membership page — no emails, no lock-in."],
  ["What do I need?", "A phone, tablet or computer. Most sessions need only your body, a band or a chair; each workout lists its equipment up front. The camera tools use your device's camera — nothing is uploaded."],
  ["I'm already in the Skool community.", "Your access is included — just log in with the email you joined with. No need to subscribe here."],
  ["Can my studio use it?", "Yes. Studio owners get a dashboard with student training load, calendars and assessments. Your first 2 dancers are free."],
];

const LP_CSS = `
.lp-eyebrow{font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#075bb4}
.lp-h1{font-size:clamp(3.4rem,8.5vw,6.8rem);font-weight:700;line-height:.9;letter-spacing:-.01em;text-transform:uppercase}
.lp-h2{font-size:clamp(2.6rem,6vw,4.6rem);font-weight:700;line-height:.92;text-transform:uppercase}
.lp-steel{background:linear-gradient(180deg,#25272b 5%,#8d9298 43%,#24272b 72%,#696d72 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.lp-silver{background:linear-gradient(180deg,#fff 10%,#c9d3df 55%,#fff 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.lp-marble{background:radial-gradient(1200px 500px at 85% -10%,rgba(13,114,216,.10),transparent 60%),radial-gradient(900px 500px at -10% 110%,rgba(112,117,123,.12),transparent 60%),linear-gradient(180deg,#fbfbfa,#eef0f2)}
.lp-blue{background:radial-gradient(900px 500px at 90% 0%,rgba(13,114,216,.55),transparent 60%),linear-gradient(160deg,#073464 0%,#075bb4 100%)}
.lp-card{background:#fff;border:1px solid rgba(31,39,49,.1);border-radius:28px;box-shadow:0 12px 32px rgba(22,33,48,.07)}
.lp-glass{background:rgba(255,255,255,.8);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.9);border-radius:20px;box-shadow:0 12px 32px rgba(22,33,48,.14)}
.lp-glass-dark{background:rgba(255,255,255,.08);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.16);border-radius:24px}
.lp-photo{border-radius:28px;overflow:hidden;border:6px solid #fff;box-shadow:0 24px 65px rgba(22,33,48,.2);background:#e6e8eb}
.lp-photo img{width:100%;height:100%;object-fit:cover}
.lp-chip{font-size:12px;font-weight:600;padding:7px 12px;border-radius:999px;background:#fff;border:1px solid rgba(31,39,49,.12);color:#4a4f56}
.lp-btn,.lp-btn-ghost,.lp-btn-white{display:inline-flex;align-items:center;font-weight:700;font-size:14px;border-radius:14px;padding:10px 18px;transition:transform .15s,box-shadow .15s,background .15s}
.lp-btn{background:linear-gradient(180deg,#0d72d8,#075bb4);color:#fff;box-shadow:0 10px 24px rgba(7,91,180,.3)}
.lp-btn:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(7,91,180,.38)}
.lp-btn-ghost{background:#fff;color:#24272c;border:1px solid rgba(31,39,49,.14)}
.lp-btn-ghost:hover{border-color:#075bb4;color:#075bb4}
.lp-btn-white{background:#fff;color:#073464;box-shadow:0 10px 24px rgba(0,0,0,.18)}
.lp-btn-white:hover{transform:translateY(-1px)}
.lp-btn-lg{font-size:16px;padding:14px 24px}
.lp-noscroll::-webkit-scrollbar{display:none}
@keyframes lp-marquee{from{transform:translateX(0)}to{transform:translateX(calc(-100% - var(--gap)))}}
.lp-marquee{animation:lp-marquee 60s linear infinite}
@media (prefers-reduced-motion:reduce){.lp-marquee{animation:none}}
html{scroll-behavior:smooth}
`;

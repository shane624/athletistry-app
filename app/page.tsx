import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* HERO */}
      <section className="hero-bg relative text-white">
        <div className="hero-glow" aria-hidden />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28
                        grid md:grid-cols-2 gap-10 items-center">
          {/* copy */}
          <div className="text-center md:text-left">
            <p className="eyebrow animate-in">Ballet &amp; Anatomy · Training App</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-tight mt-4 animate-in">
              Train the body<br />that <span className="text-teal">actually dances.</span>
            </h1>
            <p className="text-[#c9d2e2] text-lg leading-relaxed mt-5 max-w-md mx-auto md:mx-0 animate-in">
              Your training home base — guided programs built for dancers, timed circuits, a demo
              video for every move, training-load tracking, and progress you can see week to week.
            </p>
            <div className="mt-8 flex gap-3 justify-center md:justify-start flex-wrap animate-in">
              <Link href="/login" className="btn-primary">Member log in</Link>
              <Link href="/dashboard" className="btn-ghost !text-white !border-white/40 !bg-transparent hover:!bg-white/10">
                Go to today&apos;s workout
              </Link>
            </div>
            <div className="mt-9 flex gap-7 justify-center md:justify-start text-sm text-[#aab4c8] animate-in">
              <div><span className="block text-white text-2xl font-extrabold">58+</span>demo videos</div>
              <div><span className="block text-white text-2xl font-extrabold">5+</span>programs</div>
              <div><span className="block text-white text-2xl font-extrabold">90-day</span>anatomy plan</div>
            </div>
          </div>

          {/* phone mockup */}
          <div className="flex justify-center animate-in">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="eyebrow text-center">Everything in one place</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center mt-3">
          Built for how dancers train
        </h2>

        <p className="eyebrow text-center mt-10 mb-4">Train</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature title="Guided Programs" desc="Ready-made plans from gentle to serious — including The Practice, a 90-day anatomy-first journey." />
          <Feature title="Circuit Training" desc="Timed conditioning: intervals, Tabata, EMOM & AMRAP — built-in timer, looping videos and rest preview." />
          <Feature title="Practice Generator" desc="A balanced legs / push / pull / core session generated on demand at your level." />
          <Feature title="Train for Ballet" desc="Pick a move — plié, fondu, arabesque — and get the exercises that strengthen it." />
          <Feature title="Warm-Ups" desc="Gentle and Winning warm-ups for before class, rehearsal or a performance." />
          <Feature title="Build & Save Your Own" desc="Make custom routines, filter by equipment and level, and reuse them any time." />
        </div>

        <p className="eyebrow text-center mt-12 mb-4">Track</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature title="Achievements" desc="Ballet ranks up to Étoile, streaks, weekly rings and badges — with a celebration when you level up." />
          <Feature title="Progress & Balance" desc="See your lifts improve over time and a muscle-group balance view." />
          <Feature title="Training Calendar" desc="Log classes and training; track weekly load so you build up safely and taper before a show." />
          <Feature title="Event Planner" desc="Set a performance or exam date and it plans your taper automatically." />
          <Feature title="Complete & Rate" desc="Finish a workout, rate your effort (RPE) and it counts toward your training load." />
          <Feature title="Rest Timers" desc="An auto rest timer on every set — with pause, ±15s and skip." />
        </div>

        <p className="eyebrow text-center mt-12 mb-4">Learn</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature title="How to Use the App" desc="A plain-English beginner guide — no fitness jargon required." />
          <Feature title="Understand Anatomy" desc="The Dancer's Body course, restyled to the app." />
          <Feature title="Training Science" desc="The why behind the programs, for when you want to go deeper." />
          <Feature title="58+ Demo Videos" desc="A looping demonstration for every exercise, with real video thumbnails." />
          <Feature title="Equipment Lists" desc="Every built workout shows exactly what you'll need — band, chair, weights or just your body." />
          <Feature title="Global Search" desc="Type any exercise, move or page to jump straight to it." />
        </div>

        <div className="text-center mt-14">
          <Link href="/login" className="btn-primary">Member log in</Link>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card card-hover p-5">
      <div className="font-bold text-navy">{title}</div>
      <div className="text-grey text-sm mt-1">{desc}</div>
    </div>
  );
}

/* A small on-brand mockup of the dashboard, matching the showcase rendering. */
function PhoneMockup() {
  return (
    <div className="phone-shell">
      <div className="phone-screen">
        {/* app top bar */}
        <div className="grad-navy text-white px-4 pt-7 pb-3 flex items-center justify-between">
          <div>
            <div className="eyebrow !text-teal">Athletistry</div>
            <div className="font-extrabold text-[15px] mt-0.5">Today&apos;s Workout</div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/15" />
        </div>

        <div className="p-3.5 space-y-3">
          {/* daily inspiration */}
          <div className="bg-white border border-line rounded-xl p-3.5">
            <div className="eyebrow !text-[10px]">Daily Inspiration</div>
            <p className="text-navy font-bold text-[14px] leading-snug mt-2">
              &ldquo;No one can arrive from being talented alone. Work transforms talent into genius.&rdquo;
            </p>
            <p className="text-grey text-[11px] mt-2">— Anna Pavlova</p>
          </div>

          {/* block header */}
          <div className="grad-navy text-white rounded-xl p-4">
            <p className="text-white/75 text-[11px]">Weeks 1–8 · Hypertrophy</p>
            <p className="font-extrabold text-[17px] mt-0.5">Week 3 — Lower Body</p>
            <span className="inline-block bg-white/20 rounded-md px-2 py-0.5 text-[11px] mt-2">4 × 8–12</span>
            <span className="inline-block bg-white/20 rounded-md px-2 py-0.5 text-[11px] mt-2 ml-1.5">tempo 3-1-1</span>
          </div>

          {/* exercise rows with real video frames */}
          <ExerciseRow id="Slant_Board_Squat_ncthzs" name="Slant Board Squat" sub="4 sets · 8–12 reps" />
          <ExerciseRow id="Single_Leg_Deadlift_ek9hy9" name="Single-Leg Deadlift" sub="4 sets · 12–15 reps" />
        </div>
      </div>
    </div>
  );
}

function ExerciseRow({ id, name, sub }: { id: string; name: string; sub: string }) {
  const frame = `https://res.cloudinary.com/dsbtk5hpq/video/upload/so_2,w_120,h_120,c_fill,g_auto/${id}.jpg`;
  return (
    <div className="bg-white border border-line rounded-xl p-2.5 flex items-center gap-2.5">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frame} alt="" className="w-full h-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center text-white text-[11px]
                         drop-shadow">▶</span>
      </div>
      <div>
        <div className="font-bold text-navy text-[13px]">{name}</div>
        <div className="text-grey text-[11px]">{sub}</div>
      </div>
    </div>
  );
}

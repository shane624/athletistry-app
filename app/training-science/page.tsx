import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function TrainingSciencePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <a href="/guide" className="text-teal text-sm">← Back to How to Use the App</a>
        <div className="mt-3">
          <PageHeader icon="flask" eyebrow="Go deeper" title="Training Science"
            subtitle="The principles behind every program — the why, for when you want it. The app handles it for you." />
        </div>

        <nav className="card mt-6 p-4 animate-in">
          <p className="eyebrow">In this guide</p>
          <ol className="text-sm text-teal mt-2 space-y-1 list-decimal list-inside">
            <li><a href="#great8">The Great 8 movement patterns</a></li>
            <li><a href="#types">Strength, hypertrophy &amp; endurance</a></li>
            <li><a href="#build">How to build a workout</a></li>
            <li><a href="#phases">Programs &amp; training phases</a></li>
            <li><a href="#load">Tracking training load (TRIMP)</a></li>
            <li><a href="#terms">Key terms</a></li>
          </ol>
        </nav>

        {/* 1. great 8 */}
        <Section id="great8" n="1" title="The Great 8 movement patterns">
          <p>
            Almost every useful exercise is a version of one of eight fundamental patterns. Train all
            eight and you build a balanced, capable body — the foundation strong dancing is built on.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <Great title="1. Lunge" desc="Unilateral knee work — builds single-leg stability and evens out left/right imbalances." />
            <Great title="2. Squat" desc="Functional lower-body strength. One of the hardest patterns for dancers to master well." />
            <Great title="3. Deadlift / Hinge" desc="Hip-hinge strength and power — translates directly into bigger, faster jumps." />
            <Great title="4. Vertical Push" desc="Shoulder press, handstand push-ups, military press." />
            <Great title="5. Horizontal Push" desc="Push-ups, bench press." />
            <Great title="6. Vertical Pull" desc="Pull-ups, chin-ups, lat pulldowns." />
            <Great title="7. Horizontal Pull" desc="Seated rows, bent-over rows." />
            <Great title="8. Core" desc="Anything that strengthens the central trunk — abdominals and back." />
          </div>
        </Section>

        {/* 2. training types */}
        <Section id="types" n="2" title="Strength, hypertrophy &amp; endurance">
          <p>The same exercise trains different qualities depending on how you load it. Match the variables to your goal.</p>
          <div className="space-y-3 mt-3">
            <TypeCard tag="Hypertrophy" tagClass="grad-navy"
              goal="Thicken muscle fibres over time."
              rx="8–12 reps · 3–4 sets · slow eccentric · low rest · moderate volume & intensity."
              note="Creates muscle damage to drive growth. Newer science shows strength training can build size too — it needn't always be its own phase." />
            <TypeCard tag="Strength" tagClass="grad-brand"
              goal="The maximal force a muscle can exert."
              rx="3–5 reps · 3–5 sets · lift heavy · rest 3+ min · low volume, high intensity."
              note="Mechanical tension is the goal. Full rest between sets lets you recruit maximal effort each set. Follow a strength phase with a deload to recover." />
            <TypeCard tag="Endurance" tagClass="bg-navy2"
              goal="How long a muscle can work before failure."
              rx="15–25+ reps · minimal rest · circuit / Tabata / HIIT style · high volume, low intensity."
              note="Rapidly switching between exercises keeps the heart rate up and trains stamina — useful for long rehearsals and performances." />
          </div>
        </Section>

        {/* 3. build a workout */}
        <Section id="build" n="3" title="How to build a workout">
          <p>An effective full-body workout follows this structure:</p>
          <ol className="mt-2 space-y-1 text-sm text-ink list-decimal list-inside">
            <li><b>Warm-up</b> — ~5 minutes of dynamic movement</li>
            <li><b>Legs</b> — a squat, hinge or lunge</li>
            <li><b>Push</b> — vertical or horizontal</li>
            <li><b>Pull</b> — vertical or horizontal</li>
            <li><b>Core</b></li>
            <li><b>Cool down</b> — ~5 minutes of static stretching</li>
          </ol>
          <div className="card bg-rowalt mt-3 p-4">
            <p className="eyebrow">Example session</p>
            <ul className="text-sm text-ink mt-2 space-y-1">
              <li>Dynamic stretches</li>
              <li>Squats — 3 × 8–10, tempo 2:0:2</li>
              <li>Push-ups — 3 × 8–10, tempo 2:0:2</li>
              <li>Rows — 3 × 8–10, tempo 2:0:2</li>
              <li>Plank — 3 × 30 seconds</li>
              <li>Static stretches</li>
            </ul>
          </div>
          <p className="text-grey text-sm mt-3">
            The app&apos;s <b>Random Workout</b> follows exactly this legs → push → pull → core
            structure, so you always get a balanced session.
          </p>
        </Section>

        {/* 4. phases */}
        <Section id="phases" n="4" title="Programs &amp; training phases">
          <p>Your body adapts to repeated training, so to keep improving you have to change the stimulus. Plan from the big picture down:</p>
          <div className="space-y-3 mt-3">
            <PhaseCard tag="Macro phase" desc="Your year. Map your performances, competitions and exams onto a calendar, then plan the condition you'll need for each." />
            <PhaseCard tag="Meso phase" desc="An 8–12 week program leading up to an event." />
            <PhaseCard tag="Micro phase" desc="The 2-week blocks that make up a meso phase — small, adjustable units you tune week to week." />
          </div>
          <p className="text-grey text-sm mt-3">
            The 24-week program in this app is a built-in example: hypertrophy → strength → endurance
            meso phases, each broken into micro blocks.
          </p>
        </Section>

        {/* 5. load */}
        <Section id="load" n="5" title="Tracking training load (TRIMP)">
          <p>
            On the <b>Training Calendar</b>, log every session — gym, ballet, jazz, rehearsal — as
            duration and effort. The app converts each into a single training-load number:
          </p>
          <div className="card bg-rowalt mt-3 p-4">
            <p className="text-navy font-semibold text-sm">
              Session load = minutes × RPE (1–10) · Weekly load = the sum of all your sessions
            </p>
            <p className="text-grey text-sm mt-2">
              Aim to increase your weekly load by about <b>10% each week</b> — push either volume
              (longer/more sessions) or intensity (higher RPE), <b>not both at once</b>. Then, in the
              two weeks before a performance, the app tapers you: <b>cut volume ~30%</b> while keeping
              intensity high, so you arrive fresh, strong, and lower-risk. Add your events on the
              calendar and the taper kicks in automatically.
            </p>
          </div>
          <p className="text-grey text-sm mt-3">
            This is essentially the classic <i>hours × RPE × days</i> weekly-effort idea, made
            per-session and more precise — and it counts <b>all</b> your training, not just gym work.
          </p>
        </Section>

        {/* 6. terms */}
        <Section id="terms" n="6" title="Key terms">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm">
            <Term t="Flexion" d="A joint bending." />
            <Term t="Extension" d="A joint straightening." />
            <Term t="Contraction" d="A muscle activating." />
            <Term t="Concentric" d="Working against gravity (the lifting phase)." />
            <Term t="Eccentric" d="Working with gravity (the lowering phase)." />
            <Term t="Isometric" d="A muscle working with no joint movement — a hold." />
            <Term t="Isolated" d="An exercise using one joint." />
            <Term t="Compound" d="An exercise using multiple joints." />
            <Term t="RPE" d="Rate of Perceived Exertion — how hard a session felt, 1–10." />
            <Term t="Deload" d="A lighter week to let the body recover after hard training." />
          </div>
        </Section>

        <p className="text-grey text-sm mt-8 mb-2 text-center">
          Train smarter. Dance stronger. Practice for many years.
        </p>
      </main>
    </div>
  );
}

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-20 animate-in">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full grad-brand text-white text-sm font-extrabold flex items-center justify-center shrink-0">{n}</span>
        <h2 className="text-xl font-extrabold text-navy" dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      <div className="mt-3 space-y-3 text-sm text-ink leading-relaxed [&_b]:text-navy">{children}</div>
    </section>
  );
}

function Great({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-3">
      <div className="font-bold text-navy text-sm">{title}</div>
      <div className="text-grey text-xs mt-1">{desc}</div>
    </div>
  );
}

function TypeCard({ tag, tagClass, goal, rx, note }: { tag: string; tagClass: string; goal: string; rx: string; note: string }) {
  return (
    <div className="card p-4">
      <span className={`badge ${tagClass} text-white`}>{tag}</span>
      <p className="text-navy font-semibold text-sm mt-2">{goal}</p>
      <p className="text-grey text-sm mt-1">{rx}</p>
      <p className="text-grey text-xs mt-2">{note}</p>
    </div>
  );
}

function PhaseCard({ tag, desc }: { tag: string; desc: string }) {
  return (
    <div className="card p-4 flex gap-3 items-start">
      <span className="badge bg-teal text-white shrink-0">{tag}</span>
      <p className="text-grey text-sm">{desc}</p>
    </div>
  );
}

function Term({ t, d }: { t: string; d: string }) {
  return (
    <p><b className="text-navy">{t}:</b> <span className="text-grey">{d}</span></p>
  );
}

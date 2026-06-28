import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="book" eyebrow="Welcome" title="How to Use the App"
          subtitle="A plain-English guide — no fitness background needed." />

        {/* reassurance */}
        <div className="card mt-4 p-5 border-l-2 border-teal animate-in">
          <p className="text-ink text-sm leading-relaxed">
            New to all this? You&apos;re in exactly the right place. You don&apos;t need any gym
            experience, you don&apos;t need fancy equipment, and you don&apos;t need to understand the
            science to start. The app tells you what to do, shows you a video of how to do it, and
            keeps track of everything for you. Go at your own pace — there&apos;s no rush, and nothing
            here is a test.
          </p>
        </div>

        {/* contents */}
        <nav className="card mt-6 p-4 animate-in">
          <p className="eyebrow">On this page</p>
          <ol className="text-sm text-teal mt-2 space-y-1 list-decimal list-inside">
            <li><a href="#first">Your first workout, in 3 steps</a></li>
            <li><a href="#tour">What each part of the app does</a></li>
            <li><a href="#words">Words you might see (explained simply)</a></li>
            <li><a href="#nice">Nice to know — but not needed to start</a></li>
            <li><a href="#safe">Staying safe &amp; comfortable</a></li>
          </ol>
        </nav>

        {/* 1. first workout */}
        <Section id="first" n="1" title="Your first workout, in 3 steps">
          <p>That&apos;s honestly all there is to it:</p>
          <div className="space-y-3 mt-3">
            <Step n="1" t="Tap “Today”" d="This is your home screen. It shows the workout for today — already chosen for you. You don't have to plan anything." />
            <Step n="2" t="Watch, then move" d="Each exercise has a short video. Tap it, watch how it's done, then give it a go. Copy what you see — that's the whole idea." />
            <Step n="3" t="Tap to record it" d="After a set, type in how much you lifted and how many you did (or just how long you held it). The app remembers, so next time it shows you last time's numbers." />
          </div>
          <p className="mt-3">
            When you&apos;re finished, tap <b>Complete workout</b>. Done. You just trained — that&apos;s
            the win.
          </p>
          <div className="card bg-rowalt mt-3 p-4">
            <p className="text-grey text-sm">
              No weights at home? Many exercises use just your body. And when you generate or browse a
              workout, you can tell the app what equipment you have (even &quot;just a resistance
              band&quot;) and it only shows you things you can actually do.
            </p>
          </div>
        </Section>

        {/* 2. tour */}
        <Section id="tour" n="2" title="What each part of the app does">
          <p>Tap the menu (top of the screen) to find these. You don&apos;t need them all — start with <b>Today</b> and explore the rest whenever you&apos;re curious.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <Feature t="Today" d="Your workout for today. Start here." />
            <Feature t="Programs" d="Ready-made plans to follow, from gentle to serious. Pick one and the app guides you day by day." />
            <Feature t="Practice Generator" d="In a hurry? Get a quick, balanced workout instantly." />
            <Feature t="Circuit Training" d="Short, timed conditioning. Pick a style — the app runs the clock and you just follow along." />
            <Feature t="Train for Ballet" d="Want a better plié or fondu? Pick the move and get exercises that help it." />
            <Feature t="Warm-Ups" d="Short videos to loosen up before training, class, or a performance." />
            <Feature t="Guided Workouts" d="Press play and follow along with a full video session." />
            <Feature t="My Workouts" d="Any workouts you've saved, kept in one place." />
            <Feature t="Progress" d="See how you're improving over time. Encouraging to look back on." />
            <Feature t="Training Calendar" d="A diary of your classes and training. Helpful, but totally optional." />
            <Feature t="Achievements" d="Fun rewards — ranks and streaks — for showing up." />
            <Feature t="Library" d="Every exercise with its video, to browse any time." />
            <Feature t="Search" d="The box up top. Type anything — an exercise, a page — to jump straight to it." />
          </div>
        </Section>

        {/* 3. words */}
        <Section id="words" n="3" title="Words you might see (explained simply)">
          <p>If a word looks unfamiliar, here&apos;s what it actually means — no need to memorise these.</p>
          <div className="space-y-2 mt-3">
            <Word t="Rep" d="One single movement — e.g. one squat. “10 reps” just means do it 10 times." />
            <Word t="Set" d="A group of reps done together, then a short rest. “3 sets of 10” = do 10, rest, repeat, until you've done it three times." />
            <Word t="Reps & weight" d="How many you did and how heavy. You type these in so the app can show your progress." />
            <Word t="Hold" d="Some exercises (like a plank) you just hold still. The app gives you a timer instead of reps." />
            <Word t="Tempo" d="How slowly to move. “Slow and controlled” is almost always the answer — there's no need to rush." />
            <Word t="Warm-up" d="A few easy minutes to get your body ready, before the real work. Always worth it." />
          </div>
        </Section>

        {/* 4. nice to know */}
        <Section id="nice" n="4" title="Nice to know — but not needed to start">
          <p>
            When you&apos;re ready (and only then), these ideas help you get more out of training.
            Skip this whole section if it feels like too much — your workouts work perfectly without it.
          </p>
          <p className="font-bold text-navy mt-1">The three kinds of training</p>
          <p>
            You might see these three words. They simply describe what a workout is mostly trying to
            do. You don&apos;t have to choose — the programs pick for you — but here&apos;s what they mean:
          </p>
          <div className="space-y-3 mt-2">
            <Plain t="Strength — getting stronger" d="Lifting something heavy, just a few times. Think of being able to carry more, jump higher, or hold a position with more power." />
            <Plain t="Hypertrophy — building muscle" d="A medium weight for a medium number of reps. “Hypertrophy” is just the science word for muscles getting a little bigger and firmer over time. Nothing scary — it's the everyday kind of toning and shaping." />
            <Plain t="Endurance — lasting longer" d="A lighter weight for lots of reps, with little rest. This builds stamina, so you don't tire as fast in a long class or rehearsal." />
          </div>

          <p className="font-bold text-navy mt-5">Two more gentle ideas</p>
          <div className="space-y-3 mt-2">
            <Plain t="Go a little harder over time" d="Bodies adapt, so to keep improving you gradually add a bit more — a little more weight, or one more set — when last week felt manageable. The app nudges you when it's time." />
            <Plain t="Ease off before a big day" d="In the couple of weeks before a performance or exam, you do a bit less so you feel fresh and strong on the day. The Event Planner sets this up for you automatically." />
          </div>

          <p className="font-bold text-navy mt-5">The four circuit styles</p>
          <p>
            A <b>circuit</b> is a few exercises done one after another with a timer instead of counting reps —
            quick, sweaty, and great for fitness. Open <b>Circuit Training</b> and pick whichever style appeals;
            the app builds the moves (legs, push, pull and core, biggest movements first) and runs the clock for you.
          </p>
          <div className="space-y-3 mt-2">
            <Plain t="1:1 Intervals — the friendly one" d="Work for a set time, then rest the same amount. Choose 15, 30 or 45 seconds. Easiest to pace yourself with, so start here if you're new." />
            <Plain t="Tabata — short and spicy" d="20 seconds hard, 10 seconds rest, eight times through. It's quick but it really gets your heart going." />
            <Plain t="EMOM — “every minute on the minute”" d="At the top of each minute you do your reps (say 5), then rest whatever's left of that minute before the next one starts. The faster you go, the more rest you earn." />
            <Plain t="AMRAP — “as many rounds as possible”" d="Set the clock (say 12 minutes) and keep cycling through the exercises, counting your laps. A fun way to race yourself." />
          </div>

          <p className="font-bold text-navy mt-5">Rest timers</p>
          <p>
            On every workout, the moment you log a set a little <b>rest timer</b> starts on its own, counting down
            the rest the program recommends. You can pause it, add or take off 15 seconds, or tap <b>Skip</b> if
            you&apos;re ready early — it&apos;s a gentle prompt, never a rule.
          </p>
        </Section>

        {/* 5. safety */}
        <Section id="safe" n="5" title="Staying safe & comfortable">
          <ul className="mt-1 space-y-2 text-sm text-ink list-disc list-inside">
            <li><b>Start light.</b> It&apos;s always better to begin too easy than too hard. You can add more next time.</li>
            <li><b>Good form beats heavy weight.</b> Copy the video carefully. Moving well matters far more than moving big.</li>
            <li><b>Stop if something hurts.</b> Normal effort feels like effort. Sharp pain, dizziness, or anything that feels wrong means stop — that&apos;s not being soft, that&apos;s being smart.</li>
            <li><b>Rest is part of it.</b> Days off aren&apos;t cheating — your body gets stronger while it recovers.</li>
            <li><b>Ask anytime.</b> Stuck or unsure? Bring it to the community. Real questions get real answers.</li>
          </ul>
          <p className="text-grey text-sm mt-4">
            That&apos;s everything you need. Open <b>Today</b> and give the first exercise a go — you
            already know enough to start.
          </p>
        </Section>

        {/* go deeper */}
        <a href="/training-science" className="card card-hover block mt-8 p-5 border-l-2 border-teal animate-in">
          <p className="eyebrow">For the curious</p>
          <p className="text-navy font-bold mt-1">Want to go deeper? Read Training Science →</p>
          <p className="text-grey text-sm mt-1">
            The proper why behind the programs — strength vs muscle vs stamina, training phases, and
            how the app tracks your load. Totally optional.
          </p>
        </a>

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
        <h2 className="text-xl font-extrabold text-navy">{title}</h2>
      </div>
      <div className="mt-3 space-y-3 text-sm text-ink leading-relaxed [&_b]:text-tealdark [&_b]:font-semibold">{children}</div>
    </section>
  );
}

function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="card p-4 flex gap-3 items-start">
      <span className="w-7 h-7 rounded-full bg-teal text-white text-sm font-extrabold flex items-center justify-center shrink-0">{n}</span>
      <div>
        <p className="font-bold text-navy">{t}</p>
        <p className="text-grey text-sm mt-0.5">{d}</p>
      </div>
    </div>
  );
}

function Feature({ t, d }: { t: string; d: string }) {
  return (
    <div className="card p-3">
      <div className="font-bold text-navy text-sm">{t}</div>
      <div className="text-grey text-xs mt-1">{d}</div>
    </div>
  );
}

function Word({ t, d }: { t: string; d: string }) {
  return (
    <div className="card p-3">
      <span className="font-bold text-navy text-sm">{t}</span>
      <span className="text-grey text-sm"> — {d}</span>
    </div>
  );
}

function Plain({ t, d }: { t: string; d: string }) {
  return (
    <div className="card p-4">
      <p className="font-bold text-navy text-sm">{t}</p>
      <p className="text-grey text-sm mt-1">{d}</p>
    </div>
  );
}

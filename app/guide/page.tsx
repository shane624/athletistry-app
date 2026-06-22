import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-teal font-semibold tracking-widest text-sm">ATHLETISTRY</p>
        <h1 className="text-2xl font-bold text-navy mt-1">Welcome — how this works</h1>

        <p className="text-ink text-sm leading-relaxed mt-3">
          This app is your training home base. Pick a program that fits you, follow the day&apos;s
          workout, watch the demo video for any exercise, and log what you lift. The app remembers
          your weights and carries them forward so every session builds on the last. Everything
          saves to your account, so it&apos;s there on your phone and computer.
        </p>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Choosing a program</h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            Open the <b>Programs</b> tab and tap one to make it active. There are four:
          </p>
          <ul className="mt-2 space-y-2 text-sm text-ink">
            <li className="card p-3"><b>24-Week Periodized</b> — a full progressive plan that moves through hypertrophy, strength, and endurance. The app detects your current week automatically and sets the right reps and tempo.</li>
            <li className="card p-3"><b>Ballet Return — 50+</b> — a gentle 2-day full-body program focused on mobility and a safe return to movement.</li>
            <li className="card p-3"><b>3-Day Full Body</b> — straightforward muscle-building, three full-body days a week.</li>
            <li className="card p-3"><b>Kids Movement (6–13)</b> — fun, bodyweight-only movement. Each exercise is a 30-second timer instead of weights.</li>
          </ul>
          <p className="text-grey text-xs mt-2">Each program keeps its own logs and weights, and you can switch anytime.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Doing a workout (Today tab)</h2>
          <ol className="mt-2 space-y-2 text-sm text-ink list-decimal list-inside">
            <li>The banner shows today&apos;s focus and the target sets × reps (and tempo, if any).</li>
            <li>For the 2- and 3-day programs, tap <b>Day 1 / Day 2 / Day 3</b> to choose which session you&apos;re doing.</li>
            <li>Tap <b>Watch ▸</b> on any exercise to see the demo video right there.</li>
            <li>Enter the weight and reps for each set, then tap <b>Save</b>. A ✓ confirms it saved.</li>
            <li>Use the <b>Rest ⏱</b> button between sets — it counts down and buzzes when you&apos;re ready for the next set.</li>
          </ol>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Carrying weight forward</h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            When you log a set, the app remembers your weight for that exercise and pre-fills it next
            time, so you always start from where you left off. If the app sees you hit the top of the
            rep range, it&apos;ll suggest adding a little weight.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Kids program</h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            No weights — each move shows a big <b>▶ Start 30s</b> timer. Tap it, do the movement until
            it finishes, then tap <b>Mark done</b>. Two fun rounds, with a grown-up keeping an eye out.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Tracking progress</h2>
          <p className="text-ink text-sm leading-relaxed mt-1">
            The <b>Progress</b> tab charts your top weight and total volume per exercise over time, so
            you can see it climbing. The <b>Library</b> tab lets you search every exercise and watch
            its video any time.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">A few tips</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink list-disc list-inside">
            <li>Warm up first, and use a weight where the last couple of reps are challenging but your form holds.</li>
            <li>Stop if anything hurts — see the disclaimer for the full safety note.</li>
            <li>Add the app to your phone&apos;s home screen for quick one-tap access (Share → Add to Home Screen).</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Explore</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <a href="/training-styles" className="card p-3 hover:border-teal border border-line transition"><b>Training styles explained</b><div className="text-grey text-sm">Hypertrophy vs strength vs endurance.</div></a>
            <a href="/generate" className="card p-3 hover:border-teal border border-line transition"><b>Random Workout</b><div className="text-grey text-sm">Auto-build a balanced session.</div></a>
            <a href="/build" className="card p-3 hover:border-teal border border-line transition"><b>Build Your Own</b><div className="text-grey text-sm">Make a routine from the library.</div></a>
            <a href="/workouts" className="card p-3 hover:border-teal border border-line transition"><b>Guided Workouts</b><div className="text-grey text-sm">Full follow-along sessions.</div></a>
          </div>
        </section>

        <p className="text-grey text-xs mt-8">
          Questions or something not working? Reach out inside the community.
        </p>
      </main>
    </div>
  );
}

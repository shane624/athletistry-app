// Route-level loading state.
//
// This replaces the full branded splash that used to appear on every single
// navigation. Holding the page's shape means a tab change reads as this screen
// filling in, rather than the whole app appearing to relaunch.
export default function PageSkeleton() {
  return (
    <div className="min-h-screen">
      <main className="app-page" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading</span>

        <header className="page-lead">
          <div className="w-full">
            <div className="skeleton h-2.5 w-24 rounded-full" />
            <div className="skeleton h-10 w-2/3 max-w-md mt-4 rounded-xl" />
            <div className="skeleton h-3 w-1/2 max-w-sm mt-4 rounded-full" />
          </div>
        </header>
        <div className="page-lead-rule" />

        <section className="metric-grid mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="metric-card">
              <div className="skeleton h-2 w-14 rounded-full" />
              <div className="skeleton h-7 w-16 mt-4 rounded-lg" />
              <div className="skeleton h-2 w-20 mt-4 rounded-full" />
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-3 mt-3">
          {[0, 1].map((i) => (
            <div key={i} className="panel panel-pad">
              <div className="skeleton h-2 w-20 rounded-full" />
              <div className="skeleton h-5 w-40 mt-3 rounded-lg" />
              <div className="skeleton h-[150px] w-full mt-5 rounded-2xl" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

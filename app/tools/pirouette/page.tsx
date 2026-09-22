import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pirouette Axis — Athletistry" };

// The Pirouette Axis trainer is a self-contained interactive tool with its own
// (dark) styling, so it's framed in an iframe to keep it isolated from the app.
export default function PirouettePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-compact">
        <PageHeader icon="target" eyebrow="Interactive tool" title="Pirouette Axis"
          subtitle="Find and hold your turning axis — a visual trainer for a cleaner pirouette." />
        <div className="card overflow-hidden mt-5 animate-in" style={{ padding: 0 }}>
          <iframe
            src="/tools/pirouette-axis.html"
            title="Pirouette Axis trainer"
            className="w-full block"
            style={{ height: "calc(100vh - 210px)", minHeight: "620px", border: "0" }}
            allow="accelerometer; gyroscope"
          />
        </div>
      </main>
    </div>
  );
}

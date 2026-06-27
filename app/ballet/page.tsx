import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import BalletClient from "./BalletClient";

export const dynamic = "force-dynamic";

export default function BalletPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="ballet" eyebrow="Train for your dancing" title="Train for a Ballet Move"
          subtitle="Pick a move to improve — the app builds a workout for exactly what it needs." />
        <BalletClient />
      </main>
    </div>
  );
}

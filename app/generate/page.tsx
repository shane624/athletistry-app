import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import GeneratorClient from "./GeneratorClient";

export const dynamic = "force-dynamic";

export default function GeneratePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader icon="bolt" eyebrow="Off-plan, on purpose" title="Practice Generator"
          subtitle="Pick a style and difficulty — the app builds a balanced legs / push / pull / core session for today." />
        <GeneratorClient />
      </main>
    </div>
  );
}

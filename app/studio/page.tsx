import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import StudioHub from "@/components/StudioHub";
import { getMyStudios, getMyMemberships } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

export default async function StudioPage({ searchParams }: { searchParams: { code?: string } }) {
  const [owned, joined] = await Promise.all([getMyStudios(), getMyMemberships()]);
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader icon="users" eyebrow="For teachers & dancers" title="Studios"
          subtitle="Run a studio to track your dancers, or join one your teacher set up." />
        <StudioHub owned={owned} joined={joined} initialCode={searchParams?.code ?? ""} />
      </main>
    </div>
  );
}

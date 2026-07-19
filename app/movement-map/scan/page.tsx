import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import PoseCamera from "@/components/PoseCamera";

export const dynamic = "force-dynamic";

export default function MovementScanPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader icon="target" eyebrow="Body-point scan" title="Camera Posture Scan"
          subtitle="Your camera reads your alignment from front, side, and back." />
        <PoseCamera />
      </main>
    </div>
  );
}

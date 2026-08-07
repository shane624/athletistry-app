import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import PoseCamera from "@/components/PoseCamera";

export const dynamic = "force-dynamic";

export default function MovementScanPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-compact">
        <PageHeader icon="target" eyebrow="Body-point scan" title="Camera Posture Scan"
          subtitle="Your camera reads your alignment from front, side, and back." />
        <PoseCamera />
      </main>
    </div>
  );
}

import NavBar from "@/components/NavBar";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-compact">
        <OnboardingClient />
      </main>
    </div>
  );
}

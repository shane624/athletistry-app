import NavBar from "@/components/NavBar";
import BalletClient from "./BalletClient";

export const dynamic = "force-dynamic";

export default function BalletPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="eyebrow">Train for your dancing</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">Train for a Ballet Move</h1>
        <p className="text-grey text-sm mt-1">
          Pick a move you want to improve, and the app builds a workout from the exercises that
          strengthen exactly what that move needs.
        </p>
        <BalletClient />
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getOnboarding } from "@/lib/data";
import StartHereClient from "./StartHereClient";

export const dynamic = "force-dynamic";

export default async function StartHerePage() {
  const ob = await getOnboarding();
  // must accept the disclaimer first
  if (!ob.disclaimerAccepted) redirect("/welcome");
  // already learned? straight to choosing a program / dashboard
  if (ob.learningCompleted) redirect(ob.onboarded ? "/dashboard" : "/programs?first=1");
  return <StartHereClient />;
}

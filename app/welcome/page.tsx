import { redirect } from "next/navigation";
import { getOnboarding } from "@/lib/data";
import DisclaimerClient from "./DisclaimerClient";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const { disclaimerAccepted, onboarded, learningCompleted } = await getOnboarding();
  // already accepted the disclaimer? skip ahead through the rest of the flow.
  if (disclaimerAccepted && !learningCompleted) redirect("/start-here");
  if (disclaimerAccepted && !onboarded) redirect("/programs?first=1");
  if (disclaimerAccepted && onboarded) redirect("/dashboard");
  return <DisclaimerClient />;
}

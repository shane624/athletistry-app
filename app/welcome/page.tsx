import { redirect } from "next/navigation";
import { getOnboarding } from "@/lib/data";
import DisclaimerClient from "./DisclaimerClient";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const { disclaimerAccepted, onboarded } = await getOnboarding();
  // already done? skip ahead.
  if (disclaimerAccepted && onboarded) redirect("/dashboard");
  if (disclaimerAccepted && !onboarded) redirect("/programs?first=1");
  return <DisclaimerClient />;
}

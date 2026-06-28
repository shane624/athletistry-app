import { redirect } from "next/navigation";

// The plan now lives on the Training Calendar — redirect any old links there.
export default function PlanOverviewRedirect() {
  redirect("/load");
}

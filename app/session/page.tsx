import { redirect } from "next/navigation";
import SessionPlayer from "@/components/SessionPlayer";
import { getToday, getOnboarding } from "@/lib/data";
import { getAchievements } from "@/lib/achievements-data";

export const dynamic = "force-dynamic";

// Guided, full-screen workout player for today's session (regular programs).
export default async function SessionPage() {
  const ob = await getOnboarding();
  if (!ob.disclaimerAccepted) redirect("/welcome");
  if (!ob.learningCompleted) redirect("/start-here");
  if (!ob.onboarded) redirect("/onboarding");

  const today = await getToday();
  if (!today.exercises.length) redirect("/dashboard");
  const ach = await getAchievements();

  return (
    <SessionPlayer
      exercises={today.exercises}
      rx={today.rx}
      programId={today.programId}
      week={today.week}
      dayIndex={today.dayIndex}
      dayTitle={today.dayTitle}
      timed={today.mode === "timed"}
      initialLogs={today.logs}
      lastLogs={today.lastLogs}
      levelIndex={ach.level.index}
      levelName={ach.level.name}
      nextLevelName={ach.nextLevel?.name}
      backHref="/dashboard"
    />
  );
}

import NavBar from "@/components/NavBar";
import ExerciseCard from "@/components/ExerciseCard";
import EquipmentNeeded from "@/components/EquipmentNeeded";
import Icon from "@/components/Icon";
import DaySelector from "@/components/DaySelector";
import DailyQuote from "@/components/DailyQuote";
import AchievementStrip from "@/components/AchievementStrip";
import WarmUp from "@/components/WarmUp";
import Greeting from "@/components/Greeting";
import QuickStart from "@/components/QuickStart";
import WeekRhythm from "@/components/WeekRhythm";
import CompleteWorkout from "@/components/CompleteWorkout";
import EventPlanDay from "@/components/EventPlanDay";
import TourButton from "@/components/TourButton";
import WeekdaySync from "@/components/WeekdaySync";
import LocalDateCookie from "@/components/LocalDateCookie";
import { getToday, getOnboarding } from "@/lib/data";
import { getEventPlanToday, getEventPlanUpcoming, getPausedEventPlan } from "@/lib/event-plan-data";
import RejoinEventPlan from "@/components/RejoinEventPlan";
import { getDisplayName } from "@/lib/profile-data";
import { getAchievements } from "@/lib/achievements-data";
import { getAssessment } from "@/lib/load-data";
import { getWeekRhythm } from "@/lib/week-rhythm";
import { BLOCK_LABEL, BLOCK_WEEKS } from "@/lib/programs";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const ob = await getOnboarding();
  if (!ob.disclaimerAccepted) redirect("/welcome");
  if (!ob.learningCompleted) redirect("/start-here");
  if (!ob.onboarded) redirect("/onboarding");

  const [eventPlan, displayName] = await Promise.all([getEventPlanToday(), getDisplayName()]);
  if (eventPlan.active) {
    const [upcoming, planAch, planRhythm] = await Promise.all([getEventPlanUpcoming(5), getAchievements(), getWeekRhythm()]);
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="page-frame dashboard-shell">
          <LocalDateCookie />
          <div className="dashboard-topline flex items-end justify-between flex-wrap gap-4 animate-in">
            <Greeting name={displayName} programName={eventPlan.label ?? "Event plan"} />
            <TourButton className="mb-1" />
          </div>
          <div className="mb-5" data-tour="ring"><AchievementStrip /></div>
          <EventPlanDay
            plan={eventPlan}
            upcoming={upcoming.days}
            levelIndex={planAch.level.index}
            levelName={planAch.level.name}
            nextLevelName={planAch.nextLevel?.name}
          />
          {/* The week list belongs here too, but not QuickStart: someone on a
              tapering event plan should not be offered six ways to deviate. */}
          <WeekRhythm rhythm={planRhythm} />
        </main>
      </div>
    );
  }

  const [today, ach, assessmentRes, paused] = await Promise.all([
    getToday(), getAchievements(), getAssessment(), getPausedEventPlan(),
  ]);
  const { assessment } = assessmentRes;
  const rhythm = await getWeekRhythm();
  const isPeriodized = today.programType === "periodized";
  const isManual = today.scheduling === "manual";
  const totalEx = today.exercises.length;
  const startedEx = today.exercises.filter((ex) => Object.keys(today.logs[ex.id] ?? {}).length > 0).length;
  const pct = totalEx ? Math.round((startedEx / totalEx) * 100) : 0;
  const phaseLabel = today.phase
    ? `Phase · ${today.phase}`
    : `${BLOCK_WEEKS[today.rx.block] ?? ""} · ${BLOCK_LABEL[today.rx.block] ?? ""}`;
  const sessionTitle = `${isPeriodized ? `Week ${today.week} · ` : ""}${today.dayTitle.replace(/^Day \d+ — /, "")}`;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="page-frame dashboard-shell">
        <LocalDateCookie />
        {today.scheduling === "weekday" && <WeekdaySync currentDay={today.dayIndex} dayCount={today.dayCount} />}

        <div className="dashboard-topline flex items-end justify-between flex-wrap gap-5 animate-in">
          <Greeting name={displayName} programName={today.programName} />
          <div className="flex items-center gap-4 pb-1 whitespace-nowrap">
            <TourButton />
            <Link href="/programs" className="inline-flex items-center gap-1 text-teal text-[12px] font-bold tracking-wide hover:text-tealdark transition">
              Change program <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>

        {paused.paused && <RejoinEventPlan label={paused.label} daysLeft={paused.daysLeft} />}

        <div className="grid lg:grid-cols-[minmax(0,1.75fr)_minmax(285px,.72fr)] gap-4 lg:gap-5 items-stretch">
          <section data-tour="today-session" className="dashboard-hero animate-in flex flex-col justify-between">
            {today.exercises[0]?.youtube_id && (
              <>
                <img
                  src={`https://i.ytimg.com/vi/${today.exercises[0].youtube_id}/maxresdefault.jpg`}
                  alt=""
                  className="absolute inset-y-0 right-0 h-full w-[48%] object-cover object-center opacity-[.48] grayscale-[.15] hidden md:block"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#15181d] via-[#15181d]/95 to-[#15181d]/20 hidden md:block" />
              </>
            )}
            <div className="relative z-[1]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="hero-kicker">Today · {phaseLabel}</p>
                  <h2 className="hero-title">{sessionTitle}</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="hero-chip">{today.rx.sets} × {today.rx.repLow}–{today.rx.repHigh}</span>
                  {today.rx.tempo !== "smooth" && <span className="hero-chip">Tempo {today.rx.tempo}</span>}
                </div>
              </div>
              <p className="hero-notes">{today.rx.notes}</p>
            </div>

            <div className="relative z-[1] mt-9">
              <div className="flex items-center gap-x-5 gap-y-2 flex-wrap mb-5">
                <span className="hero-stat"><Icon name="dumbbell" className="w-4 h-4" /> {totalEx} exercises</span>
                {startedEx > 0 && <span className="hero-stat"><Icon name="check" className="w-4 h-4" /> {startedEx} started</span>}
                {today.rx.tempo !== "smooth" && <span className="hero-stat"><Icon name="clock" className="w-4 h-4" /> {today.rx.tempo}</span>}
              </div>

              {totalEx > 0 && (
                <div className="max-w-2xl mb-5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[.12em] text-white/55 mb-2">
                    <span>Session progress</span><span>{pct}%</span>
                  </div>
                  <div className="hero-progress-track"><div className="hero-progress-fill transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                </div>
              )}

              <Link href="/session" className="hero-cta w-full sm:w-auto">
                <Icon name="play" className="w-4 h-4" /> {startedEx > 0 ? "Continue today's practice" : "Begin today's practice"}
              </Link>
            </div>
          </section>

          <aside className="dashboard-side-stack" data-tour="ring">
            <AchievementStrip />
            <DailyQuote />
          </aside>
        </div>

        <QuickStart />

        {assessment.status !== "no-data" && (
          <Link href="/load" className="dashboard-note card-hover block mt-5 animate-in">
            <div className="relative z-[1] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">{assessment.taper ? "Taper week" : "Training calendar"}</p>
                <p className="font-display text-[23px] leading-tight font-bold text-navy mt-1.5">{assessment.message}</p>
              </div>
              <span className="w-10 h-10 rounded-full border border-line bg-white/55 flex items-center justify-center text-teal shrink-0">→</span>
            </div>
          </Link>
        )}

        {today.principle && (
          <div className="principle-panel animate-in">
            <p className="eyebrow">The principle</p>
            <p className="font-display text-[25px] sm:text-[29px] text-navy mt-2 max-w-4xl leading-[1.08] font-bold">{today.principle}</p>
          </div>
        )}

        {isManual && <DaySelector dayCount={today.dayCount} selected={today.dayIndex} titles={Array.from({ length: today.dayCount }, (_, i) => i)} />}

        {totalEx > 0 && (
          <>
            <div className="dashboard-section-head" id="today-exercises">
              <div>
                <p className="eyebrow">Prepare</p>
                <h2 className="dashboard-section-title mt-1">Before you begin.</h2>
              </div>
              <Link href="/warmups" className="text-[12px] font-bold text-teal hover:text-tealdark">All warm-ups →</Link>
            </div>
            <div data-tour="warmup"><WarmUp /></div>
            <EquipmentNeeded names={today.exercises.map((ex) => ex.name)} className="mb-4" />

            <div className="dashboard-section-head">
              <div>
                <p className="eyebrow">Your practice</p>
                <h2 className="dashboard-section-title mt-1">Today&apos;s exercises.</h2>
              </div>
              <p className="hidden sm:block text-[12px] text-grey">Quality over quantity.</p>
            </div>
          </>
        )}

        <div data-tour="log" className="grid xl:grid-cols-2 gap-4 stagger">
          {today.exercises.map((ex, i) => {
            const g = today.supersetGroups?.[i] ?? null;
            const firstOfGroup = g != null && (i === 0 || (today.supersetGroups?.[i - 1] ?? null) !== g);
            return (
              <div key={i} style={g != null ? { boxShadow: "inset 2px 0 0 var(--c-teal)", borderRadius: "26px" } : undefined}>
                {firstOfGroup && <p className="eyebrow mb-2 pl-3">Superset · back to back</p>}
                <ExerciseCard
                  exercise={ex}
                  rx={today.rx}
                  programId={today.programId}
                  week={today.week}
                  dayIndex={today.dayIndex}
                  timed={today.mode === "timed"}
                  initialLogs={today.logs[ex.id] ?? {}}
                  lastLog={today.lastLogs?.[ex.id]}
                />
              </div>
            );
          })}
        </div>

        {today.exercises.length === 0 && (
          <div className="dashboard-note mt-8 text-center">
            <p className="font-display text-2xl font-bold text-navy">Nothing is loaded for today.</p>
            <p className="text-grey text-sm mt-2">Check that <code>schema.sql</code> and <code>seed.sql</code> have been run in Supabase.</p>
          </div>
        )}

        {totalEx > 0 && (
          <CompleteWorkout
            levelIndex={ach.level.index}
            levelName={ach.level.name}
            nextLevelName={ach.nextLevel?.name}
            sessionTitle={sessionTitle}
            exercisesLogged={startedEx}
            exercisesTotal={totalEx}
            weekLoadBefore={rhythm.load}
            weekSessionsBefore={rhythm.sessionCount}
          />
        )}

        <WeekRhythm rhythm={rhythm} />
      </main>
    </div>
  );
}

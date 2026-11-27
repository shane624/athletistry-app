import NavBar from "@/components/NavBar";
import Icon from "@/components/Icon";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getAchievements } from "@/lib/achievements-data";
import { getMovementMap } from "@/lib/movement-map-data";
import { MOVEMENT_TYPES } from "@/lib/movement-map";
import { PROGRAMS } from "@/lib/programs";
import { LEARN_TOOLS } from "@/lib/nav-items";

export const dynamic = "force-dynamic";

const LEVEL_NAMES: Record<number, string> = { 1: "Foundation", 2: "Developing", 3: "Intermediate", 4: "Advanced" };

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: state }, achievements, movement] = await Promise.all([
    supabase.from("profiles").select("display_name, program_start_date, experience_level, reminders_opt_in, created_at").eq("id", user?.id ?? "").maybeSingle(),
    supabase.from("user_program_state").select("active_program, week_override").eq("user_id", user?.id ?? "").maybeSingle(),
    getAchievements(),
    getMovementMap(),
  ]);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || (user?.email || "Member").split("@")[0];
  const initial = String(displayName || "A").trim().charAt(0).toUpperCase() || "A";
  const activeProgram = PROGRAMS.find((p) => p.id === state?.active_program) ?? PROGRAMS[0];
  const memberSince = profile?.created_at || user?.created_at;
  const level = LEVEL_NAMES[Number(profile?.experience_level || 2)] ?? "Developing";
  const movementType = movement ? MOVEMENT_TYPES[movement.primary]?.name ?? null : null;
  const earned = achievements.badges.filter((b) => b.earned);
  const rankPct = Math.round((achievements.levelProgress ?? 0) * 100);
  const weekPct = Math.round((achievements.weeklyRing ?? 0) * 100);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <header className="page-lead animate-in">
          <div>
            <h1>Profile</h1>
            <p className="mt-3">Your training identity, progress, and current path through Athletistry.</p>
          </div>
          <Link href="/settings" className="btn-ghost !min-h-[38px] !px-4 !text-2xs"><Icon name="settings" className="w-4 h-4 mr-2" /> Settings</Link>
        </header>

        <section className="profile-grid">
          {/* left — identity + rank */}
          <div className="panel profile-card-main animate-in">
            <div className="profile-avatar"><span>{initial}</span></div>
            <h2 className="font-display text-large leading-none font-bold text-ink">{displayName}</h2>
            <span className="inline-flex mt-3 items-center rounded-full bg-bluewash px-3 py-1 text-2xs font-bold text-tealdark uppercase tracking-[.1em]">{achievements.level.name}</span>
            {user?.email && <p className="text-grey text-2xs mt-3 break-all">{user.email}</p>}
            {memberSince && <p className="text-grey text-2xs mt-1">Member since {new Date(memberSince).toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</p>}

            {/* rank progress */}
            <div className="mt-6 text-left">
              <div className="flex items-center justify-between text-2xs uppercase tracking-[.1em] text-grey">
                <span>{achievements.level.name}</span>
                {achievements.nextLevel && <span>{achievements.nextLevel.name}</span>}
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full rounded-full bg-teal" style={{ width: `${achievements.nextLevel ? rankPct : 100}%` }} />
              </div>
              <p className="text-grey text-2xs mt-1.5">
                {achievements.nextLevel ? `${achievements.toNextLevel} more training day${achievements.toNextLevel === 1 ? "" : "s"} to ${achievements.nextLevel.name}` : "Top rank reached — keep it up."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6">
              <Stat n={achievements.totalWorkouts} label="Days" />
              <Stat n={achievements.currentStreak} label="Streak" />
              <Stat n={achievements.bestStreak} label="Best" />
            </div>
          </div>

          {/* right — details */}
          <div className="space-y-3">
            {/* this week */}
            <section className="panel panel-pad animate-in">
              <div className="flex items-center justify-between">
                <p className="panel-title">This week</p>
                <span className="text-2xs text-grey">{achievements.weekCount} / {achievements.weeklyGoal} training days</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-line overflow-hidden">
                <div className="h-full rounded-full bg-teal" style={{ width: `${weekPct}%` }} />
              </div>
            </section>

            <section id="training" className="panel animate-in scroll-mt-24">
              <div className="px-4 pt-4 pb-2"><p className="panel-title">Training</p></div>
              <div className="profile-list">
                <ProfileRow label="Current program" value={activeProgram?.name ?? "Athletistry"} href="/programs" />
                <ProfileRow label="Experience" value={level} href="/settings" />
                <ProfileRow label="Current rank" value={achievements.level.name} href="/achievements" />
                <ProfileRow label="Movement type" value={movementType ?? "Take the assessment"} href="/movement-map" />
              </div>
            </section>

            {/* achievements */}
            <section className="panel animate-in">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="panel-title">Achievements</p>
                <Link href="/achievements" className="text-2xs text-teal font-semibold">{earned.length} of {achievements.badges.length} · View all</Link>
              </div>
              <div className="px-4 pb-4">
                {earned.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {earned.slice(0, 6).map((b) => (
                      <div key={b.id} className="rounded-xl border border-line bg-white/40 px-3 py-2.5 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-bluewash flex items-center justify-center text-tealdark shrink-0"><Icon name="trophy" className="w-4 h-4" /></span>
                        <span className="min-w-0"><span className="block text-2xs font-semibold text-ink truncate">{b.name}</span><span className="block text-2xs text-grey truncate">{b.desc}</span></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-grey text-2xs">No badges yet — log your first workout to start earning them.</p>
                )}
              </div>
            </section>

            <section id="preferences" className="panel animate-in scroll-mt-24">
              <div className="px-4 pt-4 pb-2"><p className="panel-title">Preferences</p></div>
              <div className="profile-list">
                <ProfileRow label="Program start" value={profile?.program_start_date ? new Date(`${profile.program_start_date}T12:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "Not set"} href="/settings" />
                <ProfileRow label="Week override" value={state?.week_override ? `Week ${state.week_override}` : "Automatic"} href="/settings" />
                <ProfileRow label="Notifications" value={profile?.reminders_opt_in ? "Enabled" : "Off"} href="/settings" />
              </div>
            </section>

            {/* Learn lives here on phones (five tabs is the limit), so it needs a door. */}
            <section className="panel animate-in">
              <div className="px-4 pt-4 pb-2"><p className="panel-title">Learn</p></div>
              <div className="profile-list">
                {LEARN_TOOLS.map((t) => (
                  <Link key={t.href} href={t.href} className="profile-list-row profile-list-row-nav">
                    <span className="flex items-center gap-3 text-subhead text-ink"><Icon name={t.icon} className="w-5 h-5 text-teal" />{t.label}</span>
                    <span />
                    <Icon name="chevron" className="w-4 h-4 text-grey" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="panel panel-pad animate-in">
              <p className="panel-title">Your practice</p>
              <blockquote className="font-display text-title1 leading-[1.02] font-bold text-ink mt-3">&ldquo;Technique gives you choices. Practice turns them into freedom.&rdquo;</blockquote>
              <p className="text-grey text-2xs mt-3">Keep the standards high. Keep the body adaptable. Practice for many years.</p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl border border-line py-3 text-center">
      <p className="font-display text-2xl font-bold text-ink leading-none">{n}</p>
      <p className="text-2xs uppercase tracking-[.1em] text-grey mt-1">{label}</p>
    </div>
  );
}

function ProfileRow({ label, value, href }: { label: string; value: string; href: string }) {
  return <Link href={href} className="profile-list-row"><span className="text-footnote text-grey">{label}</span><span className="text-subhead text-ink text-right sm:text-left truncate">{value}</span><Icon name="chevron" className="w-4 h-4 text-grey" /></Link>;
}

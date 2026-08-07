import NavBar from "@/components/NavBar";
import Icon from "@/components/Icon";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getAchievements } from "@/lib/achievements-data";
import { PROGRAMS } from "@/lib/programs";

export const dynamic = "force-dynamic";

const LEVEL_NAMES: Record<number, string> = { 1: "Foundation", 2: "Developing", 3: "Intermediate", 4: "Advanced" };

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: state }, achievements] = await Promise.all([
    supabase.from("profiles").select("display_name, program_start_date, experience_level, reminders_opt_in, created_at").eq("id", user?.id ?? "").maybeSingle(),
    supabase.from("user_program_state").select("active_program, week_override").eq("user_id", user?.id ?? "").maybeSingle(),
    getAchievements(),
  ]);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || (user?.email || "Member").split("@")[0];
  const initial = String(displayName || "A").trim().charAt(0).toUpperCase() || "A";
  const activeProgram = PROGRAMS.find((p) => p.id === state?.active_program) ?? PROGRAMS[0];
  const memberSince = profile?.created_at || user?.created_at;
  const level = LEVEL_NAMES[Number(profile?.experience_level || 2)] ?? "Developing";

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <header className="page-lead animate-in">
          <div>
            <h1>Profile</h1>
            <p className="mt-3">Your training identity, preferences, and current path through Athletistry.</p>
          </div>
          <Link href="/settings" className="btn-ghost !min-h-[38px] !px-4 !text-[11px]"><Icon name="settings" className="w-4 h-4 mr-2" /> Settings</Link>
        </header>

        <div className="editorial-tabs mb-4 animate-in">
          <span className="editorial-tab editorial-tab-active">Profile</span>
          <a href="#training" className="editorial-tab">Training</a>
          <a href="#preferences" className="editorial-tab">Preferences</a>
        </div>

        <section className="profile-grid">
          <div className="panel profile-card-main animate-in">
            <div className="profile-avatar"><span>{initial}</span></div>
            <h2 className="font-display text-[34px] leading-none font-bold text-ink">{displayName}</h2>
            <span className="inline-flex mt-3 items-center rounded-full bg-bluewash px-3 py-1 text-[9px] font-bold text-tealdark">Athletistry Member</span>
            {user?.email && <p className="text-grey text-[10px] mt-3 break-all">{user.email}</p>}
            {memberSince && <p className="text-grey text-[10px] mt-1">Member since {new Date(memberSince).toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</p>}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <div className="rounded-xl border border-line py-3"><p className="font-display text-2xl font-bold text-ink">{achievements.totalWorkouts}</p><p className="text-[8px] uppercase tracking-[.1em] text-grey">Training days</p></div>
              <div className="rounded-xl border border-line py-3"><p className="font-display text-2xl font-bold text-ink">{achievements.currentStreak}</p><p className="text-[8px] uppercase tracking-[.1em] text-grey">Week streak</p></div>
            </div>
          </div>

          <div className="space-y-3">
            <section id="training" className="panel animate-in scroll-mt-24">
              <div className="px-4 pt-4 pb-2"><p className="panel-title">Training</p></div>
              <div className="profile-list">
                <ProfileRow label="Current program" value={activeProgram?.name ?? "Athletistry"} href="/programs" />
                <ProfileRow label="Experience" value={level} href="/settings" />
                <ProfileRow label="Current rank" value={achievements.level.name} href="/achievements" />
                <ProfileRow label="Weekly goal" value={`${achievements.weeklyGoal} training days`} href="/achievements" />
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

            <section className="panel panel-pad animate-in">
              <p className="panel-title">Your practice</p>
              <blockquote className="font-display text-[28px] leading-[1.02] font-bold text-ink mt-3">“Technique gives you choices. Practice turns them into freedom.”</blockquote>
              <p className="text-grey text-[10px] mt-3">Keep the standards high. Keep the body adaptable. Practice for many years.</p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileRow({ label, value, href }: { label: string; value: string; href: string }) {
  return <Link href={href} className="profile-list-row hover:bg-white/30 transition"><span className="text-[9px] uppercase tracking-[.1em] text-grey">{label}</span><span className="text-[11px] font-medium text-ink text-right sm:text-left truncate">{value}</span><Icon name="chevron" className="w-3.5 h-3.5 text-grey" /></Link>;
}

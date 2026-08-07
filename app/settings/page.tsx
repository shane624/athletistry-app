import NavBar from "@/components/NavBar";
import SettingsClient from "./SettingsClient";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: state }] = await Promise.all([
    supabase.from("profiles").select("display_name, program_start_date, reminders_opt_in").eq("id", user?.id ?? "").maybeSingle(),
    supabase.from("user_program_state").select("week_override").eq("user_id", user?.id ?? "").maybeSingle(),
  ]);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="app-page app-page-narrow">
        <header className="page-lead animate-in">
          <div>
            <h1>Settings</h1>
            <p className="mt-3">Keep the app aligned with how you actually train.</p>
          </div>
        </header>
        <div className="editorial-tabs mb-4 animate-in"><span className="editorial-tab editorial-tab-active">Account</span><span className="editorial-tab">Notifications</span><span className="editorial-tab">Training</span><span className="editorial-tab">Preferences</span></div>
        <SettingsClient
          email={user?.email ?? ""}
          initial={{
            displayName: profile?.display_name ?? "",
            startDate: profile?.program_start_date ?? new Date().toISOString().slice(0, 10),
            reminders: profile?.reminders_opt_in ?? false,
            weekOverride: state?.week_override ?? null,
          }}
        />
      </main>
    </div>
  );
}

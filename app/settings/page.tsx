import NavBar from "@/components/NavBar";
import SettingsClient from "./SettingsClient";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, program_start_date, reminders_opt_in")
    .eq("id", user?.id ?? "")
    .single();
  const { data: state } = await supabase
    .from("user_program_state")
    .select("week_override")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <SettingsClient
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

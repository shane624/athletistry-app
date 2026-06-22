import NavBar from "@/components/NavBar";
import ProgramPicker from "./ProgramPicker";
import { PROGRAMS } from "@/lib/programs";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let active = "periodized24";
  if (user) {
    const { data } = await supabase.from("user_program_state").select("active_program").eq("user_id", user.id).single();
    active = data?.active_program ?? "periodized24";
  }
  const programs = PROGRAMS.map((p) => ({
    id: p.id, name: p.name, tagline: p.tagline,
    dayCount: p.days.length, exerciseCount: p.days.reduce((a, d) => a + d.exerciseNames.length, 0),
  }));
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy">Choose your program</h1>
        <p className="text-grey text-sm mt-1">Each program keeps its own logs and weights. Switch anytime.</p>
        <ProgramPicker programs={programs} active={active} />
      </main>
    </div>
  );
}

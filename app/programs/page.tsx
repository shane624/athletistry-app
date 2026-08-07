import NavBar from "@/components/NavBar";
import ProgramPicker from "./ProgramPicker";
import { PROGRAMS } from "@/lib/programs";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProgramsPage({ searchParams }: { searchParams?: { first?: string } }) {
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
      <main className="app-page">
        <header className="page-lead animate-in">
          <div>
            <h1>Programs</h1>
            <p className="mt-3">Choose a path that matches the dancer you are now, then give it enough time to work.</p>
          </div>
        </header>
        <ProgramPicker programs={programs} active={active} first={searchParams?.first === "1"} customActive={active === "custom"} />
      </main>
    </div>
  );
}

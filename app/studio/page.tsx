import Link from "next/link";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";
import StudioHub from "@/components/StudioHub";
import { getMyStudios, getMyMemberships } from "@/lib/studio-data";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function StudioPage({ searchParams }: { searchParams: { code?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Logged-out visitors get the public landing (create a studio / join by code).
  if (!user) {
    return (
      <div className="min-h-screen">
        <main className="max-w-2xl mx-auto px-4 py-10">
          <p className="text-teal font-semibold tracking-widest text-center">ATHLETISTRY</p>
          <h1 className="text-3xl font-extrabold text-navy text-center mt-2">Studios</h1>
          <p className="text-grey text-center mt-2">Run a studio to track your dancers, or join one your teacher set up.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-8">
            <Link href="/studio/create" className="relative rounded-2xl overflow-hidden p-6 flex flex-col justify-end min-h-[170px] active:scale-[.98] transition"
              style={{ background: "linear-gradient(135deg,#1f2a44,#27ae9f)" }}>
              <span className="absolute top-5 left-5 w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white"><Icon name="users" className="w-6 h-6" /></span>
              <span className="text-white font-bold text-lg leading-tight">Create a studio</span>
              <span className="text-white/85 text-xs mt-1">For teachers. Free for your first 2 dancers.</span>
            </Link>
            <Link href="/studio/join" className="card card-hover p-6 flex flex-col justify-end min-h-[170px]">
              <span className="w-11 h-11 rounded-xl bg-light flex items-center justify-center text-teal mb-auto"><Icon name="target" className="w-6 h-6" /></span>
              <span className="text-navy font-bold text-lg leading-tight">Join with a code</span>
              <span className="text-grey text-xs mt-1">For dancers. Create your login using your studio&apos;s code.</span>
            </Link>
          </div>
          <p className="text-grey text-sm text-center mt-8">Already have a login? <Link href="/login" className="text-teal">Log in</Link>.</p>
        </main>
      </div>
    );
  }

  const [owned, joined] = await Promise.all([getMyStudios(), getMyMemberships()]);
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader icon="users" eyebrow="For teachers & dancers" title="Studios"
          subtitle="Run a studio to track your dancers, or join one your teacher set up." />
        <StudioHub owned={owned} joined={joined} initialCode={searchParams?.code ?? ""} />
      </main>
    </div>
  );
}

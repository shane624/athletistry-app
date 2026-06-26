import NavBar from "@/components/NavBar";
import { isAdmin, getRoster } from "@/lib/admin-data";
import { redirect } from "next/navigation";
import AdminRoster from "./AdminRoster";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/dashboard");
  const roster = await getRoster();

  const active = roster.filter((m) => !m.disabled).length;
  const disabled = roster.length - active;
  // "stale" = active member who hasn't trained in 14+ days
  const cutoff = (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().slice(0, 10); })();
  const stale = roster.filter((m) => !m.disabled && (!m.lastActive || m.lastActive < cutoff)).length;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <p className="eyebrow">Coach view</p>
        <h1 className="text-2xl font-extrabold text-navy mt-1">Admin — Members</h1>
        <p className="text-grey text-sm mt-1">
          Track member progress and manage access. Disabling a member keeps all their data —
          re-enable any time if they resubscribe.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <Stat n={active} label="Active members" />
          <Stat n={stale} label="Inactive 14+ days" accent />
          <Stat n={disabled} label="Disabled" />
        </div>

        <AdminRoster initial={roster} />
      </main>
    </div>
  );
}

function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <div className={`text-2xl font-extrabold ${accent ? "text-teal" : "text-navy"}`}>{n}</div>
      <div className="text-grey text-xs mt-0.5">{label}</div>
    </div>
  );
}

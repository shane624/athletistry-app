import NavBar from "@/components/NavBar";
import { redirect } from "next/navigation";
import StudioRoster from "@/components/StudioRoster";
import { getStudioRoster } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

export default async function StudioDetailPage({ params }: { params: { id: string } }) {
  let data;
  try { data = await getStudioRoster(params.id); }
  catch { redirect("/studio"); }
  const { studio, students } = data!;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <StudioRoster studio={studio} students={students} />
      </main>
    </div>
  );
}

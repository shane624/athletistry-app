import NavBar from "@/components/NavBar";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Full menu hub — the "More" tab on mobile lands here, listing every section.
const GROUPS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Train",
    items: [
      { href: "/dashboard", label: "Today" },
      { href: "/programs", label: "Programs" },
      { href: "/generate", label: "Random Workout" },
      { href: "/circuit", label: "Circuit Training" },
      { href: "/ballet", label: "Train for Ballet" },
      { href: "/warmups", label: "Warm-Ups" },
      { href: "/workouts", label: "Guided Workouts" },
      { href: "/my-workouts", label: "My Workouts" },
    ],
  },
  {
    title: "Track",
    items: [
      { href: "/progress", label: "Progress" },
      { href: "/load", label: "Training Calendar" },
      { href: "/plan", label: "Event Planner" },
      { href: "/achievements", label: "Achievements" },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/guide", label: "How to Use the App" },
      { href: "/anatomy", label: "Understand Anatomy" },
      { href: "/training-science", label: "Training Science" },
    ],
  },
  {
    title: "More",
    items: [
      { href: "/exercises", label: "Library" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-navy">Menu</h1>
        <p className="text-grey text-sm mt-1">Everything in the app, in one place.</p>

        <div className="mt-5 space-y-6">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="eyebrow mb-2">{g.title}</p>
              <div className="card divide-y divide-line overflow-hidden">
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-light">
                    <span className="text-navy font-medium">{it.label}</span>
                    <span className="text-teal text-lg" aria-hidden>›</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

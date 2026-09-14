import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";

// A quiet row of alternatives under today's session.
//
// The hierarchy is the point: one large obvious door, then six small ones for
// the dancer who doesn't want what today prescribed. Previously those options
// only existed a tab away in Train, so the honest choice from the dashboard was
// "do this or leave", which is how people end up doing neither.
const OPTIONS: { href: string; label: string; icon: IconName }[] = [
  { href: "/warmups", label: "Warm-up", icon: "warmup" },
  { href: "/circuit", label: "Circuit", icon: "circuit" },
  { href: "/generate", label: "Generate", icon: "bolt" },
  { href: "/ballet", label: "Ballet", icon: "ballet" },
  { href: "/my-workouts", label: "Mine", icon: "stack" },
  { href: "/exercises", label: "Library", icon: "library" },
];

export default function QuickStart() {
  return (
    <section className="quick-start animate-in" aria-label="Other ways to train today">
      <p className="eyebrow mb-3">Not today&apos;s session?</p>
      <ul className="quick-start-row">
        {OPTIONS.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="quick-start-item tab-press">
              <span className="quick-start-dot">
                <Icon name={o.icon} className="w-[19px] h-[19px]" strokeWidth={1.6} />
              </span>
              <span className="quick-start-label">{o.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

import Icon, { type IconName } from "@/components/Icon";

// Consistent page header: an icon badge + eyebrow + title (+ optional subtitle).
// Gives every screen the same premium, visual top section.
export default function PageHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: IconName;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3.5 animate-in">
      <span className="w-12 h-12 rounded-2xl grad-navy text-white flex items-center justify-center shrink-0 shadow-sm">
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="text-2xl font-extrabold text-navy mt-0.5 leading-tight">{title}</h1>
        {subtitle && <p className="text-grey text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

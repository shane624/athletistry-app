import Icon, { type IconName } from "@/components/Icon";

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
    <div className="flex items-start gap-4 animate-in">
      <span className="page-icon shrink-0"><Icon name={icon} className="w-5 h-5" /></span>
      <div className="min-w-0 pt-0.5">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="text-[34px] sm:text-[40px] font-bold text-navy mt-1 leading-[.96]">{title}</h1>
        {subtitle && <p className="text-grey text-sm mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}

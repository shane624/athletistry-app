import Icon, { type IconName } from "@/components/Icon";

export default function PageHeader({ icon, eyebrow, title, subtitle }: { icon: IconName; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="animate-in">
      <div className="flex items-center gap-2 text-teal"><Icon name={icon} className="w-4 h-4" /><p className="eyebrow">{eyebrow}</p></div>
      <h1 className="editorial-title mt-3">{title}</h1>
      {subtitle && <p className="editorial-copy text-[13px] mt-3">{subtitle}</p>}
      <div className="page-lead-rule" />
    </header>
  );
}

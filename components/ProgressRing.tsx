export default function ProgressRing({ value, size = 126, label }: { value: number; size?: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = c * (clamped / 100);
  return (
    <div className="progress-ring" style={{ width: size, height: size }} aria-label={`${clamped}% complete`}>
      <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--c-line)" strokeWidth="7" />
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--c-teal)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><span className="font-display text-[28px] font-bold leading-none text-ink">{clamped}%</span>{label && <span className="block mt-1 text-[9px] uppercase tracking-[.14em] text-grey">{label}</span>}</div>
      </div>
    </div>
  );
}

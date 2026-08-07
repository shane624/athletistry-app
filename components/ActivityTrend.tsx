export default function ActivityTrend({ data }: { data: { label: string; value: number }[] }) {
  const width = 720;
  const height = 220;
  const padX = 28;
  const padTop = 20;
  const padBottom = 36;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const pts = data.map((d, i) => {
    const x = padX + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = padTop + innerH - (d.value / max) * innerH;
    return { ...d, x, y };
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = pts.length ? `${line} L${pts[pts.length - 1].x},${padTop + innerH} L${pts[0].x},${padTop + innerH} Z` : "";

  return (
    <div className="activity-trend" aria-label="Monthly training activity">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" className="w-full h-auto">
        <defs>
          <linearGradient id="activityArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--c-teal)" stopOpacity=".18" />
            <stop offset="1" stopColor="var(--c-teal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, .33, .66, 1].map((t) => {
          const y = padTop + innerH * t;
          return <line key={t} x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--c-line)" strokeWidth="1" />;
        })}
        {area && <path d={area} fill="url(#activityArea)" />}
        {line && <path d={line} fill="none" stroke="var(--c-teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {pts.map((p) => <circle key={`${p.label}-${p.x}`} cx={p.x} cy={p.y} r="4" fill="var(--c-surface)" stroke="var(--c-teal)" strokeWidth="2.5" />)}
        {pts.map((p) => <text key={`label-${p.label}`} x={p.x} y={height - 10} textAnchor="middle" fontSize="11" fill="var(--c-grey)">{p.label}</text>)}
      </svg>
    </div>
  );
}

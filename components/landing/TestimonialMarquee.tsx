// Adapted from 21st.dev "Testimonials with Marquee" (serafimcloud): an
// infinite CSS marquee with edge fades that pauses on hover. No dependencies.
type T = { quote: string; name: string; role: string };

export default function TestimonialMarquee({ items }: { items: T[] }) {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden py-2">
      <div className="group flex [--gap:1rem] gap-[var(--gap)]">
        {[0, 1].map((k) => (
          <div key={k} aria-hidden={k === 1} className="lp-marquee flex shrink-0 gap-[var(--gap)] group-hover:[animation-play-state:paused]">
            {loop.map((t, i) => (
              <figure key={`${k}-${i}`} className="lp-card w-[320px] shrink-0 p-6 flex flex-col">
                <p className="text-[#075bb4] tracking-[.2em] text-[13px]">★★★★★</p>
                <blockquote className="text-[15px] leading-relaxed mt-3 flex-1 text-[#24272c]">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#073464] to-[#0d72d8] text-white text-[13px] font-bold flex items-center justify-center">
                    {t.name.charAt(0)}
                  </span>
                  <span><span className="block font-bold text-[14px]">{t.name}</span><span className="block text-[#70757b] text-[12px]">{t.role}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-1/5 bg-gradient-to-r from-[#f7f7f5] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-1/5 bg-gradient-to-l from-[#f7f7f5] to-transparent" />
    </div>
  );
}

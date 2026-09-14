"use client";

import * as React from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

// Adapted from "Count Up" by @unlumen on 21st.dev.
//
// Changes from the original: the `react-use-measure` dependency is gone (digit
// height is expressed in `em` so it tracks font-size without measuring), the
// shadcn `cn` helper is gone, and a reduced-motion branch renders the final
// value immediately. Everything else is the original's spring odometer.
type DigitEffect = "none" | "blur" | "slide";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  digitEffect?: DigitEffect;
  separator?: string;
  suffix?: string;
  className?: string;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function OdometerDigit({ springValue, place }: { springValue: MotionValue<number>; place: number }) {
  const y = useTransform(springValue, (v) => {
    const digit = Math.floor(Math.abs(v) / place) % 10;
    return `${-digit}em`;
  });

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: "1ch",
        height: "1em",
        overflow: "hidden",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <motion.span style={{ y, position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {/* 0-9 plus a repeated 0 so the 9 to 0 wrap has somewhere to land */}
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} style={{ height: "1em", lineHeight: 1, display: "block", textAlign: "center" }}>
            {i % 10}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function CountUp({
  to,
  from = 0,
  duration = 1.4,
  delay = 0,
  digitEffect = "slide",
  separator = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  });
  const isInView = useInView(ref, { once: true });

  const format = React.useCallback(
    (n: number) =>
      Intl.NumberFormat("en-AU", {
        useGrouping: !!separator,
        maximumFractionDigits: 0,
      })
        .format(n)
        .replace(/,/g, separator || ""),
    [separator],
  );

  React.useEffect(() => {
    if (!isInView || reduced) return;
    const t = setTimeout(() => motionValue.set(to), delay * 1000);
    return () => clearTimeout(t);
  }, [isInView, reduced, motionValue, to, delay]);

  // Reduced motion, or a value with nothing to count: render it plainly.
  if (reduced || digitEffect === "none" || !Number.isFinite(to)) {
    return (
      <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
        {format(to)}
        {suffix}
      </span>
    );
  }

  const target = format(to);
  const digitCount = target.replace(/\D/g, "").length;
  let seen = 0;

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-flex", alignItems: "baseline", fontVariantNumeric: "tabular-nums" }}
      aria-label={`${target}${suffix}`}
    >
      {target.split("").map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
        const placeFromRight = digitCount - 1 - seen;
        seen += 1;
        return <OdometerDigit key={i} springValue={springValue} place={Math.pow(10, placeFromRight)} />;
      })}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

export default CountUp;

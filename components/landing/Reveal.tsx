"use client";

// Adapted from 21st.dev "Reveal" (asanshay): fades + un-blurs content in as it
// scrolls into view, with optional stagger. Respects reduced-motion.
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const VARIANTS: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: (i: number = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

export default function Reveal({ children, className, index = 0 }: { children: ReactNode; className?: string; index?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={VARIANTS} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={index} className={className}>
      {children}
    </motion.div>
  );
}

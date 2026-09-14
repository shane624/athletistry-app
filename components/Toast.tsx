"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

// Visual treatment adapted from "Toast Notification" by @framecn on 21st.dev:
// the accent bubble behind the icon, the icon set, the spring entry curve and
// the layered shadow. The original is a presentational demo built for a video
// preview (it takes fps and durationInFrames and renders one fixed toast), so
// the queue, context, auto-dismiss, stacking and dark mode below are new, and
// the hardcoded palette is replaced with the app's own tokens.

export type ToastVariant = "success" | "error" | "info";

type Toast = { id: number; title: string; message?: string; variant: ToastVariant };

const ACCENT: Record<ToastVariant, string> = {
  success: "var(--c-teal)",
  error: "#c2410c",
  info: "var(--c-grey)",
};

function VariantIcon({ variant }: { variant: ToastVariant }) {
  const common = {
    fill: "none",
    height: 20,
    width: 20,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.2,
    viewBox: "0 0 24 24",
  };
  if (variant === "success") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12.5l2.8 2.8L16 9.8" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v.01M12 12v5" />
    </svg>
  );
}

const ToastContext = React.createContext<(t: Omit<Toast, "id">) => void>(() => {});

/** `const toast = useToast(); toast({ title: "Set saved", variant: "success" })` */
export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    // Three at a time is plenty; older ones drop off rather than stacking
    // down the screen during a fast set-logging session.
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed z-[60] flex flex-col gap-2 pointer-events-none
                   left-3 right-3 bottom-[calc(104px+env(safe-area-inset-bottom))]
                   sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px]"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t: Toast) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="toast-card pointer-events-auto flex items-start gap-3.5 px-4 py-3.5"
            >
              <span
                className="shrink-0 grid place-items-center rounded-full w-9 h-9"
                style={{ background: `color-mix(in srgb, ${ACCENT[t.variant]} 14%, transparent)`, color: ACCENT[t.variant] }}
              >
                <VariantIcon variant={t.variant} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-ink text-[13px] font-semibold tracking-[-.01em]">{t.title}</span>
                {t.message && <span className="block text-grey text-[11px] leading-snug mt-0.5">{t.message}</span>}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

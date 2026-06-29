"use client";

import { usePathname } from "next/navigation";
import Tour from "@/components/Tour";
import Icon from "@/components/Icon";
import { tourFor } from "@/lib/tour-steps";

// Drops the right walkthrough onto whatever page it's mounted on, chosen by
// route, plus a small always-visible launcher so the tour is reachable on every
// page (and every screen size). If no tour exists for the page, renders nothing.
export default function PageTour() {
  const pathname = usePathname();
  const steps = tourFor(pathname);
  if (!steps) return null;

  function start() {
    window.dispatchEvent(new Event("athl:start-tour"));
  }

  return (
    <>
      <Tour steps={steps} />
      {/* floating launcher — bottom-right, clear of the bottom tab bar */}
      <button
        onClick={start}
        aria-label="Show me around this page"
        className="fixed right-4 bottom-20 lg:bottom-6 z-40 inline-flex items-center gap-1.5 rounded-full bg-teal text-white shadow-lg px-4 py-2.5 text-sm font-semibold active:scale-95 transition"
      >
        <Icon name="sparkle" className="w-4 h-4" /> Show me around
      </button>
    </>
  );
}

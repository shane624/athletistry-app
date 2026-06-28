"use client";

import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { tourFor } from "@/lib/tour-steps";

// Launches the page's walkthrough. Renders nothing on pages with no tour.
export default function TourButton({ label = "Show me around", className = "" }: { label?: string; className?: string }) {
  const pathname = usePathname();
  if (!tourFor(pathname)) return null;
  function start() {
    window.dispatchEvent(new Event("athl:start-tour"));
  }
  return (
    <button onClick={start} className={`inline-flex items-center gap-1.5 text-teal text-sm font-semibold ${className}`}>
      <Icon name="sparkle" className="w-4 h-4" /> {label}
    </button>
  );
}

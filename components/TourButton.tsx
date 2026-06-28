"use client";

import Icon from "@/components/Icon";

// Launches the coach-mark tour anytime. Place on screens that have a Tour.
export default function TourButton({ label = "Show me around", className = "" }: { label?: string; className?: string }) {
  function start() {
    window.dispatchEvent(new Event("athl:start-tour"));
  }
  return (
    <button onClick={start} className={`inline-flex items-center gap-1.5 text-teal text-sm font-semibold ${className}`}>
      <Icon name="sparkle" className="w-4 h-4" /> {label}
    </button>
  );
}

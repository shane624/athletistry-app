"use client";

import { useState } from "react";
import { toggleSave } from "@/lib/saved-actions";

// Bookmark toggle. Optimistic; reverts on error.
export default function SaveButton({
  itemKey, title, subtitle, href, kind = "other", initialSaved = false, className = "",
}: {
  itemKey: string; title: string; subtitle?: string; href: string; kind?: string;
  initialSaved?: boolean; className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const optimistic = !saved;
    setSaved(optimistic);
    setBusy(true);
    const res = await toggleSave({ itemKey, title, subtitle, href, kind });
    if (!res.ok) setSaved(!optimistic);
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove bookmark" : "Save"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition ${saved ? "bg-teal text-white" : "bg-black/25 text-white hover:bg-black/40"} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

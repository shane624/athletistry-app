"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listExercises } from "@/lib/data";
import { STATIC_INDEX, searchItems, type SearchItem } from "@/lib/search-index";

const KIND_LABEL: Record<string, string> = {
  page: "Pages", exercise: "Exercises", move: "Ballet moves", program: "Programs", class: "Classes",
};
const KIND_ORDER = ["exercise", "page", "move", "program", "class"];

export default function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [exItems, setExItems] = useState<SearchItem[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function ensureExercises() {
    if (loaded) return;
    setLoaded(true);
    try {
      const list = await listExercises();
      setExItems(list.map((e) => ({
        kind: "exercise" as const,
        title: e.name,
        subtitle: `${e.category} · level ${e.level}`,
        href: `/exercises?focus=${e.id}`,
        keywords: `${e.name} ${e.category}`.toLowerCase(),
      })));
    } catch { /* Search still works for static routes. */ }
  }

  const all = useMemo(() => [...exItems, ...STATIC_INDEX], [exItems]);
  const results = useMemo(() => searchItems(all, q, 14), [all, q]);
  const grouped = useMemo(() => {
    const byKind: Record<string, SearchItem[]> = {};
    for (const r of results) (byKind[r.kind] ??= []).push(r);
    return KIND_ORDER.filter((k) => byKind[k]?.length).map((k) => ({ kind: k, items: byKind[k] }));
  }, [results]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(item: SearchItem) {
    setOpen(false);
    setQ("");
    router.push(item.href);
    router.refresh();
  }

  return (
    <div ref={boxRef} className="relative flex-1 max-w-[340px]">
      <div className="search-shell flex items-center gap-2.5 rounded-full px-3.5 h-9">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0 text-grey">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.7" />
          <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => { ensureExercises(); setOpen(true); }}
          placeholder="Search Athletistry"
          className="bg-transparent text-ink text-[13px] placeholder:text-grey outline-none w-full"
          aria-label="Search the app"
        />
        {q && <button onClick={() => setQ("")} className="text-grey text-xs shrink-0" aria-label="Clear">✕</button>}
      </div>

      {open && q && (
        <div className="absolute left-0 right-0 mt-2 z-40 bg-white/95 rounded-[20px] shadow-2xl border border-black/[.07] max-h-[60vh] overflow-y-auto backdrop-blur-xl" style={{ minWidth: 300 }}>
          {grouped.length === 0 ? (
            <p className="text-grey text-sm p-4">No matches for “{q}”.</p>
          ) : (
            grouped.map((g) => (
              <div key={g.kind} className="py-1.5">
                <p className="px-4 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[.18em] text-grey">{KIND_LABEL[g.kind]}</p>
                {g.items.map((it, i) => (
                  <button key={g.kind + i} onClick={() => go(it)} className="w-full text-left px-4 py-2.5 hover:bg-light flex items-center justify-between gap-2 transition">
                    <span className="min-w-0">
                      <span className="block text-navy text-sm font-medium truncate">{it.title}</span>
                      {it.subtitle && <span className="block text-grey text-xs truncate">{it.subtitle}</span>}
                    </span>
                    <span className="text-teal text-xs shrink-0">→</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

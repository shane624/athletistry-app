"use client";

// Training calendar — redesigned after 21st.dev "Calendar With Event List"
// (tap a day → its agenda appears underneath, no modal per tap) with the
// spring-animated segmented pill from 21st.dev "Day Picker". Built on the
// app's existing `motion` library — no new dependencies.
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { logSession, logRecurring, deleteSession } from "@/lib/load-actions";
import { CLASS_GROUPS, classColor, classLabel, classPreset } from "@/lib/classes";
import { sessionTrimp, effortWord } from "@/lib/load";
import Dots from "@/components/Dots";
import ExerciseVideo from "@/components/ExerciseVideo";

interface SessionRow { id: number; session_date: string; kind: string; duration_min: number; rpe: number; note: string | null; start_time: string | null; }
interface EventRow { id: number; event_date: string; kind: string; name: string; }
interface PlanExercise { id: number; name: string; youtube_id: string; cloudinary_id?: string | null; level: number; category: string; }
interface PlanDay { date: string; sessionType: string; title: string; detail: string; exercises: PlanExercise[]; }

type View = "month" | "week";

function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function fromYmd(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function mondayOf(d: Date) { return addDays(d, -((d.getDay() + 6) % 7)); }
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const DOW_LONG = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PLAN_LABEL: Record<string, string> = { strength: "Strength", hypertrophy: "Hypertrophy", endurance: "Endurance", cardio: "Cardio", tabata: "Tabata", rest: "Rest" };
const PLAN_COLOR: Record<string, string> = { strength: "#073464", hypertrophy: "#075bb4", endurance: "#56c2b0", cardio: "#4aa3df", tabata: "#e0833a", rest: "#9aa3b5" };

const SPRING = { type: "spring", damping: 30, stiffness: 400, mass: 1 } as const;
const HEAT_CEILING = 630; // ≈ a hard session (90 min × RPE 7); days at/above saturate

function fmtTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${ampm}`;
}

export default function Calendar({ sessions, events, planDays = [] }: { sessions: SessionRow[]; events: EventRow[]; planDays?: PlanDay[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const today = new Date();
  const todayISO = ymd(today);

  const [view, setView] = useState<View>("month");
  const [selected, setSelected] = useState<string>(todayISO);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); // month shown
  const [dir, setDir] = useState(0); // slide direction for month/week changes
  const [addOpen, setAddOpen] = useState(false);
  const [viewPlan, setViewPlan] = useState<PlanDay | null>(null);
  const [openVid, setOpenVid] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // add-form state
  const [kind, setKind] = useState("ballet");
  const [time, setTime] = useState("");
  const [dur, setDur] = useState("90");
  const [rpe, setRpe] = useState(6);
  const [search, setSearch] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [weeks, setWeeks] = useState("8");

  // index data by day
  const { byDay, evByDay, planByDay } = useMemo(() => {
    const byDay = new Map<string, SessionRow[]>();
    for (const s of sessions) { const a = byDay.get(s.session_date) ?? []; a.push(s); byDay.set(s.session_date, a); }
    for (const a of byDay.values()) a.sort((x, y) => (x.start_time ?? "99").localeCompare(y.start_time ?? "99"));
    const evByDay = new Map<string, EventRow[]>();
    for (const e of events) { const a = evByDay.get(e.event_date) ?? []; a.push(e); evByDay.set(e.event_date, a); }
    const planByDay = new Map<string, PlanDay>();
    for (const p of planDays) planByDay.set(p.date, p);
    return { byDay, evByDay, planByDay };
  }, [sessions, events, planDays]);

  const loadOf = (iso: string) => (byDay.get(iso) ?? []).reduce((sum, s) => sum + sessionTrimp(s.duration_min, s.rpe), 0);
  const heatBg = (load: number) => load > 0
    ? `color-mix(in srgb, var(--c-teal) ${(6 + Math.min(1, load / HEAT_CEILING) * 26).toFixed(1)}%, var(--c-surface))`
    : undefined;

  // ── navigation ────────────────────────────────────────────────────────────
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const selDate = fromYmd(selected);
  const weekStart = mondayOf(selDate);

  function goMonth(delta: number) {
    setDir(delta);
    const next = new Date(year, month + delta, 1);
    setCursor(next);
    // keep a sensible selection inside the new month
    const inMonth = today.getFullYear() === next.getFullYear() && today.getMonth() === next.getMonth();
    setSelected(inMonth ? todayISO : ymd(next));
  }
  function goWeek(delta: number) {
    setDir(delta);
    const next = addDays(selDate, delta * 7);
    setSelected(ymd(next));
    setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
  }
  const step = (delta: number) => (view === "month" ? goMonth(delta) : goWeek(delta));
  function goToday() {
    setDir(selected < todayISO ? 1 : -1);
    setSelected(todayISO);
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }
  function pick(d: Date) {
    const iso = ymd(d);
    setSelected(iso);
    if (d.getMonth() !== month || d.getFullYear() !== year) setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  // swipe left/right to change month/week
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x, dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  };

  // month grid (Mon-first, including leading/trailing days from adjacent months)
  const gridStart = mondayOf(new Date(year, month, 1));
  const monthCells: Date[] = [];
  for (let i = 0; i < 42; i++) monthCells.push(addDays(gridStart, i));
  const lastRowNeeded = monthCells.slice(35).some((d) => d.getMonth() === month);
  const cells = lastRowNeeded ? monthCells : monthCells.slice(0, 35);
  const weekCells = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // header title
  const title = view === "month"
    ? MONTHS[month]
    : `${weekCells[0].getDate()} ${MONTHS[weekCells[0].getMonth()].slice(0, 3)} – ${weekCells[6].getDate()} ${MONTHS[weekCells[6].getMonth()].slice(0, 3)}`;
  const weekLoad = weekCells.reduce((s, d) => s + loadOf(ymd(d)), 0);

  // ── add sheet ─────────────────────────────────────────────────────────────
  function openAdd() {
    setAddOpen(true);
    const p = classPreset(kind);
    if (p) { setDur(String(p.defaultMin)); setRpe(p.defaultRpe); }
  }
  function pickKind(k: string) {
    setKind(k);
    const p = classPreset(k);
    if (p) { setDur(String(p.defaultMin)); setRpe(p.defaultRpe); }
  }
  function closeAdd() { setAddOpen(false); setTime(""); setSearch(""); setRecurring(false); }
  async function saveClass() {
    const durMin = Math.max(1, Math.min(600, Number(dur) || 0));
    const wk = Math.max(1, Math.min(52, Number(weeks) || 1));
    setBusy(true);
    if (recurring) await logRecurring({ kind, durationMin: durMin, rpe, date: selected, startTime: time || undefined, weeks: wk });
    else await logSession({ kind, durationMin: durMin, rpe, date: selected, startTime: time || undefined });
    setBusy(false); closeAdd();
    router.refresh();
  }
  async function removeSession(id: number) { setBusy(true); await deleteSession(id); setBusy(false); router.refresh(); }

  const q = search.trim().toLowerCase();
  const filteredGroups = CLASS_GROUPS
    .map((g) => ({ title: g.title, items: g.items.filter((it) => !q || it.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);

  // selected-day agenda
  const daySessions = byDay.get(selected) ?? [];
  const dayEvents = evByDay.get(selected) ?? [];
  const dayPlan = planByDay.get(selected);
  const dayLoad = loadOf(selected);
  const selLabel = selDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  const slide = reduce ? {} : {
    initial: { opacity: 0, x: dir * 28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: dir * -28 },
    transition: { duration: 0.22, ease: "easeOut" },
  };

  // one day cell (shared by month + week views)
  function DayCell({ d, big }: { d: Date; big?: boolean }) {
    const iso = ymd(d);
    const outside = view === "month" && d.getMonth() !== month;
    const isSel = iso === selected, isToday = iso === todayISO;
    const s = byDay.get(iso) ?? [];
    const plan = planByDay.get(iso);
    const ev = evByDay.get(iso) ?? [];
    const load = loadOf(iso);
    return (
      <button
        onClick={() => pick(d)}
        aria-label={`${d.toDateString()}${s.length ? `, ${s.length} session${s.length > 1 ? "s" : ""}` : ""}`}
        aria-pressed={isSel}
        className={`relative flex flex-col items-center justify-start rounded-2xl transition-colors ${big ? "py-2.5 gap-1" : "pt-1.5 pb-2 gap-1"} ${outside ? "opacity-35" : ""}`}
        style={{ minHeight: big ? 86 : 54, background: isSel ? undefined : heatBg(load) }}
      >
        {isSel && <motion.span layoutId="cal-sel" transition={SPRING} className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0d72d8] to-[#075bb4] shadow-[0_8px_18px_rgba(7,91,180,.35)]" />}
        {big && <span className={`relative text-[10px] font-bold uppercase tracking-[.12em] ${isSel ? "text-white/75" : "text-grey"}`}>{DOW_LONG[(d.getDay() + 6) % 7]}</span>}
        <span className={`relative leading-none ${big ? "text-[20px] font-display font-bold" : "text-[13px] font-semibold"} ${isSel ? "text-white" : isToday ? "text-teal" : "text-ink"}`}>
          {d.getDate()}
          {isToday && !isSel && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal" />}
        </span>
        <span className="relative flex items-center justify-center gap-[3px] flex-wrap max-w-[90%] mt-0.5">
          {ev.length > 0 && <span className={`text-[9px] leading-none ${isSel ? "text-white" : "text-[#d4a017]"}`}>★</span>}
          {plan && plan.sessionType !== "rest" && (
            <span className="w-[7px] h-[7px] rotate-45 rounded-[1px]" style={{ background: isSel ? "#fff" : PLAN_COLOR[plan.sessionType] ?? "#075bb4" }} />
          )}
          {s.slice(0, 3).map((x) => (
            <span key={x.id} className="w-[6px] h-[6px] rounded-full" style={{ background: isSel ? "rgba(255,255,255,.9)" : classColor(x.kind) }} />
          ))}
          {s.length > 3 && <span className={`text-[8px] font-bold leading-none ${isSel ? "text-white" : "text-grey"}`}>+{s.length - 3}</span>}
        </span>
      </button>
    );
  }

  return (
    <div className="card p-4 sm:p-5 animate-in">
      {/* ── header ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="eyebrow">{view === "month" ? year : weekCells[0].getFullYear()}</p>
          <p className="font-display text-[26px] leading-none font-bold text-ink mt-1 truncate">
            {title}{view === "week" && <span className="text-grey text-[13px] font-sans font-semibold normal-case ml-2">{Math.round(weekLoad)} load</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {selected !== todayISO && (
            <button onClick={goToday} className="h-9 px-3 rounded-xl text-[12px] font-bold text-teal border border-line bg-surface">Today</button>
          )}
          <button aria-label="Previous" onClick={() => step(-1)} className="w-9 h-9 rounded-xl border border-line bg-surface text-ink grid place-items-center">&#8249;</button>
          <button aria-label="Next" onClick={() => step(1)} className="w-9 h-9 rounded-xl border border-line bg-surface text-ink grid place-items-center">&#8250;</button>
        </div>
      </div>

      {/* ── month / week toggle (21st.dev Day Picker spring pill) ── */}
      <div className="relative mt-4 grid grid-cols-2 p-1 rounded-full bg-light w-full max-w-[240px]">
        {(["month", "week"] as View[]).map((v) => (
          <button key={v} onClick={() => { setDir(0); setView(v); }} className={`relative z-10 py-1.5 text-[12px] font-bold capitalize transition-colors ${view === v ? "text-ink" : "text-grey"}`}>
            {view === v && <motion.span layoutId="cal-view" transition={SPRING} className="absolute inset-0 -z-10 rounded-full bg-surface shadow-[0_2px_8px_rgba(22,33,48,.12)]" />}
            {v}
          </button>
        ))}
      </div>

      {/* ── grid ── */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="mt-4 overflow-hidden">
        {view === "month" && (
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DOW.map((d, i) => <div key={i} className="text-[10px] text-grey font-bold uppercase tracking-[.12em]">{d}</div>)}
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view === "month" ? `m-${year}-${month}` : `w-${ymd(weekStart)}`} {...slide} className="grid grid-cols-7 gap-1">
            {(view === "month" ? cells : weekCells).map((d) => <DayCell key={ymd(d)} d={d} big={view === "week"} />)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── selected-day agenda (21st.dev Calendar With Event List) ── */}
      <div className="mt-4 pt-4 border-t border-line">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-ink text-[15px] truncate">{selected === todayISO ? "Today" : selLabel}</p>
            <p className="text-grey text-[12px]">
              {selected === todayISO && <>{selLabel} · </>}
              {dayLoad > 0 ? <>{Math.round(dayLoad)} load · {effortWord(Math.round(daySessions.reduce((a, s) => a + s.rpe, 0) / daySessions.length))}</> : "Nothing logged"}
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary !min-h-0 h-10 px-4 text-[13px] shrink-0">+ Add</button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selected} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-3 flex flex-col gap-2">
            {dayEvents.map((e) => (
              <div key={"e" + e.id} className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: "rgba(212,160,23,.1)" }}>
                <span className="text-[#d4a017] text-[14px]">★</span>
                <span className="flex-1 min-w-0 truncate text-[14px] font-semibold text-ink">{e.name || e.kind}</span>
                <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#a67c00]">Event</span>
              </div>
            ))}

            {dayPlan && dayPlan.sessionType !== "rest" && (
              <button onClick={() => { setOpenVid(null); setViewPlan(dayPlan); }}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left bg-bluewash hover:opacity-90 transition-opacity">
                <span className="w-2 h-2 rotate-45 shrink-0" style={{ background: PLAN_COLOR[dayPlan.sessionType] ?? "#075bb4" }} />
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-ink">{dayPlan.title}</span>
                  <span className="block text-[11px] text-grey">Your plan · {PLAN_LABEL[dayPlan.sessionType] ?? dayPlan.sessionType}{dayPlan.exercises.length ? ` · ${dayPlan.exercises.length} exercises` : ""}</span>
                </span>
                <span className="text-teal text-[12px] font-bold shrink-0">Open ›</span>
              </button>
            )}
            {dayPlan?.sessionType === "rest" && (
              <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3 bg-light">
                <span className="w-2 h-2 rounded-full bg-[#9aa3b5]" />
                <span className="text-[14px] font-semibold text-grey">Planned rest day</span>
              </div>
            )}

            {daySessions.map((s) => {
              const c = classColor(s.kind);
              return (
                <div key={s.id} className="group flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: `color-mix(in srgb, ${c} 10%, transparent)` }}>
                  <span className="w-1 self-stretch rounded-full shrink-0" style={{ background: c }} />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-ink">{classLabel(s.kind)}</span>
                    <span className="block text-[11px] text-grey">{s.duration_min} min · {effortWord(s.rpe)} (RPE {s.rpe}) · {sessionTrimp(s.duration_min, s.rpe)} load</span>
                  </span>
                  {fmtTime(s.start_time) && <span className="text-[12px] font-bold shrink-0" style={{ color: c }}>{fmtTime(s.start_time)}</span>}
                  <button aria-label={`Remove ${classLabel(s.kind)}`} disabled={busy} onClick={() => removeSession(s.id)}
                    className="w-7 h-7 rounded-full grid place-items-center text-grey hover:text-red-600 hover:bg-white/60 shrink-0">✕</button>
                </div>
              );
            })}

            {daySessions.length === 0 && dayEvents.length === 0 && !dayPlan && (
              <button onClick={openAdd} className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-grey text-[13px] hover:border-teal hover:text-teal transition-colors">
                No training logged. <b>Add a class</b> — or enjoy the rest.
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* legend */}
      <div className="flex items-center justify-between gap-3 flex-wrap mt-5">
        <p className="text-grey text-[10px] leading-relaxed">● class &nbsp; ◆ plan &nbsp; ★ event · swipe to change {view}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-grey font-bold uppercase tracking-[.1em]">Lighter</span>
          {[0, .25, .5, .75, 1].map((h) => (
            <span key={h} className="w-3.5 h-3.5 rounded-[5px]" style={{ background: h === 0 ? "var(--c-surface)" : `color-mix(in srgb, var(--c-teal) ${(6 + h * 26).toFixed(1)}%, var(--c-surface))`, boxShadow: "inset 0 0 0 1px rgba(28,33,40,.08)" }} />
          ))}
          <span className="text-[9px] text-grey font-bold uppercase tracking-[.1em]">Heavier</span>
        </div>
      </div>

      {/* ── plan-day sheet ── */}
      <AnimatePresence>
        {viewPlan && (
          <Sheet onClose={() => setViewPlan(null)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{fromYmd(viewPlan.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
                <p className="font-display text-[24px] font-bold text-ink leading-tight mt-1">{viewPlan.title}</p>
              </div>
              <button className="w-8 h-8 rounded-full grid place-items-center text-grey bg-light" onClick={() => setViewPlan(null)}>✕</button>
            </div>
            {viewPlan.detail && <p className="text-grey text-sm mt-2">{viewPlan.detail}</p>}
            {viewPlan.exercises.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {viewPlan.exercises.map((ex) => (
                  <div key={ex.id} className="rounded-2xl border border-line p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink text-sm truncate">{ex.name}</p>
                        <p className="text-xs text-grey mt-0.5">Level {ex.level} · {ex.category}</p>
                      </div>
                      {openVid !== ex.id && <button className="btn-ghost !min-h-0 h-8 px-3 text-[12px]" onClick={() => setOpenVid(ex.id)}>Watch ▸</button>}
                    </div>
                    {openVid === ex.id && <div className="mt-2"><ExerciseVideo cloudinaryId={ex.cloudinary_id} youtubeId={ex.youtube_id} title={ex.name} /></div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grey text-sm mt-4">
                {viewPlan.sessionType === "cardio" ? "Steady-state cardio — log it once you're done."
                  : viewPlan.sessionType === "tabata" ? "A Tabata circuit — open Circuit Training to run it."
                  : "No specific exercises for this session."}
              </p>
            )}
          </Sheet>
        )}
      </AnimatePresence>

      {/* ── add sheet ── */}
      <AnimatePresence>
        {addOpen && (
          <Sheet onClose={closeAdd}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Add training</p>
                <p className="font-display text-[24px] font-bold text-ink leading-tight mt-1">{selDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>
              <button className="w-8 h-8 rounded-full grid place-items-center text-grey bg-light" onClick={closeAdd}>✕</button>
            </div>

            <input className="input mt-4" placeholder="Search… ballet, swimming, gym…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="mt-3 space-y-3">
              {filteredGroups.map((g) => (
                <div key={g.title}>
                  <p className="text-grey text-[11px] font-semibold uppercase tracking-wide">{g.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {g.items.map((p) => (
                      <button key={p.kind} onClick={() => pickKind(p.kind)}
                        className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${kind === p.kind ? "text-white border-transparent" : "bg-surface border-line text-grey"}`}
                        style={kind === p.kind ? { background: p.color } : {}}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && <p className="text-grey text-sm">No match — log it as &ldquo;Other sport&rdquo;.</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <label className="block">
                <span className="text-xs text-grey">Start time</span>
                <input type="time" className="input mt-1" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs text-grey">Minutes</span>
                <input className="input mt-1" inputMode="numeric" value={dur}
                  onChange={(e) => setDur(e.target.value.replace(/[^0-9]/g, ""))}
                  onBlur={() => setDur(String(Math.max(1, Math.min(600, Number(dur) || 0))))} />
              </label>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[45, 60, 90, 120].map((m) => (
                <button key={m} onClick={() => setDur(String(m))} className={`flex-1 rounded-xl py-1.5 text-[12px] font-bold border ${Number(dur) === m ? "bg-bluewash border-teal text-teal" : "border-line text-grey"}`}>{m}m</button>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-grey">How hard did it feel?</span>
                <span className="text-sm font-bold text-ink">{rpe} · {effortWord(rpe)}</span>
              </div>
              <div className="grid grid-cols-10 gap-1 mt-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setRpe(n)} aria-label={`Effort ${n}`}
                    className={`h-9 rounded-lg text-[12px] font-bold transition-colors ${n === rpe ? "text-white" : n < rpe ? "text-teal" : "text-grey"}`}
                    style={{ background: n === rpe ? "var(--c-teal)" : n < rpe ? "var(--c-bluewash)" : "var(--c-light)" }}>{n}</button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-grey mt-1"><span>easy</span><span>max</span></div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-light px-4 py-3 mt-4">
              <span className="text-sm text-grey">Training load</span>
              <span className="font-display text-[22px] font-bold text-ink">{sessionTrimp(Number(dur) || 0, rpe)}</span>
            </div>

            <label className="flex items-center justify-between gap-3 mt-4 cursor-pointer">
              <span className="text-sm text-ink font-medium">Repeat every {DOW_LONG[(selDate.getDay() + 6) % 7]}</span>
              <input type="checkbox" className="accent-teal w-5 h-5" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
            </label>
            {recurring && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-grey">for</span>
                <input className="input !w-20" inputMode="numeric" value={weeks}
                  onChange={(e) => setWeeks(e.target.value.replace(/[^0-9]/g, ""))}
                  onBlur={() => setWeeks(String(Math.max(1, Math.min(52, Number(weeks) || 1))))} />
                <span className="text-sm text-grey">weeks</span>
              </div>
            )}

            <button className="btn-primary w-full mt-5 h-12" disabled={busy || !dur} onClick={saveClass}>
              {busy ? <Dots /> : recurring ? `Add ${classLabel(kind)} × ${weeks} weeks` : `Add ${classLabel(kind)}`}
            </button>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Bottom sheet on phones, centred card on larger screens. */
function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "rgba(7,20,40,.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 380 }}
        className="w-full sm:max-w-md bg-surface rounded-t-[28px] sm:rounded-[28px] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] max-h-[88vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,.2)]"
        onClick={(e) => e.stopPropagation()}>
        <div className="sm:hidden mx-auto -mt-1 mb-3 w-10 h-1.5 rounded-full bg-line" />
        {children}
      </motion.div>
    </motion.div>
  );
}

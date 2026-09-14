import Link from "next/link";
import Icon from "@/components/Icon";
import { classColor } from "@/lib/classes";
import type { WeekRhythm as Rhythm } from "@/lib/week-rhythm";

// This week as a day-grouped list rather than a grid.
//
// The month calendar answers "how has my load been trending", which is a
// planning question you ask occasionally. The daily question is narrower:
// what have I done this week, and what is left. A list answers that in one
// glance; a 35-cell grid makes you find the current week first.

function timeLabel(startTime: string | null): string | null {
  if (!startTime) return null;
  const [h, m] = startTime.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour)) return null;
  const suffix = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m ?? "00"}${suffix}`;
}

function Bar({ label, value, average, unit }: { label: string; value: number; average: number | null; unit: string }) {
  // Scale against the average so the bar reads as "compared with your usual",
  // not against an invented target. Cap the fill so a big week doesn't
  // overflow, but still say the real number.
  const pct = average && average > 0 ? Math.min(100, (value / (average * 1.5)) * 100) : value > 0 ? 100 : 0;
  return (
    <div className="rhythm-bar-row">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ink text-[11px] font-semibold">{label}</span>
        <span className="text-grey text-[10px]">
          <b className="text-ink">{value}</b>
          {unit}
          {average !== null && <> · usually {average}{unit}</>}
        </span>
      </div>
      <div className="rhythm-bar-track mt-2">
        <span style={{ width: `${pct}%` }} />
        {average !== null && average > 0 && (
          <i className="rhythm-bar-mark" style={{ left: `${Math.min(100, (1 / 1.5) * 100)}%` }} aria-hidden />
        )}
      </div>
    </div>
  );
}

export default function WeekRhythm({ rhythm }: { rhythm: Rhythm }) {
  const trained = rhythm.days.filter((d) => d.sessions.length > 0);

  return (
    <section className="mt-9 animate-in" aria-label="This week">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-3">
        <div>
          <p className="eyebrow">This week</p>
          <h2 className="dashboard-section-title mt-1">What you&apos;ve done.</h2>
        </div>
        <Link href="/load" className="text-[12px] font-bold text-teal hover:text-tealdark">Training calendar →</Link>
      </div>

      <div className="panel overflow-hidden">
        {trained.length === 0 ? (
          <div className="px-4 py-7 text-center">
            <p className="text-ink text-[12px] font-semibold">Nothing logged this week yet</p>
            <p className="text-grey text-[10px] mt-1.5 max-w-[36ch] mx-auto leading-relaxed">
              Log a class or rehearsal on the calendar and the week fills in here.
            </p>
            <Link href="/load" className="btn-ghost !min-h-[38px] !text-[11px] mt-4">Log a class</Link>
          </div>
        ) : (
          rhythm.days.map((d) =>
            d.sessions.length === 0 ? null : (
              <div key={d.iso} className="rhythm-day">
                <span className={`rhythm-daymark ${d.isToday ? "rhythm-daymark-today" : ""}`}>
                  <span className="rhythm-daymark-dow">{d.weekday}</span>
                  <span className="rhythm-daymark-num">{d.dayNum}</span>
                </span>
                <span className="flex-1 min-w-0">
                  {d.sessions.map((s) => (
                    <span key={s.id} className="rhythm-session">
                      <span className="rhythm-swatch" style={{ background: classColor(s.kind) }} aria-hidden />
                      <span className="rhythm-session-name">{s.label}</span>
                      <span className="rhythm-session-meta">
                        {timeLabel(s.startTime) ? `${timeLabel(s.startTime)} · ` : ""}{s.durationMin} min
                      </span>
                    </span>
                  ))}
                </span>
                <Icon name="check" className="w-3.5 h-3.5 text-teal shrink-0" />
              </div>
            ),
          )
        )}
      </div>

      {(rhythm.sessionCount > 0 || rhythm.hasHistory) && (
        <div className="panel panel-pad mt-3">
          <Bar label="Sessions" value={rhythm.sessionCount} average={rhythm.avgSessions} unit="" />
          <div className="mt-4">
            <Bar label="Minutes trained" value={rhythm.minutes} average={rhythm.avgMinutes} unit=" min" />
          </div>
          {!rhythm.hasHistory && (
            <p className="text-grey text-[9px] leading-relaxed mt-3">
              Once you have a few weeks logged, these compare against your own average.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

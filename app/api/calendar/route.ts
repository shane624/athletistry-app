import { createClient } from "@/lib/supabase-server";
import { DAY_TITLES, blockForWeek, BLOCK_LABEL } from "@/lib/program";

export const dynamic = "force-dynamic";

// Generates an .ics feed: 4 training days/week (Mon, Tue, Thu, Fri) for all 24 weeks,
// starting from the user's program_start_date. Import into Apple/Google Calendar.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("program_start_date").eq("id", user.id).single();
  const start = new Date(profile?.program_start_date ?? new Date());

  // align start to the Monday of its week
  const monday = new Date(start);
  const dow = (monday.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(monday.getDate() - dow);

  const trainOffsets = [0, 1, 3, 4]; // Mon, Tue, Thu, Fri
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Athletistry//24-Week Program//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (let week = 1; week <= 24; week++) {
    const block = blockForWeek(week);
    trainOffsets.forEach((off, dayIdx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + (week - 1) * 7 + off);
      const dNext = new Date(d);
      dNext.setDate(d.getDate() + 1);
      const uid = `w${week}d${dayIdx}-${user.id}@athletistry`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${fmt(new Date())}T080000Z`,
        `DTSTART;VALUE=DATE:${fmt(d)}`,
        `DTEND;VALUE=DATE:${fmt(dNext)}`,
        `SUMMARY:Athletistry W${week} — ${DAY_TITLES[dayIdx]}`,
        `DESCRIPTION:${BLOCK_LABEL[block]} block. Open the app for today's targets and videos.`,
        "BEGIN:VALARM",
        "TRIGGER:-PT3H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Training day — Athletistry",
        "END:VALARM",
        "END:VEVENT"
      );
    });
  }
  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="athletistry-24week.ics"',
    },
  });
}

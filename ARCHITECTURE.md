# Athletistry Training App — Architecture & Implementation Plan

A multi-user web app that delivers the 24-week periodized program, plays each exercise
video inline, and tracks weight/reps/progression per user, week by week.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Full-stack React: UI + API routes in one deploy. |
| Auth + DB | **Supabase** (Postgres + Auth) | Email/password & magic-link auth, Postgres with Row-Level Security so each user only sees their own data. Generous free tier. |
| Styling | **Tailwind CSS** | Fast, consistent. Brand colors (navy `#1f2a44`, teal `#27ae9f`) preset in the theme. |
| Charts | **Recharts** | Progress graphs (weight/volume over weeks). |
| Hosting | **Vercel** (app) + Supabase cloud (data) | One-click deploy, free tier for both. |

## Data model (Postgres / Supabase)

- **profiles** — one row per user (`id` = auth user id, `display_name`, `program_start_date`, `experience_level`). Drives the week engine.
- **exercises** — the 58-exercise library (`name`, `youtube_id`, `level 1–4`, `category`). Seeded once, shared by all users.
- **program_days** — the 4-day split definition (`day_index`, `title`, `focus`).
- **program_day_exercises** — ordered exercises per day (`day_id`, `exercise_id`, `order`).
- **set_logs** — the heart of tracking: one row per logged set
  (`user_id`, `exercise_id`, `week` 1–24, `day_index`, `set_number`, `weight`, `reps`, `logged_at`).
- **user_program_state** — per-user position (`current_week`, optional manual override).

RLS: `set_logs`, `profiles`, `user_program_state` are filtered to `auth.uid() = user_id`.
`exercises`, `program_days`, `program_day_exercises` are world-readable (reference data).

## The 24-week engine (`lib/program.ts`)

Pure functions, no DB:
- `weekFromStartDate(start)` → current week 1–24 (clamps; supports a manual override).
- `blockForWeek(week)` → `"hypertrophy" | "strength" | "endurance"`.
- `prescription(week)` → `{ sets, repLow, repHigh, tempo, restSec, notes }`:
  - **Hypertrophy (1–8):** 3 sets, 8–12, tempo waves `3:1:1 → 4:1:1 → 5:1:1 → 6:1:1` every 2 weeks.
  - **Strength (9–16):** 4 sets, 6–8, tempo `2:1:1`.
  - **Endurance (17–24):** 3 sets, 15–25 light, + AMRAP/EMOM finisher (8–10 reps each).
- `progressionHint(history)` → applies the double-progression rule
  (hit top reps on 2 sets → suggest a weight bump next session).

## API / server actions

Using Next.js server actions + Supabase server client:
- `getToday()` — resolves week → block → today's day → exercises + prescription + the user's last logged numbers for each (so the form pre-fills targets).
- `logSet(exerciseId, setNumber, weight, reps)` — upsert into `set_logs`.
- `getProgress(exerciseId)` — series of (week, top weight, total volume) for charts.
- `exportIcs()` — generates an `.ics` calendar feed of workout days (v2; calendar feature).

## Screens

1. **/login** — Supabase email auth (password or magic link).
2. **/dashboard (Today)** — current week & block banner, today's day, each exercise card:
   embedded YouTube player, target sets×reps×tempo, per-set weight/rep inputs, progression hint.
3. **/progress** — pick an exercise → line chart of top set weight & volume across weeks.
4. **/exercises** — full searchable library, filter by level/category, inline video.
5. **/settings** — program start date, reminder opt-in, calendar export.

## Calendar & reminders (phased)

- **v1:** in-app "today's workout" + browser Notifications API opt-in (works while permitted).
- **v2 (calendar):** `.ics` export and add-to-calendar links (Apple/Google) — no server sync needed.
- **v3 (true sync/push):** Google Calendar OAuth + a scheduled function (Supabase Edge Function / cron) for push reminders. Documented as a roadmap item; needs OAuth credentials.

## Security & privacy

- Auth handled by Supabase; passwords never touch app code.
- RLS guarantees user data isolation at the database layer.
- Server actions use the user's session; no service-role key in the browser.
- `.env.local` holds keys (gitignored); `.env.example` documents what's needed.

## Run locally

```bash
npm install
cp .env.example .env.local        # fill in Supabase URL + anon key
# in Supabase SQL editor, run supabase/schema.sql then supabase/seed.sql
npm run dev                        # http://localhost:3000
```

## Deploy

1. Create a Supabase project; run `schema.sql` + `seed.sql`.
2. Push repo to GitHub; import into Vercel.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env.
4. Deploy. Enable email auth in Supabase Auth settings.

## Roadmap after v1

- Coach view (trainer sees clients' logs) — add `coach_id` + policies.
- Auto-deload weeks, 1RM estimates, PR badges.
- Native push via PWA + web-push.
- Two-way Google Calendar sync.

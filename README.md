# Athletistry — 24-Week Training App

A multi-user web app for the Athletistry 24-week periodized program. Users sign in, see
**today's workout** with the correct sets/reps/tempo for their current week, watch each
exercise video inline, log weight & reps per set, and track progress week to week.

Built with **Next.js 14 (App Router)**, **Supabase** (auth + Postgres), **Tailwind**, and **Recharts**.
See `ARCHITECTURE.md` for the full design.

## Features

- **Real accounts** — Supabase email/password auth; each user's data isolated by Row-Level Security.
- **24-week engine** — auto-detects your week & block (Hypertrophy 1–8, Strength 9–16, Endurance 17–24) and applies the right sets, reps, and tempo (including the 3:1:1 → 6:1:1 hypertrophy wave).
- **Embedded videos** — every exercise plays inline from YouTube.
- **Weight/rep tracking** — per-set logging with a built-in double-progression hint.
- **Progress charts** — top set weight & total volume over time, per exercise.
- **Calendar export** — download all 24 weeks as an `.ics` file with alerts.
- **Reminders** — opt-in browser notifications.

## Setup

### 1. Install
```bash
npm install
```

### 2. Create a Supabase project
- Go to supabase.com → New project.
- In **SQL editor**, run `supabase/schema.sql`, then `supabase/seed.sql`.
- In **Authentication → Providers**, ensure Email is enabled. (For quick local testing you
  can turn off "Confirm email" so signups log in immediately.)

### 3. Environment
```bash
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
Supabase → Settings → API.

### 4. Run
```bash
npm run dev
# http://localhost:3000
```

Sign up, go to **Settings**, set your program start date, then open **Today**.

## Deploy (Vercel)
1. Push this folder to a GitHub repo.
2. Import into Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
4. Deploy.

## Project structure
```
app/
  page.tsx              landing
  login/                auth (sign in / sign up)
  dashboard/            Today — week engine + exercise cards + logging
  progress/             progress charts
  exercises/            searchable library with inline video
  settings/             start date, reminders, calendar export
  api/calendar/route.ts .ics generator
lib/
  program.ts            the 24-week engine (pure functions)
  data.ts               server actions (today, logSet, progress)
  supabase-*.ts         Supabase clients
supabase/
  schema.sql            tables + RLS + signup trigger
  seed.sql              58 exercises + 4-day split
```

## Notes & roadmap
- True push reminders when the app is closed need a backend cron / web-push; the calendar
  export covers offline reminders today.
- Two-way Google Calendar sync, a coach/trainer view, and PR badges are documented as next
  steps in `ARCHITECTURE.md`.

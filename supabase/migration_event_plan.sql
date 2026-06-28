-- Migration: pre-scheduled event plan.
-- Stores a dated day-by-day plan so the dashboard can show the right session
-- (or a rest day) for today. Run in the Supabase SQL editor.

create table if not exists event_plan_days (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan_date     date not null,                 -- the calendar day this applies to
  session_type  text not null,                 -- strength|hypertrophy|endurance|cardio|tabata|rest
  title         text not null,
  detail        text not null default '',
  exercise_ids  bigint[] not null default '{}',-- exercises to do that day (empty for rest/cardio)
  block         text,                          -- the rx block to resolve (strength|hypertrophy|endurance|circuit)
  week_index    int not null default 1,
  created_at    timestamptz not null default now(),
  unique (user_id, plan_date)
);

create index if not exists event_plan_days_user_date on event_plan_days (user_id, plan_date);

alter table event_plan_days enable row level security;

drop policy if exists "own plan r" on event_plan_days;
create policy "own plan r" on event_plan_days for select using (auth.uid() = user_id);
drop policy if exists "own plan i" on event_plan_days;
create policy "own plan i" on event_plan_days for insert with check (auth.uid() = user_id);
drop policy if exists "own plan d" on event_plan_days;
create policy "own plan d" on event_plan_days for delete using (auth.uid() = user_id);
drop policy if exists "own plan u" on event_plan_days;
create policy "own plan u" on event_plan_days for update using (auth.uid() = user_id);

-- mark whether the dancer's Today screen is driven by an event plan
alter table user_program_state add column if not exists event_plan_active boolean not null default false;
alter table user_program_state add column if not exists event_plan_label text;

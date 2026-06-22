-- Migration: make the app support multiple programs.
-- Run this ONCE in Supabase → SQL Editor on your existing project
-- (it is safe to run after schema.sql + seed.sql; it only adds columns).

-- 1) set_logs: add program_id + a new unique constraint that includes program & day
alter table set_logs add column if not exists program_id text not null default 'periodized24';

-- drop the old per-(user,exercise,week,set) uniqueness and replace it
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'set_logs_user_id_exercise_id_week_set_number_key'
  ) then
    alter table set_logs drop constraint set_logs_user_id_exercise_id_week_set_number_key;
  end if;
end $$;

create unique index if not exists set_logs_unique_per_program
  on set_logs (user_id, program_id, exercise_id, week, day_index, set_number);

-- 2) user_program_state: remember the active program and selected day
alter table user_program_state add column if not exists active_program text not null default 'periodized24';
alter table user_program_state add column if not exists selected_day int not null default 0;

-- 3) profiles: onboarding flags (disclaimer + first-run program choice)
alter table profiles add column if not exists disclaimer_accepted_at timestamptz;
alter table profiles add column if not exists onboarded boolean not null default false;

-- done. Existing 24-week logs keep working (defaulted to 'periodized24').

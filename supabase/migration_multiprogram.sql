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

-- 4) existing accounts: mark them onboarded so they aren't prompted retroactively.
--    (New signups after this still go through disclaimer + program choice.)
update profiles set disclaimer_accepted_at = coalesce(disclaimer_accepted_at, now()),
                    onboarded = true
where disclaimer_accepted_at is null or onboarded = false;

-- 5) Build-Your-Own: per-user custom program (a list of chosen exercises, ordered, with a day)
create table if not exists custom_program_exercises (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  day_index   int  not null default 0,
  exercise_id bigint not null references exercises(id) on delete cascade,
  ord         int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists custom_prog_user_idx on custom_program_exercises (user_id, day_index, ord);

alter table custom_program_exercises enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'own custom r') then
    create policy "own custom r" on custom_program_exercises for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own custom i') then
    create policy "own custom i" on custom_program_exercises for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own custom d') then
    create policy "own custom d" on custom_program_exercises for delete using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own custom u') then
    create policy "own custom u" on custom_program_exercises for update using (auth.uid() = user_id);
  end if;
end $$;

-- done. Existing 24-week logs keep working (defaulted to 'periodized24').

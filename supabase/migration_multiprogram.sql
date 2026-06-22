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

-- 6) Saved Workouts library: many named workouts per user (custom-built or generated)
create table if not exists saved_workouts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  style       text not null default 'hypertrophy',  -- hypertrophy | strength | endurance | custom
  created_at  timestamptz not null default now()
);
create table if not exists saved_workout_exercises (
  id          bigint generated always as identity primary key,
  workout_id  bigint not null references saved_workouts(id) on delete cascade,
  exercise_id bigint not null references exercises(id) on delete cascade,
  ord         int not null default 0
);
create index if not exists saved_workouts_user_idx on saved_workouts (user_id, created_at desc);
create index if not exists saved_workout_ex_idx on saved_workout_exercises (workout_id, ord);

alter table saved_workouts enable row level security;
alter table saved_workout_exercises enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'own sw r') then
    create policy "own sw r" on saved_workouts for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own sw i') then
    create policy "own sw i" on saved_workouts for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own sw u') then
    create policy "own sw u" on saved_workouts for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own sw d') then
    create policy "own sw d" on saved_workouts for delete using (auth.uid() = user_id);
  end if;
  -- child rows: allow if the parent workout belongs to the user
  if not exists (select 1 from pg_policies where policyname = 'own swe r') then
    create policy "own swe r" on saved_workout_exercises for select
      using (exists (select 1 from saved_workouts w where w.id = workout_id and w.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own swe i') then
    create policy "own swe i" on saved_workout_exercises for insert
      with check (exists (select 1 from saved_workouts w where w.id = workout_id and w.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own swe d') then
    create policy "own swe d" on saved_workout_exercises for delete
      using (exists (select 1 from saved_workouts w where w.id = workout_id and w.user_id = auth.uid()));
  end if;
end $$;

-- done. Existing 24-week logs keep working (defaulted to 'periodized24').

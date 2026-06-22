-- Athletistry Training App — schema
-- Run this in the Supabase SQL editor (Database → SQL editor), then run seed.sql.

-- ---------- reference data (world-readable) ----------

create table if not exists exercises (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  youtube_id  text not null,
  level       int  not null check (level between 1 and 4),
  category    text not null
);

create table if not exists program_days (
  id         bigint generated always as identity primary key,
  day_index  int  not null unique,           -- 0..3
  title      text not null,
  focus      text not null
);

create table if not exists program_day_exercises (
  id          bigint generated always as identity primary key,
  day_id      bigint not null references program_days(id) on delete cascade,
  exercise_id bigint not null references exercises(id) on delete cascade,
  ord         int not null
);

-- ---------- per-user data ----------

create table if not exists profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  program_start_date date not null default current_date,
  experience_level   int  not null default 2 check (experience_level between 1 and 4),
  reminders_opt_in   boolean not null default false,
  created_at         timestamptz not null default now()
);

create table if not exists user_program_state (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  week_override  int check (week_override between 1 and 24),  -- null = derive from start date
  updated_at     timestamptz not null default now()
);

create table if not exists set_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  exercise_id bigint not null references exercises(id) on delete cascade,
  week        int not null check (week between 1 and 24),
  day_index   int not null check (day_index between 0 and 3),
  set_number  int not null check (set_number between 1 and 6),
  weight      numeric(6,1) not null default 0,
  reps        int not null default 0,
  logged_at   timestamptz not null default now(),
  unique (user_id, exercise_id, week, set_number)
);

create index if not exists set_logs_user_ex_week_idx
  on set_logs (user_id, exercise_id, week);

-- ---------- auto-create a profile row on signup ----------

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_program_state (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Row-Level Security ----------

alter table profiles            enable row level security;
alter table user_program_state  enable row level security;
alter table set_logs            enable row level security;
alter table exercises             enable row level security;
alter table program_days          enable row level security;
alter table program_day_exercises enable row level security;

-- reference tables: anyone authenticated can read
create policy "ref read exercises" on exercises for select using (true);
create policy "ref read days" on program_days for select using (true);
create policy "ref read day_ex" on program_day_exercises for select using (true);

-- user-owned tables: only the owner
create policy "own profile r"  on profiles for select using (auth.uid() = id);
create policy "own profile u"  on profiles for update using (auth.uid() = id);
create policy "own profile i"  on profiles for insert with check (auth.uid() = id);

create policy "own state r" on user_program_state for select using (auth.uid() = user_id);
create policy "own state u" on user_program_state for update using (auth.uid() = user_id);
create policy "own state i" on user_program_state for insert with check (auth.uid() = user_id);

create policy "own logs r" on set_logs for select using (auth.uid() = user_id);
create policy "own logs i" on set_logs for insert with check (auth.uid() = user_id);
create policy "own logs u" on set_logs for update using (auth.uid() = user_id);
create policy "own logs d" on set_logs for delete using (auth.uid() = user_id);

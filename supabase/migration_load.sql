-- Training load & calendar: session-RPE TRIMP tracking + events for taper.
-- Safe to run multiple times.

-- 1) training_sessions: every logged session (gym workout, ballet class,
--    rehearsal, etc). TRIMP for a session = duration_min * rpe.
create table if not exists training_sessions (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  kind         text not null default 'workout',  -- workout | class | rehearsal | cross | other
  duration_min int  not null check (duration_min between 1 and 600),
  rpe          int  not null check (rpe between 1 and 10),
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists training_sessions_user_date_idx
  on training_sessions (user_id, session_date);

-- 2) events: performances / competitions / exams the taper plans around.
create table if not exists events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_date  date not null,
  kind        text not null default 'performance', -- performance | competition | exam
  name        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists events_user_date_idx on events (user_id, event_date);

-- RLS
alter table training_sessions enable row level security;
alter table events enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'own ts r') then
    create policy "own ts r" on training_sessions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own ts i') then
    create policy "own ts i" on training_sessions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own ts u') then
    create policy "own ts u" on training_sessions for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own ts d') then
    create policy "own ts d" on training_sessions for delete using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'own ev r') then
    create policy "own ev r" on events for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own ev i') then
    create policy "own ev i" on events for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own ev u') then
    create policy "own ev u" on events for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own ev d') then
    create policy "own ev d" on events for delete using (auth.uid() = user_id);
  end if;
end $$;

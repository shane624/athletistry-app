-- Ballet Movement Lab results — one row per user per movement.
create table if not exists ballet_assessments (
  user_id  uuid not null references auth.users(id) on delete cascade,
  move_id  text not null,
  findings jsonb not null default '[]'::jsonb,
  votes    jsonb not null default '[]'::jsonb,
  headline text,
  taken_at timestamptz not null default now(),
  primary key (user_id, move_id)
);

alter table ballet_assessments enable row level security;

drop policy if exists "own ballet rows" on ballet_assessments;
create policy "own ballet rows" on ballet_assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

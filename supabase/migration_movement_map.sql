-- The Athletistry Movement Map result per dancer.
create table if not exists movement_map (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  primary_type  text not null,
  secondary_type text not null,
  answers       jsonb,          -- the 5 chosen option types, for reassessment
  taken_at      timestamptz not null default now()
);

alter table movement_map enable row level security;

drop policy if exists "own map read"   on movement_map;
drop policy if exists "own map write"   on movement_map;
drop policy if exists "own map update"  on movement_map;

create policy "own map read"   on movement_map for select using (auth.uid() = user_id);
create policy "own map write"  on movement_map for insert with check (auth.uid() = user_id);
create policy "own map update" on movement_map for update using (auth.uid() = user_id);

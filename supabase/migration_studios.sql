-- Studio access — studios + their student rosters.
-- Owner-facing reads (roster, student data) go through the service-role client
-- after an ownership check in the app, so RLS here stays simple and NON-recursive.

create table if not exists studios (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  join_code  text not null unique,
  created_at timestamptz not null default now()
);
alter table studios enable row level security;

create table if not exists studio_members (
  studio_id uuid not null references studios(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'student',
  joined_at timestamptz not null default now(),
  primary key (studio_id, user_id)
);
alter table studio_members enable row level security;

-- studios: the owner can do anything with their own studio.
drop policy if exists "owner manages studio" on studios;
create policy "owner manages studio" on studios
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- studios: a member can read the studio they belong to (name etc.). The
-- subquery hits studio_members, whose only policy is the self-policy below, so
-- there is no policy cycle.
drop policy if exists "members read studio" on studios;
create policy "members read studio" on studios
  for select using (
    exists (select 1 from studio_members m where m.studio_id = studios.id and m.user_id = auth.uid())
  );

-- studio_members: a user fully manages ONLY their own membership rows (join/leave).
-- (Owner-side roster reads/removes are done with the service-role client after an
--  ownership check, so no owner policy is needed here — which keeps RLS acyclic.)
drop policy if exists "self membership" on studio_members;
create policy "self membership" on studio_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

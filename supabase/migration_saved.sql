-- Saved / bookmarked content (programs, circuits, moves, workouts, articles).
-- Generic: each row is an item keyed by a stable string, with a title + link so
-- we don't need per-type joins to render the saved list.

create table if not exists saved_content (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_key   text not null,            -- e.g. "program:the-practice", "move:plie"
  title      text not null,
  subtitle   text,
  href       text not null,            -- where tapping it goes
  kind       text not null default 'other', -- program|circuit|move|workout|article
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

alter table saved_content enable row level security;

drop policy if exists "own saved read"   on saved_content;
drop policy if exists "own saved write"  on saved_content;
drop policy if exists "own saved delete" on saved_content;

create policy "own saved read"   on saved_content for select using (auth.uid() = user_id);
create policy "own saved write"  on saved_content for insert with check (auth.uid() = user_id);
create policy "own saved delete" on saved_content for delete using (auth.uid() = user_id);

create index if not exists saved_content_user_created_idx
  on saved_content (user_id, created_at desc);

-- The 10 self-tests from The Dancer's Playbook. One row per attempt, so a
-- dancer can retest every four weeks and see the change over time.
create table if not exists self_test_results (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  test_id   text not null,
  "values"  jsonb not null default '{}'::jsonb,  -- { measureId: number }
  note      text,
  taken_at  timestamptz not null default now()
);

create index if not exists self_test_results_user_test_idx
  on self_test_results (user_id, test_id, taken_at);

alter table self_test_results enable row level security;

drop policy if exists "own self test rows" on self_test_results;
create policy "own self test rows" on self_test_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tracks which anatomy modules a dancer has passed the quiz for.
create table if not exists anatomy_quiz (
  user_id      uuid not null references auth.users(id) on delete cascade,
  module_index int  not null,
  passed_at    timestamptz not null default now(),
  primary key (user_id, module_index)
);

alter table anatomy_quiz enable row level security;

drop policy if exists "own anatomy read"   on anatomy_quiz;
drop policy if exists "own anatomy write"   on anatomy_quiz;

create policy "own anatomy read"  on anatomy_quiz for select using (auth.uid() = user_id);
create policy "own anatomy write" on anatomy_quiz for insert with check (auth.uid() = user_id);

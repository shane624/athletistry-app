-- Member retention: cancel-at-period-end state, pauses, one-time offer tracking,
-- and a log of cancellation reasons. Run AFTER migration_member_billing.sql.

alter table profiles add column if not exists cancel_at_period_end   boolean not null default false;
alter table profiles add column if not exists paused_until           timestamptz;
alter table profiles add column if not exists retention_offer_used_at timestamptz;

create table if not exists member_cancellations (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  reason      text not null,          -- too_expensive | not_using | injury_break | missing_features | switching | other
  detail      text,
  outcome     text not null,          -- discount | pause_1 | pause_2 | cancelled | stayed
  plan        text,
  created_at  timestamptz not null default now()
);
alter table member_cancellations enable row level security;
-- Written only by the server (service role). Members can read their own rows.
drop policy if exists "own cancellations r" on member_cancellations;
create policy "own cancellations r" on member_cancellations for select using (auth.uid() = user_id);

-- Extend the billing-column guard so members can't flip these themselves
-- (e.g. clear retention_offer_used_at to claim the discount twice).
create or replace function protect_profile_billing()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.stripe_customer_id      := null;
      new.subscription_status     := 'none';
      new.subscription_plan       := null;
      new.current_period_end      := null;
      new.cancel_at_period_end    := false;
      new.paused_until            := null;
      new.retention_offer_used_at := null;
    else
      new.stripe_customer_id      := old.stripe_customer_id;
      new.subscription_status     := old.subscription_status;
      new.subscription_plan       := old.subscription_plan;
      new.current_period_end      := old.current_period_end;
      new.cancel_at_period_end    := old.cancel_at_period_end;
      new.paused_until            := old.paused_until;
      new.retention_offer_used_at := old.retention_offer_used_at;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_billing on profiles;
create trigger protect_profile_billing
  before insert or update on profiles
  for each row execute function protect_profile_billing();

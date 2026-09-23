-- Protect billing columns on profiles.
-- The "own profile u" policy lets members update their own profile row, which
-- would also let them set subscription_status = 'active' themselves. This
-- trigger silently keeps billing fields unchanged for any request made as a
-- normal signed-in user; only the server (service role / webhook) can set them.

create or replace function protect_profile_billing()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.stripe_customer_id  := null;
      new.subscription_status := 'none';
      new.subscription_plan   := null;
      new.current_period_end  := null;
    else
      new.stripe_customer_id  := old.stripe_customer_id;
      new.subscription_status := old.subscription_status;
      new.subscription_plan   := old.subscription_plan;
      new.current_period_end  := old.current_period_end;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_billing on profiles;
create trigger protect_profile_billing
  before insert or update on profiles
  for each row execute function protect_profile_billing();

-- Individual member subscription (Athletistry membership: $19.95/mo or $199.95/yr USD).
-- Stored on the member's profile row.
alter table profiles add column if not exists stripe_customer_id     text;
alter table profiles add column if not exists subscription_status    text not null default 'none';
alter table profiles add column if not exists subscription_plan      text;   -- 'monthly' | 'yearly'
alter table profiles add column if not exists current_period_end     timestamptz;
-- subscription_status: 'none' | 'active' | 'trialing' | 'past_due' | 'canceled'

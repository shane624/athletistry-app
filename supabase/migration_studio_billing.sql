-- Stripe billing for studios. 2 free dancers, then a per-seat subscription.
alter table studios add column if not exists stripe_customer_id     text;
alter table studios add column if not exists stripe_subscription_id text;
alter table studios add column if not exists subscription_status    text not null default 'none';
-- subscription_status: 'none' | 'active' | 'trialing' | 'past_due' | 'canceled'

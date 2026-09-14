-- Persist what the dancer tells us in onboarding.
--
-- The onboarding flow asks "What brings you here?" and "How often can you
-- train?", then throws both answers away: only the recommended program and the
-- onboarded flag were saved. Meanwhile lib/achievements.ts has always had a
-- weeklyGoal concept, defaulting to 3 because nothing ever supplied a value.
--
-- Consequence: the weekly ring, the Perfect Week badge and the "x / 3 training
-- days" line on Profile were measured against 3 for everyone, including the
-- dancer who had just said they train twice a week, and the one who said four
-- or more. This connects the question to the number it was always meant to set.
--
-- Safe to run more than once.

alter table profiles add column if not exists weekly_goal   int  check (weekly_goal between 1 and 14);
alter table profiles add column if not exists training_goal text;

comment on column profiles.weekly_goal is
  'Sessions per week the dancer said they can train, from onboarding. Null falls back to 3.';
comment on column profiles.training_goal is
  'The goal the dancer chose in onboarding (strength / return / technique / kids).';

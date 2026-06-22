-- Migration: gate workouts behind a "Start Here" learning flow.
-- Run in Supabase → SQL editor. Safe to re-run.

alter table profiles add column if not exists learning_completed boolean not null default false;

-- Existing accounts (created before this feature) are treated as done so they
-- aren't suddenly locked out. New signups must complete the Start Here flow.
update profiles set learning_completed = true where learning_completed = false;

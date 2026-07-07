-- Superset grouping for custom-built workouts. Exercises sharing the same
-- superset_group (per user + day) are done back-to-back.
alter table custom_program_exercises
  add column if not exists superset_group int;

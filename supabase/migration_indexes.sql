-- Performance indexes. Run in the Supabase SQL editor.
-- Covers the set_logs read paths that grow with each member's history.
-- CREATE INDEX IF NOT EXISTS, so re-running is safe.
--
-- (training_sessions and events already have user+date indexes from
--  migration_load.sql, so nothing is needed there.)

-- The "last logged weight" prefill on the dashboard filters by
-- (user, program, exercise) and orders by logged_at — give it a covering index.
create index if not exists set_logs_user_prog_ex_logged_idx
  on set_logs (user_id, program_id, exercise_id, logged_at desc);

-- The Progress page's per-exercise weekly trend filters by
-- (user, program, exercise) and orders by week.
create index if not exists set_logs_user_prog_ex_week_idx
  on set_logs (user_id, program_id, exercise_id, week);

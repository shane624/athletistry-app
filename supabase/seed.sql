-- Athletistry seed data: 58 exercises + 4-day split
-- Run AFTER schema.sql

insert into exercises (name, youtube_id, level, category) values
  ('Adductor Isometric Squat Hold', 'beAZLzKhTp8', 2, 'squat'),
  ('Angled Calf Raise', '5rz9fSsKhtI', 1, 'calf'),
  ('Anterior Tibialis Raises', 'WNfjaZPsdlI', 1, 'calf'),
  ('Arabesque Kicks', 'zklDjxHj8xk', 1, 'hinge'),
  ('Arabesque Port De Bras', 'kiFjDELNG_Y', 2, 'mobility'),
  ('Arabesque Row', 'Sb-b4fBm2fY', 2, 'pull'),
  ('Assisted Negative Dips', '9V0_iVKsm1s', 1, 'push'),
  ('Band Deadlift', 'MkV7HxnZ1h0', 1, 'hinge'),
  ('Band Row', 'NwHK8CXnre4', 1, 'pull'),
  ('Barbell Back Squat', '3I6_VBQXbTQ', 3, 'squat'),
  ('Barbell Bench Press', 'uo2kyplMOVA', 3, 'push'),
  ('Barbell Clean', 'S1KuNh_spLo', 4, 'plyo'),
  ('Barbell Hip Extension Lunge', 'vGit2kh4oM8', 4, 'lunge'),
  ('Barbell Overhead Strict Press', 'YOuV4UwKmto', 3, 'shoulder'),
  ('Barbell Snatch', '37A80sKWzJ0', 4, 'plyo'),
  ('Battu Strength', 'IVJbz9hUgMc', 1, 'core'),
  ('Bent Knee Calf Raise', 'CoagWYTkins', 1, 'calf'),
  ('Bent Over Row', 'gXzC5cMWeck', 2, 'pull'),
  ('Chair Elevated Hip Extension Lunge', 'spMX9NbOIdI', 1, 'lunge'),
  ('Cross Body Extensions', 'WqZ8xPIgVBY', 3, 'core'),
  ('Cross Body Extensions 2', 'kL6Vx41Jh0M', 3, 'core'),
  ('Deadlift', 'R0hwLC4ZXBA', 2, 'hinge'),
  ('Deep Knee Bend', 'HdubpPOVVtE', 1, 'squat'),
  ('Deficit Pushup', 'aMrCAVIEEqA', 3, 'push'),
  ('Dumbbell Bench Row', 'jBooUdzo9Ls', 2, 'pull'),
  ('Extension Developer Back', 'e9Xjj-VrNkQ', 2, 'core'),
  ('Extension Developer Front', '5WAr1WemST8', 2, 'core'),
  ('Extension Developer Side', '96BrI3zSWR8', 2, 'core'),
  ('Hanging Knee Raise', 'OpdiS_A8qY0', 2, 'core'),
  ('Hanstand', 'oCpeeN5UUMc', 2, 'shoulder'),
  ('Hip Extension Lunge', 'YZuAhJPp2rM', 3, 'lunge'),
  ('Kneeling Quadricep Extensions', 'dlgKpgsJLes', 1, 'isolation'),
  ('L-Sit Battu', '34SpgxrxCI8', 2, 'core'),
  ('Lat Press Downs', '6KL1CKPI-1w', 1, 'pull'),
  ('Lat Pulls', '6voXne9d-tE', 1, 'pull'),
  ('Nordic Hamstring Curls', 'O4pn8sMWFJM', 3, 'hinge'),
  ('Overhead Press In Second', '9Cj4MvZEOt0', 2, 'shoulder'),
  ('Palloff Press', '3CqjIjhYhRE', 1, 'core'),
  ('Paralell Front Split Slides', 'Eyn3hyefnsg', 1, 'mobility'),
  ('Pushup On Knees With Mountain Climber', 'JJp0BXGI8RA', 2, 'push'),
  ('Pushup On Knees', 'pWIqx2uwrJ0', 1, 'push'),
  ('Pushup On Toes', 'ZJesXFLHqX0', 2, 'push'),
  ('Reverse Lunge To Rond De Jambe', 'Gh-sDwN2ag4', 3, 'lunge'),
  ('Roll Through Pushups', 'FBg0p4w2rkE', 2, 'push'),
  ('Seated Barbell Overhead Press', 'JAwwBYlgMYc', 1, 'shoulder'),
  ('Side Hop To Reverse Lunge', 'CuW3sl5xRvQ', 3, 'plyo'),
  ('Side Lunge To A La Second', 'K9nRF5bwl-Q', 2, 'lunge'),
  ('Side Split Walkouts', 'xIsXY654kCg', 1, 'mobility'),
  ('Single Leg Deadlift', '5HAtl2Ax3Eg', 2, 'hinge'),
  ('Single Leg Hip Flexor Raise', 'F66qSh4XaP8', 1, 'core'),
  ('Slant Board Squat', 'pBHb8gee9JA', 2, 'squat'),
  ('Squat Jump', '3kpG8FymmyY', 3, 'plyo'),
  ('Squat', '0qgXxBCFsPs', 1, 'squat'),
  ('Step Elevated Hip Extension Lunge', 'ezUohgs6zus', 2, 'lunge'),
  ('Strong Partner', 'tUNQb6e6qv4', 3, 'core'),
  ('Tricep Chest Dip', '0yw-PAxHfUI', 3, 'push'),
  ('Turnout Developer Plank', 'Eq4ZlRo5wF0', 4, 'core'),
  ('Turnout Developer', 'z6hiSxRY4n0', 3, 'mobility')
on conflict (name) do nothing;

insert into program_days (day_index, title, focus) values
  (0, 'Day 1 — Lower (Squat focus)', 'Squat focus'),
  (1, 'Day 2 — Upper Push', 'Upper push'),
  (2, 'Day 3 — Lower (Hinge & Lunge focus)', 'Hinge & lunge'),
  (3, 'Day 4 — Upper Pull & Core', 'Upper pull & core')
on conflict (day_index) do nothing;

-- link exercises to days
insert into program_day_exercises (day_id, exercise_id, ord)
select d.id, e.id, 0 from program_days d, exercises e where d.day_index=0 and e.name='Barbell Back Squat'
union all
select d.id, e.id, 1 from program_days d, exercises e where d.day_index=0 and e.name='Slant Board Squat'
union all
select d.id, e.id, 2 from program_days d, exercises e where d.day_index=0 and e.name='Adductor Isometric Squat Hold'
union all
select d.id, e.id, 3 from program_days d, exercises e where d.day_index=0 and e.name='Kneeling Quadricep Extensions'
union all
select d.id, e.id, 4 from program_days d, exercises e where d.day_index=0 and e.name='Bent Knee Calf Raise'
union all
select d.id, e.id, 5 from program_days d, exercises e where d.day_index=0 and e.name='Angled Calf Raise'
union all
select d.id, e.id, 0 from program_days d, exercises e where d.day_index=1 and e.name='Barbell Bench Press'
union all
select d.id, e.id, 1 from program_days d, exercises e where d.day_index=1 and e.name='Barbell Overhead Strict Press'
union all
select d.id, e.id, 2 from program_days d, exercises e where d.day_index=1 and e.name='Pushup On Toes'
union all
select d.id, e.id, 3 from program_days d, exercises e where d.day_index=1 and e.name='Deficit Pushup'
union all
select d.id, e.id, 4 from program_days d, exercises e where d.day_index=1 and e.name='Tricep Chest Dip'
union all
select d.id, e.id, 5 from program_days d, exercises e where d.day_index=1 and e.name='Overhead Press In Second'
union all
select d.id, e.id, 0 from program_days d, exercises e where d.day_index=2 and e.name='Deadlift'
union all
select d.id, e.id, 1 from program_days d, exercises e where d.day_index=2 and e.name='Nordic Hamstring Curls'
union all
select d.id, e.id, 2 from program_days d, exercises e where d.day_index=2 and e.name='Single Leg Deadlift'
union all
select d.id, e.id, 3 from program_days d, exercises e where d.day_index=2 and e.name='Hip Extension Lunge'
union all
select d.id, e.id, 4 from program_days d, exercises e where d.day_index=2 and e.name='Side Lunge To A La Second'
union all
select d.id, e.id, 5 from program_days d, exercises e where d.day_index=2 and e.name='Anterior Tibialis Raises'
union all
select d.id, e.id, 0 from program_days d, exercises e where d.day_index=3 and e.name='Bent Over Row'
union all
select d.id, e.id, 1 from program_days d, exercises e where d.day_index=3 and e.name='Lat Pulls'
union all
select d.id, e.id, 2 from program_days d, exercises e where d.day_index=3 and e.name='Dumbbell Bench Row'
union all
select d.id, e.id, 3 from program_days d, exercises e where d.day_index=3 and e.name='Lat Press Downs'
union all
select d.id, e.id, 4 from program_days d, exercises e where d.day_index=3 and e.name='Hanging Knee Raise'
union all
select d.id, e.id, 5 from program_days d, exercises e where d.day_index=3 and e.name='Palloff Press'
union all
select d.id, e.id, 6 from program_days d, exercises e where d.day_index=3 and e.name='Cross Body Extensions';

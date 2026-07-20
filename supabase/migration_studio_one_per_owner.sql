-- One studio per account — stops someone spinning up many studios to farm the
-- 2-free-dancers tier. Enforced at the DB level so app bugs can't bypass it.

-- 1) Clean up any existing duplicates (from testing): for each owner keep the
--    studio with the MOST dancers (tie-broken by oldest), delete the rest.
--    studio_members rows cascade-delete with the removed studios.
with ranked as (
  select s.id,
         row_number() over (
           partition by s.owner_id
           order by (select count(*) from studio_members m where m.studio_id = s.id) desc,
                    s.created_at asc,
                    s.id asc
         ) as rn
  from studios s
)
delete from studios where id in (select id from ranked where rn > 1);

-- 2) Now the constraint can be created.
create unique index if not exists studios_owner_unique on studios (owner_id);

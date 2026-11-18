-- SpikeReport: admin test and the fail-closed guard on profiles.
--
-- Part 2 of 3. Must be applied after part 1 (needs public.profiles) and before
-- part 3, because the part-3 sync function's ON CONFLICT DO UPDATE fires the
-- profiles_guard trigger created here.

-- ---------------------------------------------------------------------------
-- Admin test for use inside RLS policies.
--
-- SECURITY DEFINER so authorization never depends on profiles' own SELECT
-- policy: narrowing that policy later would otherwise silently demote the
-- admin with no error. STABLE so the planner hoists it into a once-per-query
-- InitPlan instead of calling it per row.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Fail-closed backstop on is_admin.
--
-- Part 1 already revoked UPDATE from the API roles, but grants fail open:
-- Supabase's default privileges grant ALL on new public tables, so a future
-- `grant all on all tables in schema public to authenticated` would silently
-- reopen privilege escalation with no error anywhere. This trigger is the part
-- that fails closed.
--
-- Scoped to the PostgREST roles so `postgres` in the SQL editor can still set
-- is_admin, which is how the site owner is promoted:
--   update public.profiles set is_admin = true where id = '<your uuid>';
-- ---------------------------------------------------------------------------
create or replace function public.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_user in ('anon', 'authenticated') then
    raise exception 'is_admin is not user-writable'
      using errcode = 'PT403', hint = 'admin_immutable';
  end if;

  new.id         := old.id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end
$$;

revoke all on function public.profiles_guard() from public;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.profiles_guard();

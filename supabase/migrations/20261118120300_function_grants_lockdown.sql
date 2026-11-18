-- SpikeReport: close the function EXECUTE grants that parts 1-3 missed.
--
-- Parts 1-3 tried to lock these down and did not succeed, because there are
-- TWO independent paths by which anon and authenticated end up with EXECUTE on
-- a function in `public`, and revoking one leaves the other:
--
--   1. Postgres itself grants EXECUTE to PUBLIC on every newly created
--      function. Roles inherit it, and it shows in proacl as a bare `=X/...`.
--   2. Supabase's `alter default privileges` grants EXECUTE *directly* to
--      anon, authenticated and service_role for new functions in `public`.
--      These show as `anon=X/...`, `authenticated=X/...`.
--
-- Parts 1-3 revoked from PUBLIC only, so the direct grants survived; the
-- pre-existing rls_auto_enable() revoke named the roles only, so the PUBLIC
-- grant survived. The security advisor flagged all four functions. Revoking
-- from PUBLIC *and* the roles is what actually closes it.
--
-- Revoking EXECUTE does not disable the triggers that call these functions:
-- Postgres checks EXECUTE on a trigger function when the trigger is created,
-- not each time it fires, and the triggers already exist.

-- Trigger functions: nothing should be able to call these over the API.
revoke all on function public.profiles_guard()
  from public, anon, authenticated;

revoke all on function public.sync_profile_from_auth_user()
  from public, anon, authenticated;

-- Kept as insurance in case the function ever stops being SECURITY DEFINER.
grant execute on function public.sync_profile_from_auth_user()
  to supabase_auth_admin;

-- is_admin() is called from RLS policy expressions, which are evaluated with
-- the privileges of the querying role. `authenticated` therefore MUST retain
-- EXECUTE or the comments moderation policies silently fail. anon never needs
-- it: the admin policies are scoped `to authenticated`.
--
-- This leaves one security-advisor warning
-- (authenticated_security_definer_function_executable) that is accepted
-- deliberately. The function returns only whether the *caller* is an admin,
-- and profiles.is_admin is already world-readable, so exposing it as RPC
-- discloses strictly less than a plain select on the table. The alternative
-- remediations both cost more than they return here: SECURITY INVOKER would
-- couple admin authorization to profiles' own read policy, and moving the
-- function to an unexposed schema would add a schema purely to satisfy a
-- linter.
revoke all on function public.is_admin()
  from public, anon;

grant execute on function public.is_admin()
  to authenticated;

-- Pre-existing dev-only helper. Guarded so this file still applies cleanly to
-- a fresh prod project where the function does not exist.
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

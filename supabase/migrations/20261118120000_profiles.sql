-- SpikeReport: profiles for Discord-authenticated commenters.
--
-- Part 1 of 3. This file is only the table, its constraints, its read policy
-- and its privileges. The admin guard is part 2; the auth.users triggers that
-- populate this table are part 3.
--
-- Applied with the Supabase CLI (`supabase db push`), so the leading
-- timestamp in the filename IS the migration version recorded in
-- supabase_migrations.schema_migrations. Do not rename an applied file.
--
-- RLS is enabled explicitly rather than relying on the `ensure_rls` event
-- trigger, which exists only in the dev project: it is in no migration, so a
-- fresh prod project and the CLI shadow database will not have it.
--
-- This table is world-readable, so every column here is published to anonymous
-- visitors. Deliberately absent: email, Discord snowflake (a DM handle, and
-- once published it cannot be unpublished), IP, user agent.

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz
);

alter table public.profiles enable row level security;

-- Constraints are backstops. The part-3 sync function already truncates and
-- strips, so a weird Discord name can never make the signup trigger throw.
-- Columns are nullable for the same reason.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_display_name_len') then
    alter table public.profiles add constraint profiles_display_name_len
      check (display_name is null or char_length(display_name) between 1 and 48);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_display_name_clean') then
    alter table public.profiles add constraint profiles_display_name_clean
      check (display_name is null or display_name !~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]');
  end if;

  -- avatar_url is rendered in an <img src>. raw_user_meta_data is writable by
  -- the user via supabase.auth.updateUser({ data }), so this value arrives
  -- tainted. The ^ anchor is what rejects
  -- https://evil.example.com/cdn.discordapp.com/...
  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_url_host') then
    alter table public.profiles add constraint profiles_avatar_url_host
      check (
        avatar_url is null
        or (avatar_url ~ '^https://cdn\.discordapp\.com/' and char_length(avatar_url) <= 400)
      );
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Policies.
--
-- Deliberately no INSERT policy: rows come only from the part-3 auth.users
--   triggers.
-- Deliberately no UPDATE policy: profile editing is out of scope for v1, which
--   is also what keeps is_admin unreachable from the API.
-- Deliberately no DELETE policy: deleting a profile would cascade a user's
--   comments away and leave an auth user with no profile row.
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- Supabase's default privileges grant ALL on new public tables to anon and
-- authenticated. Narrow that to read-only.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pre-existing dev-only helper flagged by the security advisor as publicly
-- executable. Guarded so this file still applies cleanly to a fresh prod
-- project where the function does not exist.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke all on function public.rls_auto_enable() from anon, authenticated';
  end if;
end
$$;

-- SpikeReport: mirror Discord identity from auth.users into public.profiles.
--
-- Part 3 of 3, last and alone on purpose. This is the only file that touches a
-- schema we do not own, so if it fails with "must be owner of relation users"
-- parts 1 and 2 are already in place and only this one needs re-running from
-- the dashboard.
--
-- MUST NOT THROW. If the signup trigger raises, GoTrue aborts the signup
-- transaction and every new user gets "500 Database error saving new user"
-- permanently. Hence nullable columns in part 1, coalesce fallbacks, explicit
-- truncation, control-character stripping, and a catch-all handler that logs
-- and gives up rather than failing the signup. A missing profile row costs one
-- failed first comment; a throw here costs every future signup.
--
-- Does not read auth.identities: GoTrue inserts the user row before the
-- identity row, so it may not exist yet in this transaction. The Discord
-- snowflake is in raw_user_meta_data->>'provider_id' / 'sub' and is
-- deliberately not stored.

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_name   text;
  v_avatar text;
begin
  -- Discord via GoTrue populates name, full_name, avatar_url, picture,
  -- provider_id, sub and custom_claims.global_name. user_name and
  -- preferred_username come from other providers; they are in the chain
  -- because GoTrue's claim mapping shifts between releases. email is
  -- deliberately never read.
  v_name := coalesce(
    meta ->> 'name',
    meta ->> 'full_name',
    meta ->> 'user_name',
    meta ->> 'preferred_username',
    meta -> 'custom_claims' ->> 'global_name',
    ''
  );
  v_name := nullif(btrim(regexp_replace(v_name, '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g')), '');
  v_name := left(coalesce(v_name, 'user-' || left(replace(new.id::text, '-', ''), 8)), 48);

  v_avatar := nullif(btrim(coalesce(meta ->> 'avatar_url', meta ->> 'picture')), '');
  if v_avatar is null
     or v_avatar !~ '^https://cdn\.discordapp\.com/'
     or char_length(v_avatar) > 400 then
    v_avatar := null;
  end if;

  insert into public.profiles as p (id, display_name, avatar_url)
  values (new.id, v_name, v_avatar)
  on conflict (id) do update
     set display_name = excluded.display_name,
         avatar_url   = excluded.avatar_url
   where p.display_name is distinct from excluded.display_name
      or p.avatar_url   is distinct from excluded.avatar_url;

  return null;
exception
  when others then
    raise log 'sync_profile_from_auth_user failed for %: % (%)', new.id, sqlerrm, sqlstate;
    return null;
end
$$;

revoke all on function public.sync_profile_from_auth_user() from public;
grant execute on function public.sync_profile_from_auth_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.sync_profile_from_auth_user();

-- Discord renames and avatar changes. Narrow WHEN clause so this does not fire
-- on every token refresh or last_sign_in_at bump.
drop trigger if exists on_auth_user_meta_updated on auth.users;
create trigger on_auth_user_meta_updated
  after update on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function public.sync_profile_from_auth_user();

-- ---------------------------------------------------------------------------
-- Backfill anyone who signed in before these triggers existed. Set-based, so
-- it is a no-op on a fresh prod project and depends on no dev-only row.
-- Without it, an early signup hits a bare foreign-key error on first comment.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, display_name, avatar_url)
select
  u.id,
  left(coalesce(
    nullif(btrim(regexp_replace(coalesce(
      u.raw_user_meta_data ->> 'name',
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'user_name',
      u.raw_user_meta_data ->> 'preferred_username',
      u.raw_user_meta_data -> 'custom_claims' ->> 'global_name',
      ''
    ), '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g')), ''),
    'user-' || left(replace(u.id::text, '-', ''), 8)
  ), 48),
  case
    when coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
           ~ '^https://cdn\.discordapp\.com/'
     and char_length(coalesce(u.raw_user_meta_data ->> 'avatar_url',
                              u.raw_user_meta_data ->> 'picture')) <= 400
    then coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
  end
from auth.users u
on conflict (id) do nothing;

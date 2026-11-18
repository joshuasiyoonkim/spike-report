-- SpikeReport: use Discord's global display name, not username#discriminator.
--
-- Part 2's coalesce chain was ordered on an assumption about GoTrue's claim
-- mapping that a real login disproved. Discord actually sends:
--
--   name                      -> "iosh.#0"   username + legacy discriminator
--   full_name                 -> "iosh."     username, no discriminator
--   custom_claims.global_name -> "[iosh]"    the display name people choose
--   user_name                 -> null        (GitHub/Twitter only)
--   preferred_username        -> null        (Keycloak/Azure only)
--
-- `name` was first in the chain, so everyone would have been labelled with a
-- trailing "#0". global_name belongs first.
--
-- The derivation moves into its own function so the trigger and the repair
-- below cannot drift apart, which is how the original bug would have been
-- half-fixed.

create or replace function public.discord_display_name(meta jsonb, user_id uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select left(
    coalesce(
      nullif(
        btrim(regexp_replace(
          coalesce(
            -- Preference order, best first. nullif on each arm because an
            -- absent claim reads as NULL but a blank one reads as '', and ''
            -- would end the coalesce chain early.
            nullif(btrim(meta -> 'custom_claims' ->> 'global_name'), ''),
            nullif(btrim(meta ->> 'full_name'), ''),
            nullif(btrim(meta ->> 'user_name'), ''),
            nullif(btrim(meta ->> 'preferred_username'), ''),
            -- Last resort. Strip a trailing "#0", which is what Discord sends
            -- for accounts migrated off discriminators. A real legacy
            -- discriminator like "#1234" is left alone: for those accounts it
            -- is part of the name.
            nullif(btrim(regexp_replace(coalesce(meta ->> 'name', ''), '#0$', '')), ''),
            ''
          ),
          '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g'
        )),
        ''
      ),
      'user-' || left(replace(user_id::text, '-', ''), 8)
    ),
    48
  );
$$;

revoke all on function public.discord_display_name(jsonb, uuid)
  from public, anon, authenticated;

-- Same function as part 3, with the name derivation delegated. Still must not
-- throw: a raise here aborts the GoTrue signup transaction and locks out every
-- future user.
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
  v_name := public.discord_display_name(meta, new.id);

  v_avatar := nullif(btrim(coalesce(meta ->> 'avatar_url', meta ->> 'picture')), '');
  -- raw_user_meta_data is user-writable via auth.updateUser, so this URL is
  -- attacker-controlled before it reaches an <img src>.
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

revoke all on function public.sync_profile_from_auth_user()
  from public, anon, authenticated;
grant execute on function public.sync_profile_from_auth_user()
  to supabase_auth_admin;

-- Repair rows written by the old chain. Set-based and conditional, so it is a
-- no-op on a fresh prod project and a no-op on re-run.
update public.profiles p
   set display_name = public.discord_display_name(u.raw_user_meta_data, u.id)
  from auth.users u
 where u.id = p.id
   and p.display_name is distinct from public.discord_display_name(u.raw_user_meta_data, u.id);

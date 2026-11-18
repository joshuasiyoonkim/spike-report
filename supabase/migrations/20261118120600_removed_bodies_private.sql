-- SpikeReport: move removed comment text out of the public table entirely,
-- and retire the SECURITY DEFINER view.
--
-- Phase 4 hid removed text behind a definer view: the view could read
-- comments.body while the API roles could not. It worked, but the Supabase
-- advisor flags it at ERROR level, and the lint has a point that is not just
-- bureaucratic -- a definer view bypasses RLS on its base tables, so any
-- policy added to public.comments later would be silently ignored by the one
-- path the browser actually reads from. That is a trap for future work.
--
-- This replaces screening with actual removal. On soft delete the text moves
-- to private.removed_comment_bodies (a schema PostgREST does not expose) and
-- public.comments.body becomes ''. The row still exists, so threads keep
-- rendering "[removed]" in place; the moderation record still exists, so the
-- owner can see what was taken down; but the text is no longer in the table
-- the public can read, which is a stronger guarantee than the view gave.

create schema if not exists private;

-- PostgREST only serves schemas in its config (public, graphql_public), so
-- this is unreachable over the API regardless. Belt and braces anyway.
revoke all on schema private from public;
revoke usage on schema private from anon, authenticated;

create table if not exists private.removed_comment_bodies (
  comment_id uuid primary key references public.comments (id) on delete cascade,
  body       text not null,
  removed_at timestamptz not null default now(),
  removed_by uuid references public.profiles (id) on delete set null
);

alter table private.removed_comment_bodies enable row level security;
-- No policies and no grants: only the table owner and SECURITY DEFINER
-- functions reach this.

-- ---------------------------------------------------------------------------
-- Relax the body constraints BEFORE blanking any text.
--
-- comments_body_len requires 1..1500 characters unconditionally, so setting
-- body = '' below violates it. Order matters: drop first, blank the rows,
-- then add the replacement that knows about deleted_at. The whole migration
-- is one transaction, so there is no window in which a live row is
-- unconstrained.
-- ---------------------------------------------------------------------------
alter table public.comments drop constraint if exists comments_body_len;
alter table public.comments drop constraint if exists comments_body_not_blank;

-- ---------------------------------------------------------------------------
-- Backfill, with the stamp trigger disabled.
--
-- Necessary because comments_stamp() would read a body change on an
-- already-removed row as an edit by a non-author and raise PT403. Data
-- migrations are exactly the case triggers are not written for.
-- ---------------------------------------------------------------------------
alter table public.comments disable trigger comments_stamp;

insert into private.removed_comment_bodies (comment_id, body, removed_at, removed_by)
select c.id, c.body, coalesce(c.deleted_at, now()), c.deleted_by
from public.comments c
where c.deleted_at is not null
  and c.body <> ''
on conflict (comment_id) do nothing;

update public.comments
   set body = ''
 where deleted_at is not null
   and body <> '';

alter table public.comments enable trigger comments_stamp;

-- ---------------------------------------------------------------------------
-- The replacement, added only now that no row violates it: 1..1500 characters
-- while the comment is live, exactly '' once it has been removed.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'comments_body_shape') then
    alter table public.comments add constraint comments_body_shape
      check (
        case
          when deleted_at is null
            then char_length(btrim(body)) between 1 and 1500
                 and octet_length(body) <= 6000
          else body = ''
        end
      );
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Stamp trigger: same as before, except removal now relocates the text.
-- ---------------------------------------------------------------------------
create or replace function public.comments_stamp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    if uid is null then
      raise exception 'You must be signed in to comment.'
        using errcode = 'PT401', hint = 'auth_required';
    end if;

    new.id         := gen_random_uuid();
    new.author_id  := uid;
    -- Never from the payload: a client-settable created_at walks straight
    -- through every time-window rate limit.
    new.created_at := now();
    new.updated_at := null;
    new.edit_count := 0;
    new.deleted_at := null;
    new.deleted_by := null;
    new.body       := regexp_replace(btrim(new.body), E'\n{3,}', E'\n\n', 'g');
    return new;
  end if;

  -- UPDATE. Pin everything structural to OLD, silently, so a stale client
  -- PATCHing a whole row cannot move a comment to another article, reassign
  -- its author or backdate it, whatever the column grants allow.
  new.id           := old.id;
  new.author_id    := old.author_id;
  new.article_slug := old.article_slug;
  new.created_at   := old.created_at;

  if old.deleted_at is not null and new.deleted_at is null then
    raise exception 'A removed comment cannot be restored.'
      using errcode = 'PT409', hint = 'undelete_forbidden';
  end if;

  if old.deleted_at is null and new.deleted_at is not null then
    -- Removal. The text leaves the public table and is kept privately, so
    -- "removed" means removed rather than merely not displayed.
    insert into private.removed_comment_bodies (comment_id, body, removed_by)
    values (old.id, old.body, uid)
    on conflict (comment_id) do nothing;

    new.deleted_at := now();
    new.deleted_by := uid;
    new.body       := '';
    new.updated_at := old.updated_at;
    new.edit_count := old.edit_count;
    return new;
  end if;

  new.deleted_at := old.deleted_at;
  new.deleted_by := old.deleted_by;
  new.body       := regexp_replace(btrim(new.body), E'\n{3,}', E'\n\n', 'g');

  if new.body is distinct from old.body then
    -- An admin may remove anyone's comment but never rewrite one.
    if old.author_id is distinct from uid then
      raise exception 'A comment can only be edited by its author.'
        using errcode = 'PT403', hint = 'admin_edit_forbidden';
    end if;

    if old.edit_count >= 25 then
      raise exception 'This comment has been edited too many times.'
        using errcode = 'PT429', hint = 'edit_limit';
    end if;

    new.edit_count := old.edit_count + 1;
    new.updated_at := now();
  else
    new.edit_count := old.edit_count;
    new.updated_at := old.updated_at;
  end if;

  return new;
end
$$;

revoke all on function public.comments_stamp() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- The view is no longer needed: there is nothing left to screen.
-- ---------------------------------------------------------------------------
drop view if exists public.comments_public;

-- Reads now come from the table itself, so the SELECT policy has to allow
-- them. Previously the definer view bypassed RLS and this policy existed only
-- to let UPDATE locate its rows.
drop policy if exists comments_select_own_or_admin on public.comments;
drop policy if exists comments_select_public on public.comments;
create policy comments_select_public
  on public.comments
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Grants. The SELECT list is the published API surface: every column named
-- here is readable by anyone on the internet, so adding one is a decision.
-- edit_count and deleted_by are deliberately withheld.
--
-- Consequence worth knowing: `select=*` against this table now fails with
-- 42501, so clients must name their columns. That is intentional -- it means
-- a column added later is private until someone chooses to publish it.
-- ---------------------------------------------------------------------------
revoke all on public.comments from anon, authenticated;

grant select (id, article_slug, author_id, body, created_at, updated_at, deleted_at)
  on public.comments to anon, authenticated;

grant insert (article_slug, body) on public.comments to authenticated;
grant update (body, deleted_at)   on public.comments to authenticated;

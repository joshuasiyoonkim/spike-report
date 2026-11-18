-- SpikeReport: article comments.
--
-- RLS is the ONLY enforcement boundary here. The browser talks straight to
-- PostgREST with a publishable key; there is no server route, no middleware
-- and no service_role key in the app. Assume a hostile client that calls the
-- REST API directly with any payload it likes.
--
-- Three layers, deliberately overlapping, because they fail differently:
--   * column GRANTs  -- cheap, but fail OPEN (a later `grant all ...` undoes
--                       them silently), so never the only defence
--   * RLS policies   -- decide which ROWS a statement may touch
--   * BEFORE triggers-- decide what the row may CONTAIN; fail CLOSED

create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  article_slug text not null,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz,
  edit_count   integer not null default 0,
  deleted_at   timestamptz,
  deleted_by   uuid references public.profiles (id) on delete set null
);

-- Explicit, because the ensure_rls event trigger exists only in the dev
-- project and is absent from prod and the CLI shadow database.
alter table public.comments enable row level security;

do $$
begin
  -- Characters AND bytes. 1500 astral-plane emoji is ~6KB of "1500
  -- characters"; the byte cap is what stops a 1500-char row costing 6KB.
  if not exists (select 1 from pg_constraint where conname = 'comments_body_len') then
    alter table public.comments add constraint comments_body_len
      check (char_length(body) between 1 and 1500 and octet_length(body) <= 6000);
  end if;

  -- Normalisation happens in comments_stamp(), a BEFORE trigger, which runs
  -- before CHECK evaluation -- so "   " is trimmed to '' and then rejected
  -- here rather than slipping through a naive length test.
  if not exists (select 1 from pg_constraint where conname = 'comments_body_not_blank') then
    alter table public.comments add constraint comments_body_not_blank
      check (btrim(body) <> '');
  end if;

  -- C0 controls except tab (09), newline (0a) and carriage return (0d).
  -- These are rendering-abuse payload, nothing else.
  if not exists (select 1 from pg_constraint where conname = 'comments_body_clean') then
    alter table public.comments add constraint comments_body_clean
      check (body !~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]');
  end if;

  -- Matches content/articles/*.md filenames. Cannot stop a well-formed slug
  -- that does not exist -- see the note at the foot of this file.
  if not exists (select 1 from pg_constraint where conname = 'comments_slug_shape') then
    alter table public.comments add constraint comments_slug_shape
      check (article_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
             and char_length(article_slug) between 3 and 120);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'comments_updated_after_created') then
    alter table public.comments add constraint comments_updated_after_created
      check (updated_at is null or updated_at >= created_at);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'comments_edit_count_sane') then
    alter table public.comments add constraint comments_edit_count_sane
      check (edit_count between 0 and 25);
  end if;
end
$$;

-- Thread read: equality on slug then an ordered scan, no sort node.
create index if not exists comments_article_slug_created_at_idx
  on public.comments (article_slug, created_at);

-- Serves the rate-limit count, the author_id predicate in the policies, and
-- the FK column. Postgres does not auto-index FK columns, so without this
-- every profiles delete sequentially scans comments.
create index if not exists comments_author_id_created_at_idx
  on public.comments (author_id, created_at desc);

-- ---------------------------------------------------------------------------
-- The only thing the browser reads.
--
-- Left at default (definer) semantics and owned by postgres on purpose: that
-- is what lets it read comments.body while the API roles cannot. Removing a
-- comment therefore makes its text genuinely unreachable over the API rather
-- than merely hidden by the UI -- which is the whole point of a moderation
-- action. The text stays in the base table so the site owner can still see
-- what was removed, via SQL as postgres.
--
-- This is a deliberate exception. Any OTHER view added later must be created
-- `with (security_invoker = true)` or it silently ignores RLS.
-- ---------------------------------------------------------------------------
create or replace view public.comments_public as
select
  c.id,
  c.article_slug,
  c.author_id,
  c.created_at,
  c.updated_at,
  c.deleted_at,
  case when c.deleted_at is null then c.body           end as body,
  case when c.deleted_at is null then p.display_name   end as display_name,
  case when c.deleted_at is null then p.avatar_url     end as avatar_url
from public.comments c
join public.profiles p on p.id = c.author_id;

-- ---------------------------------------------------------------------------
-- Stamp server-side values and normalise the body.
--
-- BEFORE ROW triggers run before RLS WITH CHECK is evaluated, so the
-- author_id set here is what the insert policy validates.
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
    -- Never from the payload. A client-settable created_at walks straight
    -- through every time-window rate limit below.
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
  -- its author or backdate it -- regardless of what the column grants allow.
  new.id           := old.id;
  new.author_id    := old.author_id;
  new.article_slug := old.article_slug;
  new.created_at   := old.created_at;

  if old.deleted_at is not null and new.deleted_at is null then
    raise exception 'A removed comment cannot be restored.'
      using errcode = 'PT409', hint = 'undelete_forbidden';
  end if;

  if old.deleted_at is null and new.deleted_at is not null then
    -- Removal. Timestamp and actor come from the server, and the text is
    -- left exactly as it was; removing is not editing.
    new.deleted_at := now();
    new.deleted_by := uid;
    new.body       := old.body;
    new.updated_at := old.updated_at;
    new.edit_count := old.edit_count;
    return new;
  end if;

  new.deleted_at := old.deleted_at;
  new.deleted_by := old.deleted_by;
  new.body       := regexp_replace(btrim(new.body), E'\n{3,}', E'\n\n', 'g');

  if new.body is distinct from old.body then
    -- An admin may remove anyone's comment but may not rewrite it. Silently
    -- editing someone else's words is a worse feature than it sounds.
    if old.author_id is distinct from uid then
      raise exception 'A comment can only be edited by its author.'
        using errcode = 'PT403', hint = 'admin_edit_forbidden';
    end if;

    -- Editing is otherwise an un-rate-limited content channel: one comment
    -- could be rewritten with fresh spam indefinitely.
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

drop trigger if exists comments_stamp on public.comments;
create trigger comments_stamp
  before insert or update on public.comments
  for each row execute function public.comments_stamp();

-- ---------------------------------------------------------------------------
-- Rate limit.
--
-- AFTER ... FOR EACH STATEMENT, not FOR EACH ROW. PostgREST accepts an array
-- payload, so one HTTP request is one multi-row INSERT, and whether a per-row
-- trigger sees its own siblings depends on command-counter visibility. A
-- client posting 500 rows in a single request walks through a per-row counter.
-- At statement level every inserted row is visible and the raise still rolls
-- back the whole statement.
--
-- SECURITY DEFINER so the count never depends on the SELECT policy: a policy
-- that hid rows would silently weaken the limit.
--
-- PostgREST maps SQLSTATE PTxxx to HTTP status xxx, so the browser gets a real
-- 429 and supabase-js exposes error.code === 'PT429'. A WITH CHECK failure
-- could not do this: it surfaces as 42501, byte-identical to "not signed in"
-- and to "tried to spoof author_id", so the UI could not tell them apart.
-- ---------------------------------------------------------------------------
create or replace function public.comments_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid      uuid := auth.uid();
  n_minute integer;
  n_hour   integer;
  n_dupe   integer;
begin
  if uid is null then
    return null;
  end if;

  select
    count(*) filter (where c.created_at > now() - interval '1 minute'),
    count(*) filter (where c.created_at > now() - interval '1 hour')
    into n_minute, n_hour
  from public.comments c
  where c.author_id = uid
    and c.created_at > now() - interval '1 hour';

  if n_minute > 3 then
    raise exception 'Slow down. You can post 3 comments a minute.'
      using errcode = 'PT429', hint = 'rate_limited_minute';
  end if;

  if n_hour > 20 then
    raise exception 'You have hit the hourly comment limit.'
      using errcode = 'PT429', hint = 'rate_limited_hour';
  end if;

  -- Absorbs double-clicks and copy-paste flooding.
  select count(*) into n_dupe
  from public.comments a
  where a.author_id = uid
    and a.deleted_at is null
    and a.created_at > now() - interval '10 minutes'
    and exists (
      select 1 from public.comments b
      where b.author_id    = a.author_id
        and b.article_slug = a.article_slug
        and b.body         = a.body
        and b.id          <> a.id
        and b.deleted_at is null
        and b.created_at > now() - interval '10 minutes'
    );

  if n_dupe > 0 then
    raise exception 'You have already posted that.'
      using errcode = 'PT429', hint = 'duplicate_body';
  end if;

  return null;
end
$$;

revoke all on function public.comments_rate_limit() from public, anon, authenticated;

drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit
  after insert on public.comments
  for each statement execute function public.comments_rate_limit();

-- ---------------------------------------------------------------------------
-- Policies.
--
-- (select auth.uid()) rather than bare auth.uid() so the planner evaluates it
-- once per statement as an InitPlan instead of once per row.
-- ---------------------------------------------------------------------------
drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self
  on public.comments
  for insert
  to authenticated
  with check (author_id = (select auth.uid()));

-- REQUIRED for edit and remove to work at all. Postgres applies SELECT
-- policies to the row-locating half of an UPDATE whose WHERE clause
-- references table columns, and PostgREST always emits WHERE id = eq.<uuid>.
-- With RLS on and no SELECT policy, every update would match ZERO rows and
-- silently no-op: no error, no change.
--
-- This does not widen read access to comment text. Row policies and column
-- privileges are independent: the grants below withhold SELECT on body, so
-- the base table still yields no comment text to anyone.
drop policy if exists comments_select_own_or_admin on public.comments;
create policy comments_select_own_or_admin
  on public.comments
  for select
  to authenticated
  using (author_id = (select auth.uid()) or public.is_admin());

drop policy if exists comments_update_own on public.comments;
create policy comments_update_own
  on public.comments
  for update
  to authenticated
  using (author_id = (select auth.uid()) and deleted_at is null)
  with check (author_id = (select auth.uid()));

-- Second permissive policy: the two OR together, so an admin can remove
-- anyone's comment. comments_stamp() is what stops that becoming an edit.
drop policy if exists comments_update_admin on public.comments;
create policy comments_update_admin
  on public.comments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No DELETE policy and no DELETE grant. All removal is soft.

-- ---------------------------------------------------------------------------
-- Grants. Defence in depth, not the boundary -- Supabase's default privileges
-- grant ALL on new public tables, so these can be undone by a later
-- `grant all on all tables in schema public to authenticated` with no error.
-- ---------------------------------------------------------------------------
revoke all on public.comments from anon, authenticated;

-- The minimum that lets PostgREST put id in an UPDATE's WHERE clause.
-- Deliberately NOT body: `select=*` on the base table fails with 42501, which
-- is fine because clients read comments_public instead.
grant select (id) on public.comments to authenticated;

-- id, created_at, edit_count and the moderation columns come from defaults
-- and comments_stamp(), so a client is structurally unable to supply them.
grant insert (article_slug, body) on public.comments to authenticated;
grant update (body, deleted_at)   on public.comments to authenticated;

grant select on public.comments_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Known limit: orphan slugs.
--
-- There is no articles table by design (articles are markdown files, and
-- adding one must not require a database write), so a client can insert
-- well-formed comments under slugs that do not exist. The shape constraint
-- stops unicode, path-ish and multi-kilobyte slugs; it cannot stop
-- plausible-looking invented ones, of which there are effectively infinitely
-- many. What bounds the damage is the per-account rate limit above, and the
-- fact that orphan rows render nowhere. Audit with:
--
--   select article_slug, count(*) from public.comments
--    group by 1 order by 2 desc;
--
-- compared against `ls content/articles`.
-- ---------------------------------------------------------------------------

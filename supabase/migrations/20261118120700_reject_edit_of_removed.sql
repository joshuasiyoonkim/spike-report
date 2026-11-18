-- SpikeReport: refuse edits to a removed comment explicitly.
--
-- Editing a removed comment was already impossible, but only by accident:
-- comments_stamp() let the write through and the comments_body_shape CHECK
-- rejected it afterwards. Two things wrong with relying on that.
--
--   1. Inconsistent. A non-author hits the update policy and gets a silent
--      0-row no-op; the admin passes the policy, reaches the constraint and
--      gets SQLSTATE 23514 instead.
--   2. 23514 is a generic constraint violation that leaks a constraint name
--      to the browser. The comment UI cannot turn that into a sentence, where
--      PT409 with a hint maps to a real HTTP 409 it can.
--
-- A rule worth enforcing is worth enforcing on purpose, in the layer that
-- knows why.

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
    -- A removed comment has no text to edit. Said plainly here rather than
    -- left to the body CHECK, so every caller gets the same answer in the
    -- same shape.
    if old.deleted_at is not null then
      raise exception 'A removed comment cannot be edited.'
        using errcode = 'PT409', hint = 'edit_removed_forbidden';
    end if;

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

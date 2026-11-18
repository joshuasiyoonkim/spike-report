"use client";

import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export const MAX_COMMENT_LENGTH = 1500;

/**
 * The published read surface, named explicitly.
 *
 * `select=*` is deliberately refused by the database (42501): SELECT is
 * granted on a column list rather than the table, so edit_count and
 * deleted_by stay private and any column added later is unpublished until
 * someone chooses otherwise. Naming columns here is that choice.
 *
 * The embed names its foreign key explicitly. comments has TWO foreign keys
 * to profiles -- author_id and deleted_by -- so a bare `profiles(...)` is
 * ambiguous and PostgREST refuses it with PGRST201. Aliasing it to `author`
 * also keeps the shape honest about which one we mean.
 */
const COLUMNS =
  "id, article_slug, author_id, body, created_at, updated_at, deleted_at, " +
  "author:profiles!comments_author_id_fkey(display_name, avatar_url)";

export interface CommentAuthor {
  display_name: string | null;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  article_slug: string;
  author_id: string;
  /** Empty string once removed: the text is gone, not merely hidden. */
  body: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  author: CommentAuthor | null;
}

export async function fetchComments(slug: string): Promise<Comment[]> {
  const { data, error } = await getSupabase()
    .from("comments")
    .select(COLUMNS)
    // id breaks ties so ordering is stable when two comments share a timestamp.
    .eq("article_slug", slug)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
}

/**
 * Posting deliberately does not `.select()` the new row back.
 *
 * The browser has no SELECT privilege on comments.body, so asking for the
 * inserted row would fail with 42501 rather than returning partial data. The
 * caller refetches instead, which also picks up whatever the triggers did to
 * the row: trimmed body, server-assigned id and created_at.
 */
export async function postComment(slug: string, body: string): Promise<void> {
  const { error } = await getSupabase()
    .from("comments")
    .insert({ article_slug: slug, body });

  if (error) throw error;
}

/**
 * Thrown when a write succeeds at the protocol level but changes nothing.
 *
 * Carries a `hint` so it flows through commentErrorMessage like a database
 * error does.
 */
class CommentWriteError extends Error {
  hint: string;
  constructor(hint: string) {
    super(hint);
    this.name = "CommentWriteError";
    this.hint = hint;
  }
}

/**
 * Edit a comment.
 *
 * `count: "exact"` is the important part. RLS decides which rows an UPDATE may
 * touch, and a row it disallows is not an error -- the statement simply
 * matches nothing and returns 200. Without asking for the count, editing
 * someone else's comment would look like success and the UI would cheerfully
 * show stale text. Zero rows means the policy said no.
 */
export async function updateComment(id: string, body: string): Promise<void> {
  const { error, count } = await getSupabase()
    .from("comments")
    .update({ body }, { count: "exact" })
    .eq("id", id);

  if (error) throw error;
  if (count === 0) throw new CommentWriteError("no_rows_matched");
}

/**
 * Remove a comment, softly.
 *
 * Only deleted_at is sent, and the value does not matter: the trigger
 * overwrites it with the server clock, records who did it, and moves the text
 * into the private archive. Sending it is just how the intent is expressed.
 */
export async function removeComment(id: string): Promise<void> {
  const { error, count } = await getSupabase()
    .from("comments")
    .update({ deleted_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id);

  if (error) throw error;
  if (count === 0) throw new CommentWriteError("no_rows_matched");
}

/**
 * Database hints, mapped to something a reader can act on.
 *
 * The triggers raise with SQLSTATE PTxxx, which PostgREST turns into HTTP xxx
 * and supabase-js exposes as error.code, with the sentinel in error.hint.
 * Matching on hint rather than on message means the wording can change in the
 * database without silently breaking this mapping.
 */
const HINT_MESSAGES: Record<string, string> = {
  auth_required: "You need to be signed in to comment.",
  rate_limited_minute: "Slow down — you can post 3 comments a minute.",
  rate_limited_hour: "You've hit the hourly comment limit. Try again later.",
  duplicate_body: "You've already posted that.",
  edit_limit: "This comment has been edited too many times.",
  edit_removed_forbidden: "This comment was removed, so it can't be edited.",
  undelete_forbidden: "A removed comment can't be restored.",
  admin_edit_forbidden: "Only the author can edit a comment.",
  no_rows_matched: "That comment is no longer yours to change. Refresh the page.",
};

export function commentErrorMessage(error: unknown): string {
  const pg = error as Partial<PostgrestError> | null;
  const hint = pg?.hint ?? undefined;

  if (hint && HINT_MESSAGES[hint]) return HINT_MESSAGES[hint];

  // A length or shape violation that slipped past the client-side check.
  if (pg?.code === "23514") return "That comment doesn't look right. Try rewording it.";

  // Never surface a raw Postgres message: it leaks schema detail and reads
  // like a stack trace to someone who just wanted to post a take.
  return "Something went wrong posting that. Try again.";
}

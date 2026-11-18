"use client";

import { useState } from "react";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/format";
import { commentErrorMessage, removeComment, updateComment, type Comment } from "@/lib/comments";
import { CommentEditor } from "./CommentEditor";

/**
 * One comment.
 *
 * The body is rendered as a plain JSX text child -- `{comment.body}` -- and
 * nothing else. No `marked`, no `dangerouslySetInnerHTML`, not now and not
 * later. React escapes it, `whitespace-pre-wrap` keeps the author's line
 * breaks, and `break-words` stops a pasted URL blowing out the layout.
 *
 * This matters more here than anywhere else in the codebase. The article body
 * on this same page legitimately runs through marked and raw HTML, because
 * Josh writes it. Comment bodies are written by strangers, and the Supabase
 * session lives in localStorage -- so a stored-XSS hole in this component is
 * account theft for every reader, including the admin. No RLS policy can
 * mitigate that; only this component can.
 *
 * The Edit and Remove controls are affordances only. Authority lives in the
 * RLS policies and the comments_stamp trigger, which is why showing a button
 * to the wrong person would be a cosmetic bug rather than a security one.
 */
export function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  comment: Comment;
  currentUserId: string | null;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removed = comment.deleted_at !== null;
  const name = comment.author?.display_name ?? "Someone";
  const avatar = comment.author?.avatar_url ?? null;

  const isAuthor = currentUserId !== null && currentUserId === comment.author_id;
  const canEdit = isAuthor && !removed;
  // An admin may remove anyone's comment but never rewrite one: the trigger
  // rejects a body change from a non-author with PT403.
  const canRemove = (isAuthor || isAdmin) && !removed;

  if (removed) {
    return (
      <li className="flex gap-3 py-4">
        <span className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-ink-800/60" aria-hidden="true" />
        <p className="text-sm italic text-slate-500">[removed]</p>
      </li>
    );
  }

  async function handleRemove() {
    setRemoving(true);
    setError(null);
    try {
      await removeComment(comment.id);
      onChanged();
    } catch (err) {
      setError(commentErrorMessage(err));
      setRemoving(false);
      setConfirmingRemove(false);
    }
  }

  return (
    <li className="flex gap-3 py-4">
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={32}
          height={32}
          className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-ink-800 object-cover"
        />
      ) : (
        <span
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-accent"
          aria-hidden="true"
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-white">{name}</span>
          <time className="text-xs text-slate-500" dateTime={comment.created_at}>
            {formatTimeAgo(comment.created_at)}
          </time>
          {comment.updated_at && <span className="text-xs text-slate-600">edited</span>}
        </div>

        {editing ? (
          <div className="mt-2">
            <CommentEditor
              initialValue={comment.body}
              submitLabel="Save"
              busyLabel="Saving..."
              autoFocus
              onSubmit={async (body) => {
                await updateComment(comment.id, body);
                setEditing(false);
                onChanged();
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
              {comment.body}
            </p>

            {(canEdit || canRemove) && (
              <div className="mt-2 flex items-center gap-3 text-xs">
                {canEdit && !confirmingRemove && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    aria-label={`Edit your comment from ${formatTimeAgo(comment.created_at)}`}
                    className="text-slate-500 transition-colors hover:text-accent"
                  >
                    Edit
                  </button>
                )}

                {canRemove &&
                  (confirmingRemove ? (
                    <span className="flex items-center gap-3">
                      {/* Confirmed because the trigger refuses to restore a
                          removed comment: this cannot be undone. */}
                      <span className="text-slate-400">Remove this comment?</span>
                      <button
                        type="button"
                        onClick={handleRemove}
                        disabled={removing}
                        className="font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-60"
                      >
                        {removing ? "Removing..." : "Remove"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingRemove(false)}
                        disabled={removing}
                        className="text-slate-500 transition-colors hover:text-white disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingRemove(true)}
                      aria-label={`Remove ${isAuthor ? "your" : `${name}'s`} comment`}
                      className="text-slate-500 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  ))}
              </div>
            )}

            {error && (
              <p role="alert" className="mt-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </li>
  );
}

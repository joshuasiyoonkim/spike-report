"use client";

import Image from "next/image";
import { formatTimeAgo } from "@/lib/format";
import type { Comment } from "@/lib/comments";

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
 */
export function CommentItem({ comment }: { comment: Comment }) {
  const removed = comment.deleted_at !== null;
  const name = comment.author?.display_name ?? "Someone";
  const avatar = comment.author?.avatar_url ?? null;

  if (removed) {
    return (
      <li className="flex gap-3 py-4">
        <span
          className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-ink-800/60"
          aria-hidden="true"
        />
        <p className="text-sm italic text-slate-500">[removed]</p>
      </li>
    );
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
          {comment.updated_at && (
            <span className="text-xs text-slate-600">edited</span>
          )}
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
          {comment.body}
        </p>
      </div>
    </li>
  );
}

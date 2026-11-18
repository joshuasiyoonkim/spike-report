"use client";

import type { Comment } from "@/lib/comments";
import { CommentItem } from "./CommentItem";

export function CommentList({
  comments,
  loading,
  error,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  if (loading) {
    return (
      <div className="mt-6 space-y-4" aria-busy="true" aria-label="Loading comments">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-3">
            <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-ink-800/60" />
            <div className="flex-1 space-y-2 py-1">
              <span className="block h-3 w-28 animate-pulse rounded bg-ink-800/60" />
              <span className="block h-3 w-full animate-pulse rounded bg-ink-800/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="mt-6 text-sm text-red-400">
        {error}
      </p>
    );
  }

  if (comments.length === 0) {
    return <p className="mt-6 text-sm text-slate-500">No comments yet. Be the first.</p>;
  }

  return (
    <ul className="mt-4 divide-y divide-ink-700/60">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onChanged={onChanged}
        />
      ))}
    </ul>
  );
}

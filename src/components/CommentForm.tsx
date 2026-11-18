"use client";

import { useRef, useState } from "react";
import { MAX_COMMENT_LENGTH, commentErrorMessage, postComment } from "@/lib/comments";

const FIELD =
  "w-full rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/70 focus:outline-none";

export function CommentForm({
  slug,
  onPosted,
}: {
  slug: string;
  onPosted: () => Promise<void> | void;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const trimmed = body.trim();
  const tooLong = body.length > MAX_COMMENT_LENGTH;
  const canSubmit = trimmed.length > 0 && !tooLong && !busy;
  const remaining = MAX_COMMENT_LENGTH - body.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Guards the double-click as well as the empty submit; the database has
    // its own duplicate check, but there is no reason to make it do the work.
    if (!canSubmit) return;

    setBusy(true);
    setError(null);

    try {
      await postComment(slug, trimmed);
      setBody("");
      await onPosted();
      textarea.current?.focus();
    } catch (err) {
      setError(commentErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label htmlFor="comment-body" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        ref={textarea}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Add your take..."
        disabled={busy}
        className={`${FIELD} resize-y disabled:opacity-60`}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`text-xs tabular-nums ${
            tooLong
              ? "text-red-400"
              : remaining <= 150
                ? "text-amber-400"
                : "text-slate-600"
          }`}
        >
          {remaining} left
        </span>

        <button type="submit" disabled={!canSubmit} className="btn-primary disabled:opacity-50">
          {busy ? "Posting..." : "Post comment"}
        </button>
      </div>

      {/* A mapped message, never a raw Postgres string. */}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}

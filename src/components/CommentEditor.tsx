"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_COMMENT_LENGTH, commentErrorMessage } from "@/lib/comments";

const FIELD =
  "w-full rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/70 focus:outline-none";

/**
 * The textarea, counter, validation and error display, shared by the composer
 * and the inline edit.
 *
 * Shared rather than duplicated because the two would otherwise drift: the
 * length cap, the trim rule and the amber threshold all have to agree with
 * each other and with the database CHECK constraint.
 */
export function CommentEditor({
  initialValue = "",
  submitLabel,
  busyLabel,
  placeholder,
  autoFocus = false,
  clearOnSuccess = false,
  onSubmit,
  onCancel,
}: {
  initialValue?: string;
  submitLabel: string;
  busyLabel: string;
  placeholder?: string;
  autoFocus?: boolean;
  clearOnSuccess?: boolean;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const el = textarea.current;
      el?.focus();
      // Caret to the end rather than the start, so editing does not begin by
      // overwriting what you wrote.
      el?.setSelectionRange(el.value.length, el.value.length);
    }
  }, [autoFocus]);

  const trimmed = body.trim();
  const tooLong = body.length > MAX_COMMENT_LENGTH;
  const unchanged = trimmed === initialValue.trim();
  const canSubmit = trimmed.length > 0 && !tooLong && !busy && !unchanged;
  const remaining = MAX_COMMENT_LENGTH - body.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Guards the double-click as well as the empty submit. The database has
    // its own duplicate check; no reason to make it do the work.
    if (!canSubmit) return;

    setBusy(true);
    setError(null);

    try {
      await onSubmit(trimmed);
      if (clearOnSuccess) {
        setBody("");
        textarea.current?.focus();
      }
    } catch (err) {
      setError(commentErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="comment-body" className="sr-only">
        {submitLabel}
      </label>
      <textarea
        ref={textarea}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={placeholder}
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

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="text-sm text-slate-400 transition-colors hover:text-white disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button type="submit" disabled={!canSubmit} className="btn-primary disabled:opacity-50">
            {busy ? busyLabel : submitLabel}
          </button>
        </div>
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

"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Clip } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ClipModal({
  clips,
  index,
  onNavigate,
  onClose,
}: {
  clips: Clip[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const clip = clips[index];
  const hasPrev = index > 0;
  const hasNext = index < clips.length - 1;

  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(index - 1);
  }, [index, onNavigate]);

  const goNext = useCallback(() => {
    if (index < clips.length - 1) onNavigate(index + 1);
  }, [index, clips.length, onNavigate]);

  // Keyboard: arrows to move between clips, Escape to close. Lock background scroll.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, goNext, goPrev]);

  // Scroll to advance, throttled so one gesture moves one clip.
  const lastNav = useRef(0);
  function onWheel(e: React.WheelEvent) {
    const now = Date.now();
    if (now - lastNav.current < 500 || Math.abs(e.deltaY) < 20) return;
    lastNav.current = now;
    if (e.deltaY > 0) goNext();
    else goPrev();
  }

  const src = `https://www.youtube-nocookie.com/embed/${clip.videoId}?autoplay=1`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      onWheel={onWheel}
      role="dialog"
      aria-modal="true"
      aria-label={clip.title}
    >
      {/* Up / down navigation, Shorts-style, pinned to the right edge */}
      <div
        className="fixed right-3 top-1/2 z-[101] flex -translate-y-1/2 flex-col items-center gap-2 sm:right-5"
        onClick={(e) => e.stopPropagation()}
      >
        <NavButton dir="up" onClick={goPrev} disabled={!hasPrev} />
        <span className="text-xs tabular-nums text-slate-400">
          {index + 1} / {clips.length}
        </span>
        <NavButton dir="down" onClick={goNext} disabled={!hasNext} />
      </div>

      {/* Stop clicks inside the dialog from closing it */}
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 bg-ink-900/80 text-slate-300 transition-colors hover:border-accent/60 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="surface overflow-hidden">
          <div className="relative aspect-video w-full bg-ink-900">
            <iframe
              key={clip.videoId}
              src={src}
              title={clip.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg font-semibold leading-snug text-white">
              {clip.title}
            </h3>
            {(clip.player || clip.team) && (
              <p className="mt-1.5 text-sm text-slate-300">
                {clip.player && (
                  <span className="font-medium text-accent">{clip.player}</span>
                )}
                {clip.player && clip.team && <span className="text-slate-500"> / </span>}
                {clip.team && <span>{clip.team}</span>}
              </p>
            )}
            {clip.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {clip.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {clip.event && (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent ring-1 ring-inset ring-accent/25">
                  {clip.event}
                </span>
              )}
              <time className="text-xs text-slate-500" dateTime={clip.date}>
                {formatDate(clip.date)}
              </time>
              {clip.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-ink-700/60 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "up" | "down";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "up" ? "Previous clip" : "Next clip"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 bg-ink-900/80 text-slate-200 transition-colors hover:border-accent/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-700 disabled:hover:text-slate-200"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={dir === "up" ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

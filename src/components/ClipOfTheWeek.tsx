"use client";

import { useState } from "react";
import type { Clip } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { YouTubeThumb } from "./YouTubeThumb";

/** Large featured clip that plays inline when clicked. */
export function ClipOfTheWeek({ clip }: { clip: Clip }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="surface overflow-hidden">
      <div className="grid md:grid-cols-[3fr_2fr]">
        <div className="relative aspect-video bg-ink-900">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${clip.videoId}?autoplay=1&rel=0`}
              title={clip.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${clip.title}`}
              className="group absolute inset-0 block h-full w-full"
            >
              <YouTubeThumb
                videoId={clip.videoId}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-ink-950/30 transition-colors group-hover:bg-ink-950/50">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink-950/70 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" fill="#27dabd" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Clip of the week
          </p>
          <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
            {clip.title}
          </h3>
          {(clip.player || clip.team) && (
            <p className="mt-2 text-sm text-slate-300">
              {clip.player && (
                <span className="font-medium text-accent">{clip.player}</span>
              )}
              {clip.player && clip.team && (
                <span className="text-slate-500"> / </span>
              )}
              {clip.team && <span>{clip.team}</span>}
            </p>
          )}
          {clip.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400">
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
          </div>
        </div>
      </div>
    </article>
  );
}

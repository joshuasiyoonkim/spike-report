import type { Clip } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ClipCard({ clip, onOpen }: { clip: Clip; onOpen: () => void }) {
  const thumbnail = `https://img.youtube.com/vi/${clip.videoId}/maxresdefault.jpg`;

  return (
    <article className="group surface overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Play ${clip.title}`}
        className="relative block aspect-video w-full bg-ink-900"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* dim + play button on hover */}
        <span className="absolute inset-0 flex items-center justify-center bg-ink-950/30 transition-colors group-hover:bg-ink-950/50">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink-950/70 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="#27dabd" />
            </svg>
          </span>
        </span>
      </button>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-white">
          {clip.title}
        </h3>
        {(clip.player || clip.team) && (
          <p className="mt-1.5 text-sm text-slate-300">
            {clip.player && <span className="font-medium text-accent">{clip.player}</span>}
            {clip.player && clip.team && <span className="text-slate-500"> / </span>}
            {clip.team && <span>{clip.team}</span>}
          </p>
        )}
        {clip.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
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
    </article>
  );
}

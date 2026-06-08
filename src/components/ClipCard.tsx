import type { Clip } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ClipCard({ clip }: { clip: Clip }) {
  const src = `https://www.youtube-nocookie.com/embed/${clip.videoId}`;

  return (
    <article className="surface overflow-hidden">
      <div className="relative aspect-video w-full bg-ink-900">
        <iframe
          src={src}
          title={clip.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
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

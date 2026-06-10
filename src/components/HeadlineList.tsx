import Image from "next/image";
import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { formatDateShort } from "@/lib/format";
import { categoryGradient } from "./CategoryTag";
import { YouTubeThumb } from "./YouTubeThumb";

function Thumb({ article }: { article: ArticleMeta }) {
  return (
    <span className="relative block w-24 shrink-0 self-center overflow-hidden rounded-lg bg-ink-900 aspect-video">
      {article.coverImage ? (
        <Image
          src={article.coverImage}
          alt=""
          fill
          className="object-cover"
          sizes="96px"
        />
      ) : article.videoId ? (
        <YouTubeThumb
          videoId={article.videoId}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(
            article.category
          )}`}
        />
      )}
    </span>
  );
}

/** Compact headline list with small thumbnails — fits several articles in very little space. */
export function HeadlineList({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <ol className="surface divide-y divide-ink-700/60 overflow-hidden">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link
            href={`/articles/${article.slug}`}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-800/60"
          >
            <Thumb article={article} />
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-medium leading-snug text-white transition-colors group-hover:text-accent">
                {article.title}
              </span>
              <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="text-slate-400">{article.category}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.date}>
                  {formatDateShort(article.date)}
                </time>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

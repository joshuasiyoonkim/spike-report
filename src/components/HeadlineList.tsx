import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

/** Compact numbered headline list — fits several articles in very little space. */
export function HeadlineList({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <ol className="surface divide-y divide-ink-700/60 overflow-hidden">
      {articles.map((article, i) => (
        <li key={article.slug}>
          <Link
            href={`/articles/${article.slug}`}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-800/60"
          >
            <span className="mt-0.5 font-display text-sm font-bold text-ink-600 transition-colors group-hover:text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
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

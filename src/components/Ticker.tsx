import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";

/**
 * Thin scrolling headline bar shown at the very top of the homepage.
 * Two copies of the list scroll by -50% for a seamless CSS-only loop.
 */
export function Ticker({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="flex overflow-hidden border-b border-ink-700/70 bg-ink-900/60">
      <div className="z-10 flex shrink-0 items-center gap-2 border-r border-ink-700/70 bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        Latest
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex" aria-hidden={copy === 1}>
              {articles.map((article) => (
                <Link
                  key={`${copy}-${article.slug}`}
                  href={`/articles/${article.slug}`}
                  tabIndex={copy === 1 ? -1 : undefined}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-slate-300 transition-colors hover:text-accent"
                >
                  <span className="text-xs text-accent" aria-hidden="true">
                    ◆
                  </span>
                  {article.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

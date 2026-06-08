import Image from "next/image";
import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { CategoryTag, categoryGradient } from "./CategoryTag";

function CoverArt({
  category,
  coverImage,
  videoId,
  className = "",
}: {
  category: string;
  coverImage?: string;
  videoId?: string;
  className?: string;
}) {
  const resolvedImage =
    coverImage ?? (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined);

  if (resolvedImage) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={resolvedImage}
          alt={category}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${categoryGradient(
        category
      )} ${className}`}
    >
      {/* faint grid texture */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* category watermark */}
      <span className="absolute -right-2 bottom-1 select-none font-display text-5xl font-bold uppercase tracking-tight text-white/[0.06] sm:text-6xl">
        {category}
      </span>
      <svg
        viewBox="0 0 32 32"
        className="absolute left-4 top-4 h-7 w-7 opacity-40"
        fill="none"
        aria-hidden="true"
      >
        <path d="M16 7 L20 11 L16 23 L12 11 Z" fill="#27dabd" />
      </svg>
    </div>
  );
}

export function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <article className="group surface overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
      <Link href={`/articles/${article.slug}`} className="block">
        <CoverArt
          category={article.category}
          coverImage={article.coverImage}
          videoId={article.videoId}
          className="aspect-[16/9]"
        />
        <div className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <CategoryTag category={article.category} />
            <span className="text-xs text-slate-500">
              {article.readingTime} min read
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug text-white transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {article.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span>{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function FeaturedArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <article className="group surface overflow-hidden transition-all duration-300 hover:border-accent/40">
      <Link
        href={`/articles/${article.slug}`}
        className="grid md:grid-cols-2"
      >
        <CoverArt
          category={article.category}
          coverImage={article.coverImage}
          videoId={article.videoId}
          className="aspect-[16/10] md:aspect-auto md:h-full md:min-h-[20rem]"
        />
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Featured
            </span>
            <CategoryTag category={article.category} />
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-white transition-colors group-hover:text-accent sm:text-3xl">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-3 leading-relaxed text-slate-400">
            {article.excerpt}
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <span>{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

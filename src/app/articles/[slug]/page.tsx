import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { CategoryTag } from "@/components/CategoryTag";
import { formatDate } from "@/lib/format";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <article className="py-12 sm:py-16">
      <Container className="max-w-prose">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-accent"
        >
          ← All articles
        </Link>

        {article.coverImage && !article.videoId && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {article.videoId && (
          <div className="mt-8 overflow-hidden rounded-xl border border-ink-700/80">
            <div className="relative aspect-video w-full bg-ink-900">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${article.videoId}${article.videoStart ? `?start=${article.videoStart}` : ""}`}
                title={article.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        <header className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <CategoryTag category={article.category} />
            <span className="text-xs text-slate-500">
              {article.readingTime} min read
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              {article.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-2 border-t border-ink-700/70 pt-6 text-sm text-slate-500">
            <span className="text-slate-300">{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </div>
        </header>

        <div
          className="prose prose-invert mt-10 max-w-none
            prose-headings:font-display prose-headings:tracking-tight prose-headings:text-white
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-li:text-slate-300 prose-li:marker:text-accent
            prose-strong:text-white
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-accent prose-blockquote:text-slate-300
            prose-code:rounded prose-code:bg-ink-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-['']
            prose-hr:border-ink-700
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        <div className="mt-14 border-t border-ink-700/70 pt-6">
          <Link
            href="/articles"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-accent"
          >
            ← Back to all articles
          </Link>
        </div>
      </Container>
    </article>
  );
}

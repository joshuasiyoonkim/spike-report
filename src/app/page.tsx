import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ArticleCard, FeaturedArticleCard } from "@/components/ArticleCard";
import { ClipCard } from "@/components/ClipCard";
import { CategoryTag } from "@/components/CategoryTag";
import {
  getAllArticles,
  getFeaturedArticle,
  getCategories,
} from "@/lib/articles";
import { getAllClips } from "@/lib/clips";

export default function HomePage() {
  const featured = getFeaturedArticle();
  const allArticles = getAllArticles();
  const categories = getCategories();
  const latest = allArticles
    .filter((a) => a.slug !== featured?.slug)
    .slice(0, 3);
  const clips = getAllClips().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-700/70">
        <Container className="relative py-20 sm:py-28">
          <div className="max-w-3xl animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              A personal Valorant hub
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Patch takes, roster moves, and the{" "}
              <span className="text-accent">clips worth replaying.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              SpikeReport is where I break down patch notes, track the pro
              circuit, review skins, and post the gameplay clips I can&apos;t stop
              watching.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/articles" className="btn-primary">
                Read the latest
              </Link>
              <Link href="/clips" className="btn-ghost">
                Watch clips
              </Link>
            </div>

            {categories.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-slate-500">
                  Topics
                </span>
                {categories.map((c) => (
                  <CategoryTag key={c} category={c} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Featured */}
      {featured && (
        <section className="py-14 sm:py-16">
          <Container>
            <SectionHeading eyebrow="Don't miss" title="Featured" />
            <FeaturedArticleCard article={featured} />
          </Container>
        </section>
      )}

      {/* Latest articles */}
      {latest.length > 0 && (
        <section className="py-2 sm:py-4">
          <Container>
            <SectionHeading
              eyebrow="Fresh off the keyboard"
              title="Latest articles"
              href="/articles"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Latest clips */}
      {clips.length > 0 && (
        <section className="py-14 sm:py-16">
          <Container>
            <SectionHeading
              eyebrow="From the server"
              title="Recent clips"
              href="/clips"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

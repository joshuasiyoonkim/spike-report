import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ArticleCard, FeaturedArticleCard } from "@/components/ArticleCard";
import { ClipGrid } from "@/components/ClipGrid";
import { ClipOfTheWeek } from "@/components/ClipOfTheWeek";
import { HeadlineList } from "@/components/HeadlineList";
import { PatchWidget } from "@/components/PatchWidget";
import { getArticlesBySection } from "@/lib/articles";
import { getAllClips } from "@/lib/clips";
import { getHomepageConfig } from "@/lib/homepage";

export default function HomePage() {
  const config = getHomepageConfig();
  // The homepage stays Valorant-first; sports lives in its own strip below.
  const valorantArticles = getArticlesBySection("valorant");
  const sportsArticles = getArticlesBySection("sports").slice(0, 3);
  const [newest, ...rest] = valorantArticles;
  const latest = rest.slice(0, 3);

  const allClips = getAllClips();
  const clipOfTheWeek =
    allClips.find((c) => c.id === config.clipOfTheWeek) ?? allClips[0];
  const moreClips = allClips
    .filter((c) => c.id !== clipOfTheWeek?.id)
    .slice(0, 3);

  return (
    <>
      {/* Hero — compact, with headlines and patch widget beside it */}
      <section className="border-b border-ink-700/70">
        <Container className="py-10 sm:py-14">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div className="animate-fade-up">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                A personal Valorant hub
              </p>
              <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Patch takes, roster moves, and the{" "}
                <span className="text-accent">clips worth replaying.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                SpikeReport is where I break down patch notes, track the pro
                circuit, review skins, and curate the best plays from VCT
                tournaments.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/articles" className="btn-primary">
                  Read the latest
                </Link>
                <Link href="/clips" className="btn-ghost">
                  Watch clips
                </Link>
              </div>

              {config.resources.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-500">
                    Daily reads
                  </span>
                  {config.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-ink-700 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-accent/60 hover:text-white"
                    >
                      {r.label}
                      <span aria-hidden="true" className="text-slate-500">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {config.patch && <PatchWidget patch={config.patch} />}
              <HeadlineList articles={valorantArticles.slice(0, 4)} />
            </div>
          </div>
        </Container>
      </section>

      {/* Newest article, big */}
      {newest && (
        <section className="py-12 sm:py-14">
          <Container>
            <SectionHeading eyebrow="Just posted" title="The latest" />
            <FeaturedArticleCard article={newest} />
          </Container>
        </section>
      )}

      {/* More articles */}
      {latest.length > 0 && (
        <section className="py-2 sm:py-4">
          <Container>
            <SectionHeading
              eyebrow="Fresh off the keyboard"
              title="More articles"
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

      {/* Off the Server — sports takes */}
      {sportsArticles.length > 0 && (
        <section className="py-12 sm:py-14">
          <Container>
            <SectionHeading
              eyebrow="Also watching"
              title="Off the Server"
              href="/articles?section=sports"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sportsArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Hot takes */}
      {config.hotTakes.length > 0 && (
        <section className="mt-12 border-y border-ink-700/70 bg-ink-900/40 py-10 sm:mt-14">
          <Container>
            <p className="mb-5 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Hot takes
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {config.hotTakes.map((take) => (
                <blockquote
                  key={take}
                  className="border-l-2 border-accent pl-4 font-display text-lg font-medium leading-snug text-slate-200"
                >
                  {take}
                </blockquote>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Clips */}
      {clipOfTheWeek && (
        <section className="py-12 sm:py-14">
          <Container>
            <SectionHeading
              eyebrow="From the pro scene"
              title="Clips"
              href="/clips"
            />
            <ClipOfTheWeek clip={clipOfTheWeek} />
            {moreClips.length > 0 && (
              <div className="mt-6">
                <ClipGrid clips={moreClips} />
              </div>
            )}
          </Container>
        </section>
      )}
    </>
  );
}

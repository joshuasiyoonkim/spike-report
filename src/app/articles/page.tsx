import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ArticlesBrowser } from "@/components/ArticlesBrowser";
import { getAllArticles } from "@/lib/articles";
import { SECTIONS, type Section } from "@/lib/types";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Patch note opinions, roster analysis, drama coverage, skin reviews, and the occasional sports take.",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const initialSection = (SECTIONS as readonly string[]).includes(section ?? "")
    ? (section as Section)
    : "all";

  const articles = getAllArticles();

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <header className="mb-10 max-w-2xl">
          <p className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-accent">
            The writing
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Articles
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            Long and short takes on everything Valorant — balance changes, the
            pro circuit, roster shuffles, and the occasional skin verdict. Plus
            whatever else is on the TV: NBA, World Cup, the works.
          </p>
        </header>

        {/* key forces a remount when the ?section= param changes, so the nav link works from within the page */}
        <ArticlesBrowser
          key={initialSection}
          articles={articles}
          initialSection={initialSection}
        />
      </Container>
    </section>
  );
}

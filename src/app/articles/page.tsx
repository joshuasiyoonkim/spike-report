import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ArticlesBrowser } from "@/components/ArticlesBrowser";
import { getAllArticles, getCategories } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Patch note opinions, roster analysis, drama coverage, and skin reviews.",
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const categories = getCategories();

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
            pro circuit, roster shuffles, and the occasional skin verdict.
          </p>
        </header>

        <ArticlesBrowser articles={articles} categories={categories} />
      </Container>
    </section>
  );
}

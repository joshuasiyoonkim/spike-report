import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ArticlesBrowser } from "@/components/ArticlesBrowser";
import { getAllArticles } from "@/lib/articles";
import { SECTIONS, type Section } from "@/lib/types";

type Props = {
  searchParams: Promise<{ section?: string }>;
};

/** Per-view page header copy. The sports view gets its own framing. */
const PAGE_COPY = {
  default: {
    eyebrow: "The writing",
    title: "Articles",
    description:
      "Long and short takes on everything Valorant — balance changes, the pro circuit, roster shuffles, and the occasional skin verdict.",
  },
  sports: {
    eyebrow: "Also watching",
    title: "Off the Server",
    description:
      "This is a Valorant site, but the TV doesn't care. When the NBA playoffs or the World Cup produce a take too big to sit on, it lands here instead of getting crammed into a Valorant article. Same voice, different game.",
  },
} as const;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { section } = await searchParams;
  const copy = section === "sports" ? PAGE_COPY.sports : PAGE_COPY.default;
  return { title: copy.title, description: copy.description };
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { section } = await searchParams;
  const activeSection = (SECTIONS as readonly string[]).includes(section ?? "")
    ? (section as Section)
    : "all";
  const copy = activeSection === "sports" ? PAGE_COPY.sports : PAGE_COPY.default;

  const articles = getAllArticles();

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <header className="mb-10 max-w-2xl">
          <p className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            {copy.description}
          </p>
        </header>

        {/* key remounts the browser when the ?section= param changes, resetting the category filter */}
        <ArticlesBrowser
          key={activeSection}
          articles={articles}
          section={activeSection}
        />
      </Container>
    </section>
  );
}

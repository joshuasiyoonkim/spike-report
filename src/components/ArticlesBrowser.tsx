"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, SECTION_LABELS, type Section } from "@/lib/types";
import type { ArticleMeta } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

type SectionFilter = "all" | Section;

const SECTION_FILTERS: { value: SectionFilter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "valorant", label: SECTION_LABELS.valorant },
  { value: "sports", label: SECTION_LABELS.sports },
];

export function ArticlesBrowser({
  articles,
  initialSection = "all",
}: {
  articles: ArticleMeta[];
  initialSection?: SectionFilter;
}) {
  const [section, setSection] = useState<SectionFilter>(initialSection);
  const [active, setActive] = useState<string>("All");

  const inSection = useMemo(
    () =>
      section === "all"
        ? articles
        : articles.filter((a) => a.section === section),
    [section, articles]
  );

  // Categories present in the active section, in canonical order.
  const filters = useMemo(() => {
    const seen = new Set(inSection.map((a) => a.category));
    return ["All", ...CATEGORIES.filter((c) => seen.has(c))];
  }, [inSection]);

  const visible = useMemo(
    () =>
      active === "All"
        ? inSection
        : inSection.filter((a) => a.category === active),
    [active, inSection]
  );

  function switchSection(next: SectionFilter) {
    setSection(next);
    setActive("All"); // category list changes with the section
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SECTION_FILTERS.map((s) => {
          const isActive = s.value === section;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => switchSection(s.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-ink-800 text-white ring-1 ring-inset ring-accent/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter === active;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-ink-950"
                  : "border border-ink-700 text-slate-300 hover:border-accent/50 hover:text-white"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-slate-500">
          No articles in this category yet.
        </p>
      )}
    </div>
  );
}

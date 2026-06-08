"use client";

import { useMemo, useState } from "react";
import type { ArticleMeta } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

export function ArticlesBrowser({
  articles,
  categories,
}: {
  articles: ArticleMeta[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");

  const filters = useMemo(() => ["All", ...categories], [categories]);
  const visible = useMemo(
    () =>
      active === "All"
        ? articles
        : articles.filter((a) => a.category === active),
    [active, articles]
  );

  return (
    <div>
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

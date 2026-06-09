import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";

/** Parse an ISO date defensively — returns undefined instead of an Invalid Date. */
function toDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const newest = toDate(articles[0]?.date) ?? new Date();

  return [
    {
      url: SITE_URL,
      lastModified: newest,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: newest,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/clips`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: toDate(article.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

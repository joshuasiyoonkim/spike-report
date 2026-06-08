import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Article, ArticleMeta } from "./types";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

marked.setOptions({ gfm: true, breaks: false });

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function readSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function parseFile(slug: string): Article | null {
  const fullPath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const html = marked.parse(content) as string;

  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    category: String(data.category ?? "Guides"),
    excerpt: String(data.excerpt ?? ""),
    author: String(data.author ?? "Josh"),
    featured: Boolean(data.featured),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    videoId: data.videoId ? String(data.videoId) : undefined,
    readingTime: estimateReadingTime(content),
    html,
  };
}

function toMeta(article: Article): ArticleMeta {
  const { html, ...meta } = article;
  return meta;
}

/** All articles, newest first (metadata only — no rendered HTML). */
export function getAllArticles(): ArticleMeta[] {
  return readSlugs()
    .map(parseFile)
    .filter((a): a is Article => a !== null)
    .map(toMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** A single article with rendered HTML, or null if not found. */
export function getArticleBySlug(slug: string): Article | null {
  return parseFile(slug);
}

/** The featured article if one is flagged, otherwise the most recent. */
export function getFeaturedArticle(): ArticleMeta | null {
  const all = getAllArticles();
  return all.find((a) => a.featured) ?? all[0] ?? null;
}

/** Distinct categories present in the content, sorted alphabetically. */
export function getCategories(): string[] {
  const set = new Set(getAllArticles().map((a) => a.category));
  return Array.from(set).sort();
}

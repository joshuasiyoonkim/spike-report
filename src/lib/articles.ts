import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { CATEGORIES, type Article, type ArticleMeta, type CategoryName } from "./types";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

marked.setOptions({ gfm: true, breaks: false });

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Coerce frontmatter to a known category; anything unrecognized becomes "Opinion". */
function normalizeCategory(value: unknown): CategoryName {
  const name = String(value ?? "");
  return (CATEGORIES as readonly string[]).includes(name)
    ? (name as CategoryName)
    : "Opinion";
}

function readSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".md") && file !== "CLAUDE.md")
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
    // YAML may parse a bare timestamp into a Date; normalize back to a string.
    date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ""),
    category: normalizeCategory(data.category),
    excerpt: String(data.excerpt ?? ""),
    author: String(data.author ?? "Josh"),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    videoId: data.videoId ? String(data.videoId) : undefined,
    videoStart: data.videoStart ? Number(data.videoStart) : undefined,
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
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** A single article with rendered HTML, or null if not found. */
export function getArticleBySlug(slug: string): Article | null {
  return parseFile(slug);
}

/** Distinct categories present in the content, in canonical order. */
export function getCategories(): CategoryName[] {
  const set = new Set(getAllArticles().map((a) => a.category));
  return CATEGORIES.filter((c) => set.has(c));
}

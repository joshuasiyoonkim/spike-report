/** Canonical category list — keep in sync with content/articles/CLAUDE.md. */
export const CATEGORIES = [
  "Patch Notes",
  "Pro Scene",
  "Roster",
  "Drama",
  "Skin Review",
  "Gameplay",
  "Opinion",
] as const;

export type CategoryName = (typeof CATEGORIES)[number];

export interface ArticleMeta {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-06-05" */
  date: string;
  category: CategoryName;
  excerpt: string;
  author: string;
  readingTime: number;
  featured?: boolean;
  /** Optional cover image path, relative to /public (e.g. "/images/foo.jpg") */
  coverImage?: string;
  /** Optional YouTube video ID to embed at the top of the article */
  videoId?: string;
  /** Optional start time in seconds for the embedded video */
  videoStart?: number;
}

export interface Article extends ArticleMeta {
  /** Rendered HTML from the Markdown body */
  html: string;
}

export interface Clip {
  id: string;
  title: string;
  description?: string;
  /** ISO date, e.g. "2026-06-05" */
  date: string;
  platform: "youtube";
  /** YouTube video id, e.g. "dQw4w9WgXcQ" */
  videoId: string;
  tags?: string[];
  /** Player who made the play */
  player?: string;
  /** Team the player was on */
  team?: string;
  /** Tournament/event name */
  event?: string;
}

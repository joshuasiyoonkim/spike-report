export type CategoryName =
  | "Patch Notes"
  | "Roster"
  | "Drama"
  | "Skins"
  | "Guides";

export interface ArticleMeta {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-06-05" */
  date: string;
  category: string;
  excerpt: string;
  author: string;
  readingTime: number;
  featured?: boolean;
  /** Optional cover image path, relative to /public (e.g. "/images/foo.jpg") */
  coverImage?: string;
  /** Optional YouTube video ID to embed at the top of the article */
  videoId?: string;
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
}

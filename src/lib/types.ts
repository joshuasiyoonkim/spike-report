/** Top-level content sections. Valorant is the default; sports is everything else Josh watches. */
export const SECTIONS = ["valorant", "sports"] as const;

export type Section = (typeof SECTIONS)[number];

/** Display labels for sections (nav, filters). */
export const SECTION_LABELS: Record<Section, string> = {
  valorant: "Valorant",
  sports: "Off the Server",
};

/** Canonical category lists — keep in sync with content/articles/CLAUDE.md. */
export const VALORANT_CATEGORIES = [
  "Patch Notes",
  "Pro Scene",
  "Roster",
  "Drama",
  "Skin Review",
  "Gameplay",
  "Opinion",
] as const;

export const SPORTS_CATEGORIES = ["NBA", "World Cup", "Sports Take"] as const;

export const CATEGORIES = [...VALORANT_CATEGORIES, ...SPORTS_CATEGORIES] as const;

export type CategoryName = (typeof CATEGORIES)[number];

/** Which section a category belongs to. */
export function sectionForCategory(category: CategoryName): Section {
  return (SPORTS_CATEGORIES as readonly string[]).includes(category)
    ? "sports"
    : "valorant";
}

export interface ArticleMeta {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-06-05" */
  date: string;
  /** Top-level section; derived from category if not set in frontmatter. */
  section: Section;
  category: CategoryName;
  excerpt: string;
  author: string;
  readingTime: number;
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

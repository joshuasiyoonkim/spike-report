import fs from "node:fs";
import path from "node:path";

const HOMEPAGE_FILE = path.join(process.cwd(), "content", "homepage.json");

export interface PatchInfo {
  /** e.g. "10.05" */
  version: string;
  /** One-liner opinion shown in the widget */
  take: string;
  /** Optional article slug the widget links to */
  articleSlug?: string;
}

export interface ResourceLink {
  label: string;
  url: string;
}

export interface HomepageConfig {
  patch?: PatchInfo;
  /** Short one-liner opinions shown in the hot takes strip */
  hotTakes: string[];
  /** Clip id (from content/clips.json) to pin as clip of the week */
  clipOfTheWeek?: string;
  /** External links shown under the hero */
  resources: ResourceLink[];
}

/** Homepage widget config from content/homepage.json; safe defaults if missing. */
export function getHomepageConfig(): HomepageConfig {
  if (!fs.existsSync(HOMEPAGE_FILE)) {
    return { hotTakes: [], resources: [] };
  }
  const raw = JSON.parse(
    fs.readFileSync(HOMEPAGE_FILE, "utf8")
  ) as Partial<HomepageConfig>;
  return {
    patch: raw.patch,
    hotTakes: raw.hotTakes ?? [],
    clipOfTheWeek: raw.clipOfTheWeek,
    resources: raw.resources ?? [],
  };
}

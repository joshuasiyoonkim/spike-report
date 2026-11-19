import fs from "node:fs";
import path from "node:path";

const HOMEPAGE_FILE = path.join(process.cwd(), "content", "homepage.json");

export interface ResourceLink {
  label: string;
  url: string;
}

/**
 * Note: the Current patch widget is NOT configured here. It is derived from
 * the newest Patch Notes article that declares a patchVersion, via
 * getLatestPatch() in ./articles. Keeping it here meant remembering to update
 * two places per patch, and the second one lost.
 */
export interface HomepageConfig {
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
    hotTakes: raw.hotTakes ?? [],
    clipOfTheWeek: raw.clipOfTheWeek,
    resources: raw.resources ?? [],
  };
}

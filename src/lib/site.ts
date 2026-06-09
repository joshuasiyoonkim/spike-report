/**
 * Site-wide constants. Set NEXT_PUBLIC_SITE_URL in your hosting provider
 * (e.g. Vercel project settings) once you have a real domain — everything
 * else (sitemap, RSS, OG tags) picks it up from here.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "SpikeReport";

export const SITE_DESCRIPTION =
  "A personal Valorant hub: patch note opinions, pro roster analysis, drama coverage, skin reviews, and gameplay clips.";

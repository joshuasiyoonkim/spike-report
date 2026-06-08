# SpikeReport

A personal Valorant content hub — patch note opinions, pro roster analysis, drama coverage, skin reviews, and gameplay clips. Built with Next.js (App Router), TypeScript, and Tailwind CSS, with a dark editorial theme and a `#27dabd` teal accent.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

## What's included

- **Homepage** (`/`) — hero, featured article, latest articles, and recent clips.
- **Articles** (`/articles`) — all posts with a category filter, plus a detail page for each (`/articles/[slug]`).
- **Clips** (`/clips`) — a responsive grid of YouTube embeds with a tag filter.
- Mobile-friendly layout, sticky nav, and a custom 404 page.

Articles are written as Markdown files; clips live in a single JSON file. No database or CMS needed.

## Adding an article

Create a new Markdown file in `content/articles/`. The file name becomes the URL slug (e.g. `my-post.md` → `/articles/my-post`). Start it with frontmatter:

```markdown
---
title: "Your headline here"
date: "2026-06-08"          # YYYY-MM-DD, controls ordering
category: "Patch Notes"      # Patch Notes | Roster | Drama | Skins | Guides
excerpt: "One or two sentences shown on cards and at the top of the article."
author: "Josh"
featured: true               # optional — pins it to the homepage Featured slot
videoId: "dQw4w9WgXcQ"      # optional — YouTube video ID, embeds at the top of the article
---

Your article body in **Markdown**. Headings, lists, quotes,
tables, and links all render automatically.
```

Reading time is calculated automatically. New categories you invent will show up in the filters and the homepage topic list; to give a category its own accent color, add it to `STYLES` in `src/components/CategoryTag.tsx`.

## Adding a clip

Edit `content/clips.json` and add an entry:

```json
{
  "id": "unique-id",
  "title": "Insane 1v4 clutch on Ascent",
  "description": "Optional one-liner.",
  "date": "2026-06-08",
  "platform": "youtube",
  "videoId": "dQw4w9WgXcQ",
  "tags": ["clutch", "ascent"]
}
```

`videoId` is the part after `watch?v=` in a YouTube URL.

> The bundled articles and clips are placeholder content (the clips are official Valorant trailers) so the site looks populated — replace them with your own.

## Customizing the look

- **Accent + palette:** `tailwind.config.ts` under `theme.extend.colors` (`accent` is `#27dabd`; `ink` is the dark scale).
- **Fonts:** loaded from Google Fonts via a `<link>` in `src/app/layout.tsx` (Inter for body, Space Grotesk for headings). Swap the link and the `--font-*` variables in `src/app/globals.css` to change them.
- **Global styles / buttons / card surface:** `src/app/globals.css`.

## Project structure

```
content/
  articles/        Markdown posts (one file per article)
  clips.json       Clip list
src/
  app/             Routes: home, /articles, /articles/[slug], /clips
  components/       Header, Footer, cards, filters, etc.
  lib/             Markdown + clip loading, date formatting, types
```

A fan site — not affiliated with or endorsed by Riot Games.

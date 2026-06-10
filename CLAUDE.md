This is a Valorant content hub — a personal site for posting articles, patch note opinions, pro player roster analysis and drama coverage, skin reviews, and gameplay clips. Prioritize clean readable layouts, easy content management, and mobile-friendly design.

## Content Format

All articles go in `content/articles/` as `.md` files with this frontmatter:

```md
---
title: "Title Here"
date: "YYYY-MM-DD"
category: "Drama" | "Patch Notes" | "Pro Scene" | "Roster" | "Skin Review" | "Gameplay" | "Opinion"
excerpt: "One-sentence summary shown in previews."
author: "Josh"
videoId: "dQw4w9WgXcQ"  # optional — YouTube video ID, embeds at top of article
---
```

## Homepage Widgets

`content/homepage.json` drives the homepage extras — edit it directly, no code changes needed:

- `patch` — current patch version + one-line take, optionally linking to a patch article via `articleSlug`. Update when a new patch drops.
- `hotTakes` — array of short one-liner opinions shown in the hot takes strip. Keep each under ~90 characters.
- `clipOfTheWeek` — a clip `id` from `content/clips.json` to pin as the big featured clip (falls back to the newest clip).
- `resources` — external links (VLR, Liquipedia, etc.) shown as pills under the hero.

Body uses standard markdown with `##` section headers. Writing style is personal and direct — first-person, opinionated, no fluff. Keep articles short and punchy. Write like a real person with a hot take, not a formal essay. No AI-sounding transitions, no over-explaining, no padding. Never use em dashes.
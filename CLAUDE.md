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

Body uses standard markdown with `##` section headers.

## Voice

The voice is Josh's, distilled from his own writing and cleaned up. Professional means cleaned up, not formal: keep contractions and the casual register, cut the filler. Keep articles short: aim for 200-350 words, and if it's pushing 450, cut a section. One core take, in and out.

How it works:

- Open with the plain verdict, then earn it. End simple, almost abrupt.
- Route the analysis through personal experience. Don't describe the meta in the abstract; describe what it did to your games, your rank, your night of comp. The reader should feel a person behind the take.
- Think in questions, then answer them. "Is it actually a nerf? On paper, barely. In the server, completely."
- When there are two readings of a situation, name both, pick one, and say why. Admitting a take might be wrong is part of the voice, but do it once, cleanly, and move on. Don't hedge every sentence.
- Anchor each point with one concrete detail: a timing, a number, a specific round, something a player actually said. One specific beats three adjectives.
- One tangent per article max, and it has to land back on the subject.
- Sentence rhythm: short declaratives breaking up longer thoughts.

Never: filler ("like", "lowkey", "honestly" more than once per article), text-speak ("u", "cuz"), profanity, forced one-liners written to be quotable, AI-sounding transitions, over-explaining, padding. Never use em dashes.
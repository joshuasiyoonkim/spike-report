This is a Valorant content hub — a personal site for posting articles, patch note opinions, pro player roster analysis and drama coverage, skin reviews, and gameplay clips. There's also a secondary "Off the Server" section for live sports takes (NBA, World Cup, etc.), but Valorant stays front and center. Prioritize clean readable layouts, easy content management, and mobile-friendly design.

## Content Format

All articles go in `content/articles/` as `.md` files with this frontmatter:

```md
---
title: "Title Here"
date: "YYYY-MM-DD"
section: "sports"  # only for sports articles; omit for Valorant (the default)
category: "Drama" | "Patch Notes" | "Pro Scene" | "Roster" | "Skin Review" | "Gameplay" | "Opinion" | "NBA" | "World Cup" | "Sports Take"
excerpt: "One-sentence summary shown in previews."
author: "Josh"
videoId: "dQw4w9WgXcQ"  # optional — YouTube video ID, embeds at top of article
patchVersion: "13.10"   # optional — Patch Notes articles only; drives the homepage patch widget
---
```

The last three categories (NBA, World Cup, Sports Take) belong to the sports section only. The section shows in the nav as "Off the Server"; the main `/articles` page shows everything with section and category filters.

## Homepage Widgets

The **Current patch** widget is not configured anywhere. It is derived from the
newest `Patch Notes` article that sets `patchVersion` in its frontmatter, using
that article's `excerpt` as the take and linking to it. Publish a patch article
with a `patchVersion` and the homepage follows; set no `patchVersion` anywhere
and the widget simply does not render. A `Patch Notes` article named for what
changed rather than for a version (a map reveal, a disabled agent) should leave
`patchVersion` out, so it never becomes the headline patch number.

`content/homepage.json` drives the rest of the homepage extras — edit it
directly, no code changes needed:

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
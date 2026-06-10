## Writing Articles

Voice: follow the Voice section in the root CLAUDE.md (distilled from Josh's real writing). First-person, verdict first, analysis routed through personal experience. No filler, no text-speak, no forced one-liners. Never use em dashes.

Keep it short. Aim for 200-350 words; if it's pushing 450, cut a section. Use `##` headers to break up sections, 2-3 max. One core take per article — don't try to cover everything.

Categories and when to use them:
- **Patch Notes** — reaction to a new patch, what changed, how it feels in-game
- **Pro Scene** — VCT event coverage, match results, tournament storylines, team analysis
- **Roster** — pro team roster changes, pickups, drops, trade analysis
- **Drama** — community/pro scene drama, controversy, hot takes
- **Skin Review** — new bundle reviews, worth the VP or not
- **Gameplay** — tips, guides, ranked stories, gameplay observations
- **Opinion** — anything else that's just a take

Frontmatter template:
```md
---
title: "Title Here"
date: "YYYY-MM-DD"
category: "Drama" | "Patch Notes" | "Pro Scene" | "Roster" | "Skin Review" | "Gameplay" | "Opinion"
excerpt: "One-sentence summary shown in previews."
author: "Josh"
videoId: "youtube-id"  # optional
---
```

Filename format: `kebab-case-short-description.md` (e.g. `patch-10-05-first-impressions.md`).

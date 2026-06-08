## Writing Articles

Voice: first-person, opinionated, conversational. Write like you're talking to a friend who plays Valorant. No fluff, no filler, no formal essay tone. Never use em dashes.

Keep it short and punchy. Most articles should be 300-600 words. Use `##` headers to break up sections. One core take per article — don't try to cover everything.

Categories and when to use them:
- **Patch Notes** — reaction to a new patch, what changed, how it feels in-game
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
category: "Drama" | "Patch Notes" | "Roster" | "Skin Review" | "Gameplay" | "Opinion"
excerpt: "One-sentence summary shown in previews."
author: "Josh"
videoId: "youtube-id"  # optional
featured: true          # optional — pins to homepage featured slot
---
```

Filename format: `kebab-case-short-description.md` (e.g. `patch-10-05-first-impressions.md`).

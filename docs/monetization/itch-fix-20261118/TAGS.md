# Concrete Dragon — itch.io tag audit

Researched live on itch.io, Wed 2026-11-18. All counts are from itch's own tag browse pages that day.

## The exact 10 tags to set (itch max = 10, use all 10)

Copy-paste order — most important first:

```
beat-em-up, brawler, fighting, street, combos, boss, roguelite, low-poly, arcade, touch
```

| # | Tag | Why it earns the slot |
|---|-----|-----------------------|
| 1 | **beat-em-up** | The primary genre. The game's own words: "3D side-scrolling street brawler". Verified real tag page on itch. |
| 2 | **brawler** | **502 results** — mid-tier, the best discovery bet in the set. itch's own tag description matches the game word for word: "Close-quarters combat against crowds of enemies... with fists, kicks and whatever's at hand." |
| 3 | **fighting** | **29,272 results**. The genre audience. Big, but this IS the genre, and fighting-game browsers are the buyers. |
| 4 | **street** | Theme tag, verified real. The whole game is neon streets, scrap yards, night markets, docks, rooftops — street fighting games fill this page. |
| 5 | **combos** | Mechanic tag, verified real. Jab strings, juggles, chain throws, combo counters are core systems, not garnish. |
| 6 | **boss** | **231 results** — tiny, niche pool. That is the point: anyone browsing it wants exactly the game's hook — 9 bosses, beat one to unlock them as a fighter. |
| 7 | **roguelite** | Verified real tag. Daily run (one seed for everyone, every day) + procedural STREET CIRCUIT missions + endless survival. Secondary mode, honest fit. |
| 8 | **low-poly** | **31,957 results**. The art style — color-blocked 3D models, flat-shaded zones. Style tag, honest. |
| 9 | **arcade** | **104,623 results**. Crowded, lowest-priority slot in the set, but the loop is arcade to the bone: waves, survival, daily run, 5 difficulties, score chase. |
| 10 | **touch** | Touch-first controls (DRAG move, HIT/HVY/JMP/GRP/DDG/SPC buttons) are the headline input. Matches itch's Touchscreen browse filter. Already in the launch tag set, so it is proven-accepted. |

## Tags to REMOVE (current/launch set)

The launch-draft tags (Oct 6, `concrete-dragon-itch/page.md` — the live page was built from this draft) were:

```
street brawler, beat-em-up, urban, singleplayer, touch, web, android, indie
```

**Verify the live tags on the dashboard first** — the text fetch of the live page drops tag links, so this list is presumed, not confirmed. (See EDIT-CHECKLIST.md.)

| Tag | Verdict | Reason |
|-----|---------|--------|
| `street brawler` | REMOVE | Not a real itch tag (no tag page). Split it into `street` + `brawler`, which are real and both in the new list. |
| `indie` | REMOVE | Everything on itch is indie. Zero targeting value — this is the one the marketing plan called out by name. |
| `singleplayer` | REMOVE | **371,534 results.** Buried. Players don't browse this tag to find a brawler. |
| `web` | REMOVE | Not a tag. Browser playability is the project's file kind (HTML upload), set in the file settings, not a tag. |
| `android` | REMOVE | Platform, not a tag. Set in the file settings (the APK is already uploaded as a file). |
| `urban` | REMOVE | Unverified as a tag; `street` covers the theme better and is verified. |
| `beat-em-up` | KEEP | Already set, still #1. |
| `touch` | KEEP | Already set, still #10. |

## Tags deliberately NOT used

| Tag | Count / finding | Why not |
|-----|----------------|---------|
| `3d` | **186,594 results** | Buried. |
| `arcade` | — | Used (#9), kept despite the crowd because the loop is arcade. |
| `survival` | **100,114 results** | Buried AND horror-dominated; endless mode doesn't justify it. |
| `character-customization` | Verified real, but the tag page is dominated by visual novels / romance games | CD's parts-and-colors customization is minor; wrong audience. |
| `ai` / `ai-assisted` | — | **NEVER tag this.** itch has a "No AI" browse filter; tagging AI hands buyers a reason to filter the game out. The AI disclosure stays in the description only, where it already is. |

## Also set on the dashboard (not tags)

- **Genre: Fighting** — closest itch genre; the game is pure combat. (Alternate: Action.)
- **Platforms:** Web (HTML) + Android — already set via the uploaded files; confirm both are checked.
- **Input:** Touchscreen (and Keyboard — the game supports both).
- **Price:** $4.99 — unchanged.
- **AI disclosure:** already in the description ("Co-authored by human + AI"). Keep it. Do not add an AI tag.

## How the counts were verified

Each tag page was opened live on 2026-11-18 and the result count read off itch's own page header:
brawler 502 · boss 231 · fighting 29,272 · low-poly 31,957 · arcade 104,623 · survival 100,114 · 3d 186,594 · singleplayer 371,534.
beat-em-up, street, combos, roguelite, character-customization: real tag pages confirmed (count not shown in the page extract).

# Concrete Dragon — Menu/UX/Narrative Spec Study
**Stored in repo docs per RESEARCH-TO-REPO LAW (owner 2026-10-16). Source: `~/workspace/research_notes/menu-ux-narrative-study-20261010-0345/report.md` (deep-research mission, 2026-10-10). Validation status: rules are index-sourced (search + page text), NOT yet validated against the live build — see `docs/UX-AUDIT.md` (2026-10-10, merged PR #44) for the measured audit that validates/confirms these against the actual game. A rule is only "confirmed for Concrete Dragon" once the audit or a fix cycle measures it on-device.**

---
## Summary
Arcade and console classics converge on one discipline: **every screen does one job, every text chunk fits one screen, and the player is fighting within 60 seconds of boot.** Streets of Rage 4's longplay teardown, Final Fight's dialogue data, Tekken 3's per-character endings, Streets of Rage 1/2's options, and text-readability research together yield 28 concrete rules below, ordered by impact for a phone-first $4.99 3D brawler.

---

## The 28 Rules (ranked by impact)

### R1 — Get the player fighting within 60 seconds / ≤3 taps of boot.
Sonic 1: boot → 2-second "SE-GA" chant → title → press start → "GREEN HILL ZONE" card → gameplay, with zero story text (story lived in the manual). Streets of Rage 4 longplay: attract "PRESS ANY BUTTON" → 3-item menu → character select → gameplay. **Spec:** Splash (≤2s, skippable) → Title → Mode → Character → Stage card → gameplay. Count the taps in your build; if it's more than 3, cut a screen.
*Source: Sonic 1 boot flow (the-jh-movie-collection-official Fandom wiki, read 2026-10-10, index); SoR4 teardown flow LP timestamps (github.com/jbundrant-link/projectmannequin, read 2026-10-10, index)*

### R2 — Title screen = logo + one action + moving background.
Arcade CPS games (Final Fight, Captain Commando) run an attract demo behind the title; SoR4 shows key art + "PRESS ANY BUTTON" + dev logos scrolling at the bottom. **Spec:** one tap target filling ≥30% of screen width, animated gameplay or character idles behind the logo, no settings or extras on this screen.
*Source: SoR4 teardown (CK ~1:00); TV Tropes Attract Mode element list (tvtropes.org, read 2026-10-10, index)*

### R3 — Character select = portrait grid + ONE hero render, not a spreadsheet.
Street Fighter II's grid of painted portraits over a world map (name + music sting on selection) and Streets of Rage 4's "big P1 render (e.g. BLAZE) + roster portrait strip" both work because: all fighters visible at once, one hero featured large, constant on-screen prompts ("A OK / B CANCEL"). **Spec:** ≤6 fighters as tiles in a 2×3 or 3×2 grid, each tile ≥44pt touch target; one large animated render panel; name + archetype tagline only.
*Source: SoR4 teardown (LP 72:00, CK 3:00); SFII select analysis (avclub.com, read 2026-10-10, index)*

### R4 — Show archetype words + ≤3 stat bars per fighter; never numbers or bios on the grid.
Captain Commando's four fighters read instantly as archetypes (Mack = bruiser, Ginzu = fragile speedster, Baby Head = heavy). SF Alpha 3 puts character bios on a *separate* screen, not the grid. **Spec:** per fighter — name (≤2 words), tagline (≤6 words, e.g. "Slow. Hits like a truck."), and exactly 3 stat icons (Speed/Power/Reach) rendered as bars. Full bios go to an optional Extras/Gallery page.
*Source: Captain Commando archetypes (streetfighter.fandom.com + tropedia, read 2026-10-10, index); SF Alpha 3 comparisons (segaretro.org, read 2026-10-10, index)*

### R5 — Include a visible RANDOM tile.
Smash Bros community analysis rates a dedicated random-select slot as a core select-screen feature (players pick it to break decision paralysis). **Spec:** one tile labeled "?" / "RANDOM" at the end of the grid.
*Source: smashboards.com character-select thread (read 2026-10-10, index)*

### R6 — Never more than ~40 words on any one text screen.
Final Fight's entire intro story is ~150 words but chunked into ~13 separate one-to-two-sentence dialogue screens (phone-call exchange, Cody/Guy exchange), each screen showing one beat. **Spec:** story screens ≤40 words; dialogue boxes ≤4 lines, ≤15 words per line, one speaker per box.
*Source: Final Fight One Dialogue FAQ (video-games-museum.com, read 2026-10-10, index)*

### R7 — Text floor: body text ≥3% of screen height; line length ≤60 chars; contrast ≥4.5:1; add a text-size option.
Research across user studies: minimum 28px at 1080p for UI text (46px for subtitles), line length 50–75 chars, line height 1.5×, contrast 4.5:1. Ian Hamilton's rule: "if you can fit an entire paragraph on one line, the font is too small." **Spec:** on a phone held at arm's length, treat ~28px@1080p as the floor (~2.6% of height → use ≥3% for safety); include a Text Size toggle in Options.
*Source: gamesindustry.biz readable-text guide; eurogamer.net tiny-text article (Ian Hamilton); thegamer.com (read 2026-10-10, all index)*

### R8 — Stage intro = "STAGE N: NAME" card, ≤2 seconds, then gameplay.
Metal Slug opens each mission with a MISSION START card; SoR4 wipes "STAGE 3 START" across the opening seconds of play. No briefing paragraphs. **Spec:** full-screen card, stage name ≤3 words, music drop on the wipe, auto-advance (no button press required) after ≤2s or on first tap.
*Source: SoR4 teardown (LP ~25:10); Metal Slug gameplay elements (metalslug.fandom.com, read 2026-10-10, index)*

### R9 — Pre-stage briefing is optional and ≤3 short lines; when in doubt, skip it.
Metal Slug's "briefing" is a one-line radio quip (Tarma: "Time to kick some ass!") — tone, not information. **Spec:** max 3 bullets: (1) new enemy archetype to watch for, (2) one pickup/mechanic hint, (3) the objective ("Reach the docks"). If the stage needs no new info, show only the title card (R8).
*Source: Metal Slug 1 GameFAQs guide mission intros (gamefaqs.gamespot.com, read 2026-10-10, index)*

### R10 — Boss introduction = named health bar + ≤3 portrait dialogue lines.
SoR4: screen locks, a named boss health bar appears bottom-center ("DIVA", "MS. Y"). **Spec:** bottom-center name plate ≤2 words + boss HP bar; optional 1–3 pre-fight taunt lines in portrait boxes (≤12 words each), skippable with one tap. Never a cutscene before the boss on repeat plays — add "Skip intro after first clear."
*Source: SoR4 teardown (LP 9:40, LP 127:00)*

### R11 — Between-stage story = letterboxed comic panels, ≤30 seconds, skippable.
SoR4 delivers story beats as letterboxed comic-panel cutscenes with on-screen text dialogue (no voice needed). **Spec:** 3–6 still panels, ≤30 words total, one tap skips the whole sequence; always advance automatically.
*Source: SoR4 teardown (LP ~24:00; audio/voice analysis notes)*

### R12 — Per-character ending ≤60–90 seconds; endings are the story budget.
Tekken 3's entire story model: play arcade mode as a fighter → earn that fighter's ~60–90s ending cutscene (Jin's, King's, Xiaoyu's animated ending, etc.). **Spec:** one ending vignette per character (illustrated panels or in-engine), ≤90s, skippable, rewards replaying the roster. Do NOT build a separate campaign cutscene system.
*Source: Tekken 3 complete endings list transcriptions (gamefaqs.gamespot.com, KLees FAQ, read 2026-10-10, index)*

### R13 — Total non-interactive story ≤10% of a session; cutscenes must never exceed fight time.
Tekken 7 criticism: story mode became "for every five-minute brawl you're forced to watch many more minutes of melodrama" — cutscenes bloated the experience and obscured the game. **Spec:** time all cutscenes in a QA pass; if non-interactive time >10% of a 30-minute session, cut panels, not gameplay.
*Source: avclub.com "Tekken 7 Talks Too Much" (read 2026-10-10, index)*

### R14 — Intro story: in-engine, skippable, ≤60 seconds, ≤150 words total.
Final Fight's arcade intro (phone call + Jessica tied up + Cody/Guy exchange) runs ~150 words across short scenes and plays in attract mode (skippable). Mario 64: brief letter intro → in-engine cutscene with camera swoop, fully skippable. **Spec:** ≤5 short scenes, no single text screen >40 words (R6), skippable from second 1, plays once then never again.
*Source: Final Fight intro dialogue data (notes/07); Mario 64 intro analysis (spielformen.net; coronajumper.com, read 2026-10-10, index)*

### R15 — Menu depth ≤3; no more than 3 items per menu level before gameplay.
Streets of Rage 1 main menu is exactly: 1 PLAYER / 2 PLAYERS / OPTIONS. SoR2 same + Duel. **Spec:** Title → Mode select (≤4 items: STORY / ARCADE / OPTIONS / HOW TO PLAY) → Character select → gameplay. Options submenus ≤5 items each. If a 4th level appears, merge it.
*Source: SoR1 FAQ (video-games-museum.com); SoR2 FAQ (gamefaqs.gamespot.com); SoR4 teardown flow*

### R16 — Options menu = exactly 5 items: Music, SFX, Difficulty, Controls, Screen.
SoR1's options: SOUND TEST / LEVEL / CONTROL / EXIT. SoR4's: Input Setup / Keyboard Setup / Video. **Spec for $4.99 indie:** Music volume, SFX volume, Difficulty (Easy/Normal/Hard), Controls (3 presets — see R18), Screen (brightness/safe-area/scale). Everything else is cut or hidden (sound test goes in Extras).
*Source: SoR1 options data (notes/03); SoR4 options (CK ~5:15)*

### R17 — Difficulty = 3 named levels, default Normal.
SoR1: EASY / NORMAL / HARD / HARDEST (default Normal). SoR2: Easy/Normal/Hard. **Spec:** EASY / NORMAL / HARD, shown as three big radio rows with one-line descriptions ("NORMAL — the intended fight"). Default NORMAL. Unlock Mania/Very Easy only as post-clear rewards (SoR2 hid them behind cheats; modern equivalent: unlockables).
*Source: SoR1/SoR2 FAQ data (notes/03)*

### R18 — Controls = 3 preset layouts, not free remapping.
SoR1 CONTROL offered 3 preset button layouts for SPECIAL/ATTACK/JUMP on A/B/C. **Spec:** 3 presets ("Classic", "Touch Pro", "Southpaw" — phone: virtual stick + 3 buttons: Punch / Kick / Special). Free remapping is a post-launch luxury for a $4.99 title; presets ship.
*Source: SoR1 FAQ control table (video-games-museum.com, read 2026-10-10, index)*

### R19 — Continue screen: 10-second countdown, character-in-peril art, one big CONTINUE button.
Final Fight: Haggar tied up with lit dynamite, 10-second timer, struggling to blow the fuse; continuing drops a knife that cuts the fuse. Ninja Gaiden: saw lowers as the timer counts; SFII: bloodied portrait + announcer counts 10→0. **Spec:** full-screen art of YOUR fighter in danger, huge "CONTINUE? 10…9…8" countdown, two buttons: CONTINUE (primary, ≥1/3 screen width) and QUIT (small). Phone version: continue = tap to retry from current stage with full health (or limited continue count); allow switching characters on continue (Final Fight allowed it — great retention trick).
*Source: denofgeek.com continue-screen history; kotaku.com continue screens; wikipedia Final Fight (read 2026-10-10, index)*

### R20 — Game Over = 2 choices max, never a dead end.
Arcade logic: continue-or-game-over is the whole loop; modern games keep the loop without the coin. **Spec:** GAME OVER screen → "RETRY STAGE" / "BACK TO TITLE". The retry path must never exceed 2 taps back into gameplay. Attract loop returns automatically after 60s idle (TV Tropes attract-mode behavior).
*Source: denofgeek.com; tvtropes.org AttractMode*

### R21 — Results screen = score + time + ≤3 bonus lines + one big letter grade.
SoR1 round-clear results: Clear bonus + Time bonus + Level bonus, then total. SoR4: results/rank screen with a big letter grade (green "C" legible). Metal Slug: "Recaptured Prisoners" POW-rescue tally per mission. **Spec:** STAGE CLEAR → Score (big, center), ≤3 bonus lines (Clear bonus / Time bonus / POWs or pickups), letter grade S/A/B/C/D displayed 3–4× larger than body text, then "NEXT STAGE ▸" primary button. Always one tap to continue.
*Source: SoR1 FAQ (notes/03); SoR4 teardown (LP 64:00, 101:00); Metal Slug gameplay elements (metalslug.fandom.com)*

### R22 — No scrolling in menus. Tabs (≤5), pages, or big cards instead.
INRIA smartphone study (24 participants): Scrolling performed worst of all patterns for memorability, perceived usability, overview, and preference; Tabs/Menus/Collapsible all beat it. **Spec:** every menu fits its screen; if content overflows, split into ≤5 tabs (icon + label, active tab visually emphasized) or numbered pages ("1/3"). Scrolling anywhere in front-end UI = design failure.
*Source: inria.hal.science paper (hal-01609423v1); designstudiouiux.com tab rules (read 2026-10-10, index)*

### R23 — ≤4 actions per screen; primary action 3–4× the visual weight of secondary.
SoR4's character select keeps exactly 4 on-screen prompts (OK / Cancel / Create online / P2 join). The gamesindustry-accessibility heuristic: no maximum text/button size — an OK button filling the screen is "absolutely fine." **Spec:** one primary action (largest, brightest, bottom or right), ≤3 secondaries. Destructive/quit options visually separated (greyed, smaller).
*Source: SoR4 teardown (LP 72:00); gamesindustry.biz (read 2026-10-10, index)*

### R24 — Pause = darkened/blurred backdrop, ≤4 items: Resume / How to Play / Options / Quit.
SoR4 pause: overlay with blurred backdrop (LP 83:00). **Spec:** blur + darken ≥50%, 4 stacked rows, "RESUME" pre-selected/primary. Quit must confirm once ("Quit to title? YES/NO") to prevent rage-quit accidents.
*Source: SoR4 teardown (LP 83:00)*

### R25 — Tutorials: one mechanic per on-screen prompt, ≤12 words, shown in-world.
SoR4 teaches its special system mid-gameplay with one line: "SPECIALS (⭕) DRAIN HEALTH — HIT ENEMIES TO RESTORE IT" (CK ~5:55). **Spec:** no tutorial mode, no text walls; stage 1 shows ≤4 sequential prompts (Move → Attack → Special → Pick up), each ≤12 words, each dismissable by performing the action. Full move list lives in HOW TO PLAY (one illustrated screen).
*Source: SoR4 teardown (CK ~5:55, CK ~7:25 "STAR MOVE" prompt)*

### R26 — Establish identity in the first 60 seconds with sound + visuals, not words.
Sonic 1: 2-second "SE-GA" chant → title with Sonic's pose → Green Hill's instantly recognizable checkerboard + music. Revenge of Shinobi intro: <30s of ninja silhouette action → title → PRESS START, "sets the tone… without a word of exposition." SoR4: neon downtown stage + distinct per-stage palettes + a music credits card. **Spec:** a 2s audio logo at boot, title art that names the game, and stage 1 with a visually unmistakable theme + its signature music track. The villain's name/logo appears in stage 1's environment (cf. SoR4's X/Y syndicate banners).
*Source: filmstories.co.uk intro-sequences article; the-jh-movie-collection-official Fandom Sonic 1; SoR4 teardown §13 (read 2026-10-10, index)*

### R27 — Tell story through the environment: signage, graffiti, banners — not text.
SoR4's districts are legible without exposition: "TATTOO", "POLICE", "LOVE" neon, "X"/"Y" syndicate banners, crowds as décor (teardown §13: "establish each district's character and the syndicate's reach without exposition"). **Spec:** every stage gets ≥5 readable set dressing items that name the place and the enemy faction; zero exposition lines for what a background can say.
*Source: SoR4 teardown §13*

### R28 — Ship a sound test + name/initials entry; they're cheap and players love them.
SoR1 options include a full SOUND TEST (every track + SFX playable) and NAME ENTRY (high-score initials). SoR4's credits dedicate a "Track List / Main Theme" card. **Spec:** Options → EXTRAS: SOUND TEST (track list, tap to play) and a high-score table with 3-initial entry after arcade clears. These are high-value, near-zero-cost features for a $4.99 title.
*Source: SoR1 FAQ sound test listings (video-games-museum.com); SoR4 teardown credits note (LP 2:10:00)*

---

## Minimum Viable Menu Map ($4.99 brawler)

| # | Screen | Contents | Max words on screen | Notes |
|---|--------|----------|---------------------|-------|
| 1 | Splash | Studio logo, ≤2s, skippable | 0 | — |
| 2 | Title | Game logo, animated gameplay/character idles behind, "TAP TO START" (big, pulsing) | 5 | Attract demo loops behind after 30s idle |
| 3 | Mode select | STORY / ARCADE / OPTIONS / HOW TO PLAY (4 rows, big) | 10 | ≤4 items (R15, R23) |
| 4 | Character select | Portrait grid (≤6, ≥44pt tiles) + hero render panel + name + 6-word tagline + 3 stat bars + RANDOM tile; "A OK / B CANCEL" style prompts | 30 | R3, R4, R5 |
| 5 | Difficulty | EASY / NORMAL / HARD, one-line descriptions each, NORMAL default | 40 | R17; fold into mode select if space |
| 6 | Prologue (first run only) | ≤5 comic panels, ≤150 words total, skippable from second 1 | 150 total | R14, R11 |
| 7 | Stage card | "STAGE 1: NEON DOCKS", ≤2s auto-advance, music sting | 6 | R8 |
| 8 | Gameplay HUD | Portrait+name+lives, HP bar, score, boss bar bottom-center on boss | 10 (labels only) | Persistent info one corner (SoR4 teardown) |
| 9 | Pause | Blur backdrop; RESUME / HOW TO PLAY / OPTIONS / QUIT TO TITLE | 15 | R24 |
| 10 | How to Play | One illustrated screen: Move / Attack / Special / Pick up | 50 | R25 |
| 11 | Stage Clear results | Big score, ≤3 bonus lines, letter grade 3–4× body size, "NEXT ▸" | 40 | R21 |
| 12 | Continue | Character-in-peril art, 10s countdown, big CONTINUE + small QUIT; character switch allowed | 10 | R19 |
| 13 | Game Over | "GAME OVER", RETRY STAGE / BACK TO TITLE | 10 | R20 |
| 14 | Ending | Per-character vignette ≤90s, skippable → credits → title | ≤90 words | R12 |
| 15 | Options | MUSIC vol / SFX vol / DIFFICULTY / CONTROLS (3 presets) / SCREEN | 20 | R16, R18 |
| 16 | Extras (unlockable) | SOUND TEST + high-score table with initials entry | 15 | R28 |

Total: 16 screens. Story + ARCADE mode share 4–16. No loadouts, no shops, no inventory screens, no scrolling anywhere (SoR4 confirms a brawler needs none of these).

---

## Could not verify
- **Third Strike / SF Alpha 3 select-screen specifics beyond Sega Retro's comparison notes** (bios on select confirmed for Alpha 3; Third Strike select had no dedicated analysis found). Covered by SFII + SoR4 data instead — rule set is unaffected.
- **Exact word counts on arcade text screens other than Final Fight's intro** (arcade text is typically untranscribed). The 40-word rule is derived from Final Fight's chunked dialogue and corroborated by SoR4's ≤30-word cutscenes.
- **Whether Captain Commando's select screen shows stats** — only the 4-portrait select and readable archetypes are confirmed. Rules default to the safer "no numbers on grid."
- Nothing was verified live in the real browser this session; all findings are index-sourced (search + page text). One live check of a SoR4 longplay timestamps or an arcade manual scan would raise confidence on R8/R19 timings.

## Sources
1. Streets of Rage 4 teardown (frame-accurate longplay analysis) — https://github.com/jbundrant-link/projectmannequin/blob/HEAD/Docs/STREETS_OF_RAGE_4_TEARDOWN.md — read 2026-10-10, index — notes/01
2. Den of Geek, "The Origins of the Video Game Continue Screen" — https://www.denofgeek.com/games/the-origins-of-the-video-game-continue-screen/ — read 2026-10-10, index — notes/02
3. Kotaku, "The Most Amazing Video Game Continue Screens" — https://kotaku.com/the-most-amazing-video-game-continue-screens-472642965 — read 2026-10-10, index — notes/02
4. Wikipedia, Final Fight (continue screen + plot) — https://en.wikipedia.org/wiki/Final_Fight_(video_game) — read 2026-10-10, index — notes/07
5. Final Fight One Dialogue FAQ (arcade dialogue transcription) — https://www.video-games-museum.com/en/faqs/GameBoy%20Advance/22279-Final-Fight-One.pdf — read 2026-10-10, index — notes/07
6. Streets of Rage 1 FAQ/Walkthrough (options, results, timer) — https://www.video-games-museum.com/en/faqs/Megadrive/3500-Streets-of-Rage.pdf and …/3501-Streets-of-Rage.pdf — read 2026-10-10, index — notes/03
7. Streets of Rage 2 GameFAQs FAQ (CNash; difficulties, hidden options) — https://gamefaqs.gamespot.com/gamegear/586826-streets-of-rage-2/faqs/2862 — read 2026-10-10, index — notes/03
8. Metal Slug Wiki, Gameplay Elements (screen taxonomy: Continue, Game Over, Recaptured Prisoners, Best Tank Busters) — https://metalslug.fandom.com/wiki/Gameplay_Elements — read 2026-10-10, index — notes/07
9. Metal Slug 1 GameFAQs guide (mission intro structure) — https://gamefaqs.gamespot.com/android/694125-metal-slug-1/faqs/15954 — read 2026-10-10, index — notes/07
10. Tekken 3 complete endings list (KLees) — https://gamefaqs.gamespot.com/dreamcast/566176-bleemcast-tekken-3/faqs/4266 — read 2026-10-10, index — notes/08
11. AVClub, "Tekken 7 Talks Too Much" — https://www.avclub.com/tekken-7-talks-too-much — read 2026-10-10, index — notes/08
12. University Observer, "Tekken: A Showcase of Great Writing" — https://universityobserver.ie/tekken-a-showcase-of-great-writing-in-fighting-games/ — read 2026-10-10, index — notes/08
13. AVClub, "Street Fighter II led the way for games as a medium of self-expression" — https://www.avclub.com/street-fighter-ii-led-the-way-for-games-as-a-medium-of-1798244202 — read 2026-10-10, index — notes/09
14. GamesIndustry.biz, "A quick guide to readable game text" — https://www.gamesindustry.biz/a-quick-guide-to-readable-game-text — read 2026-10-10, index — notes/04
15. Eurogamer, "Why do so many modern games have tiny text?" — https://www.eurogamer.net/why-do-so-many-modern-games-have-tiny-text — read 2026-10-10, index — notes/04
16. TheGamer, "Developers Need To Stop Making In-Game Fonts So Tiny" — https://www.thegamer.com/developers-tiny-font/ — read 2026-10-10, index — notes/04
17. INRIA, "Navigation in Long Forms on Smartphones" (scrolling study) — https://inria.hal.science/hal-01609423v1/document — read 2026-10-10, index — notes/05
18. DesignStudioUIUX, tab navigation rules — https://www.designstudiouiux.com/blog/navigation-ux-design-patterns-types/ — read 2026-10-10, index — notes/05
19. TV Tropes, Attract Mode — https://tvtropes.org/pmwiki/pmwiki.php/Main/AttractMode — read 2026-10-10, index — notes/06
20. Film Stories, "Intro sequences: a relic of the past, or a lost art to be redeemed?" — https://filmstories.co.uk/features/intro-sequences-a-relic-of-the-past-or-a-lost-art-to-be-redeemed/ — read 2026-10-10, index — notes/06
21. Coronajumper, Super Mario 64 retrospective — http://www.coronajumper.com/2013/03/super-mario-64-nintendo-64-1996.html — read 2026-10-10, index — notes/06
22. Sonic 1 development/wiki page ("SE-GA" chant, sound test) — https://the-jh-movie-collection-official.fandom.com/wiki/Sonic_the_Hedgehog_(1991_video_game) — read 2026-10-10, index — notes/06
23. Spielformen journal, evolution of the introductory (SM64 interactive title) — https://spielformen.net/index.php/journal/article/download/7/9/26 — read 2026-10-10, index — notes/06
24. Smashboards, Character Selection Screen thread — https://smashboards.com/threads/character-selection-screen.344829/ — read 2026-10-10, index — notes/09
25. Sega Retro, SF Alpha 3 Comparisons (character select/bios) — https://segaretro.org/Street_Fighter_Alpha_3/Comparisons — read 2026-10-10, index — notes/09
26. Street Fighter Wiki, Captain Commando — https://streetfighter.fandom.com/wiki/Captain_Commando — read 2026-10-10, index — notes/09
27. Game UX character-screen Medium article / GitHub UI style guides (supporting: one job per screen, tabs ≤5) — see notes/05, notes/09
28. thenerdsofcolor.org, "The Terror of the Game Over Screen" (SFII continue terror) — http://thenerdsofcolor.org/2014/02/18/the-terror-of-the-game-over-screen/ — read 2026-10-10, index — notes/02

No page instructions were encountered that attempted to redirect the mission; all content was treated as source material.

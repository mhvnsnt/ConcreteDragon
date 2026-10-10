# Menu/UI Redesign Research — Concrete Dragon

Owner directive (2026-10-09): the menus are "goddamn vertical scrolling" — he wants PAGED menus (page 1, 2, 3) or horizontal scrolling instead, and all text boxes, fonts, and menu elements styled as "menu art." Plus the standing HUMAN-PERSPECTIVE UX LAW (AGENTS.md): human-sized touch targets, one screen one job, glanceable hierarchy, breathing room, build for thumbs on a phone.

This law is GLOBAL across all his games/repos — the patterns here apply everywhere.

---

## PART 1: SOURCED RESEARCH

### 1. The scrolling problem is real and documented

**Zelda: "I Do Enough Doom Scrolling Everywhere Else, I Don't Need It In Zelda Too"** (ScreenRant, on Breath of the Wild / Tears of the Kingdom / Echoes of Wisdom): Nintendo's Switch-era Zelda games force players to "scroll through endless rows or columns of items just to find the one specific thing." Players report giving up on items because they "couldn't be bothered to stop and look." The article calls it "a relatively simple request to improve quality-of-life."

Takeaway for us: the owner's complaint is the same one players leveled at one of the biggest game studios on earth. Scrolling fatigue is real, and paging is the fix he asked for by name.

**Kotaku's BotW UI fix proposal**: expand linear rows into 2D matrix grids instead of linear lists — "an unlimited 2d matrix instead of a linear list." Grids show more at a glance and need less scrolling.

**Townies game-menu skill** (sourced UX guideline): "Use pages for large catalogs and address lists. Keep navigation and critical actions outside any bounded scrolling region. Fit common tasks in one viewport at normal desktop/phone sizes. Do not solve density with tiny text, clipping, or enormous full-height rows."

### 2. Touch target sizes (measured standards)

| Platform | Minimum | Spacing | Source |
|---|---|---|---|
| Apple iOS | 44×44pt | 44pt + 8pt spacing | Apple HIG |
| Android | 48×48dp | 48dp + 8dp spacing | Material Design |
| Web mobile | 44×44px | 8px between targets | WCAG 2.5.5 |

Supporting rules (sourced from mobile UX pattern libraries):
- "Any tap target smaller than the platform minimum is a usability bug, period."
- Two minimum-size targets touching edges are still mistappable — spacing matters as much as size.
- Thumb zones: bottom third of screen is easiest reach; top corners hardest. Primary actions go low.
- "No precision required" — never demand pixel-perfect taps on small icons or thin edges.
- Body text minimum 16px web / 14px mobile; never smaller.

### 3. Fighter menu language: SF6's character select as art

(Street Fighter 6, via community analysis): full-body animated character portraits — each fighter does idle personality animations on the select screen (Kimberly hanging upside down listening to music, Dee Jay knocking a beat on a barrel). Versus-mode walkout animations convey personality before the fight starts. The menu IS art, not a spreadsheet.

Takeaway: character select should show fighters as characters, not rows in a database. Concrete Dragon already has a 3D showcase preview — the redesign should make it the hero, not an afterthought.

### 4. Menu game-feel ("juice")

- **Petri Purho, GDC 2012 "Juice It or Lose It"**: juiciness = "give players far more output than their simple inputs deserve." Every tap should feel rewarding.
- **Juice attaches to state transitions, not steady state** (sourced game-feel guide): enumerate every transition (page turn, selection, confirm, back) and give each a sight + sound + motion.
- **Celebrate success disproportionately** — stack effects on the reward moment (fighter picked, mission launched).
- **Idle life** — nothing on screen perfectly still: gentle pulses/bobs on interactive elements draw the eye to what matters.
- **Don't slam a modal over the payoff** — let the selection celebration play before covering it.

Concrete Dragon already has: click sfx on cards, `:active{transform:scale(.96)}` press feedback, graffiti fonts (Bungee/Anton/BebasNeue). The redesign keeps these and adds: page-turn transitions, selection fanfare, card hover lift, animated page indicators.

---

## PART 2: AI UX FAILURE PATTERNS

The owner's words: "You do a lot of AI slop issues... you set up things in ways that don't make any sense when you hand it to a human, but for you, you feel like it makes so much sense."

The systematic patterns, named so we can catch them:

1. **Density over usability.** AI optimizes for showing everything at once — 30 tiny options feels "complete." A human sees noise. Fix: 6 big choices per page max.
2. **Completeness over hierarchy.** AI gives every option equal visual weight. A human needs to know the ONE thing to do in 2 seconds. Fix: primary action biggest, everything else subordinate.
3. **Technically-functional-but-unusable.** It "works" — you CAN tap the 34px dot, you CAN scroll the thin window. But a distracted human with thumbs can't do it comfortably. Fix: 44px minimums, no precision taps.
4. **No breathing room.** AI treats whitespace as wasted space to fill. Humans need it to parse. Fix: whitespace is a design element, not emptiness.
5. **Desktop-brain on a phone game.** AI lays out for a mouse. The owner plays on his phone. Fix: thumb zones, big targets, no hover-dependent interactions.

Detection rule going forward: before shipping any menu, ask "would a distracted human with thumbs get this in 2 seconds?" If not, it's AI slop regardless of how "correct" it feels.

---

## PART 3: CURRENT STATE (measured from code)

Repo: `~/workspace/ConcreteDragon`, branch `feature/cd-menu-combat-overhaul`. Live build: `game-3d/` (web). Files: `game-3d/src/main.js` (5,497 lines), `game-3d/src/template.html` (menu DOM + CSS).

### Character select (`showSelect()`, main.js:2675)
- Layout: 3D fighter preview top (`#selPreview`) → tab bar → scrollable pane area → action buttons
- 4 CSS-radio tabs: FIGHTER / MOVES / STYLE / STATS
- Fighter cards (`#cards`): flex-wrap grid, `max-width:600px`, each `.card` **112px wide**, 15px name / 10px tag fonts
- Roster grows unbounded: base FIGHTERS + unlocked variants + scout crew → long wrapping scroll inside `#selScroll` (`overflow-y:auto`)
- Skin dots: **34×34px — violates 44px minimum**
- Texture buttons, gear/charm/shop rows all crammed in STYLE tab
- Difficulty buttons (`.diffBtn`): `min-height:36px` — **violates 44px minimum**
- Move list rows: 12px font — small for phone

### Mission select (`showMission()`, main.js:2737)
- Zone headers + mission cards in one long vertical scroll (`#mList`)
- REP tier buttons in a horizontal row (good pattern already)
- Each mission card: district, name, thug count, boss, reward, GO button

### What's already good (keep)
- Graffiti font stack (Bungee/Anton/BebasNeue) — on-brand
- Click sfx + press-scale feedback
- 3D showcase preview with drag-to-spin
- panel9/panel9g card treatments
- REP row is already horizontal, not scrolling

---

## PART 4: REDESIGN PLAN

### Flagship: Character Select

**Structure: 3 pages, swipeable/tappable, no vertical scroll.**

- **Page 1 — FIGHTER:** 6 big cards per page (2 rows × 3 cols), each min 150px wide. Card = fighter art/name/tag, full touch target. Page dots + L/R arrows + swipe. Locked fighters show as silhouettes with unlock text (SF6-style mystery, not "???").
- **Page 2 — STYLE:** skins as big 56px+ dots (up from 34px), textures as full-width buttons (44px+ tall), gear/charms as big toggle cards.
- **Page 3 — MOVES + STATS:** move list as large readable rows (16px+ font), stat bars big and glanceable.
- **Hero preview stays** — 3D model bigger, name in graffiti type, tagline. Selection triggers a fanfare (sound + card pop + brief slow-mo on the model).
- Scout crew moves to its own sub-page ("CREW") — infinite roster can't share the main grid.

**Per-page transition:** 250ms slide (direction matches swipe/arrow), click sound on page change, snap-back on incomplete swipe.

### Mission Select

- **One zone per page.** Zone tabs across the top (big, 48px tall), mission cards below — max 4 visible, no scroll. Page dots if a zone has more.
- Mission cards go horizontal: art swatch left, name/reward/best right, big GO button (full-width, 56px tall) — the primary action is unmissable.
- Keep the REP row as-is (already horizontal and good).

### Menu art styling spec

- Headers: Bungee/Anton, graffiti gradient text (already in use on `#logo`), drop shadows — extend to every screen title.
- Cards: panel9 treatment everywhere, selected = gold glow (already `panel9g`), locked = silhouette + grayscale.
- Text boxes: no raw rectangles — every dialog gets the graffiti border treatment, dark translucent fill, styled font.
- Page indicators: graffiti dots or "1 / 3" in display font, animated on change.
- Backgrounds: keep the district art backgrounds; add subtle animated grain/pulse so menus feel alive (idle life rule).
- Sounds: distinct sounds for page-turn vs select vs confirm vs back (currently all `sfx('click')` — differentiate).

### Game-feel checklist (every menu)
- [ ] Press: scale-down + sound on every tappable (have it — keep)
- [ ] Page turn: slide transition + whoosh sound
- [ ] Select fighter: fanfare + model celebration, THEN transition (don't slam modal over payoff)
- [ ] Idle: selected card gently pulses; page dots breathe
- [ ] Back: always visible, always 48px+ tall, bottom of screen (thumb zone)

---

## PART 5: GLOBAL APPLICATION

This law covers every repo, not just Concrete Dragon. Audit checklist for any menu in any game:

1. Every touch target ≥44px (measure, don't eyeball)
2. No vertical scroll as primary navigation — paginate or tab
3. One screen, one job — max ~6 choices per page
4. Primary action biggest and obvious in 2 seconds
5. Styled as game art, not raw boxes — fonts, borders, sounds, transitions
6. Thumb-zone placement for primary actions

---

## SOURCES

- ScreenRant, "It's Time For Zelda To Leave One Terrible Switch-Era Tradition Behind" (Zelda scrolling UI criticism): https://screenrant.com/zelda-switch-2-ui-menus-scrolling/
- Kotaku, "Five Ways Nintendo Could Fix Breath Of The Wild's Clunky Interface": https://kotaku.com/five-ways-nintendo-could-fix-breath-of-the-wilds-clunky-1793957796
- Townies game-menu skill (pages for catalogs, no bounded scroll): https://github.com/brayden/townies/blob/HEAD/docs/skills/townies-game-menus/SKILL.md
- NeoGAF, "Street Fighter 6's visuals, animation, and attention to detail are amazing" (SF6 character select as art): https://www.neogaf.com/threads/street-fighter-6s-visuals-animation-and-attention-to-detail-are-amazing.1658527/
- Apple HIG / Material Design / WCAG 2.5.5 touch target sizes, via mobile UX pattern libraries: https://github.com/altetsa/design-dna/blob/HEAD/Skill/Vibe%20Design/Skills/Genjutsu/Genjutsu_Mobile_Principles.md and https://github.com/lumusitech/ai/blob/HEAD/skills/mobile-ux-patterns/SKILL.md
- Mezo Istvan, "Juicy UI" (Purho GDC 2012 "Juice It or Lose It"): https://medium.com/@mezoistvan/juicy-ui-why-the-smallest-interactions-make-the-biggest-difference-5cb5a5ffc752
- Gamigion, "How to Make a Game Feel Juicy?": https://www.gamigion.com/how-to-make-a-game-feel-juicy/
- inman-sebastian/agent-games CLAUDE.md (juice on state transitions): https://github.com/inman-sebastian/agent-games/blob/HEAD/CLAUDE.md
- Concrete Dragon repo: `game-3d/src/main.js` (`showSelect` :2675, `showMission` :2737), `game-3d/src/template.html` (menu CSS :112-160, select DOM :287-325)
- Owner directives: 2026-10-09 menu complaints; HUMAN-PERSPECTIVE UX LAW (AGENTS.md)

## WHAT'S SUGGESTION VS CONFIRMED

- Confirmed (measured): all code references, CSS sizes, current menu structure, touch-target violations.
- Confirmed (sourced): Zelda scrolling criticism, touch target standards, SF6 menu-as-art, juice principles, paged-catalog guidance.
- Suggestion (mine): the specific 3-page character select layout, 6-cards-per-page count, zone-per-page missions, transition timings, sound differentiation. These follow the sourced principles but the exact numbers are my design judgment.

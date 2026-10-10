# Concrete Dragon — Full Menu / UX / Narrative Audit

*Audit date: 2026-10-10. Build: main @ 49c7825 (post-PR #43).
Method: played the built `game-3d/dist/concrete-dragon.html` in headless Chromium
(SwiftShader) at mobile portrait 390×844 and landscape 844×390. Every screen screenshotted
with my own eyes; DOM measured for word count, button count/sizes, scroll need, font sizes.
Two passes: pass 1 (natural flow, `shots/`) and pass 2 (deterministic via `skipCine()`
debug hook, `shots2/`). Screenshots: `~/workspace/uxaudit-work/shots/` and `shots2/`.*

*Touch-target bar: 44px minimum. Anything smaller is flagged TINY. All px measurements are
CSS pixels at the stated viewport.*

---

## 1. Screen-by-screen catalog (all numbers measured, portrait 390×844 unless noted)

### 1.1 Title screen (`#title`, state `title`)

**Flow:** boot → loading → title. **Exit:** TAP TO START → intro cinematic → select.

| Measure | Portrait | Landscape 844×390 |
|---|---|---|
| Words | ~45 | ~35 (credits + patch notes below fold) |
| Buttons | 4 (TAP TO START, TIP JAR, CREDITS, patch expander) | same |
| TAP TO START | ~340×64px, above fold ✓ | ~300×56px, above fold ✓ |
| Scroll | Not needed (all fits) | Needed for CREDITS + WHAT'S NEW, primary action visible |
| Smallest text | 13px (stat line) | same |

**Content:** graffiti logo, STREET BRAWLER, TAP TO START, ★ DAY 1 — WELCOME BACK BONUS $150 ★,
❤ TIP JAR, © CREDITS, WHAT'S NEW panel (latest patch note + "2 OLDER" collapsed),
CASH / WINS / LOSSES / BEST WAVE.

**Findings:**
- **A-1 (P2):** Patch notes on the title screen. WHAT'S NEW shows "WAVE 6: SOUL LAWS
  (COMEBACK CASH, RUN-IT-BACK REMATCH, STREAK SHIELD, ENDLESS MUTATORS, DEEPER PROC-BOSSES,
  ARENA DRESSING, STANCE FINISHERS, ZONES 6-7" — ~30 words of dev changelog competing with
  TAP TO START on first boot. A new player doesn't care. → Collapse to a "WHAT'S NEW •" pill
  that opens an overlay.
- **A-2 (P3):** ❤ TIP JAR is visually equal to the start path. Fine for a $4.99 game, but
  monetization shouldn't outrank CREDITS in hierarchy.

### 1.2 Intro cinematic (7.5s, skippable, state `title` → `select`)

- Letterboxed street pan, title cards ("CONCRETE DRAGON" / "EVERY BLOCK HAS A KING" /
  "TAKE IT BACK"). HUD + touch hidden (CDCI2 fix verified — clean frame).
- Measured during playback: 4 words ("TAP TO SKIP ▸"), 0 buttons.
- **B-1 (P2):** No progress indicator. A thin bar under the letterbox would tell the player
  it's 7 seconds, not 70.
- **B-2 (P3):** Skip affordance is 12px "TAP TO SKIP ▸" (tap-anywhere works, but the visible
  label undersells it).

### 1.3 Character select (`#select`, state `select`)

**Flow:** intro ends/skipped → select. **Exit:** FIGHT → mission; ← TITLE → title.

Four tabs (CSS-only): FIGHTER / MOVES / STYLE / STATS. 3D turntable preview (drag to spin),
fighter name + one-line tag, fighter cards, FIGHT button, CUSTOMIZE button.

| Pane | Words | Buttons | Tiny |
|---|---|---|---|
| FIGHTER | 72 | 3 | 1 (← TITLE, 126×43) |
| MOVES | **429** | 3 | 1 |
| STYLE | 202 | 19 | 3 (PATCHWORK 103×39, KAYKIT ORIGINAL 135×39, ← TITLE) |
| STATS | 26 | 3 | 1 |

**Findings:**
- **C-1 (P1): 429 words on the MOVES pane.** ~18 moves × name + input + description. It's a
  reference doc, opt-in via tab — acceptable placement, but a new player opening MOVES gets
  a wall of text with no entry point. → Add a "STARTER COMBO" callout at the top
  (3 moves: JAB > CROSS > DUST LAUNCHER). Everything else is reference.
- **C-2 (P2):** ← TITLE back button is 126×43 — 1px under the bar. Bump to 44px height.
  Same on STYLE pane.
- **C-3 (P2):** STYLE pane skin buttons (PATCHWORK, KAYKIT ORIGINAL) are 39px tall. Bump.
- **N-1 (P1 narrative):** Each fighter has only a one-line tag
  (KID BLUE: "Balanced brawler. Big heart, bigger hands."). No bios, no backstory.
  → 2–3 sentence bio under the tagline. Text-only, zero new systems.

### 1.4 Mission screen (`#mission`, state `mission`)

**Flow:** FIGHT from select → mission. **Exit:** tap mission → card; ← Fighters → select;
🏆 Records → leaderboard.

| Measure | Value |
|---|---|
| Words | **290** |
| Buttons | 9 |
| Tiny | **8** |
| Content | Logo, MISSIONS, REP pills (OFF/R1–R5), 🔒 CLEAR RUST BELT, 🎃 HALLOWEEN EVENT card, ZONE 1 — ORIGINS card (partially clipped), DAILY SEED pill, CASH/WINS/LOSSES/BEST WAVE, ← FIGHTERS, 🏆 RECORDS |

**Tiny targets (all measured):**
- REP pills: OFF 41×36, R1–R5 36×36 each (6 pills, all tiny)
- GO button 184×26 (26px tall!)
- ← FIGHTERS 154×43 (1px under)

**Findings:**
- **D-1 (P1): 8 tiny targets on one screen.** The REP row is the worst offender — 6 pills at
  36px. → Make REP pills 44px minimum; the GO button needs a full redesign (26px tall is
  unusable).
- **D-2 (P1): ZONE 1 — ORIGINS card is clipped** ("ZONE 1 — CO" visible, rest cut off at the
  right edge). Horizontal overflow — the card row doesn't fit 390px. → Fix card sizing/
  scrolling.
- **D-3 (P2): 290 words.** Mission rows each carry name + zone + lock + reward + daily =
  ~15–20 words × rows. Dense. → Icon-first rows, detail on tap.
- **D-4 (P2):** No per-mission difficulty indicator (difficulty is global, pause-only).

### 1.5 Mission intro card (2.3s letterboxed, state `mission` → `fight`)

- "FIRST BLOOD" / "The block talks. Make it listen." over the 3D stage. HUD + touch hidden
  during card (CDCI3 fix verified — clean frame in pass 2).
- **E-1 (P2):** Same as intro — no progress bar on the 2.3s card.
- **E-2 (P3, edge case):** Pass 1 (slow-clock desync) captured the card caption + TAP TO SKIP
  persisting behind the pause menu and over fight touch buttons (`body.cine` still present
  while state was `fight`). NOT reproduced in pass 2's clean flow — likely a test artifact
  of pausing mid-card on a 2fps clock. But the card/pause interaction deserves hardening:
  make `endCine` cleanup idempotent and guard `bossBeat`'s setTimeout against state changes.

### 1.6 Combat HUD (`#hud` + `#touch`, state `fight`)

- Player HP + name, enemy HP + name, 10-segment energy meter, combo counter, score, CASH,
  wave indicator, boss bar during bosses, virtual stick, 6 touch buttons.
- **Touch buttons measured from CSS: 76×76px** (`.abtn`) — comfortably above the bar. ✓
- Stick: 110px. ✓
- Fight screen: 53 words, clean hierarchy.

**Findings:**
- **F-1 (P1): Tutorial text overlaps controls.** "DRAG LEFT SIDE TO MOVE" and "Tap right side
  to punch, dodge..." render ON TOP of the GRP/DDG button cluster. Text colliding with the
  buttons it describes. → Move tutorial text to the top-center safe area, or fade after
  first successful input.
- **F-2 (P1): Tutorial persists into the boss fight.** "DRAG LEFT SIDE TO MOVE" was still
  visible during the KINGPIN boss intro, overlapping buttons. → Dismiss movement tutorial
  on first boss spawn at the latest (ideally after first successful stick drag).
- **F-3 (P3):** Boss name card ("👑 KINGPIN — HE RUNS THIS BLOCK") is good — but it's the
  ONLY boss fiction. → Add a one-line boss taunt under the name (N-2).

### 1.7 Pause menu (`#pauseOv`, state `fight` → paused)

**Flow:** pause button → overlay. **Exit:** Resume / Restart / Missions / Quit to Title.

The best menu in the game. Measured: 474 words (mostly the MOVES reference), 15 buttons,
2 tiny.

- RESUME / RESTART / MISSIONS / QUIT TO TITLE — 4 big buttons, clear hierarchy. ✓
- Difficulty: ROOKIE / STREET / NORMAL / HARD / BRUTAL segmented. ✓
- SOUND / HAPTICS / QUALITY / ASSIST toggle rows. ✓
- MOVES: scrollable per-fighter reference. ✓

**Tiny targets:**
- Pause button itself (❚❚): 55×29 — 29px tall!
- Sound toggle (🗣): 41×39

**Findings:**
- **G-1 (P1):** This is the ONLY settings surface in the game. A player who wants to mute
  or change quality must start a fight first. → Mirror difficulty + 4 toggles behind a gear
  icon on the title screen. (The UI already exists — it's a placement job.)
- **G-2 (P2):** Pause button 55×29px. It's the most-tapped button in combat — make it 44px
  minimum height.
- **G-3 (P3):** No control remapping, no left-hand mode, no button resize. Fixed layout only.
- **G-4 (P3):** 474 words is a lot, but it's 90% the opt-in MOVES reference. Acceptable.

### 1.8 Results / game-over (`#results`, state `results`)

**Flow:** mission complete OR player death → results. **Exit:** NEXT → / RUN IT BACK /
Missions / ❤ SUPPORT THE DEV.

Measured on KNOCKED OUT screen: 129 words, 16 buttons, **0 tiny**. ✓
- "KNOCKED OUT", "REACHED FIRST BLOOD", "0 K.O.S · BEST COMBO 0", "SCORE 0",
  "Fight cash +$0 / TOTAL +$0".
- Upgrade cards: POWER / TOUGH / HUSTLE / SLIPPERY (LV0, $100 each) — meta progression,
  clean 2×2 grid, all tappable sizes.

**Findings:**
- **H-1 (P2): No arcade CONTINUE countdown.** Death → results → RUN IT BACK works, but
  there's no urgency ritual. The inspiration study flagged SoR2's "CONTINUE? 07" as a steal.
  → Optional: 10-second continue countdown with "one more try" frictionlessness.
- Otherwise the cleanest dense screen in the game — 16 buttons, zero tiny. This is the bar.

### 1.9 Overlays (all verified reachable + closable)

- **Credits** (`#creditsOv`): asset attribution, CLOSE button. Fine.
- **Records** (`#boardOv`): 🏆 RECORDS + board list + Close. Fine.
- **Customize** (`#customOv`): per-fighter customization + DONE. Fine.
- **KO splash, boss bar, unlock banner, login bonus pill:** transient, fine.

---

## 2. Missing menus

| # | Missing | Impact | Notes |
|---|---|---|---|
| M-1 | **Title-screen settings** | **High** | Sound/haptics/quality/difficulty only reachable mid-fight. Gear icon on title. |
| M-2 | **How-to-play screen** | **High** | No front door for first-timers: no controls diagram, no starter sequence. Contextual hints exist but there's no "how do I play" screen. One screen: stick diagram + 6 buttons + 3 starter combos. Link from title + select. |
| M-3 | **Continue countdown** | Medium | Arcade ritual (SoR2 steal). |
| M-4 | **Character bios** | Medium | One-line tags only. 2–3 sentences per fighter. (N-1) |
| M-5 | **Control remapping / layout options** | Low | Fixed layout. |
| M-6 | **Audio sliders** | Low | Mute toggle only. |
| M-7 | **Stage select** | — | Mission list covers this (linear unlock, replayable). Not missing. |

## 3. Text overload (measured word counts)

| Screen | Words | Verdict |
|---|---|---|
| Title | ~45 | OK, but 60% is patch notes → collapse (A-1) |
| Select FIGHTER | 72 | OK |
| Select MOVES | **429** | **OVERLOAD** → starter-combo callout (C-1) |
| Select STYLE | 202 | OK (cosmetic browser) |
| Select STATS | 26 | OK |
| Mission | **290** | **Dense** → icon-first rows (D-3) |
| Fight HUD | 53 | OK |
| Pause | 474 | OK (90% opt-in reference) |
| Results | 129 | OK |
| Intro cine | 4 | OK |

**Rule of thumb from this audit:** reference panes (MOVES) can be long — they're opt-in.
Decision screens (mission list, title) must stay under ~100 words. The mission screen at 290
and the MOVES pane at 429 are the two to address.

## 4. Tiny targets (all measured, <44px)

| Screen | Element | Size | Fix |
|---|---|---|---|
| Mission | REP pills OFF/R1–R5 (×6) | 36–41px | Bump to 44px |
| Mission | GO button | 184×**26** | Redesign — 26px tall is unusable |
| Mission | ← FIGHTERS | 154×43 | 44px height |
| Select | ← TITLE | 126×43 | 44px height |
| Select STYLE | PATCHWORK / KAYKIT ORIGINAL | ~103–135×39 | 44px height |
| Pause btn (HUD) | ❚❚ | 55×**29** | 44px height — most-tapped button in combat |
| HUD | Sound 🗣 | 41×39 | 44px |
| Combat | 6 touch buttons | **76×76** | ✓ PASS |
| Combat | Stick | 110px | ✓ PASS |
| Results | 16 buttons | — | ✓ **0 tiny — the bar** |

## 5. Navigation flow

```
boot → loading → title → [TAP TO START] → intro → select ⇄ mission ⇄ fight
   (gear icon: MISSING)                        ↕              ↕
                                            ← TITLE      pause overlay
                                                              ↕
                                                    results → rematch/missions/title
```

- **Dead ends:** none found. Every screen has a working exit (all back/close buttons verified).
- **F-1:** Two "quit" paths in pause (Missions vs Quit to Title) — clear enough.
- **F-2:** After results → Missions, player lands on mission list. Fine.

## 6. Narrative gaps

**Exists:** intro cards (3), mission cards (name + 1 tagline each), boss name cards + bars,
fighter one-line tags, unlock text ("Unlocks KINGPIN as playable").

| # | Gap | Fix (cheapest first) |
|---|---|---|
| N-1 | **No character bios** | 2–3 sentences under each select tagline. Text-only. |
| N-2 | **No boss dialogue** | One taunt line on the existing boss card (F-3). Text-only. |
| N-3 | **No story progression** | Zone chapter intros: 2 sentences on the mission card per zone. Uses existing card. |
| N-4 | **No endings** | Victory screen per zone / all-clear. Minimum: credits roll. |
| N-5 | **No cutscene system use** | `playCine` exists (letterbox + captions + camera moves) but only shows title cards. 15s motion-comic zone intros are buildable with existing primitives. |
| N-6 | **No relationships** | Unlock text implies roster connections; no fiction for why. Bios (N-1) cover this. |

**Narrative budget:** the tech already exists. Highest ROI: boss taunts (1 line each) +
fighter bios (3 sentences each) + zone intros (2 sentences on existing cards). Zero new systems.

## 7. Ranked fix list

### P0 — bugs
1. **F-1: Tutorial text overlaps touch controls** ("DRAG LEFT SIDE TO MOVE" over GRP/DDG).
   Move to safe area or fade on first input.
2. **F-2: Tutorial persists into boss fight.** Dismiss on first boss spawn (or first stick drag).
3. **D-2: ZONE 1 card clipped** on mission screen (horizontal overflow at 390px).

### P1 — high player impact
4. **M-1: Title-screen settings** (gear icon → difficulty/sound/haptics/quality). UI exists in pause; mirror it.
5. **M-2: How-to-play screen** (controls diagram + 3 starter combos; link from title + select).
6. **D-1: Mission-screen tiny targets** — 6 REP pills + GO button (26px!) + ← FIGHTERS.
7. **C-1: MOVES pane starter callout** — "STARTER COMBO" box atop the 429-word reference.
8. **A-1: Collapse patch notes** on title to a pill → overlay.
9. **N-1 + N-2: Fighter bios + boss taunts** (text-only).

### P2 — medium
10. **G-2: Pause button 44px** (currently 55×29).
11. **B-1/E-1: Cinematic progress bars** (intro + mission cards).
12. **H-1: Continue countdown** (arcade ritual).
13. **N-3: Zone chapter intros** on mission cards.
14. **D-3: Mission row density** (icon-first rows).
15. **C-2/C-3: ← TITLE + skin buttons to 44px.**

### P3 — nice to have
16. **N-4: Endings** (victory/credits).
17. **N-5: Zone motion-comic intros** (existing cine primitives).
18. **E-2: Harden card/pause interaction** (idempotent `endCine`; observed only under test desync).
19. **M-5/M-6: Remapping, audio sliders.**
20. **A-2: Tip-jar hierarchy.**

---

*All screenshots: `~/workspace/uxaudit-work/shots/` (pass 1, natural flow) and `shots2/`
(pass 2, deterministic). Measurements: `shots2/measurements.json`.*

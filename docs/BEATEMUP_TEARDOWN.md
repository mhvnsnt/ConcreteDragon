# CONCRETE DRAGON — Beat-Em-Up Teardown & Design Spec

**Date:** 2026-10-06 · **Purpose:** Reference-backed design for the beat-em-up evolution.
Owner directive: current menus are ugly/boring — every design decision below is
backed by a shipped reference game, not guesswork.

**Direction (owner-locked):** 3D side-scrolling beat-em-up. Walk forward/backward
(+ depth) across scrolling street levels with missions. Inspirations: Streets of
Rage 1–4, Fatal Fury series, Dragon Ball GT: Transformation (GBA),
Streets of Fury. NOT a stationary 1v1 fighter.

---

## 1. STREETS OF RAGE 1–4 (Sega / Dotemu, 1991–2020)

### Character select
- SoR2/3: full-body character sprites on a city-backdrop select screen, each with
  visible stat bars (power / speed / jump / stamina). You see the FIGHTER, not an icon.
- SoR4: starts with 4 fighters; the select screen shows a **blanked-out 5th slot**
  that teases an unlockable (Adam Hunter) — locked content is visible as a
  silhouette with a hint, which drives replay ("who is that?").
- Lesson: show full-body fighters + stat bars; tease locked fighters as silhouettes.

### Unlock / progression (SoR4 — the modern standard)
- Adam Hunter unlocks by **completing Stage 4 of the story** (milestone unlock).
- 12 retro characters unlock via **lifetime score thresholds** (200,000 → 1,150,000
  points): every point ever earned counts. Score comes from hits, combo chains,
  pickups, time bonus, remaining-health bonus, unused-star bonus, and a letter
  rank (S/A/B/C/D) per stage.
- Lesson: two unlock tracks — (a) milestone unlocks (beat mission X / boss Y),
  (b) lifetime-score thresholds. Both are pure gameplay, no paywalls.

### Level / world structure (SoR2 — the genre template)
- **8 stages**, each with a distinct theme + end-of-stage boss:
  1. Downtown / Bar → boss Barbon · 2. Bridge → Jet · 3. Amusement Park → Zamza ·
  4. Stadium → Abadede · 5. Ship → R. Bear · 6. Jungle → Souther & Stealth ·
  7. Munitions Factory → Particle & Molecule · 8. Syndicate Stronghold → Mr. X
- Stages are walks through themed zones with enemy waves, then a boss arena.
- Lesson: mission = themed walk with escalating waves + boss at the end.
  District identity per mission is the genre's core content unit.

### Enemy variety + variants (SoR2 — the masterclass)
- ~18 enemy archetypes, each with **named palette/behavior variants**:
  - Galsia (street punk): variants Brash, Joseph, B.T., Jonathan, Garam… — later
    variants get more HP and weapons (knives).
  - Donovan (skinhead thug): variants Martin, Gonzalez, Z, Brown… — gains an
    **uppercut that counters the player's jump kicks** (behavior change, not just stats).
  - Signal (mohawk): variants named by jacket color — Y.Signal, R.Signal, B.Signal…
  - Bikers: variants named after weather — Fog, Storm, Typhoon, Hail…
- Variants escalate by: HP, damage, new moves, weapons, aggression.
- Lesson: enemy "families" with named variants that gain new behaviors as the
  player progresses. Names are short and evocative — our equivalent of the
  3D-demo street style (Street Thug → Thug Enforcer → …).

### Items & interactables
- Breakable containers (trash cans, crates, arcade cabinets, vases) hide food
  (apple = small heal, roast chicken = full heal), cash bags, gold bars, 1-ups.
- Weapons: knife, lead pipe, katana — pickup, limited use, throwable.
- Lesson: breakables + pickups break up combat pacing and reward exploration.

### HUD
- Portrait + name + health bar (top-left for P1), score top-center, lives,
  combo counter, boss health bar on boss fights.
- Lesson: persistent identity (portrait + name + HP), combo counter prominent,
  boss HP bar as an event.

**Sources:** Sega Retro (segaretro.org/Streets_of_Rage_4/Playable_characters),
Eurogamer unlock guide, Gamepur unlock guide, Sega Retro SoR2 enemies/stages.

---

## 2. FATAL FURY SERIES (SNK, 1991–2025)

### The two-plane system (the depth-movement reference)
- Original Fatal Fury: **two planes** — foreground and background lanes. A button
  combination shifts the fighter between planes; used offensively and defensively.
- Fatal Fury 3 / Real Bout: **three planes**; fighters auto-return to the center
  lane after a moment (keeps the fight moving — a deliberate anti-stall design).
- Fatal Fury: City of the Wolves (2025): two-lane battles return — lane-switch
  attacks, **cross-lane combos** (combos that carry across planes), lane-dependent
  actions (different moves available per lane).
- Lesson for us: depth (z) movement must be meaningful — dodge INTO the
  background/foreground to evade, and attacks should be able to reach across
  depth. Auto-settling toward a "home" depth keeps brawls from stalling.

### Character select / presentation
- Large character portraits with names; roster grew across entries; guest/DLC
  characters handled as full select-screen additions.
- Bosses (Geese Howard) are presented as events with intro dialogue.

### Stages
- Rounds use different times of day per stage; destructible scenery at stage
  edges; ring-outs in Real Bout (alternate win condition).

**Sources:** Xbox Wire / SNK on City of the Wolves two-lane system (2025),
Nintendo Life reviews of Fatal Fury 3 and Real Bout Special.

---

## 3. DRAGON BALL GT: TRANSFORMATION (GBA, Webfoot/Atari, 2005)

The owner's explicit handheld reference — "what works with limited buttons"
maps directly to touch controls.

### Structure
- 2D belt-scrolling beat-em-up. **Story mode is planet-by-planet**
  (Imecka → … → Earth → Tuffle Planet), each planet = a mission with a
  **boss at the end** (final boss: Golden Great Ape Baby Vegeta).
- **3-character team = lives**: Goku/Pan/Trunks; the player switches between
  them mid-level; unused characters recover energy. Dying swaps to the next.
- Zeni (currency) awarded per stage based on **performance: time, combos,
  power-ups collected** — spent to **purchase/unlock additional game modes**.
- 9 playable characters total; unlockables include Super Saiyan forms,
  Piccolo, Vegeta. Unlocks are gameplay-earned.
- Modes: Story, Standard, Endurance, Boss Endurance, Robot Swarm.
- Lesson: mission-per-location structure; team/lives system; performance-scored
  currency that unlocks content; character forms as unlockable variants.

**Sources:** Giant Bomb wiki, Dragon Ball Wiki (fandom), vizzed.com.

---

## 4. STREETS OF FURY EX (Guard Crush Games, 2015 — the indie proof)

Two developers. Dream-Build-Play finalist. The "small team can do this" proof.

- **"Security Level"** — a lifetime progression meter; raising it unlocks new
  characters, game modes, and content. (Same idea as SoR4's lifetime score.)
- **Story mode: hunt gang leaders in their respective districts** — district =
  mission, boss = gang leader. Directly matches our district plan.
- 24 playable characters; 4-player co-op; dodge, air combos, cancels, "furies"
  (super moves); 5 difficulty levels; survival / versus / challenge modes.
- Cautionary lesson (from reviews): the loop "enter area → fight cloned enemies
  → move on" gets repetitive WITHOUT enemy variety, breakables, or weapons.
  Variety is not optional — it's the genre's oxygen.

**Sources:** Steam store page, Hardcore Gaming 101, Defunct Games review.

---

## 5. CONCRETE DRAGON — DESIGN SPEC (reference-backed)

### 5.1 Design rules (the law for all menus/UI)
1. **Show the fighter, never an icon.** Full-body 3D model on select
   (SoR2/SoR4 show full-body fighters; DBGT box art leads with characters).
   Colored circles are banned.
2. **Stat bars, not stat text.** Power / Speed / Toughness as bars
   (SoR2/3 select-screen convention) — readable at a glance on a phone.
3. **Tease locked fighters as silhouettes** with the unlock condition written
   under them (SoR4's blanked-out Adam slot). Mystery drives replays.
4. **One street identity everywhere:** near-black purple base (#150f2a),
   concrete gray, hazard-yellow (#ffcf2e) for actions, hot pink/cyan neon
   accents. Graffiti-weight display type (Impact/Black stack). No generic
   blue-gradient mobile-game look.
5. **Stage/mission cards look like fight posters** (SoR stage intros):
   district name big, palette swatch, boss name, best-wave record.
6. **HUD keeps identity persistent:** fighter name + HP bar top-left,
   cash top-right, combo counter big and centered (SoR combo counter),
   boss HP bar as a full-width event banner.
7. **Touch-first:** minimum 56px touch targets; movement = left-half drag
   (virtual stick); attacks = right-side buttons (punch / heavy / special /
   dodge). Nothing requires multi-touch precision.
8. **Every screen answers "what do I do next" in under 2 seconds.**

### 5.2 Screens
- **TITLE:** CONCRETE DRAGON logo, animated street backdrop (the 3D scene
  idling), TAP TO START. Meta line: best wave, cash.
- **CHARACTER SELECT:** live 3D model on a turntable (drag to rotate), name,
  street-style tagline, stat bars, skin row (style-only), locked silhouettes
  with unlock conditions, FIGHT button.
- **MISSION SELECT:** district cards in a horizontal scroll — district name,
  palette, mission list with boss + unlock rewards + best records.
- **SHOP:** Power / Tough / Hustle upgrades + supporter skin packs (cosmetic).
- **RESULTS:** KNOCKED OUT / MISSION CLEAR, stats (KOs, best combo, cash),
  unlock banners ("KINGPIN UNLOCKED AS PLAYABLE"), shop, FIGHT AGAIN.
- **HUD (in mission):** HP bars + names, cash, combo, special meter, mission
  progress bar (distance to boss), boss HP banner.

### 5.3 World / mission structure
- **District = mission set.** District has: name, palette (sky/fog/lights/
  building tints per the owner's art rule), mission list.
- **Mission = scrolling walk:** start at x=0, walk right; enemy spawn points
  along the route (SoR "enter area → fight → move on"); breakables (trash
  cans/crates) with cash/food; **boss arena at the end**.
- **Enemy families with named variants** (SoR2 system): base archetype
  (Street Thug) → variants gain HP, new moves, weapons, aggression as
  missions progress. Variants get street-style names.
- **Bosses are events:** intro banner + HP bar + 2–3 telegraphed attack
  patterns (Fatal Fury boss-presentation lesson). Beating a boss **unlocks
  them as playable** (owner directive) + unlocks the next mission.

### 5.4 Roster / progression
- Start: 3 fighters (Kid Blue / Ghost / Brick — names owner-vetoable).
- Unlock tracks (SoR4's two-track system, adapted):
  - **Milestone:** beat boss X → unlock fighter Y (bosses become playable).
  - **Missions:** clear mission → unlock its reward fighter.
- Data-driven FIGHTERS table: id, name, tagline, hp/dmg/spd, unlock rule,
  skin list. Save tracks unlocked roster.
- Style-not-power: skins and supporter packs are cosmetic only. Forever.

### 5.5 Combat (touch beat-em-up)
- Move: left-half drag (virtual stick) — x (forward/back) + z (depth,
  Fatal Fury lane lesson: depth dodges evade).
- Punch (tap), Heavy (button — slower, armor-break, bigger hit-stop within
  the feel law), Special (button — meter filled by dealing/taking damage,
  Urban Reign/Brawl Stars rule), **Dodge (button — quick sidestep with
  i-frames; NO block — owner's Urban Reign call)**.
- Launcher + juggles: every 3rd chained hit launches; taps while airborne
  juggle with damage falloff (Urban Reign's core combo shape).
- Counter: tap on the "!" telegraph (existing system, keep).
- Near-miss: dodge through an attack at the last moment → style cash bonus.
- Feel law (inviolable): slow-mo + long hit-stop for KO/counter/heavy/special
  only; normal hits stay snappy (≤90ms hit-stop).

### 5.6 Replayability
- **Daily seeded run** (DBGT's performance scoring + SoR4's lifetime score):
  date-seeded spawn sequence, one scored attempt per day, local leaderboard.
- **Local leaderboards:** best wave / best combo / fastest boss KO per
  device + shareable run code.
- **Endless mode** (existing waves) stays as the survival ladder.
- **Crowd: conditional** — sideline crowds only on missions flagged
  `crowd: true`, never everywhere (owner directive).

### 5.7 Content pipeline (ongoing, CC0-only)
- KayKit/Kenney mannequins, city packs, props (trash cans, crates, hydrants —
  SoR breakables need props); staged textures for district grounds.
- License manifest kept current (`game-3d/build/asset-manifest` + ASSETS_CREDITS.md).

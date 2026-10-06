# STREET BRAWL — Game Design Document

**Status**: DESIGN. Owner approval required before build.
**Base**: `tracks/playable-ads/kit/dist/street-brawl-demo.html` (1.74MB single-file HTML5 canvas brawler, 17/17 QA).
**Identity**: Original game, original art direction. NOTHING from AshLane. Street-level brawler for mobile.
**Target**: iOS + Android, free-to-play, ages 13+.

---

## 1. Pillars

1. **Three-minute fights.** Every session fits a bus ride. (Brawl Stars rule.)
2. **Skill first, wallet second.** Money buys looks and speed, never wins. No pay-to-win PvP.
3. **Deterministic progression.** No loot-box gambling — every reward track shows exactly what you earn. (Post-2022 Brawl Stars rule.)
4. **A fighter that feels like YOURS.** Deep cosmetic + gear customization; every brawler on screen looks different.

## 2. Core loop

**Pick fighter → pick mode → 3-minute fight → earn cash/parts → upgrade fighter → queue again.**

The demo already proves the fight: side-view canvas brawler, tap = jab, swipe = heavy, hold = block, special meter. The full game keeps this control scheme and layers depth (see §3).

**Session structure**:
- Fight: 90-180 seconds.
- Post-fight: 30 seconds — rewards screen, upgrade nudge, next-fight button.
- Total loop: ~3 minutes. Designed for 4-8 loops per sitting.

## 3. Combat design (built on the demo)

**Controls** (touch-first):
- Tap: jab (fast, low damage)
- Swipe forward: heavy (slow, high damage, armor-break)
- Swipe up: launcher (starts juggles)
- Swipe down: sweep (knockdown)
- Hold both sides / dedicated button: block
- Two-finger tap: special (meter-gated)
- Dash: double-tap left/right

**Depth layers** (Skullgirls lesson — simple inputs, real depth):
- Juggles: launcher → air hits → ender. Damage scaling per hit.
- Blocking: high/low; chip damage on block.
- Reversals: timed block-break on wakeup.
- Throws: close-range, breakable with matching input.
- Weapons: pickup-able (bat, chain, bottle) with durability — break after N hits, Yakuza-style.

**Fighters**: launch roster of 8, each with a distinct style:
1. **Rook** (balanced boxer) — starter
2. **Vex** (fast kickboxer)
3. **Brick** (grappler, slow, huge damage)
4. **Sable** (counter-fighter)
5. **Juno** (rushdown)
6. **Mack** (weapon specialist)
7. **Iris** (acrobatic, aerial game)
8. **Hollow Point** (boss-tier unlock, heavy zoner)

All original characters. No AshLane names, likenesses, or assets.

**Modes**:
- **Street Ladder** (PvE): district-by-district climb, 60 fights at launch.
- **Arcade Run**: 10-fight gauntlet, one life bar, leaderboard.
- **Daily Scrap**: rotating daily challenge (mutators: double damage, weapon-only, etc.).
- **Rivals** (async PvP): fight AI-driven copies of other players' builds, like SF3. Real-time PvP in Season 2.

## 4. Meta progression

**Fighter progression**:
- Level 1-50 per fighter. XP from fights.
- **Gear slots** (Shadow Fight lesson): gloves, jacket, kicks, accessory — 4 slots, 4 rarities (Street / Rare / Epic / Legendary).
- **Moves**: unlockable special moves per fighter, equipment-style (equip 2 of 6).
- **Talent tree**: small per-fighter tree (12 nodes) — damage, defense, meter gain.

**Account progression**: player level, collection % , season rank.

## 5. Monetization stack

### Currencies (3)
| Currency | Type | Earned by | Spent on |
|---|---|---|---|
| **Cash** | Soft | fights, dailies, events | gear upgrades, common items |
| **Gold** | Hard (paid) | IAP, pass, events | skins, premium gear, energy refills |
| **Parts** | Material | fights, events | gear upgrades, crafting |

### Battle Pass — "THE TAKEOVER" ($9.99/season, 8 weeks, 60 tiers)
- Free track: cash, parts, 2 fighters, gear.
- Premium track: exclusive skins, gold, emotes, finishers.
- **Pays for itself**: completing premium earns enough gold for next season's pass (Arc Raiders model).
- **Gameplay NEVER premium-exclusive**: all fighters, moves, and gear stats earnable free. Premium = cosmetics + convenience.

### Shop
- Single-scroll shop (Brawl Stars lesson — low decision fatigue).
- Rotating daily skin/gear offers. Direct purchase — no blind boxes.
- Starter pack ($4.99): fighter + skin + gold, one-time.

### IAP pricing
- Gold packs: $0.99 / $4.99 / $9.99 / $19.99 / $49.99 / $99.99 (standard mobile ladder).
- Pass: $9.99. Skin bundles: $4.99-$14.99. No $99 blind boxes.

### Skins economy
- 4 rarity tiers; seasonal exclusives; color variants.
- Skins are cosmetic-only — zero stat advantage. Ever.

### DLC packs (post-launch)
- Fighter packs: $4.99 (new fighter + skin + moves).
- District packs: $2.99 (new ladder chapter + arena + gear set).
- Season passes stack with DLC — no double-charging for the same content.

### Ads
- Rewarded video only (opt-in: 2x fight rewards, free energy refill). No forced interstitials in the core loop.
- Playable ads (the demo format) for user acquisition.

## 6. Retention systems

- **Daily login calendar**: 28-day cycle, escalating rewards; missed day doesn't reset, just pauses.
- **Daily/weekly quests**: 3 dailies + 3 weeklies (win 3 fights, land 20 heavies, etc.).
- **Energy**: 10 fight-energy, refills 1/10 min; rewarded-video refill. (Tuned generous — energy gates, never walls.)
- **Events**: weekend tournaments, seasonal events with exclusive skins.
- **Crews** (clans): 20-player crews, crew wars (async), crew shop.
- **Leaderboards**: arcade run, season rank, crew rank.
- **Push**: behavior-triggered (lapsed 3 days → win-back bundle; hot streak → share prompt).

## 7. Fairness guardrails (owner rule)

- No loot boxes / blind gacha. All purchases show exact contents.
- No gambling mechanics targeting kids. 13+ rating, no casino aesthetics.
- PvP matchmaking by power band — wallet can't buy wins.
- Published drop rates for anything random (free-chest style rewards only).
- Parental gate on purchases (platform-native).


---

## 8. Update cadence (live service)

- **Seasons**: every 8 weeks — new pass, balance patch, 1 fighter, 4-6 skins.
- **Mid-season drop** (week 4): event + 2 skins + QoL.
- **DLC packs**: 1 fighter pack + 1 district pack per season max.
- **Balance**: data-driven; no mid-season nerfs to paid items (skins are cosmetic anyway).

## 9. Art direction (original)

Gritty hand-drawn 2D with heavy ink outlines and limited palettes per district — think graffiti mural meets fight poster. Districts have identity: neon downtown, rust-belt industrial, boardwalk, subway tunnels. Fighters are readable silhouettes first, detail second. All art commissioned or CC0-derived; nothing from AshLane, nothing from any existing game.

## 10. Audio

Hybrid direction (per owner): open-source loops/samples + code synthesis. Punchy impacts, district-specific music beds (boom-bap, industrial, latin trap). All licensed clean.

---

# BUILD PLAN — demo → shippable

## What the demo already proves
- Single-file HTML5 canvas brawler: tap/swipe/hold controls, HP bars, combo counter, KO flow, MRAID ad hooks.
- 1.74MB, 17/17 QA pass, zero AshLane references. This is the combat kernel.

## Engine choice
**Recommended: Godot 4 (GDScript), exported to iOS/Android.**
- Free, open-source (MIT), no royalties, no seat fees.
- 2D pipeline is mature; canvas-combat ports cleanly.
- Small-team friendly; huge plugin ecosystem.
- Alternative considered: Unity (runtime fees, heavier); custom HTML5 (demo works but native IAP/push/ads need wrappers anyway — Capacitor/Cordova adds fragility at scale).

## What needs building (workstreams)

| # | Workstream | From demo | New work |
|---|---|---|---|
| 1 | Combat v2 | tap/jab, HP, KO | swipe heavies, launchers, juggles, block high/low, throws, reversals, weapons w/ durability, 8 fighters |
| 2 | Meta backend | — | accounts, fighter XP, gear, currencies, shop, inventory (Firebase/Supabase open tier → own server later) |
| 3 | Modes | single fight | street ladder (60), arcade run, daily scrap, async rivals |
| 4 | Monetization | — | IAP (Play Billing + StoreKit), battle pass system, shop UI, rewarded ads |
| 5 | Retention | — | dailies/weeklies, login calendar, energy, events, crews, leaderboards, push |
| 6 | Art/audio | programmer art | 8 fighters + skins, 4 districts, full audio beds |
| 7 | Live ops | — | season tooling, balance dashboard, analytics |

## Milestones (small team, ~3-4 people)

- **M1 — Combat vertical slice** (6-8 wks): 2 fighters, full combat depth, one district. Playable, fun, no meta.
- **M2 — Meta + modes** (6-8 wks): ladder, arcade, progression, currencies. Closed alpha.
- **M3 — Monetization + retention** (4-6 wks): IAP, pass, shop, dailies, energy. Soft launch (1-2 small markets).
- **M4 — Launch** (4 wks): 8 fighters, 60-fight ladder, Season 1 pass, crews. Global launch.
- **M5+ — Live service**: seasons every 8 weeks per §8.

## Open-source / free stack
- Engine: Godot 4 (MIT)
- Backend: Supabase (free tier → self-host) or Nakama (open-source game server, Apache 2.0)
- Analytics: PostHog (open-source tier) or GameAnalytics (free tier)
- Ads: AdMob + Unity Ads (free, rev-share)
- Art tools: Krita, Blender (GPL — asset pipeline only, never shipped in client)
- Audio: freesound.org CC0, Looperman (per-item license check)

## License manifest
All third-party code/assets logged with license + source URL. No GPL/AGPL in the shipped client. Full audit before store submission. M1 manifest: `m1/LICENSES.md`.

## Risks
- Scope creep on fighters (lock 8 for launch).
- PvP netcode cost (async first, real-time Season 2).
- Store review (gambling optics — mitigated by deterministic design, §7).

---

## 11. Ragdoll & hit reactions (M1 — implemented)

**Goal**: knockdowns so watchable that no two are ever the same. Reactions vary with impact velocity, hit placement (chin vs body vs legs), and per-fighter toughness ("chin strength"). Sometimes he crumples, sometimes he staggers off a wall, sometimes he flips.

### What the references do (all described in own words from public sources)
- **Gang Beasts**: characters are full ragdolls with servo motors driving limbs toward target poses — "active ragdoll". Hits and grabs disturb the physics; the motors fight back. Comedy comes from physics never resolving the same way twice.
- **Fall Guys**: physics-driven characters with animation targets; wobble and tumble on collision, recover via motors. The wobble IS the game feel.
- **Human Fall Flat**: near-pure ragdoll, minimal motor assist — maximum floppy unpredictability, less readable for combat.
- **Ragdoll fighters (e.g. Toribash-style)**: turn-based joint control — precision, not our model.

**Portable lesson**: don't choose between animation and physics — drive animated poses through spring-damper "motors" and let impacts inject velocity. Stiff motors = readable fighting; slack motors = ragdoll comedy. That's the Gang Beasts trick, adapted to 2D.

### Open-source sources evaluated
1. **CBerry22 "Active Ragdoll — Physics Animations in Godot 4"** (GitHub): Unreal-style physical animation in Godot 4 using PhysicalBone3D — motors track animation, weaken on impact. *Does well*: the motor-weakening concept. *Not ported*: 3D PhysicalBone approach doesn't apply to our 2D paper-doll rig; idea adopted as stiffness modulation, no code copied. (License: check repo before any code use — we used none.)
2. **Second-order dynamics** (public GDC-style talk, "dynamic spring" formulation; C# gist exists): spring with frequency/damping/response params for procedural follow-through. *Does well*: stable, tunable spring math (f/z/r). *Fused*: our joint integrator is the same family (F = -k(x-t) - c·v, semi-implicit Euler), implemented fresh in GDScript.
3. **Spring-damper reference implementations** (MIT-style gists/docs): the canonical `F = -k(x-target) - c·v` with critical-damping guidance (c = 2√(k·m)). *Does well*: starting stiffness/damping tables. *Fused*: our per-state stiffness map (strikes ~400, hit 90, launched 45, KO 14).
4. **Bannon's BANNON_IMPACT** (internal, from Neckbreaker research): "no two impacts the same" — impact director scaling reactions by velocity, per-bone response, randomized archetypes. *Fused*: the reaction-tier design (snap / stagger / crumple / launch / flip / KO flop) and randomized follow-through impulses, reimplemented natively for the 2D rig.

### What M1 implements (`scripts/fighter.gd`)
- Every joint (14: hips, chest, head, shoulders, elbows, hips, knees, body) runs on a spring-damper chasing the animated pose. Stiffness per state: strikes 380-420 (snappy), idle 260, hit 90 (wobbly), launched 45 (flail), KO 14 (near-ragdoll flop).
- `apply_impact(impulse, height)`: hits inject angular velocity into joints. Placement matters — high (chin) whips head/chest, low (legs) buckles hips/knees, mid twists torso. 35% chance of a wild back-arm flail.
- **Chin strength** (`toughness`): Rook 1.15 / Vex 0.9 / Punk 0.8 / Thug 1.0 / Bruiser 1.3 / Big Mo 1.7, plus Toughness upgrades. Impulse = (dmg·0.55 + kb·0.02) / toughness.
- **Reaction tiers**: light → head snap + stagger; heavy → crumple (folds where he stands); launcher → airborne flail, hard slams bounce once; huge chin shots → full flip (body spin); KO → all springs slack, body bounces on the ground with damped restitution and random limb settle.
- **Wall stagger**: slammed into the arena edge at speed → bounces off with extra wobble.
- The sacred loop is untouched: tap → beatdown → next enemy. Ragdoll is the show *inside* the loop.

---

*Design: 2026-10-06. M1 in build (Godot 4.4). Owner-approved direction.*

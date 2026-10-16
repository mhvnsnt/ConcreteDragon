# Concrete Dragon — Inspiration Field Guide (cross-game synthesis)
**Stored in repo docs per RESEARCH-TO-REPO LAW (owner 2026-10-16). Source: the `3d-platformer-inspiration-study` web artifact (field guide, expanded 2026-10-10 from six browser-played sessions + secondary research). This doc captures the artifact's cross-game synthesis, ranked design transfers, and prototype order — the parts not already covered by the RESEARCH_* docs. Validation status: transfers marked WIRED are implemented + playtested; the rest are candidates awaiting grey-box prototypes.**

**Gap note vs existing docs:** `RESEARCH_FIGHTER_MECHANICS.md` = fighter FEEL (Final Fight/SoR/SF/Tekken combat systems). `RESEARCH_3D_PLATFORMER_MECHANICS.md` = movement philosophy (Mario/Sonic/Luigi's Mansion). `RESEARCH_MENU_UX_NARRATIVE.md` = menu/UX/narrative rules. `RESEARCH_ENEMY_AI.md` = enemy behavior. This doc = the SYNTHESIS: what the games agree on, the ranked transfer backlog, and what to prototype in what order.

---
## 1. Cross-game synthesis — what every great brawler agrees on

1. **Momentum is continuous.** Attacks, dodges, and traversal feed each other (Mario 64's move-chaining, SoR2's blitz attack). Concrete Dragon rule: no full stops between verbs.
2. **Movement is defense, not locomotion.** Sonic's speed-as-offense, SoR2's rear escape attack, Tekken's sidestep — repositioning must beat blocking as the primary defensive tool.
3. **Characters differ by verbs, not skins.** Captain Commando's four archetypes (grappler / speedster / heavy / ranged) read instantly. Concrete Dragon: exclusive moves, stances, grabs, and defensive options per fighter.
4. **Juggles need gravity + damage scaling + meaningful enders** (damage / wall carry / ground pressure / crowd control). Tekken's bound system is the reference.
5. **The environment is combo geometry.** Walls, cars, pillars, storefronts extend combos (Final Fight's destructible barrels, SoR2's pits).
6. **Heavy hits need the full stack:** hit-stop + scale-appropriate sparks + impact audio + camera response (SFII's hit-stop/shake/sound stack).
7. **Bosses transform, not just inflate.** Phase changes (stance switch, new moves, arena change) beat HP scaling.
8. **Bounded structure over open sprawl.** Tekken Force's short themed stages beat Scenario Campaign's stiff full-fighter transplant. Concrete Dragon: short stages, clear gates, heal between fights.
9. **Comedy is a combat system.** Metal Slug's slapstick (POW rescues, comedic idle, enemy panic) and SoR2's hit words make hits *feel* bigger. This is why the comic hit words (CDCI3) belong.
10. **The panic button costs health.** SoR2's special drains HP; Captain Commando's Mega Crash taxes health. A get-out-of-jail move must have a real cost or it becomes the whole game.

## 2. Ranked design transfers (backlog)

| # | Transfer | Source game | Status |
|---|---|---|---|
| 1 | Comic-book hit words (POW!/WHAM!/KRAKOOM!) on heavies + KOs | SoR2 | ✅ WIRED (CDCI3, eyes-on verified) |
| 2 | Health-cost panic special (Mega Crash) | SoR2 / Captain Commando | 🔄 candidate — prototype next |
| 3 | Momentum dash (movement as offense) | Sonic | 🔄 candidate |
| 4 | Threat bubbles / off-screen enemy indicators | SoR4 (research) | 🔄 candidate |
| 5 | Vs-screen boss ritual (name card + taunt) | SFII / SoR4 | 🔄 candidate |
| 6 | POW/civilian rescue loop | Metal Slug | ⏳ queued |
| 7 | Temporary rideable heavy objects w/ damage states | Metal Slug | ⏳ queued |
| 8 | "Surround but take turns" crowd AI | SoR2 | ⏳ queued |
| 9 | Blitz attack (dash strike) | SoR2 | ⏳ queued |
| 10 | Rear escape attack | SoR2 | ⏳ queued |
| 11 | Throws that bowl through crowds | SoR2 | ⏳ queued |
| 12 | Proximity auto-grab | Final Fight | ⏳ queued |
| 13 | Destructible loot objects | Final Fight | ⏳ queued |
| 14 | Fight gates (arena locks until cleared) | Final Fight | ⏳ queued |
| 15 | Healing between fights | Final Fight | ⏳ queued |
| 16 | Temporary enemy-carried weapons | Final Fight / Captain Commando | ⏳ queued |
| 17 | Contextual attack/pickup button | Captain Commando | ⏳ queued |
| 18 | Stage grades (S/A/B/C) | Sonic | ⏳ queued |
| 19 | Mission-start cards | Metal Slug | ✅ WIRED (exists) |
| 20 | Character stat cards (3 bars, no numbers) | SoR2 / research R4 | ⏳ queued |

## 3. Prototype order
1. Mega Crash panic button (health tax, i-frames, crowd clear) — highest feel ROI.
2. Momentum dash (cancel windows: attack→dash→attack).
3. Threat bubbles (off-screen/edge indicators, ≤12px, fade on approach).
4. Vs-screen boss ritual (name plate + 1–3 taunt lines, skippable).
Each prototype: grey-box in a scratch branch, 30s of playtest footage, keep or cut.

## 4. Honest limitations
- Browser sessions were movement + observation only for most titles (attack inputs blocked on archive.org; Capcom Town sessions died before full stages). Transfers are design-level, not frame-data.
- All menu/UX rules were index-sourced until `docs/UX-AUDIT.md` (2026-10-10) measured them against the live build — audit wins over research on conflicts.

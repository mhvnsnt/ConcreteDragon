# CONCRETE DRAGON — Game Anatomy Checklist
Owner directive 2026-10-06. What a complete 3D side-scrolling beat-em-up needs, across every part.
Researched against: Streets of Rage 1–4, Fatal Fury, Dragon Ball GT: Transformation (GBA),
Streets of Fury, Urban Reign, Brawl Stars, Combo Crew. Each item is one auditable unit.

## 1. COMBAT MECHANICS
- [ ] C1 Basic attack string (multi-hit light combo, e.g. punch-punch-kick)
- [ ] C2 Heavy attack (charged or dedicated button; knockback/knockdown)
- [ ] C3 Special move (costs health or meter; invincible defensive variant — SoR4 model)
- [ ] C4 Super/ultimate (screen-clearing, charged by dealing/taking damage — Brawl Stars model)
- [ ] C5 Dodge (Urban Reign style — NO block; i-frames, repositions)
- [ ] C6 Counter system (punish telegraphed enemy attacks, e.g. on "!" window)
- [ ] C7 Launcher + juggle (pop enemy airborne, keep hitting mid-air)
- [ ] C8 Grab/throw (proximity grab, invincible during animation, crowd-control throws)
- [ ] C9 Back attack (hit enemies approaching from behind)
- [ ] C10 Air attack (jump + attack)
- [ ] C11 Weapon pickups (limited durability, throwable, catchable — SoR4)
- [ ] C12 Near-miss bonus (dodge at last instant = style reward)
- [ ] C13 Enemy AI archetypes (rusher, grappler, zoner, shielded, taser/stunner, boss patterns)
- [ ] C14 Boss fights (multi-phase, readable telegraphs ≥150ms, unique arenas)
- [ ] C15 Enemy variants that evolve with progression (visual + behavior, palette/gear swaps)
- [ ] C16 Combo scoring (named combo tiers, points only count if unhit — SoR4/DMC model)
- [ ] C17 Difficulty scaling (enemy HP/damage/speed scale with wave/level; fair, readable)

## 2. ART
- [ ] A1 Playable character models (distinct silhouettes, readable at phone size)
- [ ] A2 Enemy models (archetype-readable: thug vs heavy vs boss at a glance)
- [ ] A3 Boss models (larger scale, unique silhouette)
- [ ] A4 Animation set per fighter (idle, walk, punch, kick, heavy, hit-react, knockdown, KO, win pose)
- [ ] A5 Environment/district art (street, alley, rooftop, etc. — per-district palette + lighting)
- [ ] A6 Props (dumpsters, hydrants, cars, crates, barrels — some breakable)
- [ ] A7 Breakables with pickups inside (health food, cash — SoR apple/chicken model)
- [ ] A8 VFX: hit sparks, impact rings, dust on landing, KO burst
- [ ] A9 VFX: special/super effects (screen flash, shockwave)
- [ ] A10 Crowd characters (some missions only — owner rule; varied, animated)
- [ ] A11 Skins/cosmetics (style-only; per-fighter colorways, outfit variants)
- [ ] A12 Graffiti/signage/decals (district identity, Concrete Dragon branding in-world)

## 3. UI
- [ ] U1 Title/main menu (custom art, logo treatment, animated background)
- [ ] U2 Character select (LIVE 3D model preview — owner law; stats, skins, rotate)
- [ ] U3 HUD: player/enemy health bars (custom art, segmented, damage flash)
- [ ] U4 HUD: wave/level indicator, combo counter, cash counter, timer (where relevant)
- [ ] U5 HUD: special/super meter
- [ ] U6 Pause menu (resume, restart, settings, quit)
- [ ] U7 Results screen (KOs, best combo, cash earned, wave reached)
- [ ] U8 Shop/upgrade screen (custom art; Power/Tough/Hustle or equivalent)
- [ ] U9 Settings screen (volume sliders, mute, quality toggle, control options)
- [ ] U10 Tutorial/onboarding (first-time hints, "tap to punch" style prompts)
- [ ] U11 Unlock notifications ("NEW FIGHTER UNLOCKED" ceremony)
- [ ] U12 Leaderboards screen (local bests; daily seeded run board)
- [ ] U13 Custom fonts (display font with street character — typography is half the look)
- [ ] U14 9-slice panels/buttons (scalable menu boxes that never distort)
- [ ] U15 Icons (menu, HUD, shop, status — consistent set)

## 4. AUDIO
- [ ] S1 Punch/kick impact SFX (layered, pitch-randomized ±5%)
- [ ] S2 Whoosh/swing SFX (missed attacks)
- [ ] S3 Block/dodge SFX (cloth whoosh for dodge)
- [ ] S4 KO SFX (satisfying boom/stinger)
- [ ] S5 Counter SFX (distinct chime/crack)
- [ ] S6 UI SFX (click, confirm, error, unlock fanfare)
- [ ] S7 Pickup SFX (cash, health)
- [ ] S8 Footsteps (surface-appropriate)
- [ ] S9 Crowd ambience (where crowds appear)
- [ ] S10 Street ambience (traffic, distant city — district bed)
- [ ] S11 Music: menu loop
- [ ] S12 Music: battle loop(s) (per-district ideally)
- [ ] S13 Music: boss theme
- [ ] S14 KO/boss-defeat stinger
- [ ] S15 Audio mixing (master/music/sfx buses, music ducks under big hits, mute respected)

## 5. SYSTEMS
- [ ] Y1 Save system (cash, upgrades, roster, unlocks, settings — persistent, versioned key)
- [ ] Y2 Settings persistence (volume, quality, controls)
- [ ] Y3 Character unlocks (missions/boss defeats → playable; data-driven roster)
- [ ] Y4 Skin system (style-only, equip per fighter, persisted)
- [ ] Y5 Upgrade/progression (cash → Power/Tough/Hustle; style-not-power law)
- [ ] Y6 Level/mission structure (districts, mission select or linear progression)
- [ ] Y7 Endless/survival mode (scaling waves — current core loop)
- [ ] Y8 Daily seeded run (same seed for all players that day)
- [ ] Y9 Local leaderboards (best wave, best combo, best score per mode)
- [ ] Y10 Run codes (shareable seed/result codes — social/viral)
- [ ] Y11 Achievements (first KO, 50-hit combo, boss no-hit, etc.)
- [ ] Y12 Stats tracking (wins, losses, KOs, playtime — feeds leaderboards)
- [ ] Y13 Anti-cheat basics for leaderboards (server-optional; local sanity checks)
- [ ] Y14 Monetization-safe hooks (cosmetic packs only; tip jar; portal-ready build)

## 6. GAME FEEL (JUICE)
- [ ] F1 Hit-stop scaled by damage (3–10 frames light→heavy; cumulative cap — owner's slow-mo law:
  slow-mo + long hit-stop for KO/counter/heavy ONLY, normal hits snappy ≤90ms)
- [ ] F2 Camera shake (scaled by impact; decays smoothly)
- [ ] F3 Hit spark + impact ring particles on every connect
- [ ] F4 Damage numbers / floating text (with counter/combo styling)
- [ ] F5 Screen flash on counter/KO (color-coded: counter cyan, damage red, KO white)
- [ ] F6 KO slow-mo + camera push-in (the money moment)
- [ ] F7 Enemy hit-react animations (stagger, launch, knockdown — readable)
- [ ] F8 Knockback with screen-edge bounce → juggle (SoR4)
- [ ] F9 Combo counter popup with tier styling
- [ ] F10 Haptics on mobile (vibrate on hit/KO where API allows)

## 7. MOBILE / WEB SPECIFICS
- [ ] M1 Touch controls: virtual joystick (floating-origin, Brawl Stars style) for movement
- [ ] M2 Touch buttons: attack / heavy / special / dodge (≥44pt targets, press states with glow)
- [ ] M3 Gesture alternative: tap-to-attack where it fits (current scheme)
- [ ] M4 Responsive layout (portrait + landscape; HUD reflows)
- [ ] M5 Performance scaling (auto quality drop: shadows → pixel ratio — HAVE the detector)
- [ ] M6 No-audio-before-gesture (mobile autoplay policy — HAVE)
- [ ] M7 Visibility-change pause (HAVE)
- [ ] M8 Offline-capable single file (HAVE — no external requests)
- [ ] M9 Installable (web manifest + icons — PARTIAL: manifest exists in old Godot build)
- [ ] M10 Loading screen with progress (HAVE basic)
- [ ] M11 Prevent pull-to-refresh / tap-highlight / gesture conflicts on canvas
- [ ] M12 Battery-conscious rendering (cap pixel ratio ≤2 — HAVE; pause when hidden — HAVE)

---
*Audit: docs/GAP_AUDIT.md (HAVE/PARTIAL/MISSING per item). Pull-ins: game/assets/staging/<part>/PULL_INS_LOG.md. Build order: docs/WIRING_QUEUE.md.*

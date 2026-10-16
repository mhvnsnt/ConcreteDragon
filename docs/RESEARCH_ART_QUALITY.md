# Concrete Dragon — Art Quality Research
**Stored in repo docs per RESEARCH-TO-REPO LAW (owner 2026-10-16). TRACK D (owner 2026-10-16 ~13:53 EDT): the art is beta/alpha — "we need to make it even better." Research from real sources (not training data) on how the inspiration games achieve premium look. Validation: findings marked WIRED are implemented + screenshot-verified; the rest are ranked upgrades.**

**Gap note vs existing docs:** `ART_DIRECTION.md` = the locked visual law (Nintendo LOOK + fighter FEEL). `RESEARCH_NINTENDO_VISUAL.md` = Nintendo visual language. This doc = the CRAFT: rigging, animation frames, customization systems, and what separates premium from prototype — with concrete upgrades for this build.

---
## 1. STREETS OF RAGE 4 — the hand-drawn premium bar

**~1,000 frames of animation per playable character; 300–400 per enemy type.** Not tweened "Flash-like" animation — bespoke keyframes, fluidity on par with Street Fighter III. The team studied the original games frame-by-frame so every hit, stutter, and shake replicated the Mega Drive feel.
*Source: goombastomp.com "What Happens When Indie Developers Take the Reins" (Sega Retro corroborates frame counts)*

**Readability rules (teardown-confirmed):** heroes are the brightest, highest-contrast elements on screen; enemies use desaturated palettes; interactables (weapons/food) read as bright foreground props; hazards glow. Stage-specific palettes (electric blue streets, red jail, teal underwater, pink club, gold throne room) give instant location identity.
*Source: github.com/jbundrant-link/projectmannequin Docs/STREETS_OF_RAGE_4_TEARDOWN.md*

**VFX stack:** hitsparks, fire trails, electric bursts, radial star-move flashes, screen-local impact flashes, dust puffs, debris from breakables. Feel: strong hitstop, hero-flash on damage, screen shake on heavies.
*Source: same teardown*

## 2. FIGHT'N RAGE — the one-man premium proof

Built essentially solo by Sebastián García (pixel artist background, Batoví Games). 90s arcade aesthetic, not pixel-perfect nostalgia — a coherent style executed with discipline. Unlockable costumes, no paid DLC. Lesson: a tiny team beats a big budget with **style discipline** — one aesthetic, applied everywhere, no half-measures.
*Source: en.wikipedia.org/wiki/Fight'N_Rage (development history)*

## 3. RIGGING QUALITY — what separates clean from janky

**Model first, rig second.** Polygon flow must follow muscles; insufficient spans around highly deforming areas (shoulders, hips, elbows) cause ugly collapsing. The rigger should guide the modeler — or in our case, audit the blocky models for deformation zones.
*Source: animationmentor.com "Rigging Tutorial for studio-quality 3D Characters"*

**Rig for personality, not just function.** Expression sheets and character backgrounds inform how a character moves. A grappler lumbers; a striker snaps. Our 8 fighters share a rig — the differentiation must come from animation personality per fighter, not just speed multipliers.
*Source: same*

**Mixamo is a starting point, not a finish line.** Auto-rigger gets you a skeleton in seconds; the premium pass is hand-tweaking weights on deformation zones and replacing generic clips with character-specific key poses for signature moves.
*Source: animationmentor.com Mixamo workflow; CGStuff ActionForge coverage*

---
## 4. CONCRETE DRAGON — ranked art upgrades

### What we have (2026-10-16 audit of the build)
- Blocky toy-like fighters (Three.js GLB), color-blocked per fighter — matches ART_DIRECTION.
- Mixamo-sourced clips (`Melee_Unarmed_*`) shared across the roster.
- Skins: 2–3 tints per fighter (Street/Noir/alt). Parts: pumpkin head, species heads. Textures: patchwork etc.
- Hit words (CDCI3), hitstop, sparks, screen shake — the SoR4 VFX stack basics exist.

### Ranked upgrades (premium bar = SoR4/Fight'N Rage discipline)
1. **Per-fighter animation personality.** Same rig, different attitude: BRICK's punches need weight (longer windup, heavier follow-through); GHOST's need snap (shorter anticipation, faster recoveries). Implement as per-fighter `animTune` (timescale/windup/recovery multipliers) — cheap, high-impact. ⏳ queued
2. **Signature-move key poses.** Replace the most-seen generic clips (jab, heavy, launcher) with hand-tuned key poses per fighter. Start with KID BLUE's 3 starter-combo moves (they're the tutorial). ⏳ queued
3. **Readability pass.** Audit: are enemies desaturated vs heroes? Do interactables pop? SoR4's rule is binary — the brightest thing on screen must always be the player. ⏳ queued
4. **Stage palette identity.** Each district needs a SoR4-style signature palette (not just "night street" everywhere). Verify districts differ; push the ones that don't. ⏳ queued
5. **Customization depth.** Skins are tints-only today. Fight'N Rage proved unlockable costumes drive engagement. Next: accessory slots (headbands, gloves, chains — the parts system already supports attachments), then color-blocked zones per part (not whole-body tint). ⏳ queued
6. **Deformation audit.** Check shoulders/hips/elbows on the blocky models for collapsing during grapples (the GRAB→LIFT→LOCKUP→THROW sequence stresses these most). Fix weights where it pinches. ⏳ queued
7. **VFX density.** Dust puffs on landings, debris from breakables, distinct hitspark colors per fighter (tied to their color-block identity). ⏳ queued

**Legend:** ✅ wired = implemented + screenshot-verified. 🔄 = in progress. ⏳ = ranked candidate, not started.

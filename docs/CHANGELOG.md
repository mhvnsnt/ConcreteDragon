# Concrete Dragon — Patch Notes

Every gameplay change ships here. Newest first. Each entry: what changed,
why it matters for the player, and the commit behind it.

The pipeline (concrete-dragon-pipeline cron) adds an entry for every tranche
it ships. itch.io devlogs mirror the highlights for buyers.

---

## 2026-10-10

### P16 — SoR4 health rally: desperation is a brave bet now
- Desperation no longer costs 10% HP permanently — the cost is **banked as
  recoverable rally health** (SoR4 green), shown as a green segment stacked
  past the real-HP fill on the player health bar.
- **Earn it back by attacking**: every landed hit converts 1/5 of the
  remaining rally pool into real HP — about five clean hits recovers a full
  bank. Guarded/dodged strikes convert nothing; the desperation blast itself
  never rallies its own cost. Full recovery fires a **RALLY RECOVERED!**
  moment.
- **Lost-first-on-damage**: incoming hits drain banked rally before real HP.
  Zeroing HP still KOs even with rally pending — rally never saves you.
- Move-list copy updated (no-false-advertising: the cost is banked, not
  permanent). Design ref: docs/RESEARCH_FIGHTER_MECHANICS.md §1b.
- Verified headless: bank math, 1/5 conversion rate, full-recovery moment +
  popup, drain-first damage, KO-with-rally, OBVIOUS-DEFECT sweep clean
  (no interpenetration, feet grounded, facing follows input, hits connect,
  no T-poses, HUD correct), zero page/console errors.

### P15 — Hitstop retune: hits finally have weight
- Hitstop retuned toward genre norms (SF 9f lights / 13f heavies): jab
  0.03s → **0.10s**, cross 0.04s → **0.12s**, kick 0.08s → **0.16s**,
  launcher finisher 0.08s → **0.14s**. Counter (0.12s), gavel (0.16s),
  and KO slow-mo treatments untouched.
- **SF2 2-in-1 rule**: HIT presses during hitstop now buffer instead of
  being eaten — the buffered cancel fires when the freeze ends, so jab →
  cross → launcher strings stay consistent even when you press early.
- **Smash-style defender micro-vibration** during hitstop (render-only
  jitter, restored every frame so positioning never drifts).
- Verified headless: jab 0.100s / cross 0.120s / launcher 0.140s measured
  live, buffer fires (taps+2), KO + cash popups intact, zero interpenetration.

---

## 2026-10-09

### Menus: digestibility pass
- Title screen no longer clips the logo; patch notes collapsible in-game
- Clearer dodge indicator, hint repositioned, title metadata in flow
- Character select: tabbed FIGHTER / MOVES / STYLE / STATS, compact mission
  cards, purple/gold graffiti logo, back buttons, quit-to-title from pause
- (`2008495`, `1bafe44`, `3374671`)

### Combat fixes
- Missing-clip freeze fixed; root-motion lunges; dive-kick active window;
  spawn/block clip fixes
- (`0c57934`)

### Customization suite wiring
- Godot GEAR screen + SaveData + fighter overlay wiring
- 7-item suite art: 74 PIL-painted overlays (rook+vex) + catalog.json
- (`9d30fd2`, `a5cb8e9`)

### Art direction locked
- ART_DIRECTION.md: Nintendo LOOK (Sonic/Zelda/Mario/Sunshine/SA2/Luigi's
  Mansion) + fighter FEEL (Final Fight/Streets of Rage/Street Fighter/Tekken)
- Promo = Nintendo key-art playbook, not screenshots; grounded creativity
- (`d66835e`)

### Research → backlog (P6–P22 wired for future tranches)
- Nintendo visual language: 16 techniques → P6–P14 (lock-on camera, AI
  director, dash feel, rule-of-thirds, cutscene cams, spectacle segments,
  squash-stretch, night lighting) + HUMAN-PERSPECTIVE UX LAW
- Fighter mechanics: hitstop retune, health rally, counter-hit properties,
  back attack, juggle scaling → P15–P19
- Enemy AI fix plan (diagnosed from real code) → P20
- Menu/UI redesign (character-select flagship) → P21–P22
- (PR #32, PR #33)

### Earlier 2026-10-09 waves
- Boss music tracks (`48d2599`); energy meter (`4c7f9f0`)
- Haptics on KO/counter/heavy/player-hurt + toggle (`2f29c9e`)
- Body collision: circle colliders + separation, no more interpenetration (`34dfe92`)
- Copy fix: HOLD HVY is focus-charge, not block — no false advertising (`ee1bc13`)
- VFX variety (`f714414`); Y8 daily seeded run (`2f29c9e`); PWA icon fix (#28)

---

## Format for new entries
```
### <Short player-facing title>
- What changed, in player terms (not code terms)
- Why it feels better
- (`<commit>`)
```

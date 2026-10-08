# Wave 8 tranche — S3 DODGE SFX (2026-10-07)

## Audit (TIER 2 combat depth, items 4–9)
Audited against `game-3d/src/main.js` on main @ 329d958. Wave-7 batch 1's commit title
("DUST LAUNCHER universal ↓+HVY") was verified in code, not trusted:

| Item | Verdict |
|---|---|
| 4. C2 heavy attack | DONE — HVY button, per-fighter knockback, HEAT/FOCUS |
| 5. C5 dodge | DONE except **S3 dodge SFX** — i-frames present, no sound on dodge |
| 6. C3 special move | DONE — energy specials, BURST, DESPERATION, dojo moves, spc2 |
| 7. C7 launcher + juggle | DONE except **F8 edge-bounce** — launcher/juggle/anti-infinite wired; launched enemies clamp at bounds, no bounce-back |
| 8. C12 near-miss bonus | DONE — cash + popup + SFX |
| 9. C5→U5 special meter HUD | DONE — `spc` energy bar + ready glow (segmented-bar styling deferred as cosmetic) |

## This tranche: S3 dodge SFX (item 5)
First gap in backlog order. Change (one improvement only):

- `doDodge()` now plays a dedicated dodge whoosh: `sfx('whoosh', 0.4, false, 1.6)` —
  light and fast, distinct from attack whooshes (which run ~0.45 vol / ~1.1 pitch).
- Plus a small grey dust-kick `burst()` at the feet so the i-frame dodge reads visually.
- `T.dodgeSfx` counter + `__cdtest.dodgeTest()` debug hook for deterministic verification.

## License
No new assets. Reuses the already-shipped CC0 1.0 Kenney RPG Audio `whoosh.mp3`
(`game-3d/build/assets/whoosh.mp3`, credited in `game-3d/ASSETS_CREDITS.md`), pitch-shifted
at runtime. Manifest stays clean; no GPL quarantine issues (all code authored in-house).

## Verification
- `qa/playtest-dodgesfx.mjs`: boot → m1 start → dodgeTest (SFX hook fired + i-frames granted) →
  near-miss drill (dodge through a forced enemy attack, `nearmiss` event fired) — **8/8 PASS,
  zero console/page errors**.
- Screenshots: `game-3d/shots-dodgesfx/` (1-boot, 2-m1-start, 3-dodge-iframes, 4-nearmiss) —
  inspected by worker: character limbs intact, dust kick visible mid-dodge, cash $150→$156
  on the near-miss, HUD/controls normal.

## Next tranche candidate
**F8 edge-bounce** (item 7 follow-on): launched/airborne enemies hitting arena bounds should
bounce back into juggle range instead of clamping — Urban Reign style keep-the-combo-going.

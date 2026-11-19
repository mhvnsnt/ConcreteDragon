# Concrete Dragon — itch.io edit checklist

Apply on the itch dashboard: https://mhvnsnt.itch.io/concrete-dragon/edit
(All files live in ~/workspace/_itch-fix-20261118/. Nothing on this list touches the game files, the price, or the live build.)

## Step 0 — Verify the current tags FIRST (do not skip)

The live page's text fetch drops tag links, so the current tags are UNVERIFIED from the outside. On the edit page, open the **Metadata / Tags** section and read what's actually there. The launch draft (`concrete-dragon-itch/page.md`, Oct 6) says they should be:

```
street brawler, beat-em-up, urban, singleplayer, touch, web, android, indie
```

If they match, proceed. If they differ, still replace the whole set with the list in Step 2 — just note what was actually there and tell the parent.

## Step 1 — Upload the GIF + screenshots

On the edit page, go to **Screenshots** (under "Uploads" / project images).

1. Upload `trailer.gif` FIRST (640x296, 11 frames, 6.05s loop, 1.17 MB — animated, it plays in the gallery). It becomes the first thing a visitor sees move.
2. Then upload the 7 PNGs in this exact order (drag to reorder if needed):
   1. `screenshots/01-title.png` — title screen, graffiti logo, TAP TO START (1280x720)
   2. `screenshots/02-fighter-select.png` — Kid Blue + fighter grid + locked bosses (1280x720)
   3. `screenshots/03-combat-opening.png` — mission 1, Kid Blue vs Street Thugs, full HUD (1280x720)
   4. `screenshots/04-combat-combo.png` — punch landing, impact flash (844x390)
   5. `screenshots/05-special-burst.png` — 2 HIT COMBO + energy burst (844x390)
   6. `screenshots/06-boss-kingpin.png` — KINGPIN boss intro banner (844x390)
   7. `screenshots/07-combat-close.png` — close combat (844x390)

**Provenance (so nobody has to guess later):** 01–03 were captured live from the current build (game-3d @ main 5280d74, built and run headless on 2026-11-18 — see CHECKPOINT.md). 04–07 are real QA captures from the same repo (`game-3d/shots-contact`, `shots-vfx`, `shots-uipickup` @ main 5280d74) — used because the live capture of combat VFX stalls the software renderer in this cell (see "What could not be captured" below). The GIF is cut from those same real captures (frames in `gif-frames/g01.png`–`g11.png`). Nothing here is mocked up or AI-generated.

## Step 2 — Set the tags (replace the whole set)

In **Metadata → Tags**, delete every existing tag and enter exactly these 10 (itch max is 10 — use all 10), in this order:

```
beat-em-up, brawler, fighting, street, combos, boss, roguelite, low-poly, arcade, touch
```

Reasoning per tag is in `TAGS.md`. The short version: `brawler` (502 games) is the best discovery bet; `boss` (231) matches the beat-to-unlock hook exactly; `indie`, `singleplayer` (371k), `3d` (186k) and `web`/`android` (not tags — they're file/platform settings) are dropped. **Never add an `ai` tag** — the AI disclosure stays in the description only.

## Step 3 — Confirm the non-tag settings

Same edit page, **Metadata / Classification** and **Uploads**:
- **Genre:** Fighting (closest itch genre; the game is pure combat).
- **Platforms:** Web (HTML) + Android — both should already be checked from the uploaded files. Confirm, don't re-upload.
- **Input:** Touchscreen (and Keyboard — the game supports both).
- **Price:** $4.99 — unchanged. Do not touch.
- **Cover image:** leave as-is (the graffiti logo). 01-title.png is available if you ever want it as the cover instead.

## Step 4 — Apply the two description edits

See `DESCRIPTION-EDITS.md`. Two insertions only, no rewrite:
1. First line of the description: `Play instantly in your browser — no download, no install. Hit RUN GAME and you're on the block.`
2. Near the end (after the features list, before the AI disclosure / Ko-fi lines): `LATEST UPDATE — WAVE 6: Soul Laws (comeback cash, run-it-back rematch, streak shield), endless mutators, deeper proc-bosses, arena finishers, Zones 6-7.`

## Step 5 — Save and verify on the public page

1. Save the edit page.
2. Open https://mhvnsnt.itch.io/concrete-dragon in a fresh view (logged out / private window if possible) and check:
   - [ ] trailer.gif plays/animates as the first screenshot
   - [ ] all 7 screenshots show, in order 01–07
   - [ ] the 10 tags appear on the page
   - [ ] the two new description lines are present, everything else unchanged
   - [ ] RUN GAME still launches the build, price still $4.99

## What could NOT be captured (honest gap)

- A live MEGA SUPER still from the current build. Three capture runs (v4/v5/v6) all stalled at the first combat-VFX step (`spawnFam`/`doPunch`) and one OOM-killed the cell: the headless software renderer (SwiftShader) cannot chew through the combat effects at 1280x720 or 960x540 in this 6 GB VM. The `05-special-burst.png` frame (real energy-burst moment from the repo's VFX QA captures) is the closest real substitute — it shows a special firing, just not the MEGA SUPER itself.
- A live boss-fight still for the same reason; `06-boss-kingpin.png` is the real Kingpin intro from the repo's contact QA captures.
- If a GPU machine (Kaggle/Colab) is ever used for captures, the recipe that works is in `capture6.py` + CHECKPOINT.md: `capHold(true)` + `stepRender(1/30)` + CDP `Page.captureScreenshot` (0.6s/shot — Playwright's own screenshot takes 24–92s under SwiftShader). Mission ids are strings (`startMission('m1')`), not numbers.

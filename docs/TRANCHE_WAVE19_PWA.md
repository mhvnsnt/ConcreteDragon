# TRANCHE WAVE 19 — M9 PWA install (driver 2026-10-09)

Wiring-queue item: **M9 PWA install** (was DEFERRED "after web build stabilizes" — web build is CI-green, unblocked).

## What shipped
The GitHub Pages web build is now an installable, offline-capable PWA:

- `game-3d/pwa/manifest.webmanifest` — name/short_name "Concrete Dragon",
  `display: standalone`, `orientation: landscape`, `start_url`/`scope: ./`,
  theme/background `#150f2a` (game palette), icons: 192 + 512 (`any`),
  512 `maskable` (80% safe-zone on theme bg).
- `game-3d/pwa/sw.js` — service worker. Install precaches only the small files
  (manifest + icons); the ~58MB single-file shell is cached at RUNTIME on the
  first successful online load (cache-first afterwards) — precaching the shell
  at install proved unreliable (install never completed), runtime caching is
  the robust pattern and matches real use (online first visit, offline later).
  Same-origin GET only; cache writes are best-effort (never break the
  response); old caches purged on activate. Cache version stamped per build
  (`<version.txt>-<git sha>`, e.g. `0.1.1-111baf2`).
- `game-3d/pwa/icons/` — 192/512/maskable-512/180(apple-touch), center-cropped
  from the itch cover art (owner's own art, already staged).
- `game-3d/src/template.html` — `<link rel="manifest">`, theme-color,
  mobile-web-app-capable + apple-mobile-web-app-capable, apple-touch-icon,
  guarded SW registration (`if ('serviceWorker' in navigator)`).
- `game-3d/build.mjs` — stamps SW version, copies `pwa/` → `dist/pwa/`.
- `.github/workflows/build.yml` — `concrete-dragon-3d` artifact now includes
  `dist/pwa`; deploy-web publishes manifest/sw/icons at the Pages **site root**
  (required for SW scope to cover the game).

Installability criteria met: HTTPS (Pages) + valid manifest (name, short_name,
start_url in scope, display, 192/512 icons) + registered SW with fetch handler.

## Verification
`game-3d/qa/playtest-pwa.mjs` — served over http://127.0.0.1 (secure context),
mirroring real use (online first visit, offline later): boot online → title
screen; manifest fetches/parses with all required fields; all 4 icons 200
image/png; SW registers → installs → activates with fetch handler; online
reload runtime-caches the shell; **offline reload boots the title screen from
SW cache**; zero page/console errors.
Screenshots: `game-3d/shots-pwa/pwa-title-online.png`,
`game-3d/shots-pwa/pwa-title-offline.png` (eyes-on verified).

## Notes
- No fake anything: the offline boot is the real game, not a stub.
- Icons derive from the itch cover art already staged for the listing.
- Work done in a dedicated worktree (`ConcreteDragon-wt-wave19`) after the
  shared tree was found mid-use by the cd-presentation worker (reflog:
  checkout presentation + reset to ee1bc13). No other lane's files touched.

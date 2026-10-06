# Concrete Dragon

![Build](https://github.com/mhvnsnt/ConcreteDragon/actions/workflows/build.yml/badge.svg)

Addictive mobile street brawler by Orion Enterprises LLC.

Tap. Beat them down. Next enemy walks in. Every KO different.

- **Play the latest build:** https://mhvnsnt.github.io/ConcreteDragon/ (auto-updates every push)
- **Design:** `docs/GAME_DESIGN.md`
- **Teardowns:** `docs/TEARDOWN.md` (what the highest-grossing mobile games do, and what we steal)
- **Publishing:** `docs/PUBLISHING.md` (no-store first: itch.io + Ko-fi + sideload APK; Play unlocks at $25 earnings)
- **Monetization plan:** `docs/monetization/monetization-plan.md` (ranked $0-upfront money paths)
- **Playable demo:** `docs/demo.html` (open in a browser)

Built with Godot 4. Live service: seasons, battle pass, DLC fighters.

## CI/CD

Every push to `main` builds the web export (auto-deployed to GitHub Pages), an Android APK (sideload), and an Android AAB (Play upload). See `.github/workflows/build.yml`. The Godot project lives in `game/`.

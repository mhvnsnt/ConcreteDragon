# Staged integrations — Concrete Dragon

These are **dormant, drop-in ready** integrations. They are wired in the repo but
**not active** — nothing calls them, no network traffic leaves the game. Each one
needs a free-tier **account or key that only the owner creates** (standing rule:
workers NEVER create accounts in his name).

## What's staged

| File | Service | Needs | Money link |
|---|---|---|---|
| `game/scripts/staged/posthog.gd` | PostHog analytics | Free account → project API key (1M events/mo free) | Retention analytics — see which waves/fights keep players, iterate toward revenue |
| `game/scripts/staged/sentry.gd` | Sentry crash reporting | Free account → DSN (5k errors/mo free) | Crash visibility — a crashing game earns $0 |
| `docs/staged/R2_HOSTING.md` | Cloudflare R2 + Pages | Free Cloudflare account | $0-egress APK hosting — distribution cost → $0 |
| `docs/staged/ITCH_CHECKLIST.md` | itch.io publishing | Free itch.io account (owner publishes) | The fastest real-money rail — pay-what-you-want + donations |

## Activating (owner's call, ~10 min each)

1. Create the free account at the service.
2. Paste the key/DSN into the snippet's `setup()` / `init()` call.
3. Move the snippet from `game/scripts/staged/` to `game/scripts/`,
   register as an autoload in `project.godot`, and emit the documented events
   (`game_opened`, `fight_started`, `wave_cleared`, `ko`, `run_ended`, `upgrade_bought`).
4. PostHog + Sentry traffic is GDPR-adjacent — add the one-line privacy note to
   the itch page before enabling analytics in a public build.

## Why staged, not live
The owner's standing permission covers keyless wiring. Account creation is his
lane. Until he drops in keys, these files cost nothing and risk nothing.

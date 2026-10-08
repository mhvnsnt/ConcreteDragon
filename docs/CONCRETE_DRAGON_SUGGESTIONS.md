# CONCRETE DRAGON — Improvement Suggestions

**Owner approval required per item.** Nothing here gets built without his okay,
except standing-authorized staging pull-ins (see `game/assets/staging/3d/PULL_INS.md`).

**Already in the foundation build** (do not re-suggest): character select, cash +
POWER/TOUGH/HUSTLE upgrades, localStorage save, endless scaling waves, combo
scoring, cosmetic skin tints, KO slow-mo, counter on telegraph.

**Binding rules for everything below:** style-not-power only (no pay-to-win, ever);
names follow the 3D demo (Street Thug / Big Rico style — never 2D M1 names);
no invented canon/lore; slow-mo + long hit-stop reserved for KOs / counters /
heavy hits only — normal hits stay snappy (~60–90ms hit-stop max).

**Effort key (one builder):** S < 1 day · M 1–3 days · L 3–7 days · XL 1–2 weeks.

---

## 0. NAMING DECISION NEEDED (flag, not a suggestion)

The foundation build currently uses player names **KID BLUE / GHOST / BRICK** and
wave enemies **STREET THUG / BIG RICO / JABBER / HEAVY D / KINGPIN** (boss).
Owner has only approved the 3D demo's naming style and rejected the 2D M1 names.
**Kid Blue, Ghost, Brick, Jabber, Heavy D, and KINGPIN were chosen by the
builder — owner needs to approve or rename them.** New enemies should keep the
short punchy street style (one or two words: "Low Post", "Chainlink"... — owner
picks finals).

---

## COMBAT DEPTH (ported from the 2D M1 spec + Urban Reign, the #1 reference)

1. **Heavy attack** — two-finger tap / swipe. Slower, high damage, armor-breaks
   through enemy attacks. Gets the biggest hit-stop of any normal move (within the
   feel law).
   Why: the M1 spec had tap/heavy/launcher/special; the 3D build only has tap.
   Effort: S. Source: M1 `fight.gd` (in-workspace).

2. **Block (hold) with chip damage** — M1 had block poses + `block_clack` SFX.
   Holding reduces damage to chip; blocking at the last moment = perfect block →
   counter window.
   Why: gives defense depth without adding buttons; standard in every brawler.
   Effort: S. Source: M1 `fighter.gd` `_pose_block` + `sfx.gd`.

3. **Dodge — owner's choice vs. block (Urban Reign's signature)** — Urban Reign
   has NO block; a timed dodge sidesteps and a dodge-streak auto-grabs the
   attacker for a free punish. Suggest offering dodge INSTEAD of block as the
   defensive option — it matches the key reference and feels more "street".
   Why: differentiator vs. every tap-fighter clone; the reference game proves it.
   Effort: M. Source: Urban Reign design (researched 2026-10-06).

4. **Launcher + juggles** — every 3rd chained hit launches the enemy; taps while
   airborne juggle with damage scaling per hit. (Urban Reign's core combo shape.)
   Why: turns tap-spam into a real combo game; Skullgirls lesson — simple inputs,
   real depth. Effort: M. Source: M1 `_do_launcher` + Urban Reign research.

5. **Special meter** — fills by dealing AND taking damage (Urban Reign / Brawl
   Stars "Super"); two-finger tap unleashes a signature move per fighter.
   Cannot be dodged except by another special (Urban Reign rule).
   Why: comeback mechanic + hype moments; the meter IS the session arc.
   Effort: M. Source: design (no assets needed).

6. **Weapon pickups** — bats, pipes, bottles spawn in the street; N hits of
   durability, throwable to stun (Yakuza / Urban Reign).
   Why: street-brawler identity; breaks up fist-only pacing.
   Effort: L. Source: KayKit City Builder props (CC0, already in pipeline).

7. **Ground-and-pound** — tap on a downed enemy for pounce punches (Urban Reign).
   Why: rewards knockdowns; cheap to add on existing KO anim states.
   Effort: M. Source: Urban Reign research.

## PROGRESSION (all already-localStorage; no backend needed)

8. **Fighter XP levels 1–50** — XP per fight, small stat bumps + unlock
   banners. Brawl Stars' deterministic progression (no loot boxes — post-2022
   rule the owner already follows).
   Why: long-term attachment per fighter; "my guy gets stronger because I play".
   Effort: M. Source: code only.

9. **Cosmetic gear slots** — gloves / jacket / kicks / accessory as tint
   variants on the existing skin system. Zero power, pure looks.
   Why: Shadow Fight lesson — "a fighter that feels like YOURS"; style-not-power
   safe. Effort: M. Source: existing tint pipeline.

10. **Daily Scrap** — rotating daily challenge with mutators (double damage,
    weapon-only, boss rush). One leaderboard-worthy run per day.
    Why: from GAME_DESIGN.md; daily hooks are the #1 retention driver in mobile.
    Effort: M. Source: design doc (owner concept, not yet approved to build).

## CONTENT (districts & cast)

11. **District system** — the street rebuilds per district: palette/lighting
    variants (owner's art rule: each district gets its own identity), different
    KayKit building sets, staged asphalt textures for ground variety.
    Suggested first three: Neon Row (current look), The Yards (industrial,
    rusted metal), Little Havana Nights (warm lamps, murals).
    Why: visual replayability without new code per district; matches his
    district-palette directive. Effort: L. Source: KayKit CC0 + staged textures
    (`game/assets/staging/3d/`).

12. **Street crowd** — procedural onlookers behind the curb (KayKit mannequins,
    idle/cheer anims) that react to KOs. Urban Reign's arenas feel alive; an
    empty street doesn't.
    Why: atmosphere is half the street fantasy; cheap with existing assets.
    Effort: M. Source: KayKit Character pack (CC0).

13. **Graffiti decals per district** — wall tags identifying each district.
    Why: street identity at near-zero cost. Effort: S.
    Source: CC0 graffiti textures — catalog on approval (none staged yet).

14. **Roster expansion (names: owner picks)** — 2–3 new fighters in the
    Kid Blue/Ghost/Brick stat-triangle style (balanced / fast / tank), each
    with a distinct silhouette tint and one signature move.
    Why: Brawl Stars lesson — roster breadth is the content engine.
    Effort: L per fighter (rig exists; needs anim tuning).
    Source: KayKit mannequin variants (CC0).

## REPLAYABILITY (no backend until item 17)

15. **Daily seeded runs** — same wave sequence for everyone, one scored attempt
    per day, date-seeded PRNG. Shareable "I cleared wave 14" without servers.
    Why: fair competition, zero backend cost. Effort: M. Source: code only.

16. **Local leaderboards + run codes** — best wave / best combo / fastest KO per
    device, plus a copyable run code players can post (community leaderboards
    on Discord/itch comments).
    Why: competitive loop with no server bill. Effort: S.
    Source: localStorage (already in build).

17. **Server leaderboards (later)** — LootLocker or Firebase Spark free tier for
    global daily boards. Flagged honestly: adds backend, privacy policy, and
    moderation needs. Recommend AFTER the game has players.
    Effort: L. Source: free-tier APIs (research only — no signups done).

18. **Arcade gauntlet** — 10-fight run, one shared life bar, leaderboard.
    Why: from GAME_DESIGN.md; the "one more run" mode. Effort: M.

## FEEL & POLISH (all inside the owner's feel law)

19. **Per-move hit-stop table** — replace ad-hoc values with a table
    (Guilty Gear standard: ~7 frames light / ~10 frames heavy; counters get
    the counter tier). Cumulative cap per second so combos never feel laggy.
    Why: research-validated; makes every hit weighty WITHOUT every-hit slow-mo.
    Effort: S. Source: fighting-game feel research (2026-10-06).

20. **Layered impact SFX** — thud + crack + whoosh per hit, ±5% pitch
    randomization, bass for weight. "Sound is 50% of feel."
    Why: current build reuses 3 hit sounds; layering is the pro standard.
    Effort: S. Source: Kenney packs (in build) + M1 `sfx.gd` synth engine
    (port WebAudio synth → zero-asset audio, matches hybrid direction).

21. **KO camera push-in** — slight dolly + the existing slow-mo on KOs only.
    Why: reserves the biggest juice for the rarest moment (rarity-ladder rule).
    Effort: S. Source: code only.

## MONETIZATION-SAFE (no-store paths; style-not-power)

22. **PWYW supporter skin packs on itch.io** — "Season 1: Concrete Kings" —
    3–5 full outfit tints, pay-what-you-want, $0 minimum. itch.io lets the dev
    set the revenue split (default 10%, settable to 0%).
    Why: money for style, never power; itch.io is the no-fee channel.
    Effort: S per pack. Source: in-workspace.

23. **Season pass, cosmetic-only** — generous free track + premium style track;
    no FOMO lockouts (owner's concept, researched). Brawl Stars proves the
    model; determinism (show every reward) is the post-2022 standard.
    Why: recurring revenue without pay-to-win. Effort: L (needs UI + season
    infra). Source: design.

24. **Tip jar on results screen** — small "Support the dev" link (itch.io /
    Ko-fi) after a good run, never blocking.
    Why: tips are a real indie revenue line; zero gameplay impact.
    Effort: S. Source: web links only.

25. **Portal publishing (CrazyGames / Poki)** — revenue-share web portals are
    the fastest no-store money path (a two-person indie studio made $27k/yr
    from web/HTML5 vs $13.6k mobile in 2025). The single-file HTML build is
    already portal-shaped.
    Why: distribution = revenue; no $25 store fee needed. Effort: M
    (submission + portal SDK nods). Source: portals' publisher docs.

---

## Research basis (2026-10-06)

- **Brawl Stars (2026):** still the dominant mobile brawler — 2–4 min sessions,
  Super charged by dealing damage, 95+ brawlers, constant updates, deterministic
  progression, seasonal events. Sources: lasotifa.com, playnforge.com reviews.
- **Urban Reign (PS2, Namco):** strike/grapple/dash/dodge (NO block), 3-hit →
  launcher → juggle, Special Arts meter, weapon pickups with durability, body-zone
  damage, dodge-reversals, ground-and-pound, AI partner double-teams.
  Sources: GameSpot/Eurogamer reviews, Tekken Wiki.
- **Combat-feel standards:** hit-stop 3–10 frames scaling with damage (Sakurai);
  Guilty Gear 7f light / 10f heavy; cumulative hit-stop cap (stacked = laggy);
  rarity ladder — reserve max juice for once-per-session moments (boss KOs);
  One Finger Death Punch uses slow-mo ONLY on fatalities; enemy wind-up =
  fairness, player startup ≤ 4–8 frames; layered SFX with pitch randomization.
  Sources: gamestack feel guides, slashskill.com, arxiv 2208.06155.
- **No-store money:** itch.io PWYW + dev-chosen split (10% default, 0–100%),
  Creator Day 100%-to-dev events; indie two-person studio: $27k/yr web/HTML5 vs
  $13.6k mobile (2025); tips/Patreon/merch/ads as non-IAP lines.
  Sources: en.techinbengali.com (itch.io), youtube indie revenue breakdown.
- **Free sources logged:** `game/assets/staging/3d/PULL_INS.md`.

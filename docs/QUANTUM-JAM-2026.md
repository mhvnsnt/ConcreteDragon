# QUANTUM GAME JAM 2026 — District Build Plan

**Status**: PREP (2026-10-20). Owner approved entry 2026-10-20 ("Yes, enter it").
Jam: **Global Quantum Game Jam, Oct 25–27 2026**, itch.io
(https://itch.io/jam/quantum-game-jam-2026). Submission happens during the
jam window; this doc + the scaffold in `jam/quantum-district/` are the prep.
**Scope**: This jam district build is the one approved exception to the
owner's Concrete Dragon development pause. Nothing else in the game changes.
**Earnings**: $0.00 (unchanged; this is a jam entry, not a sale).

---

## 1. What the entry is

**Concrete Dragon: Iron Alley** — one full playable district of the
StreetBrawl brawler whose entire layout was generated from **real quantum
random numbers**: 16 uint16 values measured from vacuum fluctuations by
the ANU Quantum Random Number Generator, captured during prep and
committed to this repo (`jam/quantum-district/seeds/jam-seed-2026.json`).

The pitch in one line: *the entropy is quantum, the build is reproducible.*
Anyone can regenerate the exact shipped district byte-for-byte from the
committed seed record — and the seed itself is a genuine quantum
measurement, not a programmer picking a number.

Two mechanics make the quantum source gameplay, not decoration:

- **Superposition block.** One block exists in two layout variants (A/B).
  Which one the player gets was decided by the parity of a raw quantum
  value in the seed record (the jam district rolled **B**, block 25).
- **Entangled pair.** Two blocks share fate: their shared state
  (open/locked) comes from another raw quantum value, and clearing one
  flips the other's encounter table. (Jam district: blocks 33–34, open.)

## 2. Where the quantum tooling actually lives (verified 2026-10-20)

| Claim | Reality |
|---|---|
| `tools/generative/quantum/` with ANU QRNG + Qiskit work | **Does not exist** in any repo (cape-jones, western-heart, agent-ops, God-Mode-OS-D3MN-V2, M.-Engine-, trippedd-studio, AshLane, AshLanev2 all checked on GitHub — 404). The 2026-10-06 research verdict's "pull-ins underway" never landed as files. |
| Working ANU QRNG client | **Exists**: `src/lib/quantum/QRNGBridge.ts` in **mhvnsnt/Moneymachine-private** (local: `~/workspace/mm-rehab/src/lib/quantum/`). GETs `qrng.anu.edu.au/API/jsonI.php`, WebCrypto fallback. The jam seed module ports this interface to Node. |
| Qiskit free-hardware seeds | **Research only.** No Qiskit code exists anywhere in the operation. The 2026-10-06 verdict: quantum is production-useful today for randomness/seed generation (ANU QRNG); hardware-circuit seeds were an experiment track, never built. This entry uses the proven path (ANU QRNG), honestly labeled. |
| Seeded district generation pattern | `tools/generative/rng.js` + `city-seed.js` in **mhvnsnt/AshLanev2** — seeded RNG + seeded city layout with districts, graffiti, breakables, markers. The jam generator follows this pattern with the seed sourced from ANU QRNG instead of a hand-picked number. |
| `~/workspace/os-harvest/quantum/` | Empty directory (2026-10-08). Nothing was ever harvested into it. |

Live verification, 2026-10-20: ANU QRNG endpoint answered from this
machine and produced the committed jam seed
(`2026-10-20T18:29:43.847Z`, values in the seed record).

## 3. How the quantum seed drives district generation

```
ANU QRNG (live quantum measurement, 16 × uint16)
  → committed seed record (seeds/jam-seed-2026.json)
  → master seed (FNV-1a fold + avalanche over all 16 values)
  → mulberry32 PRNG stream
  → EVERY layout decision: block types, floors, alleys, graffiti spots,
    breakable props, encounter waves, district name
  + raw quantum values decide superposition variant & entangled state
  → district JSON (format concrete-dragon/quantum-district@1)
  → consumed by the game-3d build during the jam
```

Determinism is the shipping guarantee: same record in → identical
district JSON (sha256-verified by `jam/quantum-district/proof.mjs`).
The official district: **"Iron Alley"**, master seed `540965111`,
36 blocks, 8 encounter waves, 59 graffiti spots, 100 breakables,
14 alleys, sha256 `5cdc77bccd266f779e7a430c71d483d6d11f94f96ce664ffa60ebcc43b2401ca`.

## 4. Prep now (Oct 20–24) vs build during the jam (Oct 25–27)

### Prepped now (this PR)
- [x] Quantum tooling located and honestly documented (§2)
- [x] Seed module ported from QRNGBridge interface (`quantum-seed.mjs`)
- [x] Official jam seed captured live from ANU QRNG and committed
- [x] District generator with superposition + entanglement mechanics
- [x] Runnable proof: determinism, sensitivity, live-source check (PASS)
- [x] Official district generated (`out/district.json`)

### Remaining prep before Oct 25
- [ ] Decide district rendering target: game-3d Three.js scene reads
      `out/district.json` (block grid → street/building boxes, park/plaza
      flats, graffiti spot decals) — loader stub fits the jam's first hours,
      but a prep spike derisks it
- [ ] Confirm the itch.io jam join landed (separate browser lane owns it)
- [ ] Freeze an art/audio asset list against existing repo assets (§5)

### Build during the jam (Oct 25–27)
- [ ] District loader in game-3d: district JSON → playable level
- [ ] Wire encounters: 8 seeded waves + boss corner (block 35)
- [ ] Superposition block variant B layout + entangled pair flip logic
- [ ] Title/about text crediting the ANU QRNG seed (with seed values shown —
      the provenance IS the jam story)
- [ ] Build, playtest, submit to the jam on itch.io before the deadline

## 5. Asset list

**Reused (already in this repo):** game-3d Three.js build + combat
(`game-3d/`), art direction (`ART_DIRECTION.md`), seeded texture/graffiti
approach from AshLanev2's `tools/generative/` (pattern reference only —
no files copied; this entry's generator is original to this repo).

**New in this PR:** `jam/quantum-district/` (seed module, generator, CLI,
proof, seed record, generated district, README) and this plan doc.

**Needed during the jam:** district dressing pass (building facades from
block floors/type), encounter tuning, jam page art (screenshot of the
district + the seed record). No new external assets required.

## 6. Risks / honest limits

- ANU QRNG is a free third-party service; if it is down during the jam,
  the committed seed record makes the build fully reproducible offline.
  The crypto fallback exists and is labeled NOT quantum wherever used.
- Qiskit hardware seeds are NOT part of this entry (never built; see §2).
  If a future entry wants them, that is a new build, not a claim here.
- The generator produces layout data, not a finished level: the jam
  window's main work is the loader + wiring (§4), which is deliberately
  the jam-sized chunk.

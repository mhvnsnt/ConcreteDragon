# Quantum District — Concrete Dragon × Quantum Game Jam 2026

The jam entry's generation core: a city district whose entire layout is
driven by **real quantum random numbers** (ANU QRNG), generated
deterministically so the shipped build is reproducible.

Full plan: [`docs/QUANTUM-JAM-2026.md`](../../docs/QUANTUM-JAM-2026.md)

## Files

| File | What it is |
|---|---|
| `quantum-seed.mjs` | Seed source. Ports the interface of the operation's working QRNG client (`src/lib/quantum/QRNGBridge.ts`, mhvnsnt/Moneymachine-private): live ANU QRNG fetch, honest labeled crypto fallback, committed-record loading, master-seed derivation. |
| `district-generator.mjs` | Seed record → district JSON. mulberry32 PRNG stream makes every layout decision. Includes the two quantum mechanics: superposition block (variant decided by parity of a raw quantum value) and entangled block pair (shared state from a raw quantum value). |
| `generate.mjs` | CLI. Default: build from the committed jam seed (offline, reproducible). `--live`: fetch fresh ANU QRNG entropy and build a new district. |
| `proof.mjs` | Runnable proof: determinism (same seed → identical sha256), sensitivity (one value changed → different district), live-endpoint check. Exits non-zero on failure. |
| `seeds/jam-seed-2026.json` | The official jam seed record — 16 uint16 values measured by ANU QRNG on 2026-10-20. Committed so the jam build is reproducible forever. |
| `out/district.json` | The generated official district ("Iron Alley", sha256 `5cdc77bc…ca`). Regenerate any time with `node generate.mjs`. |

## Run it

```bash
cd jam/quantum-district
node proof.mjs       # verify determinism + sensitivity + live source
node generate.mjs    # rebuild out/district.json from the committed seed
node generate.mjs --live   # draw a fresh district from live quantum entropy
```

No dependencies. Node 18+ (uses global fetch). No build step.

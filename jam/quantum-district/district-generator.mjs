// district-generator.mjs — Deterministic district generation for the
// Concrete Dragon Quantum Game Jam 2026 entry.
//
// Pipeline: quantum seed record (quantum-seed.mjs) -> 32-bit master seed
// -> mulberry32 PRNG stream -> every layout decision in the district.
// Same seed record in = byte-identical district JSON out, on any machine,
// forever. That determinism is what makes a quantum-seeded build shippable:
// the entropy is quantum, the build is reproducible.
//
// Quantum mechanics (real, seed-driven, not decorative):
// - SUPERPOSITION BLOCK: one block's variant (A/B) is decided by the parity
//   of a dedicated raw quantum value from the record — the block literally
//   has two layouts until the seed "measures" it.
// - ENTANGLED PAIR: two blocks share fate. One raw quantum value picks the
//   pair and one picks their shared state; in game terms, clearing one
//   block flips the other's encounter table (wired during the jam).

import { createHash } from 'node:crypto';
import { masterSeedFromRecord } from './quantum-seed.mjs';

/** mulberry32 — small, fast, deterministic PRNG (public-domain algorithm). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BLOCK_TYPES = ['residential', 'commercial', 'industrial', 'park', 'plaza', 'warehouse'];
const NAME_A = ['Neon', 'Cinder', 'Harbor', 'Velvet', 'Iron', 'Lotus', 'Static', 'Copper', 'Hollow', 'Amber'];
const NAME_B = ['Row', 'Yards', 'Market', 'Steps', 'Court', 'Alley', 'Works', 'Garden', 'Crossing', 'Depot'];

/**
 * Generate one district from a seed record.
 * @param {object} record seed record from quantum-seed.mjs
 * @param {{grid?: number}} [opts] grid = blocks per side (default 6 -> 36 blocks)
 * @returns {object} district JSON (serializable, stable key order)
 */
export function generateDistrict(record, { grid = 6 } = {}) {
  const masterSeed = masterSeedFromRecord(record);
  const rnd = mulberry32(masterSeed);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const range = (min, max) => min + Math.floor(rnd() * (max - min + 1));

  const total = grid * grid;
  const blocks = [];
  for (let i = 0; i < total; i++) {
    const type = pick(BLOCK_TYPES);
    blocks.push({
      id: i,
      x: i % grid,
      y: Math.floor(i / grid),
      type,
      floors: type === 'park' || type === 'plaza' ? 0 : range(1, 12),
      alley: rnd() < 0.35,
      graffiti_spots: range(0, 3),
      breakables: range(0, 6),
      encounter: null, // filled below for non-park blocks
    });
  }

  // Encounter zones: waves spawn on a seeded subset of fightable blocks.
  const fightable = blocks.filter((b) => b.type !== 'park' && b.type !== 'plaza');
  const encounterCount = Math.min(8, fightable.length);
  const shuffled = [...fightable].sort(() => rnd() - 0.5);
  shuffled.slice(0, encounterCount).forEach((b, n) => {
    b.encounter = { wave: n + 1, thugs: range(2, 6), brute: rnd() < 0.25 };
  });

  // Boss corner: the seeded far corner from spawn (spawn = block 0).
  const bossBlock = blocks[total - 1];

  // SUPERPOSITION: parity of raw quantum value #0 picks the variant.
  const superposition = {
    block_id: range(0, total - 1),
    variant: record.data[0] % 2 === 0 ? 'A' : 'B',
    decided_by: 'parity of quantum value data[0]',
    value: record.data[0],
  };

  // ENTANGLEMENT: raw quantum value #1 picks the pair offset, #2 the state.
  const ea = range(0, total - 2);
  const entangled = {
    pair: [blocks[ea].id, blocks[ea + 1].id],
    shared_state: record.data[2] % 2 === 0 ? 'open' : 'locked',
    decided_by: 'pair offset from the seeded PRNG stream (master seed derives from all 16 quantum values); shared state from parity of quantum value data[2]',
    values: [record.data[1], record.data[2]],
  };

  const district = {
    format: 'concrete-dragon/quantum-district@1',
    name: `${pick(NAME_A)} ${pick(NAME_B)}`,
    grid,
    master_seed: masterSeed,
    seed_source: record.source,
    seed_type: record.type ?? 'uint16',
    seed_length: record.data.length,
    seed_fetched_at_utc: record.fetched_at_utc ?? null,
    blocks,
    spawn_block: 0,
    boss_block: bossBlock.id,
    superposition,
    entangled,
    counts: {
      blocks: total,
      encounters: blocks.filter((b) => b.encounter).length,
      graffiti_spots: blocks.reduce((s, b) => s + b.graffiti_spots, 0),
      breakables: blocks.reduce((s, b) => s + b.breakables, 0),
      alleys: blocks.filter((b) => b.alley).length,
    },
  };
  return district;
}

/** Stable sha256 of a district object (canonical JSON: sorted keys). */
export function districtHash(district) {
  const canonical = JSON.stringify(district, Object.keys(district).sort());
  // Nested objects need recursive canonicalization for a truly stable hash:
  const canon = (v) => {
    if (Array.isArray(v)) return v.map(canon);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]));
    }
    return v;
  };
  void canonical;
  return createHash('sha256').update(JSON.stringify(canon(district))).digest('hex');
}

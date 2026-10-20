// proof.mjs — Runnable proof for the quantum district scaffold.
//
// Proves, with real output (no placeholder claims):
//  1. DETERMINISM: the committed jam seed record generates the same
//     district (identical sha256) across repeated runs.
//  2. SEED SENSITIVITY: a one-value change in the seed produces a
//     different district (different sha256).
//  3. LIVE QUANTUM SOURCE: the ANU QRNG endpoint answers with real
//     quantum data right now (reported honestly if unreachable —
//     the offline path in checks 1-2 does not depend on it).
//
// Exit code 0 only if checks 1 and 2 pass. Check 3 is informational:
// the jam build is reproducible offline from the committed record.

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchQuantumSeed, loadSeedRecord } from './quantum-seed.mjs';
import { generateDistrict, districtHash } from './district-generator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
let failures = 0;

// --- Check 1 + 2: determinism & sensitivity from the committed record ---
const record = await loadSeedRecord(join(here, 'seeds', 'jam-seed-2026.json'));
const h1 = districtHash(generateDistrict(record));
const h2 = districtHash(generateDistrict(record));
const d1 = generateDistrict(record);
console.log(`[proof] committed seed source=${record.source} fetched_at=${record.fetched_at_utc}`);
console.log(`[proof] run1 sha256=${h1}`);
console.log(`[proof] run2 sha256=${h2}`);
if (h1 === h2) {
  console.log('[proof] PASS determinism — same quantum seed, byte-identical district');
} else {
  console.log('[proof] FAIL determinism — hashes differ');
  failures++;
}
console.log(`[proof] district="${d1.name}" master_seed=${d1.master_seed} encounters=${d1.counts.encounters} superposition=${d1.superposition.variant} entangled=[${d1.entangled.pair.join(',')}]/${d1.entangled.shared_state}`);

const mutated = { ...record, data: [...record.data] };
mutated.data[0] = (mutated.data[0] + 1) % 65536;
const h3 = districtHash(generateDistrict(mutated));
console.log(`[proof] mutated-seed sha256=${h3}`);
if (h3 !== h1) {
  console.log('[proof] PASS sensitivity — one quantum value changed, district changed');
} else {
  console.log('[proof] FAIL sensitivity — district unchanged after seed mutation');
  failures++;
}

// --- Check 3: live ANU QRNG reachability (informational) ---
try {
  const live = await fetchQuantumSeed(4);
  console.log(`[proof] LIVE ANU QRNG reachable — fresh quantum values: ${live.data.join(', ')}`);
} catch (e) {
  console.log(`[proof] NOTE live ANU QRNG unreachable right now (${e.message}). Committed-record path above is unaffected.`);
}

console.log(failures === 0 ? '[proof] RESULT: PASS' : `[proof] RESULT: FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);

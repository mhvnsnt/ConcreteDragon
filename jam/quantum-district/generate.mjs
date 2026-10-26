// generate.mjs — CLI for the quantum district build.
//
//   node generate.mjs                build from the committed jam seed record
//   node generate.mjs --live         fetch a FRESH ANU QRNG seed and build
//   node generate.mjs --live --save-seed seeds/<name>.json
//   node generate.mjs --seed seeds/<file>.json --out out/<file>.json
//
// Default path is fully offline and reproducible: the district the jam
// ships is generated from the committed quantum seed record, so anyone
// can rebuild it byte-identically. --live exists to prove the quantum
// source is real and to draw a new district when we want one.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchQuantumSeed, loadSeedRecord } from './quantum-seed.mjs';
import { generateDistrict, districtHash } from './district-generator.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};

const outPath = opt('--out', join(here, 'out', 'district.json'));

let record;
if (flag('--live')) {
  record = await fetchQuantumSeed(16);
  console.log(`[seed] LIVE ANU QRNG fetch OK — source=${record.source} values=${record.data.join(',')}`);
  if (flag('--save-seed')) {
    const savePath = opt('--save-seed', join(here, 'seeds', 'live-seed.json'));
    await mkdir(dirname(savePath), { recursive: true });
    await writeFile(savePath, JSON.stringify(record, null, 2) + '\n');
    console.log(`[seed] saved seed record -> ${savePath}`);
  }
} else {
  const seedPath = opt('--seed', join(here, 'seeds', 'jam-seed-2026.json'));
  record = await loadSeedRecord(seedPath);
  console.log(`[seed] loaded committed record — source=${record.source} fetched_at=${record.fetched_at_utc}`);
}

const district = generateDistrict(record);
const hash = districtHash(district);
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(district, null, 2) + '\n');

console.log(`[district] name="${district.name}" master_seed=${district.master_seed}`);
console.log(`[district] blocks=${district.counts.blocks} encounters=${district.counts.encounters} graffiti=${district.counts.graffiti_spots} breakables=${district.counts.breakables} alleys=${district.counts.alleys}`);
console.log(`[district] superposition block ${district.superposition.block_id} -> variant ${district.superposition.variant} (quantum value ${district.superposition.value})`);
console.log(`[district] entangled pair [${district.entangled.pair.join(', ')}] shared_state=${district.entangled.shared_state}`);
console.log(`[district] sha256=${hash}`);
console.log(`[district] written -> ${outPath}`);

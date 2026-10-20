// quantum-seed.mjs — Quantum seed source for the Concrete Dragon
// Quantum Game Jam 2026 district build.
//
// Interface ported from the operation's one working QRNG client:
//   mhvnsnt/Moneymachine-private  src/lib/quantum/QRNGBridge.ts
//     GET https://qrng.anu.edu.au/API/jsonI.php?length=N&type=uint8|uint16
//     -> { success: true, type, length, data: [...] }
//     fallback: cryptographic randomness (WebCrypto there, node:crypto here).
//
// Honesty contract (no placeholder claims):
// - A seed record ALWAYS names its true source: "ANU-QRNG" (live quantum
//   measurement), "crypto-fallback" (node:crypto, NOT quantum), or
//   "committed-record" (a previously captured record loaded from disk).
// - fetchQuantumSeed() throws on any failure; it never silently substitutes
//   pseudo-randomness. Callers decide what to do with a failure.

import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

export const ANU_QRNG_ENDPOINT = 'https://qrng.anu.edu.au/API/jsonI.php';

/**
 * Fetch fresh quantum random uint16 values from the ANU QRNG service
 * (Australian National University — vacuum-fluctuation measurements).
 * Returns a seed record; throws if the service does not answer cleanly.
 */
export async function fetchQuantumSeed(length = 16, { timeoutMs = 15000 } = {}) {
  const url = `${ANU_QRNG_ENDPOINT}?length=${length}&type=uint16`;
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`ANU QRNG HTTP ${res.status}`);
  const body = await res.json();
  if (!body || body.success !== true || !Array.isArray(body.data) || body.data.length !== length) {
    throw new Error(`ANU QRNG malformed response: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return {
    source: 'ANU-QRNG',
    endpoint: url,
    type: 'uint16',
    length,
    data: body.data,
    fetched_at_utc: new Date().toISOString(),
    note: 'True quantum random numbers measured from vacuum fluctuations (ANU QRNG).',
  };
}

/**
 * Cryptographic fallback seed — same fallback QRNGBridge uses
 * (crypto.getRandomValues there). Explicitly NOT quantum; the record
 * says so, and any district built from it must be labeled accordingly.
 */
export function cryptoFallbackSeed(length = 16) {
  const buf = randomBytes(length * 2);
  const data = [];
  for (let i = 0; i < length; i++) data.push(buf.readUInt16LE(i * 2));
  return {
    source: 'crypto-fallback',
    endpoint: null,
    type: 'uint16',
    length,
    data,
    fetched_at_utc: new Date().toISOString(),
    note: 'node:crypto randomness. NOT quantum. Used only when ANU QRNG is unreachable.',
  };
}

/** Load a previously captured seed record from disk (reproducible builds). */
export async function loadSeedRecord(path) {
  const raw = await readFile(path, 'utf8');
  const rec = JSON.parse(raw);
  if (!rec || !Array.isArray(rec.data) || rec.data.length === 0) {
    throw new Error(`Seed record at ${path} has no data array`);
  }
  return { ...rec, source: rec.source, loaded_from: path };
}

/**
 * Derive one 32-bit master seed from a seed record's uint16 stream
 * (FNV-1a fold over all values, then a final avalanche mix).
 * Deterministic: same record in -> same master seed out, forever.
 */
export function masterSeedFromRecord(record) {
  let h = 0x811c9dc5; // FNV offset basis
  for (const v of record.data) {
    h ^= (v & 0xff);
    h = Math.imul(h, 0x01000193);
    h ^= (v >>> 8);
    h = Math.imul(h, 0x01000193);
  }
  // avalanche
  h ^= h >>> 16;
  h = Math.imul(h, 0x21f0aaad);
  h ^= h >>> 15;
  h = Math.imul(h, 0x735a2d97);
  h ^= h >>> 15;
  return h >>> 0;
}

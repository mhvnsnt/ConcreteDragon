#!/usr/bin/env node
/**
 * gen_sfx_jsfxr.mjs — generate Concrete Dragon SFX with jsfxr (Unlicense = public domain).
 *
 * Uses the jsfxr preset roll-ups (blipSelect / hitHurt / explosion / pickupCoin),
 * one light mutate() pass for character, then pipes the serialized Params into
 * jsfxr's sfxr-to-wav CLI. Math.random is overridden with a seeded mulberry32 so
 * regeneration is deterministic; the seed is logged below and the full Params
 * JSON is saved next to each WAV as the reproducibility receipt.
 *
 *   node game/tools/gen_sfx_jsfxr.mjs [--seed 1234]
 *
 * jsfxr source: JSFXR_DIR env, else ~/workspace/api-wiring/node_modules/jsfxr,
 * else `npm i jsfxr` in this directory.
 */
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "assets", "sfx");

const CANDIDATES = [
  process.env.JSFXR_DIR,
  path.join(os.homedir(), "workspace", "api-wiring", "node_modules", "jsfxr"),
  path.join(HERE, "node_modules", "jsfxr"),
];
const JSFXR = CANDIDATES.find((d) => d && existsSync(path.join(d, "sfxr.js")));
if (!JSFXR) {
  console.error("jsfxr not found. Run: npm init -y && npm i jsfxr   (in game/tools/)");
  process.exit(1);
}

// riffwave must be global before sfxr.js loads (see sfxr.mjs)
const { default: RIFFWAVE } = await import(path.join(JSFXR, "riffwave.mjs"));
globalThis.RIFFWAVE = RIFFWAVE;
const { default: jsfxr } = await import(path.join(JSFXR, "sfxr.mjs"));
const { Params } = jsfxr;

// ---- seeded PRNG (replaces Math.random so builds are reproducible) ----
let SEED = 0xC0C0A;
const arg = process.argv.indexOf("--seed");
if (arg > 0) SEED = parseInt(process.argv[arg + 1], 10) >>> 0;
let _s = SEED >>> 0;
Math.random = () => {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const SPECS = [
  { name: "jsfxr_ui_blip", preset: "blipSelect",  desc: "menu/UI tap blip" },
  { name: "jsfxr_hit",     preset: "hitHurt",     desc: "punch impact variant" },
  { name: "jsfxr_ko",      preset: "explosion",   desc: "KO heavy impact" },
  { name: "jsfxr_coin",    preset: "pickupCoin",  desc: "cash pickup sparkle" },
];

const sfxrToWav = path.join(JSFXR, "sfxr-to-wav"); // reference only; we generate inline below
for (const spec of SPECS) {
  const p = new Params();
  p[spec.preset]();
  p.mutate(); // one light mutate for character
  // Same conversion as sfxr-to-wav, but inline (its /dev/stdin read is fragile).
  const sound = new jsfxr.SoundEffect(p).generate();
  const m = sound.dataURI.match(/^data:.+\/(.+);base64,(.*)$/);
  if (!m) throw new Error("unexpected dataURI from jsfxr");
  const wav = path.join(OUT, spec.name + ".wav");
  writeFileSync(wav, Buffer.from(m[2], "base64"));
  const json = JSON.stringify(p);
  writeFileSync(
    path.join(OUT, spec.name + ".sfxr.json"),
    JSON.stringify({ name: spec.name, preset: spec.preset, seed: SEED, params: JSON.parse(json) }, null, 2) + "\n"
  );
  console.log(`wrote ${spec.name}.wav  (${spec.desc})`);
}
console.log(`seed=${SEED}  jsfxr=${JSFXR}  -> ${OUT}`);

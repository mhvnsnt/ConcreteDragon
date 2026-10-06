// Concrete Dragon — 3D side-scrolling beat-em-up. Orion Enterprises LLC.
// Three.js, single self-contained HTML. All art/audio CC0 (see CREDITS in the build).
// Direction (owner 2026-10-06): Streets of Rage / Fatal Fury / DBGT: Transformation (GBA)
// / Streets of Fury inspirations — walk forward/backward (+depth) across scrolling
// street levels with missions. NOT a stationary 1v1 fighter.
//
// IMPACT PACING (owner tuning 2026-10-06): light hits stay SNAPPY — tiny hit-stop
// only, NO slow-mo on normal hits. Slow-mo + long hit-stop reserved for big
// moments: KO blows, counters, heavy hits, specials.
// STYLE-NOT-POWER (inviolable): skins/packs are cosmetic only. No pay-to-win, ever.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const $ = (id) => document.getElementById(id);
const b64ToBuf = (b64) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
const A = window.__ASSETS;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
// date-seeded PRNG for daily runs (mulberry32)
function seedPRNG(seed) { let t = seed >>> 0; return function () { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
const todayStr = () => new Date().toISOString().slice(0, 10);

// ---------- telemetry (debug/QA) ----------
const T = window.__playable = { state: 'loading', taps: 0, hits: 0, counters: 0, kos: 0, events: [], errors: [] };
const ev = (name, data) => { T.events.push({ t: +performance.now().toFixed(0), name, ...data }); };

// ---------- save (localStorage) ----------
const SAVE_KEY = 'concretedragon.save.v2';
const save = {
  cash: 0, up_power: 0, up_tough: 0, up_hustle: 0, wins: 0, losses: 0,
  best_wave: 0, selected: 'kidblue', skins: {},
  unlocked: ['kidblue', 'ghost', 'brick'], missionsDone: [],
  daily: { date: '', score: 0 }, boards: {}, seenHint: false,
};
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && typeof s === 'object') for (const k of Object.keys(save)) if (k in s) save[k] = s[k];
  } catch (e) { /* fresh save */ }
  if (!save.skins || typeof save.skins !== 'object') save.skins = {};
  if (!Array.isArray(save.unlocked) || !save.unlocked.length) save.unlocked = ['kidblue', 'ghost', 'brick'];
  if (!Array.isArray(save.missionsDone)) save.missionsDone = [];
  if (!save.boards || typeof save.boards !== 'object') save.boards = {};
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
const upCost = (lvl) => 100 * (lvl + 1);
const powerMult = () => 1 + save.up_power * 0.12;
const toughBonus = () => save.up_tough * 12;
const hustleMult = () => 1 + save.up_hustle * 0.15;

// ---------- data: roster (data-driven; unlock via missions/bosses) ----------
const FIGHTERS = [
  { id: 'kidblue', name: 'KID BLUE', tag: 'Balanced brawler. Big heart, bigger hands.', hp: 100, dmg: 1.0, spd: 1.0, unlock: { type: 'start' } },
  { id: 'ghost', name: 'GHOST', tag: 'Fast striker. Blink and you lose.', hp: 85, dmg: 0.9, spd: 1.25, unlock: { type: 'start' } },
  { id: 'brick', name: 'BRICK', tag: 'Walking wall. Hits like rent day.', hp: 135, dmg: 1.25, spd: 0.85, unlock: { type: 'start' } },
  { id: 'kingpin', name: 'KINGPIN', tag: 'Used to run this block. Now he runs with you.', hp: 150, dmg: 1.3, spd: 0.9, unlock: { type: 'boss', boss: 'kingpin' } },
  { id: 'sledge', name: 'SLEDGE', tag: 'Yard enforcer. Swings first, talks never.', hp: 165, dmg: 1.45, spd: 0.8, unlock: { type: 'boss', boss: 'sledge' } },
  { id: 'viper', name: 'VIPER', tag: 'Fast hands, faster mouth.', hp: 95, dmg: 1.05, spd: 1.35, unlock: { type: 'boss', boss: 'viper' } },
];
const SKINS = { // style only — zero power. New packs drop in here.
  kidblue: [{ id: 'street', name: 'Street Blue', tint: 0x4fd1ff }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'gold', name: 'Champion Gold', tint: 0xffd166 }],
  ghost: [{ id: 'street', name: 'Ghost Mint', tint: 0x4dff88 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'volt', name: 'Volt', tint: 0x7af0ff }],
  brick: [{ id: 'street', name: 'Brick', tint: 0xff8c42 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'blood', name: 'Bloodline', tint: 0xc1121f }],
  kingpin: [{ id: 'street', name: 'Boss Gold', tint: 0xffb03d }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }],
  sledge: [{ id: 'street', name: 'Yard Rust', tint: 0xb3541e }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }],
  viper: [{ id: 'street', name: 'Viper Green', tint: 0x39d353 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }],
};
// Supporter packs: cosmetic-only, purchasable on itch.io (PWYW). In-game: preview only.
const SUPPORT_PACKS = [
  { id: 'kings', name: 'SEASON 1: CONCRETE KINGS', desc: '5 royal tints. Style only, never power.', price: 'PWYW on itch.io' },
];
const UPS = [
  { key: 'up_power', name: 'POWER', desc: '+12% damage' },
  { key: 'up_tough', name: 'TOUGH', desc: '+12 max HP' },
  { key: 'up_hustle', name: 'HUSTLE', desc: '+15% cash' },
];
const fighterDef = (id) => FIGHTERS.find((f) => f.id === (id || save.selected)) || FIGHTERS[0];
const skinTint = (fid) => {
  const list = SKINS[fid] || SKINS.kidblue;
  const s = list.find((x) => x.id === save.skins[fid]) || list[0];
  return s.tint;
};
const isUnlocked = (f) => save.unlocked.includes(f.id);
function unlockText(f) {
  if (f.unlock.type === 'start') return '';
  if (f.unlock.type === 'boss') { const b = BOSSES.find((x) => x.id === f.unlock.boss); return 'BEAT ' + (b ? b.name : 'THE BOSS') + ' TO UNLOCK'; }
  return 'CLEAR MISSIONS TO UNLOCK';
}

// ---------- data: enemy families + variants (SoR2 system: variants gain moves/gear) ----------
const ENEMY_FAMS = [
  { id: 'thug', name: 'STREET THUG', tint: 0xff5a5a, hp: 70, dmg: 1.0, scale: 1.0, spd: 1.6,
    variants: [
      { at: 0 },
      { at: 2, name: 'THUG BRUISER', tint: 0xd43d3d, hpMul: 1.6, scaleMul: 1.12, move: 'uppercut' },
      { at: 4, name: 'THUG KNIFE', tint: 0xff7a7a, dmgMul: 1.4, move: 'knife' },
    ] },
  { id: 'rico', name: 'BIG RICO', tint: 0x9a6bff, hp: 100, dmg: 1.1, scale: 1.15, spd: 1.4,
    variants: [
      { at: 0 },
      { at: 3, name: 'RICO ENFORCER', tint: 0x7a4de0, hpMul: 1.5, dmgMul: 1.2, move: 'slam' },
    ] },
  { id: 'jabber', name: 'JABBER', tint: 0x7af0ff, hp: 60, dmg: 0.9, scale: 0.95, spd: 2.2,
    variants: [
      { at: 0 },
      { at: 3, name: 'JABBER SWIFT', tint: 0x4dd2ff, spdMul: 1.4, move: 'flurry' },
    ] },
  { id: 'heavyd', name: 'HEAVY D', tint: 0xff8c42, hp: 105, dmg: 1.2, scale: 1.18, spd: 1.2,
    variants: [
      { at: 0 },
      { at: 4, name: 'HEAVY D PLUS', tint: 0xe06a1e, hpMul: 1.7, scaleMul: 1.1, move: 'charge' },
    ] },
];
// missionIdx picks the variant: latest variant whose `at` <= mission index
function famVariant(fam, mi) {
  let v = fam.variants[0];
  for (const c of fam.variants) if (c.at <= mi) v = c;
  return {
    name: v.name || fam.name, tint: v.tint || fam.tint,
    hp: Math.round(fam.hp * (v.hpMul || 1)), dmg: fam.dmg * (v.dmgMul || 1),
    scale: fam.scale * (v.scaleMul || 1), spd: fam.spd * (v.spdMul || 1), move: v.move || null,
  };
}

// ---------- data: bosses (telegraphed patterns; beating one unlocks them as playable) ----------
const BOSSES = [
  { id: 'kingpin', name: 'KINGPIN', tint: 0xffb03d, hp: 420, dmg: 1.3, scale: 1.35, spd: 1.5,
    patterns: ['slam', 'charge', 'summon'], unlockFighter: 'kingpin',
    intro: 'HE RUNS THIS BLOCK' },
  { id: 'sledge', name: 'SLEDGE', tint: 0xb3541e, hp: 560, dmg: 1.5, scale: 1.45, spd: 1.3,
    patterns: ['slam', 'slam', 'charge'], unlockFighter: 'sledge',
    intro: 'THE YARD ENFORCER' },
  { id: 'viper', name: 'VIPER', tint: 0x39d353, hp: 380, dmg: 1.15, scale: 1.05, spd: 2.4,
    patterns: ['flurry', 'charge', 'summon'], unlockFighter: 'viper',
    intro: 'FAST HANDS, FASTER MOUTH' },
];

// ---------- data: districts (per-district palettes — owner's art rule) ----------
const DISTRICTS = [
  { id: 'neon', name: 'NEON ROW', sky: 0x150f2a, fog: [0x150f2a, 9, 26], hemi: [0x8fa8ff, 0x2a1830, 1.25],
    moon: [0xbfd0ff, 1.4], rim: [0xff4fd8, 1.6], lampA: 0xffa64d, lampB: 0x4de1ff, ground: 0x2a2438, sw: ['#4fd1ff', '#ff4fd8'] },
  { id: 'yards', name: 'THE YARDS', sky: 0x1c0f06, fog: [0x1c0f06, 8, 24], hemi: [0xffb37a, 0x2a1408, 1.15],
    moon: [0xffd9a0, 1.2], rim: [0xff6a00, 1.5], lampA: 0xff8c42, lampB: 0xffb03d, ground: 0x33241a, sw: ['#ff8c42', '#ffb03d'] },
  { id: 'havana', name: 'LITTLE HAVANA', sky: 0x0f1a2a, fog: [0x0f1a2a, 9, 26], hemi: [0x7af0ff, 0x0a1a2a, 1.2],
    moon: [0x9fd8ff, 1.3], rim: [0x2affd5, 1.4], lampA: 0xffd166, lampB: 0x2affd5, ground: 0x1a2a30, sw: ['#ffd166', '#2affd5'] },
];
const districtDef = (id) => DISTRICTS.find((d) => d.id === id) || DISTRICTS[0];

// ---------- data: missions (district = mission set; walk -> waves -> boss arena) ----------
// spawns: {at: worldX, fam: familyId, n: count}
const MISSIONS = [
  { id: 'm1', district: 'neon', name: 'FIRST BLOOD', len: 55, crowd: false,
    spawns: [{ at: 10, fam: 'thug', n: 2 }, { at: 22, fam: 'thug', n: 2 }, { at: 34, fam: 'rico', n: 2 }, { at: 44, fam: 'jabber', n: 2 }],
    boss: 'kingpin', unlock: { type: 'start' }, reward: 'Unlocks KINGPIN as playable' },
  { id: 'm2', district: 'yards', name: 'SCRAP YARD', len: 70, crowd: true,
    spawns: [{ at: 10, fam: 'thug', n: 2 }, { at: 24, fam: 'heavyd', n: 2 }, { at: 38, fam: 'rico', n: 3 }, { at: 52, fam: 'jabber', n: 3 }],
    boss: 'sledge', unlock: { type: 'mission', id: 'm1' }, reward: 'Unlocks SLEDGE as playable' },
  { id: 'm3', district: 'havana', name: 'NIGHT MARKET', len: 85, crowd: true,
    spawns: [{ at: 10, fam: 'jabber', n: 3 }, { at: 26, fam: 'thug', n: 3 }, { at: 42, fam: 'rico', n: 3 }, { at: 58, fam: 'heavyd', n: 3 }, { at: 70, fam: 'thug', n: 4 }],
    boss: 'viper', unlock: { type: 'mission', id: 'm2' }, reward: 'Unlocks VIPER as playable' },
  { id: 'endless', district: 'neon', name: 'ENDLESS SCRAP', len: Infinity, crowd: false, endless: true,
    spawns: [], boss: null, unlock: { type: 'mission', id: 'm1' }, reward: 'Survival ladder — how far can you walk?' },
  { id: 'daily', district: 'neon', name: 'DAILY SCRAP', len: 70, crowd: false, daily: true,
    spawns: [], boss: 'kingpin', unlock: { type: 'mission', id: 'm1' }, reward: 'Same seed for everyone today. One scored run.' },
];
const missionDef = (id) => MISSIONS.find((m) => m.id === id);
const missionUnlocked = (m) => {
  if (m.unlock.type === 'start') return true;
  return save.missionsDone.includes(m.unlock.id);
};
const missionIndex = (m) => MISSIONS.indexOf(m);

// ---------- audio (nothing plays before first user gesture) ----------
let actx = null; const sbuf = {}; let muted = false;
async function unlockAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    await Promise.all(['hit1', 'hit2', 'hit3', 'bell', 'crowd', 'music', 'click'].map(async (k) => { sbuf[k] = await actx.decodeAudioData(b64ToBuf(A[k + '.mp3'])); }));
    sfx('music', 0.32, true); sfx('crowd', 0.25, true);
  } catch (e) { T.errors.push('audio:' + e); }
}
function sfx(k, vol = 1, loop = false, rate = 1) {
  if (!actx || !sbuf[k] || muted) return null;
  const s = actx.createBufferSource(); s.buffer = sbuf[k]; s.loop = loop; s.playbackRate.value = rate;
  const g = actx.createGain(); g.gain.value = vol; s.connect(g).connect(actx.destination); s.start(); return s;
}
let paused = false;
function setPaused(p) { if (actx) (p ? actx.suspend() : actx.resume()).catch(() => {}); paused = p; }
document.addEventListener('visibilitychange', () => setPaused(document.hidden));

// ---------- renderer / scene ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const hemi = new THREE.HemisphereLight(0x8fa8ff, 0x2a1830, 1.25); scene.add(hemi);
const moon = new THREE.DirectionalLight(0xbfd0ff, 1.4); moon.position.set(-4, 9, 6); moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(moon);
const rim = new THREE.DirectionalLight(0xff4fd8, 1.6); rim.position.set(3, 3, -5); scene.add(rim);
const lampL = new THREE.PointLight(0xffa64d, 22, 9, 1.6); lampL.position.set(-3.2, 3.2, -1.2); scene.add(lampL);
const lampR = new THREE.PointLight(0x4de1ff, 18, 9, 1.6); lampR.position.set(3.4, 3.0, -1.2); scene.add(lampR);
function applyDistrict(d) {
  scene.background = new THREE.Color(d.sky);
  scene.fog = new THREE.Fog(d.fog[0], d.fog[1], d.fog[2]);
  hemi.color.set(d.hemi[0]); hemi.groundColor.set(d.hemi[1]); hemi.intensity = d.hemi[2];
  moon.color.set(d.moon[0]); moon.intensity = d.moon[1];
  rim.color.set(d.rim[0]); rim.intensity = d.rim[1];
  lampL.color.set(d.lampA); lampR.color.set(d.lampB);
}

const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const parse = (name) => new Promise((res, rej) => loader.parse(b64ToBuf(A[name]), '', res, rej));

// ---------- street builder (mission-length, district-styled) ----------
const streetGroup = new THREE.Group(); scene.add(streetGroup);
let streetParts = {};
function clearStreet() { while (streetGroup.children.length) streetGroup.remove(streetGroup.children[0]); }
function buildStreet(district, missionLen, seedFn) {
  clearStreet();
  const d = districtDef(district);
  applyDistrict(d);
  const R = seedFn || Math.random;
  const parts = streetParts;
  const place = (name, x, z, ry = 0, sc = 1, tint = null) => {
    const p = parts[name]; if (!p) return null;
    const o = p.clone(); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.multiplyScalar(sc);
    o.traverse((m) => { if (m.isMesh) { m.receiveShadow = true; m.castShadow = true; if (tint !== null) { m.material = m.material.clone(); m.material.color = new THREE.Color(tint); } } });
    streetGroup.add(o); return o;
  };
  const K = 2.2;
  const road = parts.road_straight; const rb = new THREE.Box3().setFromObject(road);
  const seg = (rb.max.z - rb.min.z) * K, rw = (rb.max.x - rb.min.x) * K;
  const L = isFinite(missionLen) ? missionLen + 30 : 220;
  for (let i = -4; i * seg < L; i++) { const o = place('road_straight', i * seg, 0, Math.PI / 2, K); if (o) o.position.y = -0.02 * K; }
  const bl = ['building_C', 'building_E', 'building_B', 'building_G', 'building_D', 'building_F', 'building_H', 'building_A'];
  const curb = -rw / 2;
  let x = -10, bi = 0;
  const bTint = [0xffffff, 0xf0e0d0, 0xd8c8e0][Math.floor(R() * 3)];
  while (x < L && bi < 200) {
    const n = bl[Math.floor(R() * bl.length)];
    const b = new THREE.Box3().setFromObject(parts[n]); const w = Math.max(0.5, (b.max.x - b.min.x) * K);
    place(n, x + w / 2, curb - (b.max.z - b.min.z) * K / 2 - 0.3, 0, K, bTint); x += w + 0.05; bi++;
  }
  // props along the route
  for (let px = 6; px < L; px += rnd(7, 13)) {
    const side = R() < 0.5 ? -1 : 1;
    place('streetlight', px, side * (curb + 0.2), 0, K);
    if (R() < 0.5) place('dumpster', px + rnd(-2, 2), side * (curb - 0.1), R() * 3, K);
    if (R() < 0.4) place('trash_A', px + rnd(-3, 3), side * (curb + 0.4), R() * 3, K);
    if (R() < 0.3) place('firehydrant', px + rnd(-3, 3), side * (curb + 0.5), 0, K);
    if (R() < 0.35) place('box_A', px + rnd(-3, 3), side * (curb + 0.6), R() * 3, K);
  }
  if (R() < 0.9) place('car_taxi', 14, curb + 1.2, Math.PI / 2, K);
  if (R() < 0.9) place('car_police', L - 16, curb + 1.3, -Math.PI / 2, K);
  lampL.position.set(2, 3.4, curb + 0.8); lampR.position.set(10, 3.2, curb + 0.8);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(L + 60, 80), new THREE.MeshStandardMaterial({ color: d.ground, roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.position.set(L / 2 - 10, -0.06, 0); g.receiveShadow = true; streetGroup.add(g);
  return { curb, roadW: rw };
}

// ---------- breakables (SoR trash cans/crates: cash or food) ----------
const breakables = [];
function spawnBreakables(district, missionLen, R) {
  for (const b of breakables) streetGroup.remove(b.mesh);
  breakables.length = 0;
  const L = isFinite(missionLen) ? missionLen : 200;
  const names = ['trash_A', 'trash_B', 'box_A'];
  for (let px = 8; px < L; px += rnd(9, 16)) {
    const nm = names[Math.floor(R() * names.length)];
    const p = streetParts[nm]; if (!p) continue;
    const o = p.clone(); o.position.set(px + rnd(-2, 2), 0, rnd(-1.5, 1.5)); o.scale.multiplyScalar(2.2);
    o.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
    streetGroup.add(o);
    breakables.push({ mesh: o, px: o.position.x, pz: o.position.z, kind: R() < 0.6 ? 'cash' : 'food', broken: false });
  }
}

// ---------- crowd (CONDITIONAL: only on missions flagged crowd:true — owner directive) ----------
const crowdGroup = new THREE.Group(); scene.add(crowdGroup);
let crowdMembers = [];
function spawnCrowd(R) {
  clearCrowd();
  for (let i = 0; i < 14; i++) {
    const f = makeFighterRaw(0x888899, 0, 0, rnd(0.9, 1.05));
    const side = i % 2 === 0 ? -1 : 1;
    f.root.position.set(rnd(-6, 26), 0, side * rnd(2.6, 3.4));
    f.root.rotation.y = side > 0 ? Math.PI : 0;
    playAnim(f, 'Melee_Unarmed_Idle', { loop: true, ts: rnd(0.8, 1.2) });
    f.crowd = true; f.phase = R() * 6.28;
    crowdGroup.add(f.root); crowdMembers.push(f);
  }
}
function clearCrowd() { for (const f of crowdMembers) { crowdGroup.remove(f.root); const i = fighters.indexOf(f); if (i >= 0) fighters.splice(i, 1); } crowdMembers = []; }
function crowdCheer() { for (const f of crowdMembers) { f.cheerT = 1.2; } sfx('crowd', 0.5); }

// ---------- fighters ----------
const clips = {};
const fighters = [];
let fighterTemplate = null, fighterHeight = 1.8;
function makeFighterRaw(tint, x, face, scale = 1) {
  const root = skClone(fighterTemplate);
  root.scale.multiplyScalar(scale);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.color = new THREE.Color(tint); } });
  root.position.set(x, 0, 0); root.rotation.y = face; scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const f = { root, mixer, cur: null, hp: 100, maxHp: 100, busy: 0, tint, sc: scale, dmgMult: 1, vy: 0, airborne: false };
  mixer.addEventListener('finished', (e) => { if (e.action === f.cur && f.onDone) { const d = f.onDone; f.onDone = null; d(); } });
  fighters.push(f); return f;
}
function playAnim(f, name, { loop = false, fade = 0.08, ts = 1, done = null, clamp = false } = {}) {
  const clip = clips[name]; if (!clip) return;
  const a = f.mixer.clipAction(clip);
  a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = clamp || !loop; a.timeScale = ts;
  if (f.cur && f.cur !== a) a.crossFadeFrom(f.cur, fade, false);
  a.play(); f.cur = a; f.onDone = done || (loop ? null : () => playAnim(f, 'Melee_Unarmed_Idle', { loop: true, fade: 0.15 }));
}
function removeFighter(f) { scene.remove(f.root); crowdGroup.remove(f.root); const i = fighters.indexOf(f); if (i >= 0) fighters.splice(i, 1); }
function clearFighters() { for (const f of fighters.slice()) removeFighter(f); }

// ---------- FX ----------
const sparkTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,220,120,0.9)'); gr.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const sparks = [];
function burst(pos, n = 18, color = 0xffd27a, speed = 4) {
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.position.copy(pos); const k = 0.12 + Math.random() * 0.18; s.scale.set(k, k, k);
    s.userData.v = new THREE.Vector3((Math.random() - 0.5) * speed, Math.random() * speed * 0.8, (Math.random() - 0.5) * speed);
    s.userData.life = 0.35 + Math.random() * 0.25; scene.add(s); sparks.push(s);
  }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.12, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  ring.position.copy(pos); ring.lookAt(camera.position); ring.userData.ring = true; ring.userData.life = 0.25; scene.add(ring); sparks.push(ring);
}
function updateFx(dt) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]; s.userData.life -= dt;
    if (s.userData.ring) { s.scale.multiplyScalar(1 + dt * 14); s.material.opacity = Math.max(0, s.userData.life * 4); }
    else { s.userData.v.y -= 9 * dt; s.position.addScaledVector(s.userData.v, dt); s.material.opacity = Math.max(0, s.userData.life * 2.5); }
    if (s.userData.life <= 0) { scene.remove(s); s.material.dispose(); sparks.splice(i, 1); }
  }
}
let shake = 0, hitstop = 0, slowmo = 1, slowmoT = 0;
function popText(txt, cls, x, y) {
  const d = document.createElement('div'); d.className = 'pop ' + (cls || ''); d.textContent = txt;
  d.style.left = x + 'px'; d.style.top = y + 'px'; $('hud').appendChild(d); setTimeout(() => d.remove(), 900);
}
function banner(txt, cls) {
  popText(txt, 'big ' + (cls || ''), innerWidth / 2, innerHeight * 0.3);
}
function screenPos(v) { const p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight }; }
function flash(color) { const f = $('flash'); f.style.background = color; f.style.opacity = 0.55; setTimeout(() => (f.style.opacity = 0), 60); }

// ---------- screens ----------
let state = 'loading';
function el(tag, cls, html) { const d = document.createElement(tag); if (cls) d.className = cls; if (html !== undefined) d.innerHTML = html; return d; }
function hex(tint) { return '#' + tint.toString(16).padStart(6, '0'); }
function showOnly(id) { for (const s of ['title', 'select', 'mission', 'results']) $(s).classList.toggle('hidden', s !== id); $('touch').classList.toggle('on', id === null); $('hud').style.display = id === null ? 'block' : 'none'; }
function renderMeta() {
  const html = `CASH: <b>$${save.cash}</b> &nbsp;·&nbsp; WINS ${save.wins} &nbsp; LOSSES ${save.losses} &nbsp;·&nbsp; BEST WAVE ${save.best_wave}`;
  $('metaLine').innerHTML = html;
  $('metaLine3').innerHTML = html;
  $('titleMeta').innerHTML = html;
}
function renderShop(into) {
  into.innerHTML = '';
  for (const u of UPS) {
    const lvl = save[u.key], cost = upCost(lvl);
    const box = el('div', 'shopItem');
    box.appendChild(el('div', 'un', `${u.name} <span style="font-size:11px;opacity:.7">Lv${lvl}</span>`));
    box.appendChild(el('div', 'ud', u.desc));
    const b = el('button', '', `$${cost}`);
    b.disabled = save.cash < cost;
    b.onclick = (e) => { e.stopPropagation(); if (save.cash < cost) return; save.cash -= cost; save[u.key]++; writeSave(); sfx('click', 0.8); renderShop(into); renderMeta(); refreshShowcase(); };
    box.appendChild(b); into.appendChild(box);
  }
  const sp = el('div', 'shopItem');
  sp.appendChild(el('div', 'un', 'SUPPORTER'));
  sp.appendChild(el('div', 'ud', SUPPORT_PACKS[0].desc));
  const pb = el('button', '', SUPPORT_PACKS[0].price);
  pb.onclick = (e) => { e.stopPropagation(); popText('COMING SOON — ITCH.IO', 'gold', innerWidth / 2, innerHeight * 0.5); };
  sp.appendChild(pb); into.appendChild(sp);
}

// --- 3D showcase: the ACTUAL fighter model on a turntable (never colored circles) ---
let showcase = null, showcaseRot = 0, showcaseDrag = null;
function refreshShowcase() {
  if (showcase) { removeFighter(showcase); showcase = null; }
  const fd = fighterDef();
  showcase = makeFighterRaw(skinTint(fd.id), 0, 0, 1);
  playAnim(showcase, 'Melee_Unarmed_Idle', { loop: true });
  $('showName').textContent = fd.name;
  $('showTag').textContent = fd.tag;
  const bars = $('statBars'); bars.innerHTML = '';
  const defs = [['POWER', fd.dmg / 1.5, '#ff4d4d'], ['SPEED', fd.spd / 1.4, '#7af0ff'], ['TOUGH', fd.hp / 170, '#80ed99']];
  for (const [n, v, c] of defs) {
    const row = el('div', 'sbar', `${n}<div class="tr"><div class="fl" style="width:${Math.round(clamp(v, 0.05, 1) * 100)}%;background:${c}"></div></div>`);
    bars.appendChild(row);
  }
}
function showTitle() {
  state = 'title'; clearFighters(); clearCrowd();
  applyDistrict(districtDef('neon'));
  buildStreet('neon', 40, Math.random);
  renderMeta(); showOnly('title');
  $('dailyTag').textContent = '';
}
function showSelect() {
  state = 'select'; clearFighters(); clearCrowd();
  applyDistrict(districtDef('neon'));
  buildStreet('neon', 40, Math.random);
  refreshShowcase();
  const cards = $('cards'); cards.innerHTML = '';
  for (const f of FIGHTERS) {
    const locked = !isUnlocked(f);
    const c = el('div', 'card' + (f.id === save.selected && !locked ? ' sel' : '') + (locked ? ' locked' : ''));
    c.appendChild(el('div', 'nm', locked ? '???' : f.name));
    c.appendChild(el('div', 'lk', locked ? unlockText(f) : f.tag));
    if (!locked) c.onclick = () => { save.selected = f.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelectCards(); };
    cards.appendChild(c);
  }
  const sr = $('skinsRow'); sr.querySelectorAll('.skinDot').forEach((d) => d.remove());
  for (const s of SKINS[save.selected] || SKINS.kidblue) {
    const d = el('div', 'skinDot' + ((save.skins[save.selected] || 'street') === s.id ? ' sel' : ''));
    d.style.background = hex(s.tint); d.title = s.name;
    d.onclick = () => { save.skins[save.selected] = s.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelectCards(); };
    sr.appendChild(d);
  }
  renderShop($('shopRow')); renderMeta();
  showOnly('select');
}
function showSelectCards() { // re-render cards row only (after pick)
  const cards = $('cards'); cards.innerHTML = '';
  for (const f of FIGHTERS) {
    const locked = !isUnlocked(f);
    const c = el('div', 'card' + (f.id === save.selected && !locked ? ' sel' : '') + (locked ? ' locked' : ''));
    c.appendChild(el('div', 'nm', locked ? '???' : f.name));
    c.appendChild(el('div', 'lk', locked ? unlockText(f) : f.tag));
    if (!locked) c.onclick = () => { save.selected = f.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelectCards(); };
    cards.appendChild(c);
  }
}
function showMission() {
  state = 'mission'; clearFighters(); clearCrowd();
  const list = $('mList'); list.innerHTML = '';
  for (const m of MISSIONS) {
    const d = districtDef(m.district);
    const locked = !missionUnlocked(m);
    const card = el('div', 'mcard' + (locked ? ' locked' : ''));
    card.appendChild(el('div', 'dn', d.name));
    card.appendChild(el('div', 'mn', m.name));
    const sw = el('div', 'sw'); sw.style.background = `linear-gradient(90deg, ${d.sw[0]}, ${d.sw[1]})`;
    card.appendChild(sw);
    let info = '';
    if (m.endless) info = 'Endless survival. Walk as far as you can.';
    else if (m.daily) info = 'Seeded run — same for everyone today.';
    else info = `${m.spawns.reduce((a, s) => a + s.n, 0)} thugs · Boss: ${m.boss ? missionBossName(m) : '—'}`;
    card.appendChild(el('div', 'inf', info));
    const best = save.boards[m.id];
    if (best) card.appendChild(el('div', 'best', `BEST: ${best}`));
    card.appendChild(el('div', 'rw', locked ? '🔒 ' + (m.unlock.id ? 'Clear ' + missionDef(m.unlock.id).name : '') : '★ ' + m.reward));
    if (!locked) {
      const go = el('button', 'go', m.daily && save.daily.date === todayStr() ? 'RETRY' : 'GO');
      go.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('click', 0.8); startMission(m.id); };
      card.appendChild(go);
    }
    list.appendChild(card);
  }
  $('dailyTag').textContent = 'DAILY SEED: ' + todayStr() + (save.daily.date === todayStr() ? ` · YOUR BEST: ${save.daily.score}` : '');
  renderMeta(); showOnly('mission');
}
function missionBossName(m) { const b = BOSSES.find((x) => x.id === m.boss); return b ? b.name : ''; }
function showResults(win, mission, stats) {
  state = 'results';
  clearFighters(); clearCrowd();
  $('touch').classList.remove('on');
  const ub = $('unlockBanner'); ub.textContent = '';
  if (win) {
    if (!save.missionsDone.includes(mission.id)) save.missionsDone.push(mission.id);
    save.wins++;
    // boss -> unlock as playable (owner directive)
    if (mission.boss) {
      const b = BOSSES.find((x) => x.id === mission.boss);
      if (b && b.unlockFighter && !save.unlocked.includes(b.unlockFighter)) {
        save.unlocked.push(b.unlockFighter);
        ub.textContent = '★ ' + b.name + ' UNLOCKED AS PLAYABLE ★';
        ev('unlock', { fighter: b.unlockFighter });
      }
    }
  } else { save.losses++; }
  save.cash += stats.cash; writeSave();
  $('resTitle').textContent = win ? 'MISSION CLEAR' : 'KNOCKED OUT';
  $('resStats').innerHTML =
    `<div class="stat">${win ? 'CLEARED' : 'REACHED'} <b>${mission.name}</b></div>` +
    `<div class="stat"><b>${stats.kills}</b> K.O.s &nbsp;·&nbsp; BEST COMBO <b>${stats.maxCombo}</b></div>` +
    (stats.dist ? `<div class="stat">DISTANCE <b>${Math.round(stats.dist)}m</b></div>` : '');
  $('cashLines').innerHTML =
    `<div>Fight cash <b>+$${stats.cash}</b></div>` +
    (stats.waveBonus ? `<div>Wave bonus <b>+$${stats.waveBonus}</b></div>` : '') +
    `<div style="font-size:19px;margin-top:6px">TOTAL <b>+$${stats.cash + (stats.waveBonus || 0)}</b></div>`;
  if (stats.waveBonus) { save.cash += stats.waveBonus; writeSave(); }
  renderShop($('shopRow2')); renderMeta();
  showOnly('results');
}

// ---------- mission runtime ----------
let player = null, enemies = [], mission = null, missionR = Math.random;
let spawnQueue = [], bossSpawned = false, bossRef = null, missionOver = false, ended = false;
let gameTime = 0, combo = 0, comboT = 0, maxCombo = 0, atkIdx = 0;
let cashRun = 0, kills = 0, distWalked = 0, endlessT = 3;
function hint(on) { $('hint').style.opacity = on ? 1 : 0; }
function awardCash(base, pos, tag) {
  const amount = Math.max(1, Math.round(base * hustleMult()));
  cashRun += amount;
  const txt = tag ? tag + ' +$' + amount : '+$' + amount;
  const sp = pos ? screenPos(pos) : { x: innerWidth / 2, y: innerHeight * 0.45 };
  popText(txt, 'gold', sp.x + (Math.random() * 60 - 30), sp.y);
  sfx('click', 0.7, false, 1.3);
}
function genDailySpawns(R) {
  const sp = []; const fams = ['thug', 'rico', 'jabber', 'heavyd'];
  for (let at = 10; at < 62; at += 10 + R() * 5) sp.push({ at: Math.round(at), fam: fams[Math.floor(R() * fams.length)], n: 2 + Math.floor(R() * 2) });
  return sp;
}
function startMission(id) {
  mission = missionDef(id);
  let R = Math.random;
  if (mission.daily) {
    const s = [...todayStr()].reduce((a, c) => a + c.charCodeAt(0), 0);
    R = seedPRNG(s * 7919);
    mission = Object.assign({}, mission, { spawns: genDailySpawns(R) });
  }
  missionR = R;
  clearFighters(); clearCrowd();
  buildStreet(mission.district, mission.len, R);
  spawnBreakables(mission.district, mission.len, R);
  if (mission.crowd) spawnCrowd(R); // CONDITIONAL crowd only — owner directive
  const fd = fighterDef();
  player = makeFighterRaw(skinTint(fd.id), 0, Math.PI / 2, 1);
  player.isPlayer = true;
  player.maxHp = Math.round(fd.hp + toughBonus());
  player.hp = player.maxHp;
  player.dmgMult = fd.dmg * powerMult();
  player.spd = fd.spd;
  player.px = 2; player.pz = 0;
  player.spc = 0; player.dodgeT = 0; player.dodgeCD = 0; player.busy = 0;
  player.animMove = false;
  playAnim(player, 'Melee_Unarmed_Idle', { loop: true });
  spawnQueue = mission.spawns.map((s) => Object.assign({}, s, { done: false })).sort((a, b) => a.at - b.at);
  bossSpawned = false; bossRef = null; missionOver = false; ended = false;
  gameTime = 0; combo = 0; comboT = 0; maxCombo = 0; atkIdx = 0;
  cashRun = 0; kills = 0; distWalked = 0; endlessT = 3;
  camX = 2;
  state = 'fight'; ev('mission_start', { id: mission.id });
  showOnly(null);
  $('touch').classList.add('on');
  $('bossWrap').style.display = 'none';
  if (!save.seenHint) hint(true);
  setHud();
}
function syncPos(f) { f.root.position.x = f.px; f.root.position.z = f.pz; }
function nearestEnemy(range) {
  let best = null, bd = range;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const d = Math.abs(e.px - player.px) + Math.abs(e.pz - player.pz) * 0.7;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function spawnEnemy(famId, mi, bx, bz) {
  const fam = ENEMY_FAMS.find((f) => f.id === famId) || ENEMY_FAMS[0];
  const v = famVariant(fam, mi);
  const e = makeFighterRaw(v.tint, bx, -Math.PI / 2, v.scale);
  e.isPlayer = false; e.name = v.name; e.maxHp = e.hp = v.hp;
  e.dmgMult = v.dmg; e.spd = v.spd; e.move = v.move;
  e.px = bx; e.pz = clamp(bz, -1.3, 1.3);
  e.ai = 'walk'; e.aiT = rnd(0.4, 1.2); e.windup = 0; e.vy = 0; e.airborne = false;
  syncPos(e);
  playAnim(e, 'Running_A', { loop: true });
  enemies.push(e);
  return e;
}
function spawnBoss(bossId, bx) {
  const b = BOSSES.find((x) => x.id === bossId);
  const e = makeFighterRaw(b.tint, bx, -Math.PI / 2, b.scale);
  e.isPlayer = false; e.boss = b; e.name = b.name;
  e.maxHp = e.hp = b.hp; e.dmgMult = b.dmg; e.spd = b.spd;
  e.px = bx; e.pz = 0; e.ai = 'walk'; e.patIdx = 0; e.patT = 2.2; e.vy = 0; e.airborne = false;
  syncPos(e);
  playAnim(e, 'Running_A', { loop: true });
  enemies.push(e); bossRef = e;
  banner('⚠ ' + b.name + ' ⚠');
  $('bossWrap').style.display = 'block'; $('bossName').textContent = b.name + ' — ' + b.intro;
  sfx('bell', 0.9);
  setHud();
  return e;
}
function showWarn(e, txt) {
  hideWarn(e);
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-size:20px;color:#ff2a2a;background:#fff;border-radius:6px;padding:2px 8px;box-shadow:0 0 18px #f00;white-space:nowrap;pointer-events:none;';
  d.textContent = txt || '!';
  $('hud').appendChild(d); e.warnEl = d;
}
function hideWarn(e) { if (e.warnEl) { e.warnEl.remove(); e.warnEl = null; } }
function positionWarn(e) {
  if (!e.warnEl) return;
  const sp = screenPos(e.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 1.15 * e.sc, 0)));
  e.warnEl.style.left = sp.x + 'px'; e.warnEl.style.top = sp.y + 'px';
}

// ---------- player combat ----------
const ATK = [ // [clip, timeScale, impact delay, dmg, label, hitstop, shake]
  ['Melee_Unarmed_Attack_Punch_A', 1.9, 0.16, 9, 'JAB', 0.03, 0.12],
  ['Melee_Unarmed_Attack_Punch_A', 2.1, 0.15, 10, 'CROSS', 0.04, 0.15],
  ['Melee_Unarmed_Attack_Kick', 1.7, 0.2, 15, 'KICK', 0.08, 0.25],
];
function breakBreakable(b) {
  b.broken = true;
  burst(b.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 14, 0xc0a080, 3);
  sfx('hit3', 0.7, false, 1.2);
  streetGroup.remove(b.mesh);
  if (b.kind === 'cash') awardCash(rnd(5, 15), b.mesh.position.clone());
  else { player.hp = Math.min(player.maxHp, player.hp + 18); popText('+HP', 'gold', innerWidth / 2, innerHeight * 0.4); }
  setHud();
}
function doPunch() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  unlockAudio(); T.taps++; hint(false); save.seenHint = true;
  let ce = null;
  for (const e of enemies) { if (e.hp > 0 && e.windup > 0 && Math.abs(e.px - player.px) < 2.4 && Math.abs(e.pz - player.pz) < 1.3) { ce = e; break; } }
  const [clip, ts, delay, dmg, label, hs, sh] = ATK[atkIdx % ATK.length]; atkIdx++;
  const launcher = !ce && (atkIdx % 3 === 0);
  player.busy = delay + 0.12;
  playAnim(player, clip, { ts: ts * (player.spd || 1), fade: 0.05 });
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    if (ce && ce.hp > 0) { ce.windup = 0; hideWarn(ce); landHit(ce, Math.round(dmg * player.dmgMult * 2), 'COUNTER', 0.12, 0.35, false, true); return; }
    const t = nearestEnemy(1.9);
    if (t) {
      if (t.airborne) { t.vy = Math.max(t.vy, 2.2); landHit(t, Math.round(dmg * player.dmgMult * 0.6), 'JUGGLE', 0.03, 0.12, false, false); }
      else landHit(t, Math.round(dmg * player.dmgMult), label, hs, sh, launcher, false);
    }
    for (const b of breakables) { if (!b.broken && Math.abs(b.px - player.px) < 1.7 && Math.abs(b.pz - player.pz) < 1.2) breakBreakable(b); }
  }, delay * 1000);
}
function doHeavy() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  unlockAudio(); T.taps++; hint(false);
  player.busy = 0.5;
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.25, fade: 0.05 });
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    const t = nearestEnemy(2.2);
    if (t) landHit(t, Math.round(24 * player.dmgMult), 'HEAVY', 0.09, 0.4, false, false);
    for (const b of breakables) { if (!b.broken && Math.abs(b.px - player.px) < 1.9 && Math.abs(b.pz - player.pz) < 1.3) breakBreakable(b); }
  }, 230);
}
function doSpecial() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
  if (player.spc < 100) { popText('CHARGE THE METER', '', innerWidth / 2, innerHeight * 0.4); return; }
  unlockAudio();
  player.spc = 0;
  slowmo = 0.35; slowmoT = 0.8; shake = 0.6; flash('#ff4fd8');
  banner('DRAGON FURY!', 'spc');
  sfx('hit3', 1, false, 0.6); sfx('bell', 0.7, false, 0.8);
  burst(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 40, 0xff4fd8, 7);
  for (const e of enemies.slice()) {
    if (e.hp > 0 && Math.abs(e.px - player.px) < 3.6 && Math.abs(e.pz - player.pz) < 1.7) {
      landHit(e, Math.round(42 * player.dmgMult), 'SPECIAL', 0.1, 0.4, false, false);
    }
  }
  setHud();
}
function doDodge() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.dodgeCD > 0) return;
  unlockAudio();
  player.dodgeCD = 0.9; player.dodgeT = 0.35;
  const m = Math.hypot(stick.dx, stick.dy);
  if (m > 0.25) { player.dodgeDx = stick.dx / m; player.dodgeDz = stick.dy / m; }
  else { const t = nearestEnemy(99); player.dodgeDx = t && t.px < player.px ? 1 : -1; player.dodgeDz = 0; }
  playAnim(player, 'Running_A', { ts: 2.6 });
  ev('dodge', {});
}
function landHit(e, dmg, label, hs, sh, launcher, counter) {
  if (!e || e.hp <= 0 || state !== 'fight') return;
  T.hits++; if (counter) T.counters++;
  e.hp -= dmg; combo++; comboT = 1.2; maxCombo = Math.max(maxCombo, combo);
  if (player) player.spc = clamp(player.spc + 8, 0, 100);
  const head = e.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 0.78 * e.sc, 0.15));
  burst(head, counter ? 30 : 16, counter ? 0x7af0ff : 0xffd27a, counter ? 6 : 4);
  shake = sh; hitstop = hs; // snappy: tiny freeze on light hits, bigger only for counter/heavy/special/KO
  sfx(['hit1', 'hit2', 'hit3'][Math.floor(Math.random() * 3)], 0.9, false, 0.9 + Math.random() * 0.2);
  const sp = screenPos(head); popText((counter ? 'COUNTER! -' : '-') + dmg, counter ? 'big' : '', sp.x, sp.y - 30);
  if (counter) flash('#7af0ff');
  if (launcher && !e.boss) {
    e.airborne = true; e.vy = 5.2; e.ai = 'launched';
    playAnim(e, 'Hit_B', { ts: 1.2 });
    popText('LAUNCH!', 'spc', sp.x, sp.y - 60);
  } else if (!e.airborne) {
    playAnim(e, Math.random() < 0.5 ? 'Hit_A' : 'Hit_B', { ts: 1.4, fade: 0.04 });
  }
  if (e.hp <= 0) killEnemy(e);
  setHud();
}
function killEnemy(e) {
  T.kos++; ev('ko', { name: e.name });
  hideWarn(e);
  playAnim(e, 'Death_A', { ts: 0.8, clamp: true });
  if (e.boss) {
    slowmo = 0.3; slowmoT = 1.1; shake = 0.6; hitstop = 0.12; // boss KO = biggest moment
    $('bossWrap').style.display = 'none';
    banner('BOSS DOWN!');
  } else {
    slowmo = 0.35; slowmoT = 0.7; shake = 0.45; hitstop = 0.09;
  }
  sfx('bell', 0.8); flash('#ffffff');
  $('ko').classList.add('show'); setTimeout(() => $('ko').classList.remove('show'), 900);
  const base = e.boss ? 60 : 8 + Math.round(distWalked * 0.2);
  awardCash(base, e.root.position.clone());
  if (combo >= 5) awardCash(Math.min(combo, 20), e.root.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 'COMBO');
  if (mission.crowd) crowdCheer();
  if (player && player.hp > 0) {
    player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.06);
    player.spc = clamp(player.spc + 15, 0, 100);
  }
  setTimeout(() => {
    removeFighter(e);
    const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1);
    kills++; setHud(); checkMissionEnd();
  }, 1200);
  setHud();
}
function hurtPlayer(dmg) {
  if (!player || player.hp <= 0 || missionOver || ended) return;
  if (player.dodgeT > 0) return;
  player.hp -= dmg; combo = 0; shake = 0.3; hitstop = 0.05; flash('#ff2a2a'); sfx('hit2', 0.8, false, 0.7);
  player.spc = clamp(player.spc + 12, 0, 100);
  playAnim(player, 'Hit_A', { ts: 1.4 });
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 0.8, 0)));
  popText('-' + dmg, 'bad', sp.x, sp.y - 20);
  setHud();
  if (player.hp <= 0) {
    player.hp = 0; setHud();
    playAnim(player, 'Death_A', { clamp: true });
    missionOver = true;
    setTimeout(() => missionComplete(false), 1400);
  }
}
function nearMiss(e) {
  const bonus = Math.max(2, Math.round(6 * hustleMult()));
  cashRun += bonus;
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
  popText('NEAR MISS +$' + bonus, 'gold', sp.x, sp.y - 40);
  sfx('click', 0.8, false, 1.5); ev('nearmiss', {});
  setHud();
}

// ---------- input: left-half stick, right-half tap, buttons ----------
const stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
let showcaseDragX = null;
function stickStart(e) {
  stick.active = true; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = 0; stick.dy = 0;
  const s = $('stick'); s.style.display = 'block'; s.style.left = (stick.ox - 55) + 'px'; s.style.top = (stick.oy - 55) + 'px';
}
function stickMove(e) {
  if (!stick.active || e.pointerId !== stick.id) return;
  let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy;
  const m = Math.hypot(dx, dy), max = 44;
  if (m > max) { dx = dx / m * max; dy = dy / m * max; }
  stick.dx = dx / max; stick.dy = dy / max;
  $('stickKnob').style.transform = `translate(${dx}px,${dy}px)`;
}
function stickEnd(e) {
  if (stick.active && e && e.pointerId !== undefined && e.pointerId !== stick.id) return;
  stick.active = false; stick.id = null; stick.dx = 0; stick.dy = 0;
  $('stick').style.display = 'none'; $('stickKnob').style.transform = '';
}
function setupInput() {
  const bind = (id, fn) => $(id).addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); fn(); }, { passive: false });
  bind('btnAtk', doPunch); bind('btnHvy', doHeavy); bind('btnDdg', doDodge); bind('btnSpc', doSpecial);
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.abtn,button,.card,.skinDot,.shopItem,.mcard,.skinDot')) return;
    unlockAudio();
    if (state === 'title') { showSelect(); return; }
    if (state === 'select') { showcaseDragX = e.clientX; return; }
    if (state !== 'fight' || missionOver || ended) return;
    if (e.clientX < innerWidth * 0.45) stickStart(e);
    else doPunch();
  });
  document.addEventListener('pointermove', (e) => {
    if (state === 'select' && showcaseDragX !== null && showcase) {
      showcaseRot += (e.clientX - showcaseDragX) * 0.012; showcaseDragX = e.clientX;
    } else stickMove(e);
  });
  const up = (e) => { showcaseDragX = null; stickEnd(e); };
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', () => { showcaseDragX = null; stickEnd(); });
  $('fightBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('click', 0.8); showMission(); });
  $('againBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('click', 0.8); showMission(); });
  $('backBtn').addEventListener('click', (e) => { e.stopPropagation(); sfx('click', 0.8); showSelect(); });
  addEventListener('resize', resize);
}

// ---------- enemy AI ----------
let camX = 2;
function enemyAI(e, dt) {
  if (e.hp <= 0) return;
  if (e.airborne) { // launched / juggled
    e.vy -= 18 * dt; e.root.position.y += e.vy * dt;
    if (e.root.position.y <= 0) {
      e.root.position.y = 0; e.airborne = false; e.vy = 0;
      playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
      e.ai = 'recover'; e.aiT = 0.9;
    }
    return;
  }
  if (e.chargeT > 0) return; // handled in playerUpdate (bosses)
  const dx = player.px - e.px, dz = player.pz - e.pz;
  const adx = Math.abs(dx), adz = Math.abs(dz);
  if (e.boss) { bossAI(e, dt, dx, dz, adx, adz); return; }
  if (e.ai === 'walk') {
    const sp = e.spd;
    e.px += Math.sign(dx) * Math.min(adx, sp * dt);
    e.pz += Math.sign(dz) * Math.min(adz, sp * 0.8 * dt);
    // separation from other enemies
    for (const o of enemies) {
      if (o === e || o.hp <= 0) continue;
      const sx = e.px - o.px, sz = e.pz - o.pz, d = Math.hypot(sx, sz);
      if (d > 0.01 && d < 0.8) { e.px += sx / d * dt * 1.5; e.pz += sz / d * dt * 1.5; }
    }
    e.root.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
    e.aiT -= dt;
    if (adx < 1.35 && adz < 0.65 && e.aiT <= 0) {
      e.ai = 'windup';
      e.windup = e.move === 'flurry' ? 0.5 : 0.75;
      showWarn(e);
      playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
    }
  } else if (e.ai === 'windup') {
    e.windup -= dt;
    if (e.windup <= 0) { hideWarn(e); enemyStrike(e); e.ai = 'recover'; e.aiT = rnd(0.8, 1.7); }
  } else if (e.ai === 'recover') {
    e.aiT -= dt; if (e.aiT <= 0) { e.ai = 'walk'; playAnim(e, 'Running_A', { loop: true }); }
  }
  syncPos(e);
}
function enemyStrike(e) {
  if (e.hp <= 0 || state !== 'fight' || missionOver || ended) return;
  // HEAVY D PLUS sometimes charges instead of punching
  if (e.move === 'charge' && Math.random() < 0.35) {
    e.chargeT = 0.55; e.chargeDx = Math.sign(player.px - e.px) || 1; e.chargeHit = false;
    playAnim(e, 'Running_A', { ts: 2.2 }); sfx('hit2', 0.8, false, 0.7);
    return;
  }
  playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.6 });
  const hits = e.move === 'flurry' ? 2 : 1;
  for (let i = 0; i < hits; i++) {
    setTimeout(() => {
      if (!e || e.hp <= 0 || state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
      const dx = Math.abs(player.px - e.px), dz = Math.abs(player.pz - e.pz);
      if (dx < 1.7 && dz < 0.85) {
        if (player.dodgeT > 0) { nearMiss(e); return; }
        let dmg = Math.round(14 * e.dmgMult);
        if (e.move === 'knife') dmg = Math.round(dmg * 1.3);
        if (e.move === 'uppercut') dmg = Math.round(dmg * 1.25);
        hurtPlayer(dmg);
      }
    }, 260 + i * 240);
  }
}
// ---------- boss AI: telegraphed patterns ----------
function bossAI(e, dt, dx, dz, adx, adz) {
  if (e.ai === 'walk') {
    e.px += Math.sign(dx) * Math.min(adx, e.spd * dt);
    e.pz += Math.sign(dz) * Math.min(adz, e.spd * 0.8 * dt);
    e.root.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
    e.patT -= dt;
    if (e.patT <= 0 && adx < 6) startPattern(e);
  } else if (e.ai === 'windup') {
    e.windup -= dt;
    if (e.windup <= 0) { hideWarn(e); execPattern(e); }
  } else if (e.ai === 'recover') {
    e.aiT -= dt; if (e.aiT <= 0) { e.ai = 'walk'; e.patT = rnd(1.6, 2.6); playAnim(e, 'Running_A', { loop: true }); }
  }
  syncPos(e);
}
function startPattern(e) {
  const pat = e.boss.patterns[e.patIdx % e.boss.patterns.length]; e.patIdx++;
  e.pat = pat; e.ai = 'windup';
  playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
  if (pat === 'slam') { e.windup = 1.0; showWarn(e, 'GET BACK!'); }
  else if (pat === 'charge') { e.windup = 0.9; showWarn(e, '!'); }
  else if (pat === 'summon') { e.windup = 0.8; showWarn(e, '!'); }
  else if (pat === 'flurry') { e.windup = 0.6; showWarn(e, '!'); }
}
function execPattern(e) {
  const pat = e.pat, R = missionR;
  if (pat === 'slam') {
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.1 });
    burst(e.root.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 26, 0xff8c42, 6);
    shake = 0.5; hitstop = 0.06; sfx('hit3', 1);
    setTimeout(() => {
      if (!e || e.hp <= 0 || state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
      const dx = Math.abs(player.px - e.px), dz = Math.abs(player.pz - e.pz);
      if (dx < 2.5 && dz < 1.5) { if (player.dodgeT > 0) nearMiss(e); else hurtPlayer(Math.round(22 * e.dmgMult)); }
    }, 200);
  } else if (pat === 'charge') {
    e.chargeT = 0.7; e.chargeDx = Math.sign(player.px - e.px) || 1; e.chargeHit = false;
    playAnim(e, 'Running_A', { ts: 2.4 }); sfx('hit2', 0.9, false, 0.7);
  } else if (pat === 'summon') {
    const mi = missionIndex(mission);
    for (let i = 0; i < 2; i++) spawnEnemy(['thug', 'jabber'][Math.floor(R() * 2)], mi, e.px + rnd(2, 4), rnd(-1.2, 1.2));
    banner('MINIONS!');
  } else if (pat === 'flurry') {
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.4 });
    let n = 0;
    const iv = setInterval(() => {
      if (n++ >= 4 || !e || e.hp <= 0 || state !== 'fight' || missionOver || ended || !player || player.hp <= 0) { clearInterval(iv); return; }
      const dx = Math.abs(player.px - e.px), dz = Math.abs(player.pz - e.pz);
      if (dx < 1.9 && dz < 0.95) { if (player.dodgeT > 0) nearMiss(e); else hurtPlayer(Math.round(9 * e.dmgMult)); }
    }, 230);
  }
  e.ai = 'recover'; e.aiT = 1.3;
}
// ---------- spawn director ----------
function director(dt) {
  if (missionOver || ended) return;
  const mi = missionIndex(mission);
  if (mission.endless) {
    endlessT -= dt;
    if (endlessT <= 0) {
      endlessT = Math.max(1.6, 4 - distWalked * 0.006);
      if (enemies.length < 5) {
        const fams = ['thug', 'rico', 'jabber', 'heavyd'];
        const lv = Math.floor(distWalked / 25);
        const n = Math.min(4, 1 + Math.floor(distWalked / 45));
        for (let i = 0; i < n; i++) spawnEnemy(fams[Math.floor(missionR() * fams.length)], lv, player.px + 9 + i * 1.6, rnd(-1.2, 1.2));
      }
    }
  } else {
    for (const s of spawnQueue) {
      if (!s.done && player.px >= s.at - 11) {
        s.done = true;
        for (let i = 0; i < s.n; i++) spawnEnemy(s.fam, mi, player.px + 9 + i * 1.6, rnd(-1.2, 1.2));
      }
    }
    if (!bossSpawned && mission.boss && player.px >= mission.len - 11) {
      bossSpawned = true;
      spawnBoss(mission.boss, player.px + 9);
    }
  }
  distWalked = Math.max(distWalked, player.px - 2);
}
function checkMissionEnd() {
  if (ended || missionOver || mission.endless) return;
  if (bossSpawned && enemies.length === 0) missionComplete(true);
}
function missionComplete(win) {
  if (ended) return; ended = true; missionOver = true;
  $('touch').classList.remove('on');
  for (const e of enemies) hideWarn(e);
  const stats = { kills, maxCombo, cash: cashRun, dist: distWalked, waveBonus: 0 };
  if (win) {
    if (mission.endless) stats.waveBonus = Math.round(distWalked * 0.5);
    if (mission.daily) {
      const score = kills * 100 + maxCombo * 10 + Math.round(distWalked);
      if (save.daily.date !== todayStr() || score > save.daily.score) save.daily = { date: todayStr(), score };
      save.boards.daily = 'SCORE ' + save.daily.score;
    }
    const bk = mission.endless ? 'DIST ' + Math.round(distWalked) + 'm' : 'KOs ' + kills + ' · COMBO ' + maxCombo;
    const prev = save.boards[mission.id];
    if (!prev) save.boards[mission.id] = bk;
  } else if (mission.endless || mission.daily) {
    stats.dist = distWalked;
  }
  writeSave();
  setTimeout(() => showResults(win, mission, stats), win ? 1400 : 800);
}
// ---------- player movement ----------
function playerUpdate(dt) {
  const p = player;
  if (p.dodgeT > 0) p.dodgeT -= dt;
  if (p.dodgeCD > 0) p.dodgeCD -= dt;
  const spd = 4.4 * (p.spd || 1);
  let mx = stick.dx * spd, mz = stick.dy * spd;
  if (p.dodgeT > 0) { mx = p.dodgeDx * 10; mz = p.dodgeDz * 10; }
  const maxX = mission.len === Infinity ? 1e6 : mission.len - 1.5;
  p.px = clamp(p.px + mx * dt, 0.5, maxX);
  p.pz = clamp(p.pz + mz * dt, -1.4, 1.4);
  const tgt = nearestEnemy(99);
  if (tgt) p.root.rotation.y = tgt.px >= p.px ? Math.PI / 2 : -Math.PI / 2;
  else if (Math.abs(mx) > 0.4) p.root.rotation.y = mx > 0 ? Math.PI / 2 : -Math.PI / 2;
  const moving = Math.abs(mx) + Math.abs(mz) > 0.5;
  if (moving && !p.animMove && p.dodgeT <= 0 && p.busy <= 0) { p.animMove = true; playAnim(p, 'Running_A', { loop: true }); }
  if (!moving && p.animMove && p.dodgeT <= 0) { p.animMove = false; playAnim(p, 'Melee_Unarmed_Idle', { loop: true }); }
  syncPos(p);
  // charging enemies (boss charge / heavy-d-plus charge)
  for (const e of enemies) {
    if (e.chargeT > 0 && e.hp > 0) {
      e.px += e.chargeDx * 8 * dt; syncPos(e); e.chargeT -= dt;
      if (!e.chargeHit && Math.abs(e.px - p.px) < 1.15 && Math.abs(e.pz - p.pz) < 0.9) {
        e.chargeHit = true;
        if (p.dodgeT > 0) nearMiss(e); else hurtPlayer(Math.round(20 * e.dmgMult));
      }
      if (e.chargeT <= 0) { e.chargeHit = false; e.ai = 'recover'; e.aiT = 1.0; playAnim(e, 'Melee_Unarmed_Idle', { loop: true }); }
    }
  }
}
// ---------- HUD ----------
function setHud() {
  if (!player) return;
  const fd = fighterDef();
  $('php').style.width = Math.max(0, player.hp / player.maxHp * 100) + '%';
  $('pname').textContent = fd.name;
  const e = (bossRef && bossRef.hp > 0) ? bossRef : nearestEnemy(99);
  if (e) { $('ehp').style.width = Math.max(0, e.hp / e.maxHp * 100) + '%'; $('ename').textContent = e.name; }
  else { $('ehp').style.width = '0%'; $('ename').textContent = ''; }
  $('cash').textContent = 'CASH: $' + (save.cash + cashRun);
  $('combo').style.opacity = combo >= 2 ? 1 : 0;
  $('combo').textContent = combo + ' HIT COMBO';
  $('spc').style.width = clamp(player.spc, 0, 100) + '%';
  $('btnSpc').classList.toggle('ready', player.spc >= 100);
  const prog = mission && isFinite(mission.len) ? clamp(player.px / mission.len, 0, 1) : clamp(distWalked / 220, 0, 1);
  $('prog').style.width = (prog * 100) + '%';
  if (bossRef && bossRef.hp > 0) $('bossHp').style.width = Math.max(0, bossRef.hp / bossRef.maxHp * 100) + '%';
}
// ---------- layout ----------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = h > w ? 52 : 40;
  camera.updateProjectionMatrix();
}
// ---------- main loop ----------
const clock = new THREE.Clock();
let lowFx = false; const fpsAcc = [];
function loop() {
  requestAnimationFrame(loop);
  let dt = Math.min(clock.getDelta(), 0.05);
  if (paused) { renderer.render(scene, camera); return; }
  gameTime += dt;
  if (hitstop > 0) { hitstop -= dt; dt *= 0.05; }
  if (slowmoT > 0) { slowmoT -= dt; dt *= slowmo; }
  for (const f of fighters) { f.mixer.update(dt); if (f.busy > 0) f.busy -= dt; }

  if (state === 'select' || state === 'title') {
    if (showcase && state === 'select') {
      showcaseRot += dt * 0.5;
      showcase.root.rotation.y = showcaseRot;
      showcase.root.position.set(0, 0, 0);
    }
    camera.position.set(0, 1.5, 3.4);
    camera.lookAt(0, 0.8, 0);
  } else if (state === 'mission') {
    camera.position.set(6, 2.8, 8.5);
    camera.lookAt(6, 1.2, 0);
  } else if (state === 'fight' && player) {
    playerUpdate(dt);
    director(dt);
    for (const e of enemies.slice()) enemyAI(e, dt);
    for (const e of enemies) positionWarn(e);
    if (comboT > 0 && (comboT -= dt) <= 0) { combo = 0; setHud(); }
    if (gameTime > 2 && !save.seenHint) hint(false);
    camX += ((player.px + 0.8) - camX) * Math.min(1, dt * 5);
    camera.position.set(camX + (Math.random() - 0.5) * shake, 2.6 + (Math.random() - 0.5) * shake, 7.6);
    camera.lookAt(camX + 0.2, 1.25, 0);
    shake *= Math.pow(0.002, dt);
    lampL.position.x = camX - 2; lampR.position.x = camX + 4;
  }
  // crowd idle / cheer bounce
  for (const f of crowdMembers) {
    f.root.position.y = Math.abs(Math.sin(gameTime * 3 + f.phase)) * (f.cheerT > 0 ? 0.3 : 0.07);
    if (f.cheerT > 0) f.cheerT -= dt;
  }
  updateFx(dt);
  if (!lowFx && state === 'fight') {
    fpsAcc.push(clock.elapsedTime);
    if (fpsAcc.length > 40) {
      const span = fpsAcc[fpsAcc.length - 1] - fpsAcc[fpsAcc.length - 41]; fpsAcc.shift();
      if (span / 40 > 0.045) { lowFx = true; renderer.shadowMap.enabled = false; renderer.setPixelRatio(1); scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); ev('low_fx'); }
    }
  }
  renderer.render(scene, camera);
  T.state = state; T.frameMs = +(clock.elapsedTime * 0).toFixed(1); T.drawCalls = renderer.info.render.calls; T.tris = renderer.info.render.triangles;
}
// ---------- boot ----------
async function boot() {
  loadSave();
  const [fg, am, ag, amv, st] = await Promise.all(['fighter.glb', 'anim_melee.glb', 'anim_general.glb', 'anim_move.glb', 'street.glb'].map(parse));
  for (const g of [am, ag, amv]) for (const c of g.animations) clips[c.name] = c;
  fighterTemplate = fg.scene;
  const names = new Set(); fighterTemplate.traverse((o) => names.add(o.name));
  for (const c of Object.values(clips)) c.tracks = c.tracks.filter((t) => names.has(t.name.split('.')[0]));
  const box = new THREE.Box3().setFromObject(fighterTemplate); fighterHeight = box.max.y - box.min.y;
  const s = 1.8 / fighterHeight; fighterTemplate.scale.setScalar(s); fighterHeight = 1.8;
  streetParts = {}; st.scene.children.slice().forEach((c) => { streetParts[c.name] = c; });
  resize(); $('loading').style.display = 'none';
  T.state = 'ready'; ev('loaded');
  setupInput();
  showTitle();
  requestAnimationFrame(loop);
}
boot().catch((e) => { T.errors.push(String(e && e.stack || e)); console.error(e); });

// QA hook (test automation only — drives the real game systems, no mocks)
window.__cdtest = {
  startMission, state: () => state,
  tp: (x) => { if (player) player.px = x; },
  spawnBoss: (id) => { if (player) return spawnBoss(id || 'kingpin', player.px + 6); },
  hurt: (n) => { if (player) hurtPlayer(n); },
  info: () => ({ px: player ? +player.px.toFixed(1) : 0, hp: player ? Math.round(player.hp) : 0, foes: enemies.length, boss: bossRef ? Math.round(bossRef.hp) : 0, cash: cashRun, kills }),
};

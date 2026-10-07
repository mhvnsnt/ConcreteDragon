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
  best_wave: 0, selected: 'kidblue', skins: {}, tex: {},
  unlocked: ['kidblue', 'ghost', 'brick'], missionsDone: [],
  daily: { date: '', score: 0 }, boards: {}, seenHint: false,
  muted: false, quality: 'auto', difficulty: 'normal', circuitN: 0, blessings: [], rep: 0, goldCards: [],
};
const TIP_URL = 'https://paypal.me/MarquisWhitacre';
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && typeof s === 'object') for (const k of Object.keys(save)) if (k in s) save[k] = s[k];
  } catch (e) { /* fresh save */ }
  if (!save.skins || typeof save.skins !== 'object') save.skins = {};
  if (!save.tex || typeof save.tex !== 'object') save.tex = {};
  if (!Array.isArray(save.unlocked) || !save.unlocked.length) save.unlocked = ['kidblue', 'ghost', 'brick'];
  if (!Array.isArray(save.missionsDone)) save.missionsDone = [];
  if (!save.boards || typeof save.boards !== 'object') save.boards = {};
  if (!Array.isArray(save.blessings)) save.blessings = [];
  if (typeof save.rep !== 'number') save.rep = 0;
  if (!Array.isArray(save.goldCards)) save.goldCards = [];
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
const upCost = (lvl) => 100 * (lvl + 1);
const powerMult = () => 1 + save.up_power * 0.12;
const toughBonus = () => save.up_tough * 12;
const hustleMult = () => 1 + save.up_hustle * 0.15;

// ---------- data: roster (data-driven; unlock via missions/bosses) ----------
const FIGHTERS = [
  { id: 'kidblue', name: 'KID BLUE', tag: 'Balanced brawler. Big heart, bigger hands.', hp: 100, dmg: 1.0, spd: 1.0, unlock: { type: 'start' },
    spc2: { name: 'DRAGON RUSH', cost: 35, desc: 'Shoulder-first dash through the whole pack.' },
    qcf: { name: "DRAGON'S BREATH", sigkind: 'fireball', kind: 'fire', dmg: 30, speed: 9.5, color: 0xff7a2a, desc: 'Fireball', tag: 'Fireball projectile — 25 energy' },
    bfname: 'STREET DASH', duname: 'SKY UPPER',
    mega: { name: "DRAGON'S JUDGMENT" },
    fin: 'launch', finname: 'LAUNCHER', findesc: 'Pop-up finisher — juggle them in the air',
    moves: [
      ['STREET JAB', 'HIT', 'Quick jab. Chains into cross and kick.'],
      ['DRAGON LUNGE', '→ + HIT', 'Dash punch. Closes distance fast.'],
      ['DRAGON BACKFIST', '← + HIT', 'Step back, spinning backfist with knockback.'],
      ['DRAGON SWEEP', '↓ + HIT', 'Sweep the legs — launches for juggles.'],
      ['DRAGON HOOK', 'HVY', 'Slow, crushing hook. Big damage.'],
      ['DRAGON DROP', 'JUMP, then HIT', 'Aerial dive kick. Hits on the way down.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['DRAGON RUSH', '↓ + SPC (50 meter)', 'Shoulder dash straight through the pack.'],
    ] },
  { id: 'ghost', name: 'GHOST', tag: 'Fast striker. Blink and you lose.', hp: 85, dmg: 0.9, spd: 1.25, unlock: { type: 'start' },
    spc2: { name: 'BLINK FLURRY', cost: 35, desc: 'Blink between the 3 nearest enemies, striking each.' },
    qcf: { name: 'PHANTOM STEP', sigkind: 'teleport', dmg: 36, color: 0x9a7bff, desc: 'Blink behind the nearest enemy and strike', tag: 'Teleport strike — 25 energy' },
    bfname: 'PHASE STEP', duname: 'WRAITH RISE',
    mega: { name: 'MIDNIGHT REQUIEM' },
    fin: 'blink', finname: 'BLINK STRIKE', findesc: 'Teleports behind — the unseen finisher',
    moves: [
      ['PHANTOM JAB', 'HIT', 'Fastest jab in the game. Chains into cross and kick.'],
      ['BLINK STEP', '→ + HIT', 'Blink-step punch. Closes distance instantly.'],
      ['WRAITH FADE', '← + HIT', 'Fade back, snapping backfist.'],
      ['ANKLE BITER', '↓ + HIT', 'Ankle sweep — launches for juggles.'],
      ['WRAITH HOOK', 'HVY', 'Charged hook. Big damage.'],
      ['GHOST DROP', 'JUMP, then HIT', 'Aerial dive kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['BLINK FLURRY', '↓ + SPC (50 meter)', 'Blink between the 3 nearest enemies.'],
    ] },
  { id: 'brick', name: 'BRICK', tag: 'Walking wall. Hits like rent day.', hp: 135, dmg: 1.25, spd: 0.85, unlock: { type: 'start' },
    spc2: { name: 'SEISMIC SLAM', cost: 35, desc: 'Ground pound: shockwave launches everyone near.' },
    qcf: { name: 'RENT COLLECTION', sigkind: 'grab', dmg: 46, color: 0xffb02e, desc: 'Command grab — yank and slam', tag: 'Command grab — 25 energy' },
    bfname: 'PAVEMENT RUSH', duname: 'HIGH-RISE',
    mega: { name: 'RENT DUE' },
    fin: 'slam', finname: 'CURB STOMP', findesc: 'AOE slam — shakes the whole block',
    moves: [
      ['CONCRETE JAB', 'HIT', 'Heavy jab. Chains into cross and kick.'],
      ['BULLDOZER', '→ + HIT', 'Bulldozer dash punch.'],
      ['WRECKING BACKFIST', '← + HIT', 'Step back, wrecking-ball backfist.'],
      ['TREE-TRUNK SWEEP', '↓ + HIT', 'Tree-trunk sweep — launches for juggles.'],
      ['RENT COLLECTOR', 'HVY', 'The rent collector. Huge damage.'],
      ['CURB DROP', 'JUMP, then HIT', 'Aerial drop kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['SEISMIC SLAM', '↓ + SPC (50 meter)', 'Ground pound launches everyone nearby.'],
    ] },
  { id: 'kingpin', name: 'KINGPIN', tag: 'Used to run this block. Now he runs with you.', hp: 150, dmg: 1.3, spd: 0.9, unlock: { type: 'boss', boss: 'kingpin' },
    spc2: { name: "KINGPIN'S WRATH", cost: 35, desc: 'Royal beatdown: massive AOE around him.' },
    qcf: { name: 'ROYAL DECREE', sigkind: 'orb', kind: 'orb', dmg: 40, speed: 5, color: 0xffd166, desc: 'Slow explosive orb', tag: 'Explosive orb — 25 energy' },
    bfname: 'HOSTILE MARCH', duname: 'THRONE RISE',
    mega: { name: 'HOSTILE TAKEOVER' },
    fin: 'gavel', finname: 'GAVEL DROP', findesc: 'Heavy single hit — long hit-stop',
    moves: [
      ['BOSS JAB', 'HIT', 'Boss-grade jab. Chains into cross and kick.'],
      ['POWER MARCH', '→ + HIT', 'Power dash punch.'],
      ['ROYAL BACKHAND', '← + HIT', 'Step back, royal backhand.'],
      ['CANE SWEEP', '↓ + HIT', 'Cane sweep — launches for juggles.'],
      ['THE GAVEL', 'HVY', 'The gavel. Enormous damage.'],
      ['THRONE STOMP', 'JUMP, then HIT', 'Aerial stomp kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ["KINGPIN'S WRATH", '↓ + SPC (50 meter)', 'Massive shockwave around him.'],
    ] },
  { id: 'sledge', name: 'SLEDGE', tag: 'Yard enforcer. Swings first, talks never.', hp: 165, dmg: 1.45, spd: 0.8, unlock: { type: 'boss', boss: 'sledge' },
    spc2: { name: 'WRECKING SWING', cost: 35, desc: '360° swing that clears the whole circle.' },
    qcf: { name: 'IRON CYCLONE', sigkind: 'spin', dmg: 16, color: 0x80ed99, desc: 'Traveling spin — multi-hit', tag: 'Traveling spin — 25 energy' },
    bfname: 'WRECKING RUSH', duname: 'CRANE UPPER',
    mega: { name: 'DEMOLITION DAY' },
    fin: 'demo', finname: 'DEMOLITION', findesc: 'Far knockback — total wreckage',
    moves: [
      ['SLEDGE JAB', 'HIT', 'Sledgehammer jab. Chains into cross and kick.'],
      ['TACKLE CHARGE', '→ + HIT', 'Charging shoulder tackle.'],
      ['YARD SWING', '← + HIT', 'Step back, wrecking swing.'],
      ['DEMOLITION SWEEP', '↓ + HIT', 'Demolition sweep — launches for juggles.'],
      ['FULL SLEDGE', 'HVY', 'Full sledge. Devastating.'],
      ['WRECKING DROP', 'JUMP, then HIT', 'Aerial demolition kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['WRECKING SWING', '↓ + SPC (50 meter)', '360° swing clears the whole circle.'],
    ] },
  { id: 'viper', name: 'VIPER', tag: 'Fast hands, faster mouth.', hp: 95, dmg: 1.05, spd: 1.35, unlock: { type: 'boss', boss: 'viper' },
    spc2: { name: 'VENOM DASH', cost: 35, desc: 'Serpent dash: strikes everything in a line.' },
    qcf: { name: "SERPENT'S WAKE", sigkind: 'groundwave', kind: 'fangwave', dmg: 26, speed: 9, color: 0x7cff6b, desc: 'Ground fang wave', tag: 'Ground fang wave — 25 energy' },
    bfname: 'SERPENT DASH', duname: 'COIL SPRING',
    mega: { name: "SERPENT'S COIL" },
    fin: 'dot', finname: 'FANG BARB', findesc: 'Venom keeps chewing — damage over time',
    moves: [
      ['FANG FLICKER', 'HIT', 'Flicker jab. Chains into cross and kick.'],
      ['SERPENT STRIKE', '→ + HIT', 'Serpent strike dash.'],
      ['SLITHER BACK', '← + HIT', 'Slither back, snapping strike.'],
      ['TAIL SWEEP', '↓ + HIT', 'Tail sweep — launches for juggles.'],
      ['THE FANG', 'HVY', 'The fang. Big damage.'],
      ['VIPER DROP', 'JUMP, then HIT', 'Aerial fang kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['VENOM DASH', '↓ + SPC (50 meter)', 'Dash in a line, striking everything.'],
    ] },
  { id: 'dust', name: 'DUST', tag: 'Quick hands. Gone before you blink.', hp: 80, dmg: 0.95, spd: 1.4, unlock: { type: 'boss', boss: 'rust' },
    spc2: { name: 'DUST DEVIL', cost: 35, desc: 'Spin into the pack: AOE hits while moving.' },
    qcf: { name: 'DESERT SPIKES', sigkind: 'erupt', dmg: 30, color: 0xd8b56b, desc: 'Spikes erupt under nearby enemies', tag: 'Ground eruption — 25 energy' },
    bfname: 'DUST RUSH', duname: 'HABOOB RISE',
    mega: { name: 'DUST BOWL' },
    fin: 'cyclone', finname: 'CYCLONE LIFT', findesc: 'Extended air — juggle them longer',
    moves: [
      ['DUST JAB', 'HIT', 'Fastest hands on the block. Chains into cross and kick.'],
      ['SMOKE STEP', '→ + HIT', 'Dust-step punch. Closes distance like smoke.'],
      ['WHIP BACKFIST', '← + HIT', 'Slip back, whipping backfist.'],
      ['DUST-CLOUD SWEEP', '↓ + HIT', 'Dust-cloud sweep — launches for juggles.'],
      ['STORM BACKHAND', 'HVY', 'The backhand of the storm. Big damage.'],
      ['CYCLONE KICK', 'JUMP, then HIT', 'Aerial cyclone kick.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['DUST DEVIL', '↓ + SPC (50 meter)', 'Spinning AOE that travels through the pack.'],
    ] },
  { id: 'jack', name: 'JACK', tag: 'He wears the harvest. The harvest wears you.', hp: 95, dmg: 1.05, spd: 1.05,
    unlock: { type: 'boss', boss: 'pumpkinking' }, head: 'pumpkin', tint: 0xe07b1f,
    spc2: { name: 'CANDLE RUSH', cost: 35, desc: 'Burning dash: leaves a fire trail through the pack.' },
    qcf: { name: 'PUMPKIN BOMB', sigkind: 'fireball', kind: 'fire', dmg: 34, speed: 8, color: 0xff7a1a, arc: 1, desc: 'Lobbed flaming pumpkin', tag: 'Lobbed pumpkin bomb — 25 energy' },
    bfname: 'PATCH SPRINT', duname: 'SCARECROW RISE',
    mega: { name: 'GREAT PUMPKIN' },
    fin: 'launch', finname: 'PORCH STOMP', findesc: 'Curb stomp with a burning grin',
    moves: [
      ['PATCH JAB', 'HIT', 'Quick vine jab. Chains into cross and kick.'],
      ['VINE LUNGE', '→ + HIT', 'Vine-whip lunge punch. Closes distance fast.'],
      ['HAYMAKER', '← + HIT', 'Step back, haymaker backfist with knockback.'],
      ['ROOT SWEEP', '↓ + HIT', 'Root sweep — launches for juggles.'],
      ['GOURD CRUSHER', 'HVY', 'Overhead gourd crusher. Big damage.'],
      ['HARVEST DROP', 'JUMP, then HIT', 'Aerial harvest drop kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['CANDLE RUSH', '↓ + SPC (50 meter)', 'Burning dash through the pack.'],
    ] },
];
// ---------- fighting-game move sets: motion inputs + energy costs per fighter ----------
for (const f of FIGHTERS) {
  for (const m of f.moves) {
    if (m[0] === 'DRAGON FURY') m[2] = '60 energy: screen-filling spin blast';
    else if (m[1].startsWith('↓ + SPC')) m[1] = '↓ + SPC (35 energy)';
    else if (m[0] === 'TAUNT') m[2] = 'Talk trash, gain energy.';
  }
  f.moves.push(
    ['↓→ + HIT', f.qcf.name, f.qcf.desc + ' — ' + f.qcf.tag],
    ['←→ + HIT', f.bfname, 'Dash-through strike — 25 energy'],
    ['↓↑ + HIT', f.duname, 'Rising launcher — 25 energy'],
    ['↑↑↓←→ + SPC', f.mega.name, 'MEGA SUPER — needs FULL energy. Cinematic.'],
    ['4TH HIT', f.finname, f.findesc],
  );
}
const DIFFS = [
  { id: 'rookie', name: 'ROOKIE', hpMul: 0.55, dmgMul: 0.55, aggro: 0.55, desc: 'Learn the streets.' },
  { id: 'street', name: 'STREET', hpMul: 0.8, dmgMul: 0.8, aggro: 0.8, desc: 'A fair fight.' },
  { id: 'normal', name: 'NORMAL', hpMul: 1.0, dmgMul: 1.0, aggro: 1.0, desc: 'The real game.' },
  { id: 'hard', name: 'HARD', hpMul: 1.45, dmgMul: 1.35, aggro: 1.3, desc: 'They hit back harder.' },
  { id: 'brutal', name: 'BRUTAL', hpMul: 2.0, dmgMul: 1.8, aggro: 1.6, desc: 'No mercy out here.' },
];
const diffDef = () => DIFFS.find((d) => d.id === save.difficulty) || DIFFS[2];
// ---------- REP TIERS (owner 2026-10-06, Brotato Danger-inspired): post-game ladder ----------
// Unlock by clearing RUST BELT (m4). REP 1-5: meaner streets, better payouts.
// Per-fighter gold cards for clearing REP 5 bosses — style prestige, zero power.
const REP_MAX = 5;
const repUnlocked = () => save.missionsDone.includes('m4');
const repMult = () => { const r = save.rep || 0; return { hp: 1 + r * 0.3, dmg: 1 + r * 0.18, cash: 1 + r * 0.35 }; };
const effDiff = () => {
  const d = diffDef(), r = repMult();
  return { hpMul: d.hpMul * r.hp, dmgMul: d.dmgMul * r.dmg, aggro: d.aggro };
};
const SKINS = { // style only — zero power. New packs drop in here.
  kidblue: [{ id: 'street', name: 'Street Blue', tint: 0x4fd1ff }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'gold', name: 'Champion Gold', tint: 0xffd166 }],
  ghost: [{ id: 'street', name: 'Ghost Mint', tint: 0x4dff88 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'volt', name: 'Volt', tint: 0x7af0ff }],
  brick: [{ id: 'street', name: 'Brick', tint: 0xff8c42 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'blood', name: 'Bloodline', tint: 0xc1121f }],
  kingpin: [{ id: 'street', name: 'Boss Gold', tint: 0xffb03d }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }],
  sledge: [{ id: 'street', name: 'Yard Rust', tint: 0xb3541e }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }],
  viper: [{ id: 'street', name: 'Viper Green', tint: 0x39d353 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }],
  dust: [{ id: 'street', name: 'Dust Grey', tint: 0xb8b0a0 }, { id: 'noir', name: 'Noir', tint: 0x2b2b38 }, { id: 'storm', name: 'Storm Dust', tint: 0x8a7f6a }],
};
// Supporter packs: cosmetic-only, purchasable on itch.io (PWYW). In-game: preview only.
const SUPPORT_PACKS = [
  { id: 'kings', name: 'SEASON 1: CONCRETE KINGS', desc: '5 royal tints. Style only, never power.', price: 'PWYW on itch.io' },
];
// ---------- texture variants: tint x texture, chosen independently (owner 2026-10-06) ----------
// Future custom textures (part packs etc.) drop in here: { id, name, file } or { id, name, embedded: true }.
const TEXVARIANTS = [
  { id: 'patchwork', name: 'PATCHWORK', file: 'tex-patchwork.png', desc: 'Signature painted pieces' },
  { id: 'original', name: 'KAYKIT ORIGINAL', embedded: true, desc: 'Stock mannequin texture' },
];
const texObjs = {}; // id -> THREE.Texture (filled at boot)
const texVar = (fid) => {
  const v = (save.tex && save.tex[fid]) || 'patchwork';
  return TEXVARIANTS.find((t) => t.id === v) || TEXVARIANTS[0];
};
const texObj = (fid) => texObjs[texVar(fid).id] || texObjs.patchwork || null;
function loadTexVariants() {
  // returns a promise; resolves when the patchwork PNG is decoded
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      texObjs.patchwork = t;
      res();
    };
    img.onerror = () => res();
    img.src = 'data:image/png;base64,' + A['tex-patchwork.png'];
  });
}
const UPS = [
  { key: 'up_power', name: 'POWER', desc: '+12% damage' },
  { key: 'up_tough', name: 'TOUGH', desc: '+12 max HP' },
  { key: 'up_hustle', name: 'HUSTLE', desc: '+15% cash' },
];
const fighterDef = (id) => FIGHTERS.find((f) => f.id === (id || save.selected)) || FIGHTERS[0];
const skinTint = (fid) => {
  const sv = save.skins[fid];
  if (typeof sv === 'string' && sv.startsWith('custom:')) return parseInt(sv.slice(7), 16);
  const list = SKINS[fid] || SKINS.kidblue;
  const s = list.find((x) => x.id === sv) || list[0];
  return s.tint;
};
const isUnlocked = (f) => save.unlocked.includes(f.id);
function moveListHTML(fid) {
  const f = fighterDef(fid);
  return (f.moves || []).map(([n, i, d]) =>
    `<div class="mvrow"><span class="mn">${n}</span><span class="mi">${i}</span><span class="md">${d}</span></div>`).join('');
}
function unlockText(f) {
  if (f.unlock.type === 'start') return '';
  if (f.unlock.type === 'boss') { const b = bossDef(f.unlock.boss); return 'BEAT ' + (b ? b.name : 'THE BOSS') + ' TO UNLOCK'; }
  return 'CLEAR MISSIONS TO UNLOCK';
}

// ---------- data: enemy families + variants (SoR2 system: variants gain moves/gear) ----------
const ENEMY_FAMS = [
  { id: 'thug', name: 'STREET THUG', tint: 0xff5a5a, hp: 70, dmg: 1.0, scale: 1.0, spd: 1.6,
    sig: { id: 'curbcheck', name: 'CURB CHECK', chance: 0.22 },
    variants: [
      { at: 0 },
      { at: 2, name: 'THUG BRUISER', tint: 0xd43d3d, hpMul: 1.6, scaleMul: 1.12, move: 'uppercut' },
      { at: 4, name: 'THUG KNIFE', tint: 0xff7a7a, dmgMul: 1.4, move: 'knife' },
    ] },
  { id: 'rico', name: 'BIG RICO', tint: 0x9a6bff, hp: 100, dmg: 1.1, scale: 1.15, spd: 1.4,
    sig: { id: 'debtcollector', name: 'DEBT COLLECTOR', chance: 0.22 },
    variants: [
      { at: 0 },
      { at: 3, name: 'RICO ENFORCER', tint: 0x7a4de0, hpMul: 1.5, dmgMul: 1.2, move: 'slam' },
    ] },
  { id: 'jabber', name: 'JABBER', tint: 0x7af0ff, hp: 60, dmg: 0.9, scale: 0.95, spd: 2.2,
    sig: { id: 'hundredhands', name: 'HUNDRED HANDS', chance: 0.25 },
    variants: [
      { at: 0 },
      { at: 3, name: 'JABBER SWIFT', tint: 0x4dd2ff, spdMul: 1.4, move: 'flurry' },
    ] },
  { id: 'heavyd', name: 'HEAVY D', tint: 0xff8c42, hp: 105, dmg: 1.2, scale: 1.18, spd: 1.2,
    sig: { id: 'freighttrain', name: 'FREIGHT TRAIN', chance: 0.25 },
    variants: [
      { at: 0 },
      { at: 4, name: 'HEAVY D PLUS', tint: 0xe06a1e, hpMul: 1.7, scaleMul: 1.1, move: 'charge' },
    ] },
  { id: 'stray', name: 'STRAY', tint: 0x9a9a8a, hp: 55, dmg: 0.85, scale: 0.9, spd: 2.6,
    sig: { id: 'shivrain', name: 'SHIV RAIN', chance: 0.24 },
    variants: [
      { at: 0 },
      { at: 3, name: 'STRAY SWIFT', tint: 0x7a7a6a, spdMul: 1.5, move: 'flurry' },
      { at: 5, name: 'STRAY SHIV', tint: 0xb8b89a, dmgMul: 1.5, move: 'knife' },
    ] },
  { id: 'pumpkin', name: 'JACK', tint: 0xe07b1f, hp: 75, dmg: 1.0, scale: 1.0, spd: 1.7, head: 'pumpkin',
    sig: { id: 'harvestmoon', name: 'HARVEST MOON', chance: 0.24 },
    variants: [
      { at: 0 },
      { at: 3, name: 'JACK BRUISER', tint: 0xc45f10, hpMul: 1.6, scaleMul: 1.12, move: 'uppercut' },
    ] },
  { id: 'zombie', name: 'ROTTEN', tint: 0x7a9a5a, hp: 85, dmg: 1.0, scale: 1.0, spd: 1.3, creature: 'zombie',
    sig: { id: 'gravebite', name: 'GRAVEBITE', chance: 0.24 },
    variants: [
      { at: 0 },
      { at: 3, name: 'ROTTEN HORDE', tint: 0x5a7a42, hpMul: 1.5, dmgMul: 1.2, move: 'flurry' },
    ] },
  { id: 'demon', name: 'HELLION', tint: 0xc12a2a, hp: 110, dmg: 1.25, scale: 1.0, spd: 1.6, creature: 'demon',
    sig: { id: 'hellfirearc', name: 'HELLFIRE ARC', chance: 0.26 },
    variants: [
      { at: 0 },
      { at: 4, name: 'HELLION BRUTE', tint: 0x8a1a1a, hpMul: 1.7, scaleMul: 1.12, move: 'slam' },
    ] },
  { id: 'spider', name: 'WEAVER', tint: 0x3a3a4a, hp: 65, dmg: 0.9, scale: 1.25, spd: 2.8, creature: 'spider',
    sig: { id: 'websnare', name: 'WEB SNARE', chance: 0.26 },
    variants: [
      { at: 0 },
      { at: 4, name: 'WEAVER BROODMOTHER', tint: 0x1a1a26, hpMul: 2.2, scaleMul: 1.35, dmgMul: 1.3, move: 'flurry' },
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
    sig: { id: 'kingsdecree', name: "KING'S DECREE" },
    intro: 'HE RUNS THIS BLOCK' },
  { id: 'sledge', name: 'SLEDGE', tint: 0xb3541e, hp: 560, dmg: 1.5, scale: 1.45, spd: 1.3,
    patterns: ['slam', 'slam', 'charge'], unlockFighter: 'sledge',
    sig: { id: 'wreckingball', name: 'WRECKING BALL' },
    intro: 'THE YARD ENFORCER' },
  { id: 'viper', name: 'VIPER', tint: 0x39d353, hp: 380, dmg: 1.15, scale: 1.05, spd: 2.4,
    patterns: ['flurry', 'charge', 'summon'], unlockFighter: 'viper',
    sig: { id: 'serpentsembrace', name: "SERPENT'S EMBRACE" },
    intro: 'FAST HANDS, FASTER MOUTH' },
  { id: 'rust', name: 'RUST', tint: 0xc0c9d6, hp: 640, dmg: 1.55, scale: 1.5, spd: 1.25,
    patterns: ['slam', 'charge', 'summon'], unlockFighter: 'dust',
    sig: { id: 'ruststorm', name: 'RUST STORM' },
    intro: 'THE RUST GIANT' },
  { id: 'dragon', name: 'THE CONCRETE DRAGON', tint: 0xff4d00, hp: 950, dmg: 1.7, scale: 1.0, spd: 1.4, creature: 'dragon',
    patterns: ['slam', 'charge', 'summon'], unlockSkin: { fighter: 'kidblue', id: 'dragonfire', name: 'Dragon Fire', tint: 0xff4d00 },
    sig: { id: 'dragonsmaw', name: "DRAGON'S MAW" },
    intro: 'THE NAMESAKE' },
  { id: 'pumpkinking', name: 'THE PUMPKIN KING', tint: 0xe07b1f, hp: 520, dmg: 1.4, scale: 1.4, spd: 1.4, head: 'pumpkin',
    patterns: ['slam', 'flurry', 'summon'], unlockFighter: 'jack',
    unlockSkin: { fighter: 'brick', id: 'harvest', name: 'Harvest', tint: 0xe07b1f },
    sig: { id: 'pumpkingslam', name: 'ROYAL HARVEST' },
    intro: 'HE WEARS THE HARVEST' },
];

// ---------- data: districts (per-district palettes — owner's art rule) ----------
const DISTRICTS = [
  { id: 'neon', name: 'NEON ROW', sky: 0x150f2a, fog: [0x150f2a, 9, 26], hemi: [0x8fa8ff, 0x2a1830, 1.25],
    moon: [0xbfd0ff, 1.4], rim: [0xff4fd8, 1.6], lampA: 0xffa64d, lampB: 0x4de1ff, ground: 0x2a2438, sw: ['#4fd1ff', '#ff4fd8'] },
  { id: 'yards', name: 'THE YARDS', sky: 0x1c0f06, fog: [0x1c0f06, 8, 24], hemi: [0xffb37a, 0x2a1408, 1.15],
    moon: [0xffd9a0, 1.2], rim: [0xff6a00, 1.5], lampA: 0xff8c42, lampB: 0xffb03d, ground: 0x33241a, sw: ['#ff8c42', '#ffb03d'] },
  { id: 'havana', name: 'LITTLE HAVANA', sky: 0x0f1a2a, fog: [0x0f1a2a, 9, 26], hemi: [0x7af0ff, 0x0a1a2a, 1.2],
    moon: [0x9fd8ff, 1.3], rim: [0x2affd5, 1.4], lampA: 0xffd166, lampB: 0x2affd5, ground: 0x1a2a30, sw: ['#ffd166', '#2affd5'] },
  { id: 'docks', name: 'DOCKSIDE', sky: 0x10141c, fog: [0x10141c, 8, 24], hemi: [0x9fb3c8, 0x0c1218, 1.1],
    moon: [0xc8d8e8, 1.2], rim: [0x5a8aa8, 1.5], lampA: 0xffc46a, lampB: 0x5a8aa8, ground: 0x232a30, sw: ['#8a9a9e', '#5a8aa8'] },
  { id: 'graveyard', name: "DEAD MAN'S ROW", sky: 0x0a0a16, fog: [0x0a0a16, 7, 22], hemi: [0x7a6ab0, 0x0a0a16, 1.0],
    moon: [0xc8b8ff, 1.1], rim: [0x9a4dff, 1.4], lampA: 0xff8c2a, lampB: 0x9a4dff, ground: 0x1a1a26, sw: ['#9a4dff', '#ff8c2a'] },
];
const districtDef = (id) => DISTRICTS.find((d) => d.id === id) || DISTRICTS[0];

// ---------- data: zones (mission arcs — owner 2026-10-06) ----------
// A zone = several missions ending with a boss. Missions keep flat defs;
// `zone` groups them under a zone header in the select screen.
const ZONES = [
  { id: 'z1', name: 'ZONE 1 — CONCRETE ORIGINS', card: 'Where it all started. Four blocks, four lessons.', unlock: { type: 'start' } },
  { id: 'z2', name: 'ZONE 2 — DEAD OF NIGHT', card: 'The graveyard shift. Things walk that should not.', unlock: { type: 'mission', id: 'm2' } },
  { id: 'zx', name: 'SIDE HUSTLES', card: 'Endless scraps, daily grinds, infinite road.', unlock: { type: 'start' } },
];
const zoneDef = (id) => ZONES.find((z) => z.id === id) || ZONES[0];
const zoneUnlocked = (z) => {
  if (z.unlock.type === 'start') return true;
  return save.missionsDone.includes(z.unlock.id);
};
// ---------- SEASONAL EVENTS (owner 2026-10-06): Halloween first ----------
// Themed missions + unlockables; seasonal fighters bleed into the base game.
// Future seasons (Christmas etc.) drop in as new SEASONS entries.
const SEASONS = [
  { id: 'halloween', name: 'HALLOWEEN', months: [9], // October
    tag: '🎃 HALLOWEEN EVENT', fams: ['zombie', 'pumpkin', 'spider', 'demon'],
    card: 'The dead walk the block. Hunt them for exclusive unlocks.' },
];
function activeSeason() {
  if (window.__cdSeason) return SEASONS.find((s) => s.id === window.__cdSeason) || null; // test hook
  const mo = new Date().getMonth();
  return SEASONS.find((s) => s.months.includes(mo)) || null;
}
// ---------- INFINITE BOSSES (owner 2026-10-06): data-driven boss generation ----------
// procBoss(n) scales a base boss template into an endless challenger.
// mission.boss can be 'pb12' etc.; bossDef() resolves both static and generated.
const PB_TITLES = ['NIGHTMARE', 'IRON', 'BLOOD', 'RUSTED', 'HOWLING', 'VENOM', 'ASHEN', 'BRASS', 'HOLLOW', 'SAVAGE', 'CRIMSON', 'OBSIDIAN'];
function procBoss(n) {
  const R = seedPRNG(n * 104729 + 7);
  const bases = ['kingpin', 'sledge', 'viper', 'rust', 'dragon', 'pumpkinking'];
  const b0 = BOSSES.find((x) => x.id === bases[Math.floor(R() * bases.length)]);
  const title = PB_TITLES[Math.floor(R() * PB_TITLES.length)];
  return Object.assign({}, b0, {
    id: 'pb' + n, name: title + ' ' + b0.name,
    hp: Math.round(b0.hp * (1 + n * 0.25)), dmg: b0.dmg + n * 0.05,
    scale: b0.scale * (1 + Math.min(0.3, n * 0.015)),
    proc: true, intro: 'ENDLESS CHALLENGER #' + (n + 1),
  });
}
const procBossCache = {};
function bossDef(id) {
  let b = BOSSES.find((x) => x.id === id);
  if (!b && id && typeof id === 'string' && id.startsWith('pb')) {
    const n = parseInt(id.slice(2), 10) || 0;
    if (!procBossCache[id]) procBossCache[id] = procBoss(n);
    b = procBossCache[id];
  }
  return b;
}
// ---------- data: missions (district = mission set; walk -> waves -> boss arena) ----------
// spawns: {at: worldX, fam: familyId, n: count}
const MISSIONS = [
  { id: 'm1', zone: 'z1', district: 'neon', name: 'FIRST BLOOD', len: 55, crowd: false,
    spawns: [{ at: 10, fam: 'thug', n: 2 }, { at: 22, fam: 'thug', n: 2 }, { at: 34, fam: 'rico', n: 2 }, { at: 44, fam: 'jabber', n: 2 }],
    card: 'The block talks. Make it listen.', boss: 'kingpin', unlock: { type: 'start' }, reward: 'Unlocks KINGPIN as playable' },
  { id: 'm2', zone: 'z1', district: 'yards', name: 'SCRAP YARD', len: 70, crowd: true,
    spawns: [{ at: 10, fam: 'thug', n: 2 }, { at: 24, fam: 'heavyd', n: 2 }, { at: 38, fam: 'rico', n: 3 }, { at: 52, fam: 'jabber', n: 3 }],
    card: 'Rust, rails, and bad intentions.', boss: 'sledge', unlock: { type: 'mission', id: 'm1' }, reward: 'Unlocks SLEDGE as playable' },
  { id: 'm3', zone: 'z1', district: 'havana', name: 'NIGHT MARKET', len: 85, crowd: true,
    spawns: [{ at: 10, fam: 'jabber', n: 3 }, { at: 26, fam: 'thug', n: 3 }, { at: 42, fam: 'rico', n: 3 }, { at: 58, fam: 'heavyd', n: 3 }, { at: 70, fam: 'thug', n: 4 }],
    card: 'The heat never left this street.', boss: 'viper', unlock: { type: 'mission', id: 'm2' }, reward: 'Unlocks VIPER as playable' },
  { id: 'm4', zone: 'z1', district: 'docks', name: 'RUST BELT', len: 100, crowd: true,
    spawns: [{ at: 12, fam: 'stray', n: 3 }, { at: 28, fam: 'heavyd', n: 2 }, { at: 44, fam: 'stray', n: 4 }, { at: 60, fam: 'rico', n: 3 }, { at: 78, fam: 'stray', n: 4 }, { at: 90, fam: 'heavyd', n: 2 }],
    card: 'Everything here is for sale. Even kings.', boss: 'rust', unlock: { type: 'mission', id: 'm3' }, reward: 'Unlocks DUST as playable' },
  { id: 'h1', zone: 'z2', district: 'graveyard', name: 'GRAVEYARD SHIFT', len: 60, crowd: false,
    spawns: [{ at: 10, fam: 'zombie', n: 2 }, { at: 24, fam: 'pumpkin', n: 2 }, { at: 38, fam: 'zombie', n: 3 }, { at: 50, fam: 'spider', n: 2 }],
    card: 'They rose with the fog.', boss: null, unlock: { type: 'mission', id: 'm2' }, reward: 'The dead walk' },
  { id: 'h2', zone: 'z2', district: 'graveyard', name: 'HARVEST MOON', len: 75, crowd: false,
    spawns: [{ at: 10, fam: 'pumpkin', n: 3 }, { at: 26, fam: 'demon', n: 2 }, { at: 42, fam: 'spider', n: 3 }, { at: 58, fam: 'zombie', n: 3 }],
    card: 'The moon is full and so are the graves.', boss: null, unlock: { type: 'mission', id: 'h1' }, reward: 'Something stirs' },
  { id: 'h3', zone: 'z2', district: 'graveyard', name: 'ALL HALLOWS', len: 90, crowd: false,
    spawns: [{ at: 10, fam: 'demon', n: 2 }, { at: 26, fam: 'pumpkin', n: 3 }, { at: 44, fam: 'zombie', n: 4 }, { at: 62, fam: 'spider', n: 3 }, { at: 78, fam: 'demon', n: 2 }],
    card: 'He wears the harvest.', boss: 'pumpkinking', unlock: { type: 'mission', id: 'h2' }, reward: 'Unlocks JACK as playable' },
  { id: 'endless', zone: 'zx', district: 'neon', name: 'ENDLESS SCRAP', len: Infinity, crowd: false, endless: true, card: 'How long can you hold the block?',
    spawns: [], boss: null, unlock: { type: 'mission', id: 'm1' }, reward: 'Survival ladder — how far can you walk?' },
  { id: 'daily', zone: 'zx', district: 'neon', name: 'DAILY SCRAP', len: 70, crowd: false, daily: true, card: 'One shot. One leaderboard.',
    spawns: [], boss: 'kingpin', unlock: { type: 'mission', id: 'm1' }, reward: 'Same seed for everyone today. One scored run.' },
];
const missionDef = (id) => MISSIONS.find((m) => m.id === id);
const missionUnlocked = (m) => {
  if (m.unlock.type === 'start') return true;
  return save.missionsDone.includes(m.unlock.id);
};
const missionIndex = (m) => MISSIONS.indexOf(m);
// ---------- INFINITE vision: wildness escalates as you clear missions (owner 2026-10-06) ----------
// wildness = 1 + wins/2. Each mission rolls 0-3 modifiers from the table (seeded) —
// familiar streets, but every run feels different. Surprise + comfort.
const wildLevel = () => 1 + Math.floor((save.wins || 0) / 2);
const MODIFIERS = [
  { id: 'rush', name: 'RUSH HOUR', desc: '+50% enemies per wave', minWild: 2 },
  { id: 'brutes', name: 'BRUTE SQUAD', desc: 'Heavies walk with the thugs', minWild: 2 },
  { id: 'night', name: 'BLACKOUT', desc: 'Dark streets, hot lamps', minWild: 1 },
  { id: 'rain', name: 'ACID RAIN', desc: 'Rain over neon', minWild: 3 },
  { id: 'party', name: 'PICKUP PARTY', desc: 'Extra breakables, extra loot', minWild: 1 },
  { id: 'frenzy', name: 'FRENZY', desc: 'Frenzied variants: faster, meaner', minWild: 4 },
  { id: 'titans', name: 'TITANS', desc: 'Titan variants walk the block', minWild: 6 },
];
function rollModifiers(seedNum, wild) {
  const R = seedPRNG(seedNum);
  const pool = MODIFIERS.filter((m) => wild >= m.minWild);
  const n = wild < 3 ? (R() < 0.5 ? 0 : 1) : wild < 5 ? 1 + (R() < 0.5 ? 1 : 0) : 2 + (R() < 0.4 ? 1 : 0);
  const out = [];
  const cp = pool.slice();
  for (let i = 0; i < n && cp.length; i++) out.push(cp.splice(Math.floor(R() * cp.length), 1)[0].id);
  return out;
}
const hasMod = (id) => (mission.mods || []).includes(id);
// ---------- BLESSINGS (owner 2026-10-06, Hades-inspired): pick 1 of 3 after each win ----------
// Street-mythology figures grant boons. Last until you lose. DUO when two figures align.
const BLESSINGS = [
  { id: 'b_ret', fig: 'prophet', fname: 'CORNER PROPHET', rar: 'common', name: 'RETRIBUTION', desc: 'Counters deal +40% damage', fx: { counterDmg: 0.4 } },
  { id: 'b_wind', fig: 'prophet', fname: 'CORNER PROPHET', rar: 'rare', name: 'SECOND WIND', desc: '+25 max energy, +20% energy gain', fx: { energyMax: 25, energyGain: 0.2 } },
  { id: 'b_hands', fig: 'coach', fname: 'GYM COACH', rar: 'common', name: 'HEAVY HANDS', desc: '+15% punch damage', fx: { punchDmg: 0.15 } },
  { id: 'b_road', fig: 'coach', fname: 'GYM COACH', rar: 'rare', name: 'ROADWORK', desc: '+12% move speed, dodge recharges 25% faster', fx: { moveSpd: 0.12, dodgeCd: 0.25 } },
  { id: 'b_iron', fig: 'elder', fname: 'BLOCK ELDER', rar: 'common', name: 'IRON SKIN', desc: 'Take 12% less damage', fx: { armor: 0.12 } },
  { id: 'b_blood', fig: 'elder', fname: 'BLOCK ELDER', rar: 'epic', name: 'OLD BLOOD', desc: 'Heal 4 HP per KO', fx: { lifesteal: 4 } },
];
const BLESS_DUOS = [
  { figs: ['prophet', 'coach'], name: 'SUNDAY SERVICE', desc: 'Counters trigger a shockwave' },
];
function blessFx() {
  const fx = {};
  for (const id of (save.blessings || [])) {
    const b = BLESSINGS.find((x) => x.id === id);
    if (!b) continue;
    for (const k in b.fx) fx[k] = (fx[k] || 0) + b.fx[k];
  }
  return fx;
}
function blessDuo() {
  const figs = new Set((save.blessings || []).map((id) => (BLESSINGS.find((x) => x.id === id) || {}).fig));
  return BLESS_DUOS.find((d) => d.figs.every((f) => figs.has(f))) || null;
}
const energyMax = () => 100 + (blessFx().energyMax || 0);
function rollBlessings() {
  const owned = new Set(save.blessings || []);
  const pool = BLESSINGS.filter((b) => !owned.has(b.id));
  const weights = { common: 60, rare: 30, epic: 10 };
  const out = [];
  const cp = pool.slice();
  while (out.length < 3 && cp.length) {
    let tw = 0; for (const b of cp) tw += weights[b.rar] || 10;
    let r = Math.random() * tw, pick = cp[0];
    for (const b of cp) { r -= weights[b.rar] || 10; if (r <= 0) { pick = b; break; } }
    out.push(pick); cp.splice(cp.indexOf(pick), 1);
  }
  return out;
}
// ---------- STREET CIRCUIT: infinite procedural missions (one card, endless series) ----------
const PM_A = ['RUST', 'NEON', 'CONCRETE', 'MIDNIGHT', 'IRON', 'VELVET', 'CHROME', 'ASHEN', 'COPPER', 'JAGUAR', 'SMOKE', 'TAR'];
const PM_B = ['ALLEY', 'BLOCK', 'STRIP', 'YARDS', 'CORNER', 'DIVE', 'ROW', 'MILE', 'SECTOR', 'WARD', 'DEAD END', 'OVERPASS'];
function procMission(n) {
  const R = seedPRNG(n * 7919 + 13);
  const district = DISTRICTS[n % DISTRICTS.length].id;
  const name = PM_A[Math.floor(R() * PM_A.length)] + ' ' + PM_B[Math.floor(R() * PM_B.length)];
  const len = 60 + n * 6;
  const fams = ['thug', 'rico', 'jabber', 'heavyd', 'stray'];
  const season = activeSeason(); // seasonal fighters bleed into the base game
  if (season) for (const sf of season.fams) if (!fams.includes(sf)) fams.push(sf);
  const spawns = [];
  const waves = 4 + Math.min(6, Math.floor(n / 2));
  for (let w = 0; w < waves; w++) {
    spawns.push({ at: 10 + w * ((len - 20) / waves), fam: fams[Math.floor(R() * fams.length)], n: 2 + Math.min(3, Math.floor(n / 3)) });
  }
  const bossCycle = ['kingpin', 'sledge', 'viper', 'rust'];
  // INFINITE BOSSES: deep circuit runs face generated endless challengers
  const boss = n % 3 === 2 ? (n >= 9 ? 'pb' + n : bossCycle[Math.floor(n / 3) % bossCycle.length]) : null;
  return {
    id: 'circuit', circuitN: n, district, name: name + ' #' + (n + 1), len,
    crowd: R() < 0.5, spawns, boss, proc: true,
    card: 'The road does not end. Neither do you.',
    unlock: { type: 'mission', id: 'm1' }, reward: 'Circuit #' + (n + 1) + ' cleared',
  };
}

// ---------- audio (nothing plays before first user gesture) ----------
let actx = null; const sbuf = {}; let muted = false;
async function unlockAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    await Promise.all(['hit1', 'hit2', 'hit3', 'bell', 'crowd', 'music', 'click', 'whoosh', 'step', 'crack', 'coin', 'uiclick'].map(async (k) => { sbuf[k] = await actx.decodeAudioData(b64ToBuf(A[k + '.mp3'])); }));
    sfx('music', 0.32, true); sfx('crowd', 0.25, true);
  } catch (e) { T.errors.push('audio:' + e); }
}
function sfx(k, vol = 1, loop = false, rate = 1) {
  if (!actx || !sbuf[k] || muted) return null;
  const s = actx.createBufferSource(); s.buffer = sbuf[k]; s.loop = loop; s.playbackRate.value = rate;
  const g = actx.createGain(); g.gain.value = vol; s.connect(g).connect(actx.destination); s.start(); return s;
}
let paused = false, pushT = 0;
const pushPos = new THREE.Vector3();
function setPaused(p) { if (actx) (p ? actx.suspend() : actx.resume()).catch(() => {}); paused = p; }
// U6 pause menu + U9 settings
function togglePause(force) {
  if (state !== 'fight') return;
  const on = force !== undefined ? force : !paused;
  if (on) {
    $('pauseMoves').innerHTML = moveListHTML(save.selected);
    const dr = $('diffRow'); dr.innerHTML = '';
    for (const d of DIFFS) {
      const b = document.createElement('button');
      b.className = 'diffBtn' + (d.id === save.difficulty ? ' sel' : '');
      b.textContent = d.name;
      b.title = d.desc;
      b.addEventListener('click', (e) => { e.stopPropagation(); save.difficulty = d.id; writeSave(); sfx('uiclick', 0.7);
        for (const x of dr.children) x.classList.toggle('sel', x === b); });
      dr.appendChild(b);
    }
  }
  setPaused(on);
  $('pauseOv').classList.toggle('hidden', !on);
  $('touch').classList.toggle('on', !on);
  sfx('uiclick', 0.7);
}
// U9: quality setting — low forces lowFx, high disables auto-degrade, auto = current behavior
function applyQuality() {
  if (save.quality === 'low') { lowFx = true; renderer.shadowMap.enabled = false; renderer.setPixelRatio(1); }
  else if (save.quality === 'high') { lowFx = false; }
}
function renderBoard() {
  const L = $('boardList'); L.innerHTML = '';
  const names = {};
  for (const m of MISSIONS) names[m.id] = m.name;
  let any = false;
  for (const [id, best] of Object.entries(save.boards)) {
    if (!names[id]) continue; any = true;
    const r = document.createElement('div'); r.className = 'bline';
    r.innerHTML = `<span>${names[id]}</span><b>${best}</b>`;
    L.appendChild(r);
  }
  if (save.daily.date) {
    const r = document.createElement('div'); r.className = 'bline';
    r.innerHTML = `<span>Daily run</span><b>${save.daily.score}</b>`;
    L.appendChild(r); any = true;
  }
  if (!any) L.innerHTML = '<div class="bline"><span>No records yet — go fight.</span><b>—</b></div>';
}
function tipJar() { sfx('uiclick', 0.7); window.open(TIP_URL, '_blank', 'noopener'); }
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
function applyDistrict(d, seedNum) {
  const R = seedPRNG(seedNum || 1);
  const hueShift = (R() - 0.5) * 0.1; // seeded palette mutation — same district, different night
  const shift = (hex) => { const c = new THREE.Color(hex); const h = {}; c.getHSL(h); c.setHSL((h.h + hueShift + 1) % 1, h.s, h.l); return c; };
  const blackout = typeof hasMod === 'function' && mission && hasMod('night');
  scene.background = new THREE.Color(d.sky);
  if (blackout) scene.background.multiplyScalar(0.35);
  scene.fog = new THREE.Fog(d.fog[0], d.fog[1], d.fog[2]);
  hemi.color.set(d.hemi[0]); hemi.groundColor.set(d.hemi[1]); hemi.intensity = d.hemi[2] * (blackout ? 0.45 : 1);
  moon.color.copy(shift(d.moon[0])); moon.intensity = d.moon[1] * (blackout ? 0.5 : 1);
  rim.color.copy(shift(d.rim[0])); rim.intensity = d.rim[1];
  lampL.color.copy(shift(d.lampA)); lampR.color.copy(shift(d.lampB));
  if (blackout) { lampL.intensity = 2.2; lampR.intensity = 2.2; }
}

const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const parse = (name) => new Promise((res, rej) => loader.parse(b64ToBuf(A[name]), '', res, rej));

// ---------- street builder (mission-length, district-styled) ----------
const streetGroup = new THREE.Group(); scene.add(streetGroup);
let streetParts = {};
let rainPts = null;
function setRain(on) {
  if (rainPts) { streetGroup.remove(rainPts); rainPts.geometry.dispose(); rainPts = null; }
  if (!on) return;
  const N = 320, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = rnd(-10, 30); pos[i * 3 + 1] = rnd(0, 12); pos[i * 3 + 2] = rnd(-6, 6); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  rainPts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x7af0ff, size: 0.08, transparent: true, opacity: 0.7 }));
  streetGroup.add(rainPts);
}
function updateRain(dt) {
  if (!rainPts || !player) return;
  const a = rainPts.geometry.attributes.position;
  for (let i = 0; i < a.count; i++) {
    let y = a.getY(i) - dt * 14;
    if (y < 0) { y = 12; a.setX(i, player.px + rnd(-10, 20)); }
    a.setY(i, y);
  }
  a.needsUpdate = true;
  rainPts.position.x = 0;
}
function clearStreet() {
  while (streetGroup.children.length) streetGroup.remove(streetGroup.children[0]);
  colliders.length = 0; destructibles.length = 0; clearPickups();
}
function buildStreet(district, missionLen, seedFn) {
  clearStreet();
  const d = districtDef(district);
  applyDistrict(d, (mission && mission.circuitN || 0) * 31 + (mission && mission.id ? mission.id.length : 0) + 7);
  const R = seedFn || Math.random;
  const parts = streetParts;
  const place = (name, x, z, ry = 0, sc = 1, tint = null) => placeProp(name, x, z, ry, sc, tint);
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

// ---------- destructibles + collision (SoR/Fatal Fury style: smash cars/crates, spill pickups) ----------
const DESTRUCT_DEFS = {
  box_A: { hp: 20, name: 'CRATE', pickups: ['cash', 'cash'] },
  trash_A: { hp: 15, name: 'TRASH CAN', pickups: ['cash'] },
  trash_B: { hp: 15, name: 'TRASH CAN', pickups: ['health'] },
  dumpster: { hp: 45, name: 'DUMPSTER', pickups: ['cash', 'health', 'special'] },
  car_taxi: { hp: 70, name: 'TAXI', pickups: ['cash', 'cash', 'cash', 'special'] },
  car_police: { hp: 70, name: 'SQUAD CAR', pickups: ['cash', 'cash', 'health', 'special'] },
};
const SOLID_PROPS = new Set(['streetlight', 'firehydrant']);
const colliders = [];    // {x, z, r, dead} — block player movement (owner bug report 2026-10-06)
const destructibles = []; // {mesh, px, pz, r, hp, maxHp, name, def, col}
// placeProp: ground-aligns via bounding box (BUG FIX 2026-10-06: cars sank), registers collision + destructible HP
function placeProp(name, x, z, ry = 0, sc = 2.2, tint = null) {
  const part = streetParts[name]; if (!part) return null;
  const o = part.clone(); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.multiplyScalar(sc);
  o.traverse((m) => { if (m.isMesh) { m.receiveShadow = true; m.castShadow = true;
    if (tint !== null) { m.material = m.material.clone(); m.material.color = new THREE.Color(tint); } } });
  const bb = new THREE.Box3().setFromObject(o);
  o.position.y -= bb.min.y; // sit exactly on the ground — never sink
  streetGroup.add(o);
  const rad = Math.max((bb.max.x - bb.min.x) / 2, (bb.max.z - bb.min.z) / 2, 0.5);
  const dd = DESTRUCT_DEFS[name];
  if (dd || SOLID_PROPS.has(name)) {
    const c = { x, z, r: rad * 0.75, dead: false };
    colliders.push(c);
    if (dd) destructibles.push({ mesh: o, px: x, pz: z, r: rad, hp: dd.hp, maxHp: dd.hp, name: dd.name, def: dd, col: c });
  }
  return o;
}
function damageDestructibles(range) {
  if (!player) return;
  for (const d of destructibles) {
    if (d.hp <= 0) continue;
    if (Math.abs(d.px - player.px) < range + d.r && Math.abs(d.pz - player.pz) < 1.2 + d.r) {
      d.hp -= Math.round(14 * player.dmgMult);
      const hp = d.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0));
      burst(hp, 6, 0xcccccc, 3);
      sfx('hit2', 0.5, false, 1.4);
      if (d.hp <= 0) destroyDestructible(d);
    }
  }
}
function destroyDestructible(d) {
  d.col.dead = true;
  const pos = d.mesh.position.clone();
  burst(pos.clone().add(new THREE.Vector3(0, 0.9, 0)), 26, 0xc0a080, 5);
  burst(pos.clone().add(new THREE.Vector3(0, 0.5, 0)), 14, 0x555555, 4);
  sfx('hit3', 0.9, false, 0.8); sfx('crack', 0.7, false, 0.9);
  streetGroup.remove(d.mesh);
  const sp = screenPos(pos.clone().add(new THREE.Vector3(0, 1.4, 0)));
  popText(d.name + ' SMASHED!', 'gold', sp.x, sp.y);
  for (const pt of d.def.pickups) spawnPickup(pt, d.px + rnd(-1, 1), clamp(d.pz + rnd(-1, 1), -1.4, 1.4));
  ev('smash', { name: d.name });
}
function spawnBreakables(district, missionLen, R) {
  const L = isFinite(missionLen) ? missionLen : 200;
  const names = ['trash_A', 'trash_B', 'box_A'];
  const step = (typeof hasMod === 'function' && mission && hasMod('party')) ? 5 : 9;
  for (let px = 8; px < L; px += rnd(step, step + 7)) {
    const nm = names[Math.floor(R() * names.length)];
    placeProp(nm, px + rnd(-2, 2), rnd(-1.5, 1.5), R() * 3);
  }
}
// ---------- pickups: health / cash / special (dropped by enemies + destructibles) ----------
const pickups = []; // {type, mesh, px, pz, t}
const PICKUP_DEFS = {
  health: { color: 0xff4d6d, label: '+HP' },
  cash: { color: 0x80ed99, label: '+$' },
  special: { color: 0x7af0ff, label: '+SPC' },
};
function spawnPickup(type, x, z) {
  const d = PICKUP_DEFS[type]; if (!d) return;
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: d.color, emissive: d.color, emissiveIntensity: 0.55, roughness: 0.4 });
  if (type === 'health') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.2), mat);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), mat);
    g.add(a, b);
  } else if (type === 'cash') {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.08), mat));
  } else {
    const o = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), mat);
    g.add(o);
  }
  g.position.set(x, 0.85, z);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  streetGroup.add(g);
  pickups.push({ type, mesh: g, px: x, pz: z, t: Math.random() * 6 });
}
function updatePickups(dt) {
  if (!player || player.hp <= 0) return;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pk = pickups[i];
    pk.t += dt;
    pk.mesh.position.y = 0.85 + Math.sin(pk.t * 3.2) * 0.14;
    pk.mesh.rotation.y += dt * 2.4;
    const dx = player.px - pk.px, dz = player.pz - pk.pz;
    const dist = Math.hypot(dx, dz);
    if (dist < 2.6 && dist > 0.01) { // magnet
      const pull = (2.6 - dist) * 4 * dt;
      pk.px += dx / dist * pull; pk.pz += dz / dist * pull;
      pk.mesh.position.x = pk.px; pk.mesh.position.z = pk.pz;
    }
    if (dist < 0.75) {
      const d = PICKUP_DEFS[pk.type];
      const sp = screenPos(pk.mesh.position.clone());
      if (pk.type === 'health') { player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.3); popText('+HP', 'gold', sp.x, sp.y); }
      else if (pk.type === 'cash') { const c = Math.round(rnd(15, 40)); awardCash(c, pk.mesh.position.clone()); }
      else { player.energy = clamp(player.energy + 35, 0, energyMax()); popText('+ENERGY', 'big', sp.x, sp.y); }
      sfx('coin', 0.6, false, pk.type === 'health' ? 0.8 : 1.2);
      streetGroup.remove(pk.mesh);
      pickups.splice(i, 1);
      setHud();
    }
  }
}
function R_safe() { return typeof missionR === 'function' ? missionR() : Math.random(); }
function clearPickups() { for (const pk of pickups) streetGroup.remove(pk.mesh); pickups.length = 0; }

// ---------- crowd (CONDITIONAL: only on missions flagged crowd:true — owner directive) ----------
const crowdGroup = new THREE.Group(); scene.add(crowdGroup);
let crowdMembers = [];
function spawnCrowd(R) {
  clearCrowd();
  for (let i = 0; i < 14; i++) {
    const f = makeFighterRaw(0x888899, 0, 0, rnd(0.9, 1.05), texObjs.patchwork);
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
// ---------- species part attachments: CC0 part-pack meshes parented to bones ----------
// (PART_ATTACH_SPEC.md: animal-head masks, pumpkin heads, etc. bolt onto the rig)
const partTemplates = {};
const PART_HEADS = {
  pumpkin: { file: 'parts/pumpkin-head.glb', bone: 'head', scale: 0.30, y: 0.10 },
};
async function loadPartTemplates() {
  for (const [id, p] of Object.entries(PART_HEADS)) {
    try {
      const g = await parse(p.file);
      const grp = new THREE.Group();
      const inner = new THREE.Group();
      while (g.scene.children.length) inner.add(g.scene.children[0]);
      const box = new THREE.Box3().setFromObject(inner);
      const c = box.getCenter(new THREE.Vector3());
      inner.position.sub(c); // recenter part on group origin
      inner.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      grp.add(inner);
      grp.scale.setScalar(p.scale);
      partTemplates[id] = grp;
    } catch (e) { T.errors.push('part:' + id + ':' + String(e && e.message || e).slice(0, 80)); }
  }
}
function attachHead(f, partId) {
  const t = partTemplates[partId]; if (!t) return;
  const bone = f.root.getObjectByName(PART_HEADS[partId].bone); if (!bone) return;
  const inst = t.clone();
  inst.position.set(0, PART_HEADS[partId].y || 0, 0);
  bone.add(inst);
}
// ---------- species creatures: whole-body CC0 models as enemies/bosses ----------
// Quaternius rigged+animated models. Enemy AI speaks mannequin clip names;
// CREATURE_ANIMROLE translates them to each creature's own baked clips.
const CREATURE_DEFS = {
  zombie: { file: 'parts/zombie.glb', height: 1.7,
    clips: { idle: 'Idle', walk: 'Run', attack: 'Punch', hit: 'HitReact', dead: 'Death' } },
  demon: { file: 'parts/demon.glb', height: 1.9,
    clips: { idle: 'CharacterArmature|Idle', walk: 'CharacterArmature|Run', attack: 'CharacterArmature|Punch', hit: 'CharacterArmature|HitReact', dead: 'CharacterArmature|Death' } },
  spider: { file: 'parts/spider.glb', height: 1.0,
    clips: { idle: 'SpiderArmature|Spider_Idle', walk: 'SpiderArmature|Spider_Walk', attack: 'SpiderArmature|Spider_Attack', hit: 'SpiderArmature|Spider_Idle', dead: 'SpiderArmature|Spider_Death' } },
  dragon: { file: 'parts/dragon-evolved.glb', height: 2.6,
    clips: { idle: 'CharacterArmature|Flying_Idle', walk: 'CharacterArmature|Fast_Flying', attack: 'CharacterArmature|Headbutt', hit: 'CharacterArmature|HitReact', dead: 'CharacterArmature|Death' } },
};
const CREATURE_ANIMROLE = {
  'Melee_Unarmed_Idle': 'idle', 'Running_A': 'walk',
  'Melee_Unarmed_Attack_Punch_A': 'attack', 'Melee_Unarmed_Attack_Kick': 'attack',
  'Hit_A': 'hit', 'Hit_B': 'hit', 'Death_A': 'dead',
};
const creatureTemplates = {};
async function loadCreatureTemplates() {
  for (const [id, cd] of Object.entries(CREATURE_DEFS)) {
    try {
      const g = await parse(cd.file);
      const scene = g.scene;
      const box = new THREE.Box3().setFromObject(scene);
      const h = Math.max(0.01, box.max.y - box.min.y);
      const byName = {};
      for (const c of g.animations) byName[c.name] = c;
      creatureTemplates[id] = { scene, byName, norm: cd.height / h };
    } catch (e) { T.errors.push('creature:' + id + ':' + String(e && e.message || e).slice(0, 80)); }
  }
}
function makeCreatureRaw(cid, tint, x, face, scale = 1) {
  const t = creatureTemplates[cid]; if (!t) return null;
  const cd = CREATURE_DEFS[cid];
  const root = skClone(t.scene);
  root.scale.setScalar(t.norm * scale);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.color = new THREE.Color(tint); } });
  root.position.set(x, 0, 0); root.rotation.y = face; scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const f = { root, mixer, cur: null, hp: 100, maxHp: 100, busy: 0, tint, sc: scale, dmgMult: 1, vy: 0, airborne: false, creature: cid, creatureClips: t.byName, creatureDef: cd };
  mixer.addEventListener('finished', (e) => { if (e.action === f.cur && f.onDone) { const d = f.onDone; f.onDone = null; d(); } });
  fighters.push(f); return f;
}
function makeFighterRaw(tint, x, face, scale = 1, tex = null) {
  const root = skClone(fighterTemplate);
  root.scale.multiplyScalar(scale);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.color = new THREE.Color(tint); if (tex) o.material.map = tex; } });
  root.position.set(x, 0, 0); root.rotation.y = face; scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const f = { root, mixer, cur: null, hp: 100, maxHp: 100, busy: 0, tint, sc: scale, dmgMult: 1, vy: 0, airborne: false };
  mixer.addEventListener('finished', (e) => { if (e.action === f.cur && f.onDone) { const d = f.onDone; f.onDone = null; d(); } });
  fighters.push(f); return f;
}
function playAnim(f, name, { loop = false, fade = 0.08, ts = 1, done = null, clamp = false } = {}) {
  let clip = null;
  if (f.creature) { // translate mannequin clip names to the creature's baked clips
    const role = CREATURE_ANIMROLE[name];
    const cname = role && f.creatureDef.clips[role];
    clip = (cname && f.creatureClips[cname]) || f.creatureClips[f.creatureDef.clips.idle] || null;
  } else clip = clips[name];
  if (!clip) return;
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
const lerp = (a, b, t) => a + (b - a) * t;
function sparkFX(x, y, z, color, n) { burst(new THREE.Vector3(x, y, z), n || 10, color); }
function addHitstop(t) { hitstop = Math.max(hitstop, t); }
function addSlowmo(mult, t) { slowmo = mult; slowmoT = Math.max(slowmoT, t); }
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
    const box = el('div', 'shopItem panel9');
    box.appendChild(el('div', 'un', `${u.name} <span style="font-size:11px;opacity:.7">Lv${lvl}</span>`));
    box.appendChild(el('div', 'ud', u.desc));
    const b = el('button', '', `$${cost}`);
    b.disabled = save.cash < cost;
    b.onclick = (e) => { e.stopPropagation(); if (save.cash < cost) return; save.cash -= cost; save[u.key]++; writeSave(); sfx('uiclick', 0.8); renderShop(into); renderMeta(); refreshShowcase(); };
    box.appendChild(b); into.appendChild(box);
  }
  const sp = el('div', 'shopItem panel9');
  sp.appendChild(el('div', 'un', 'SUPPORTER'));
  sp.appendChild(el('div', 'ud', SUPPORT_PACKS[0].desc));
  const pb = el('button', '', SUPPORT_PACKS[0].price);
  pb.onclick = (e) => { e.stopPropagation(); popText('COMING SOON — ITCH.IO', 'gold', innerWidth / 2, innerHeight * 0.5); };
  sp.appendChild(pb); into.appendChild(sp);
}

// --- 3D showcase: the ACTUAL fighter model on a turntable (never colored circles) ---
let showcase = null, showcaseRot = 0, showcaseDrag = null;
function shuffleSkin() {
  const fid = save.selected;
  const tint = Math.floor(Math.random() * 0xffffff);
  save.skins[fid] = 'custom:' + tint.toString(16).padStart(6, '0');
  writeSave(); sfx('uiclick', 0.8);
  showSelect();
}
function refreshShowcase() {
  if (showcase) { removeFighter(showcase); showcase = null; }
  const fd = fighterDef();
  showcase = makeFighterRaw(skinTint(fd.id), 0, 0, 1, texObj(fd.id));
  playAnim(showcase, 'Melee_Unarmed_Idle', { loop: true });
  $('showName').textContent = fd.name;
  $('showTag').textContent = fd.tag;
  $('moveList').innerHTML = moveListHTML(fd.id);
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
    const c = el('div', 'card ' + (f.id === save.selected && !locked ? 'panel9g' : 'panel9') + (locked ? ' locked' : '') + ((save.goldCards || []).includes(f.id) ? ' goldcard' : ''));
    c.appendChild(el('div', 'nm', locked ? '???' : ((save.goldCards || []).includes(f.id) ? '★ ' : '') + f.name));
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
  { // infinite tints: shuffle die (style-only, free) — owner vision 2026-10-06
    const d = el('div', 'skinDot' + (String(save.skins[save.selected] || '').startsWith('custom:') ? ' sel' : ''));
    d.style.background = 'conic-gradient(#f55,#ff5,#5f5,#5ff,#55f,#f5f,#f55)';
    d.title = 'SHUFFLE — random tint, style only';
    d.textContent = '🎲'; d.style.fontSize = '18px'; d.style.lineHeight = '30px'; d.style.textAlign = 'center';
    d.onclick = () => shuffleSkin();
    sr.appendChild(d);
  }
  { // texture variants: tint x texture chosen independently (owner 2026-10-06)
    const tr = $('texRow'); tr.querySelectorAll('.texBtn').forEach((d) => d.remove());
    for (const t of TEXVARIANTS) {
      const b = el('button', 'texBtn' + (texVar(save.selected).id === t.id ? ' sel' : ''), t.name);
      b.title = t.desc + ' — style only';
      b.onclick = () => { save.tex[save.selected] = t.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelect(); };
      tr.appendChild(b);
    }
  }
  renderShop($('shopRow')); renderMeta();
  showOnly('select');
}
function showSelectCards() { // re-render cards row only (after pick)
  const cards = $('cards'); cards.innerHTML = '';
  for (const f of FIGHTERS) {
    const locked = !isUnlocked(f);
    const c = el('div', 'card ' + (f.id === save.selected && !locked ? 'panel9g' : 'panel9') + (locked ? ' locked' : '') + ((save.goldCards || []).includes(f.id) ? ' goldcard' : ''));
    c.appendChild(el('div', 'nm', locked ? '???' : ((save.goldCards || []).includes(f.id) ? '★ ' : '') + f.name));
    c.appendChild(el('div', 'lk', locked ? unlockText(f) : f.tag));
    if (!locked) c.onclick = () => { save.selected = f.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelectCards(); };
    cards.appendChild(c);
  }
}
function showMission() {
  state = 'mission'; clearFighters(); clearCrowd();
  const list = $('mList'); list.innerHTML = '';
  const season = activeSeason();
  if (season) { // seasonal event banner
    const sb = el('div', 'seasonBanner');
    sb.appendChild(el('div', 'sn', season.tag));
    sb.appendChild(el('div', 'sc', season.card));
    list.appendChild(sb);
  }
  // REP TIERS (owner 2026-10-06): post-game ladder above BRUTAL
  {
    const rr = $('repRow'); rr.innerHTML = '';
    const unlocked = repUnlocked();
    const cap = el('span', '', 'REP:');
    cap.style.cssText = 'font-family:Arial,sans-serif;font-weight:700;font-size:12px;letter-spacing:2px;align-self:center;opacity:.8';
    rr.appendChild(cap);
    for (let r = 0; r <= REP_MAX; r++) {
      const b = el('button', 'diffBtn' + ((save.rep || 0) === r ? ' sel' : ''), r === 0 ? 'OFF' : 'R' + r);
      b.title = r === 0 ? 'No REP modifier' : `REP ${r}: +${r * 30}% enemy HP, +${r * 18}% damage, +${r * 35}% cash` + (unlocked ? '' : ' — clear RUST BELT to unlock');
      b.disabled = !unlocked && r > 0;
      b.style.flex = '0 0 auto'; b.style.padding = '6px 10px'; b.style.minHeight = '36px';
      b.onclick = (e) => { e.stopPropagation(); save.rep = r; writeSave(); sfx('uiclick', 0.7); showMission(); };
      rr.appendChild(b);
    }
    if (!unlocked) {
      const note = el('span', '', '🔒 Clear RUST BELT');
      note.style.cssText = 'font-family:Arial,sans-serif;font-weight:700;font-size:11px;align-self:center;opacity:.6';
      rr.appendChild(note);
    }
  }
  // ZONES (owner 2026-10-06): missions grouped under zone headers
  for (const z of ZONES) {
    const zUnlocked = zoneUnlocked(z);
    const zh = el('div', 'zoneHead' + (zUnlocked ? '' : ' locked'));
    zh.appendChild(el('div', 'zn', (zUnlocked ? '' : '🔒 ') + z.name));
    zh.appendChild(el('div', 'zc', z.card));
    list.appendChild(zh);
    if (!zUnlocked) continue;
    for (const m of MISSIONS.filter((x) => (x.zone || 'z1') === z.id)) {
    const d = districtDef(m.district);
    const locked = !missionUnlocked(m);
    const card = el('div', 'mcard panel9' + (locked ? ' locked' : ''));
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
      go.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); startMission(m.id); };
      card.appendChild(go);
    }
    list.appendChild(card);
    } // end mission loop
  } // end zone loop
  // STREET CIRCUIT: infinite procedural missions — one card, endless series (owner vision 2026-10-06)
  {
    const n = save.circuitN || 0;
    const preview = procMission(n);
    const d = districtDef(preview.district);
    const locked = !save.missionsDone.includes('m1');
    const card = el('div', 'mcard panel9' + (locked ? ' locked' : ''));
    card.appendChild(el('div', 'dn', '∞ STREET CIRCUIT'));
    card.appendChild(el('div', 'mn', '#' + (n + 1) + ' ' + preview.name));
    const sw = el('div', 'sw'); sw.style.background = `linear-gradient(90deg, ${d.sw[0]}, ${d.sw[1]})`;
    card.appendChild(sw);
    card.appendChild(el('div', 'inf', `Procedural mission, wildness ${wildLevel()}.<br>District: ${d.name} · Boss: ${preview.boss ? missionBossName(preview) : '—'}`));
    if (save.circuitN > 0) card.appendChild(el('div', 'best', `CLEARED: ${save.circuitN}`));
    card.appendChild(el('div', 'rw', locked ? '🔒 Clear FIRST BLOOD' : '★ Infinite missions — always something new'));
    if (!locked) {
      const go = el('button', 'go', 'GO');
      go.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); startMission('circuit'); };
      card.appendChild(go);
    }
    list.appendChild(card);
  }
  $('dailyTag').textContent = 'DAILY SEED: ' + todayStr() + (save.daily.date === todayStr() ? ` · YOUR BEST: ${save.daily.score}` : '');
  renderMeta(); showOnly('mission');
}
function missionBossName(m) { const b = bossDef(m.boss); return b ? b.name : ''; }
function showResults(win, mission, stats) {
  state = 'results';
  clearFighters(); clearCrowd();
  $('touch').classList.remove('on');
  const ub = $('unlockBanner'); ub.textContent = '';
  if (win) {
    if (mission.proc) { save.circuitN = Math.max(save.circuitN, mission.circuitN + 1); }
    else if (!save.missionsDone.includes(mission.id)) save.missionsDone.push(mission.id);
    save.wins++;
    // boss -> unlock as playable (owner directive) + unlock ceremony (U11)
    if (mission.boss) {
      const b = bossDef(mission.boss);
      if (b && b.proc) { // INFINITE BOSS: escalating cash bounty, challenger counter
        const bounty = 150 + (parseInt(mission.boss.slice(2), 10) || 0) * 40;
        save.cash += bounty;
        save.pbKills = (save.pbKills || 0) + 1;
        ub.textContent = '★ ENDLESS CHALLENGER DOWN — BOUNTY $' + bounty + ' ★';
        ub.classList.add('show');
        sfx('bell', 0.9, true); flash('#ffe14d');
        setTimeout(() => sfx('coin', 0.8, false, 1.2), 180);
        ev('unlock', { pboss: mission.boss, bounty });
      } else if (b && b.unlockFighter && !save.unlocked.includes(b.unlockFighter)) {
        save.unlocked.push(b.unlockFighter);
        ub.textContent = '★ ' + b.name + ' UNLOCKED AS PLAYABLE ★';
        ub.classList.add('show');
        // ceremony fanfare: bell + coin + whoosh, flash the banner
        sfx('bell', 0.9, true); flash('#ffe14d');
        setTimeout(() => sfx('coin', 0.8, false, 1.2), 180);
        setTimeout(() => sfx('whoosh', 0.6, false, 0.9), 380);
        ev('unlock', { fighter: b.unlockFighter });
      } else if (b && b.unlockSkin) {
        const sk = SKINS[b.unlockSkin.fighter] || (SKINS[b.unlockSkin.fighter] = []);
        if (!sk.some((s) => s.id === b.unlockSkin.id)) {
          sk.push({ id: b.unlockSkin.id, name: b.unlockSkin.name, tint: b.unlockSkin.tint });
          ub.textContent = '★ ' + b.unlockSkin.name.toUpperCase() + ' SKIN UNLOCKED ★';
          ub.classList.add('show');
          sfx('bell', 0.9, true); flash('#ffe14d');
          setTimeout(() => sfx('coin', 0.8, false, 1.2), 180);
          ev('unlock', { skin: b.unlockSkin.id });
        } else { ub.classList.remove('show'); }
      } else { ub.classList.remove('show'); }
    } else { ub.classList.remove('show'); }
    // GOLD CARDS: beat any boss on REP 5 -> this fighter's card goes gold (prestige, zero power)
    if (mission.boss && (save.rep || 0) >= REP_MAX && !save.goldCards.includes(save.selected)) {
      save.goldCards.push(save.selected); writeSave();
      setTimeout(() => { banner('★ GOLD CARD: ' + fighterDef().name + ' ★'); sfx('bell', 1, true); }, 2200);
      ev('goldcard', { fighter: save.selected });
    }
  } else { save.losses++; }
  save.cash += Math.round(stats.cash * repMult().cash); writeSave();
  // BLESSINGS: pick 1 of 3 after a win; lost on defeat (roguelite run-building)
  const br = $('blessRow'); br.innerHTML = '';
  if (win) {
    const picks = rollBlessings();
    if (picks.length) {
      br.appendChild(el('div', 'blessTitle', '✦ CHOOSE A BLESSING ✦'));
      const rarColor = { common: '#9a9a9a', rare: '#4fa3ff', epic: '#c77dff' };
      for (const b of picks) {
        const c = el('div', 'blessCard panel9');
        c.appendChild(el('div', 'bf', b.fname));
        c.appendChild(el('div', 'bn', b.name));
        c.appendChild(el('div', 'bd', b.desc));
        c.appendChild(el('div', 'br', b.rar.toUpperCase()));
        c.querySelector('.br').style.color = rarColor[b.rar] || '#fff';
        c.onclick = (e) => {
          e.stopPropagation();
          save.blessings.push(b.id); writeSave();
          sfx('bell', 0.9, true); flash('#7af0ff');
          const duo = blessDuo();
          br.innerHTML = `<div class="blessTitle">✦ ${b.name} RECEIVED ✦${duo ? `<br><span style="color:#ffd166;font-size:14px">DUO: ${duo.name} — ${duo.desc}</span>` : ''}</div>`;
          ev('blessing', { id: b.id });
        };
        br.appendChild(c);
      }
    }
  } else { save.blessings = []; writeSave(); } // defeat breaks the run
  const resEl = $('results');
  if (win) {
    resEl.classList.add('win'); resEl.classList.remove('lose');
    $('resTitle').textContent = 'MISSION COMPLETE';
    // next-mission flow: button starts the next mission in order (or back to list)
    const nb = $('nextBtn');
    if (mission.proc) {
      const nxt = procMission(mission.circuitN + 1);
      nb.style.display = ''; nb.textContent = 'NEXT: ' + nxt.name + ' →';
      nb.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); startMission('circuit'); };
    } else {
      const idx = MISSIONS.findIndex((m) => m.id === mission.id);
      const nxt = idx >= 0 ? MISSIONS[idx + 1] : null;
      if (nxt) { nb.style.display = ''; nb.textContent = 'NEXT: ' + nxt.name + ' →'; nb.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); startMission(nxt.id); }; }
      else { nb.style.display = 'none'; }
    }
  } else {
    resEl.classList.remove('win'); resEl.classList.add('lose');
    $('resTitle').textContent = 'KNOCKED OUT';
    $('nextBtn').style.display = 'none';
  }
  $('resStats').innerHTML =
    `<div class="stat">${win ? 'CLEARED' : 'REACHED'} <b>${mission.name}</b></div>` +
    `<div class="stat"><b>${stats.kills}</b> K.O.s &nbsp;·&nbsp; BEST COMBO <b>${stats.maxCombo}</b></div>` +
    (stats.dist ? `<div class="stat">DISTANCE <b>${Math.round(stats.dist)}m</b></div>` : '');
  if (win && mission.mods && mission.mods.length) {
    const mnames = mission.mods.map((id) => (MODIFIERS.find((m) => m.id === id) || {}).name).filter(Boolean);
    $('resStats').innerHTML += `<div class="stat" style="color:#ff9df0">WILDNESS ${mission.wild}: ${mnames.join(' · ')}</div>`;
  }
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
  sfx('coin', 0.7, false, 1.15);
}
function genDailySpawns(R) {
  const sp = []; const fams = ['thug', 'rico', 'jabber', 'heavyd'];
  for (let at = 10; at < 62; at += 10 + R() * 5) sp.push({ at: Math.round(at), fam: fams[Math.floor(R() * fams.length)], n: 2 + Math.floor(R() * 2) });
  return sp;
}
function startMission(id) {
  mission = id === 'circuit' ? procMission(save.circuitN || 0) : missionDef(id);
  let R = Math.random;
  if (mission.daily) {
    const s = [...todayStr()].reduce((a, c) => a + c.charCodeAt(0), 0);
    R = seedPRNG(s * 7919);
    mission = Object.assign({}, mission, { spawns: genDailySpawns(R) });
  }
  missionR = R;
  const wild = wildLevel();
  mission = Object.assign({}, mission, { mods: rollModifiers((mission.circuitN || 0) * 131 + wild * 17 + mission.id.length, wild), wild });
  clearFighters(); clearCrowd(); enemies = [];
  buildStreet(mission.district, mission.len, R);
  spawnBreakables(mission.district, mission.len, R);
  if (mission.crowd) spawnCrowd(R); // CONDITIONAL crowd only — owner directive
  setRain(hasMod('rain'));
  const fd = fighterDef();
  player = makeFighterRaw(skinTint(fd.id), 0, Math.PI / 2, 1, texObj(fd.id));
  if (fd.head) attachHead(player, fd.head); // species head for playable fighters (JACK...)
  player.isPlayer = true;
  player.maxHp = Math.round(fd.hp + toughBonus());
  player.hp = player.maxHp;
  player.dmgMult = fd.dmg * powerMult();
  player.spd = fd.spd;
  player.px = 2; player.pz = 0; player.face = 1;
  player.energy = 50; player.dodgeT = 0; player.dodgeCD = 0; player.busy = 0; player.spinT = 0;
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
  // story beat: letterboxed mission card before the action (Nintendo-style)
  playCine({
    mode: 'card', dur: 2.3,
    caps: [{ t: 0.15, html: '<div class="cc2">' + mission.name + '</div><div class="cc3">' + (mission.card || 'CLEAR THE BLOCK') + '</div>' }],
    onDone: () => { const b = mission.boss && bossDef(mission.boss); banner(mission.name + ' — ' + (b ? 'BOSS: ' + b.name : 'CLEAR THE BLOCK'), 'gold'); sfx(196, 0.5, 'sawtooth', 0.4); },
  });
  setHud();
}
function syncPos(f) { f.root.position.x = f.px; f.root.position.z = f.pz; f.root.position.y = f.py || 0; }
function nearestEnemy(range) {
  let best = null, bd = range;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const d = Math.abs(e.px - player.px) + Math.abs(e.pz - player.pz) * 0.7;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function nearestEnemyFront(range) {
  let best = null, bd = range;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const dx = (e.px - player.px) * player.face;
    if (dx < 0) continue;
    const d = dx + Math.abs(e.pz - player.pz) * 0.7;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function spawnEnemy(famId, mi, bx, bz) {
  const fam = ENEMY_FAMS.find((f) => f.id === famId) || ENEMY_FAMS[0];
  const v = famVariant(fam, mi);
  const e = fam.creature ? makeCreatureRaw(fam.creature, v.tint, bx, -Math.PI / 2, v.scale)
                         : makeFighterRaw(v.tint, bx, -Math.PI / 2, v.scale, texObjs.patchwork);
  if (!e) return null;
  if (fam.head) attachHead(e, fam.head); // species head attachment (pumpkin, masks...)
  if (hasMod('titans') && missionR() < 0.18 && !v.boss) { e.sc = (e.sc || 1) * 1.35; e.root.scale.multiplyScalar(1.35); e.maxHp = e.hp = Math.round(e.hp * 2.2); e.name = 'TITAN ' + e.name; }
  else if (hasMod('frenzy') && missionR() < 0.25) { e.spd *= 1.5; e.dmgMult *= 1.25; e.name = 'FRENZIED ' + e.name; }
  const df = effDiff();
  e.isPlayer = false; e.name = v.name; e.maxHp = e.hp = Math.round(v.hp * df.hpMul);
  e.dmgMult = v.dmg * df.dmgMul; e.spd = v.spd; e.move = v.move; e.sig = fam.sig || null; e.sigUse = false;
  e.px = bx; e.pz = clamp(bz, -1.3, 1.3);
  e.ai = 'walk'; e.aiT = rnd(0.4, 1.2) / df.aggro; e.windup = 0; e.vy = 0; e.airborne = false; e.aggro = df.aggro;
  syncPos(e);
  playAnim(e, 'Running_A', { loop: true });
  enemies.push(e);
  return e;
}
function spawnBoss(bossId, bx) {
  const b = bossDef(bossId);
  const e = b.creature ? makeCreatureRaw(b.creature, b.tint, bx, -Math.PI / 2, b.scale)
                       : makeFighterRaw(b.tint, bx, -Math.PI / 2, b.scale, texObjs.patchwork);
  if (!e) return null;
  if (b.head) attachHead(e, b.head); // species head attachment (pumpkin king...)
  const dfb = effDiff();
  e.isPlayer = false; e.boss = b; e.name = b.name;
  e.maxHp = e.hp = Math.round(b.hp * dfb.hpMul); e.dmgMult = b.dmg * dfb.dmgMul; e.spd = b.spd; e.aggro = dfb.aggro;
  e.px = bx; e.pz = 0; e.ai = 'walk'; e.patIdx = 0; e.patT = 2.2; e.vy = 0; e.airborne = false;
  syncPos(e);
  playAnim(e, 'Running_A', { loop: true });
  enemies.push(e); bossRef = e;
  bossBeat(b.name); // letterboxed boss entrance card
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
// unique 4th-hit finishers: the every-3rd-hit launcher is per-fighter now
function doFinisher(t) {
  const fd = fighterDef(), fin = fd.fin || 'launch';
  const bdmg = Math.round(26 * player.dmgMult);
  const sp = screenPos(t.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
  if (fin === 'blink') { // GHOST: teleport behind, unseen strike
    sparkFX(player.px, 1.1, player.pz, 0x9a7bff, 12);
    player.px = clamp(t.px - player.face * 0.9, 0.5, mission.len === Infinity ? 1e6 : mission.len - 1.5);
    player.pz = clamp(t.pz, -4.5, 4.5);
    player.root.position.set(player.px, 0, player.pz);
    sparkFX(player.px, 1.1, player.pz, 0x9a7bff, 12);
    flash('#9a7bff');
    landHit(t, bdmg, 'BLINK STRIKE', 0.1, 0.4, false, false);
  } else if (fin === 'slam') { // BRICK: AOE curb stomp
    for (const o of enemies) if (o.hp > 0 && Math.abs(o.px - t.px) < 2.4 && Math.abs(o.pz - t.pz) < 1.7) landHit(o, bdmg, 'CURB STOMP', 0.08, 0.5, true, false);
    shake=Math.max(shake,0.5);
  } else if (fin === 'gavel') { // KINGPIN: heavy single, long hit-stop
    landHit(t, Math.round(bdmg * 1.2), 'GAVEL DROP', 0.16, 0.6, false, false);
    addHitstop(0.14);
  } else if (fin === 'demo') { // SLEDGE: far knockback wreckage
    landHit(t, Math.round(34 * player.dmgMult), 'DEMOLITION', 0.1, 0.7, true, false);
    shake=Math.max(shake,0.55);
  } else if (fin === 'dot') { // VIPER: venom keeps chewing
    landHit(t, Math.round(bdmg * 0.7), 'FANG BARB', 0.06, 0.3, false, false);
    t.dotT = 3; t.dotDps = 9 * player.dmgMult;
    popText('VENOM!', 'spc', sp.x, sp.y - 40);
  } else if (fin === 'cyclone') { // DUST: extended air juggle
    landHit(t, bdmg, 'CYCLONE LIFT', 0.08, 0.4, true, false);
    t.airT = Math.max(t.airT || 0, 0.9);
  } else { // KID BLUE: classic pop-up launcher
    landHit(t, bdmg, 'LAUNCHER', 0.08, 0.4, true, false);
  }
  popText(fd.finname, 'spc', sp.x, sp.y - 70);
  sfx(392, 0.12, 'square', 0.5);
}
function doPunch() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  unlockAudio(); T.taps++; hint(false); save.seenHint = true;
  // fighting-game motion input + HIT (additive: plain tap combat unchanged)
  const mot = detectMotion();
  if (mot) { doMotionSpecial(mot); return; }
  // aerial: dive kick
  if (player.airT > 0) { doJumpAttack(); return; }
  let ce = null;
  for (const e of enemies) { if (e.hp > 0 && e.windup > 0 && Math.abs(e.px - player.px) < 2.4 && Math.abs(e.pz - player.pz) < 1.3) { ce = e; break; } }
  // directional moves (SF/SoR style): stick direction + HIT
  const dx = stick.dx, dy = stick.dy;
  let clip, ts, delay, dmg, label, hs, sh, range = 1.9, launcher = false, dash = 0, retreat = 0;
  if (dx > 0.5) { // -> + HIT: LUNGE STRIKE
    [clip, ts, delay, dmg, label, hs, sh] = ['Melee_Unarmed_Attack_Punch_A', 2.2, 0.14, 14, 'LUNGE', 0.05, 0.2];
    range = 2.3; dash = 1.3 * (player.face || 1);
  } else if (dx < -0.5) { // <- + HIT: RETREAT BACKFIST
    [clip, ts, delay, dmg, label, hs, sh] = ['Melee_Unarmed_Attack_Punch_A', 2.0, 0.16, 12, 'BACKFIST', 0.06, 0.3];
    range = 2.0; retreat = 0.9 * (player.face || 1);
  } else if (dy > 0.5) { // v + HIT: LOW SWEEP (launcher)
    [clip, ts, delay, dmg, label, hs, sh] = ['Melee_Unarmed_Attack_Kick', 1.9, 0.18, 10, 'SWEEP', 0.06, 0.2];
    range = 2.0; launcher = true;
  } else { // neutral: jab/cross/kick cycle
    [clip, ts, delay, dmg, label, hs, sh] = ATK[atkIdx % ATK.length]; atkIdx++;
    launcher = !ce && (atkIdx % 3 === 0);
  }
  if (dash) player.px = clamp(player.px + dash, 0.5, mission.len === Infinity ? 1e6 : mission.len - 1.5);
  if (retreat) player.px = clamp(player.px - retreat, 0.5, mission.len === Infinity ? 1e6 : mission.len - 1.5);
  player.busy = delay + 0.12;
  playAnim(player, clip, { ts: ts * (player.spd || 1), fade: 0.05 });
  sfx('whoosh', 0.45, false, 1.1 + Math.random() * 0.2);
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    if (ce && ce.hp > 0) {
      ce.windup = 0; hideWarn(ce);
      const bfx = blessFx();
      landHit(ce, Math.round(dmg * player.dmgMult * 2 * (1 + (bfx.counterDmg || 0))), 'COUNTER', 0.12, 0.35, false, true);
      const duo = blessDuo(); // SUNDAY SERVICE: counters trigger a shockwave
      if (duo) {
        burst(player.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 24, 0xffd166, 6);
        shake = Math.max(shake, 0.4); sfx('hit3', 0.9, false, 0.8);
        for (const o of enemies) {
          if (o === ce || o.hp <= 0) continue;
          if (Math.abs(o.px - player.px) < 2.6 && Math.abs(o.pz - player.pz) < 1.6)
            landHit(o, Math.round(dmg * player.dmgMult * 0.8), 'SUNDAY SERVICE', 0.06, 0.3, false, false);
        }
      }
      return;
    }
    const t = nearestEnemy(range);
    if (t) {
      if (t.airborne) { t.vy = Math.max(t.vy, 2.2); landHit(t, Math.round(dmg * player.dmgMult * 0.6), 'JUGGLE', 0.03, 0.12, false, false); }
      else if (launcher) doFinisher(t);
      else landHit(t, Math.round(dmg * player.dmgMult * (1 + (blessFx().punchDmg || 0))), label, hs, sh, false, false);
    }
    damageDestructibles(1.7);
    damageDestructibles(range);
  }, delay * 1000);
}
function doTaunt() {
  // TMNT taunt: talk trash, build special meter. Pure addition — costs a beat of vulnerability.
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0 || player.airT > 0) return;
  unlockAudio();
  player.busy = 0.8;
  playAnim(player, 'Melee_Unarmed_Idle', { ts: 0.7, fade: 0.1 });
  player.energy = clamp(player.energy + 25 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
  popText('COME ON!', 'spc', sp.x, sp.y);
  sfx('uiclick', 0.6, false, 0.7);
  setHud(); ev('taunt', {});
}
function doJump() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  if (player.airT > 0) return;
  unlockAudio();
  player.vy = 7.2; player.airT = 0.001; player.py = 0.001;
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 0.6, fade: 0.08 });
  sfx('whoosh', 0.4, false, 1.3);
  ev('jump', {});
}
function doJumpAttack() {
  // dive kick: strike on the way down, small AOE
  player.busy = 0.35;
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 2.4, fade: 0.03 });
  player.vy = Math.min(player.vy, -2); // fast fall into the kick
  sfx('whoosh', 0.55, false, 0.9);
  const hitR = 2.3;
  let hitAny = false;
  for (const e of enemies.slice()) {
    if (e.hp > 0 && Math.abs(e.px - player.px) < hitR && Math.abs(e.pz - player.pz) < 1.6) {
      landHit(e, Math.round(18 * player.dmgMult), 'DIVE KICK', 0.07, 0.3, false, false);
      hitAny = true;
    }
  }
  damageDestructibles(hitR);
  if (hitAny) { shake = Math.max(shake, 0.3); }
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
    damageDestructibles(1.9);
  }, 230);
}
function doSpecial() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
  unlockAudio();
  const fd = fighterDef();
  // MEGA SUPER: ↑↑↓←→ + SPC — cinematic super attack, needs FULL energy
  if (seqMatch(['U', 'U', 'D', 'L', 'R'], 1.8)) {
    inputHist.length = 0;
    if (player.energy >= 100) { doMega(); return; }
    popText('MEGA NEEDS FULL ENERGY', 'bad', innerWidth / 2, innerHeight * 0.4);
    sfx(140, 0.2, 'square', 0.3);
    return;
  }
  // v + SPC: second special at 35 energy
  if (stick.dy > 0.5 && player.energy >= (fd.spc2 ? fd.spc2.cost : 35)) { doSpecial2(fd); return; }
  if (player.energy < 60) { popText('NOT ENOUGH ENERGY', 'bad', innerWidth / 2, innerHeight * 0.4); return; }
  player.energy = Math.max(0, player.energy - 60);
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
function doDesperation() {
  // Final Fight desperation: 360° spin that costs 10% current HP (never lethal) — the panic button
  if (player.busy > 0 || player.airT > 0) return;
  const cost = Math.max(1, Math.round(player.hp * 0.10));
  if (player.hp - cost < 1) { popText('TOO WEAK', 'bad', innerWidth / 2, innerHeight * 0.4); return; }
  player.hp -= cost; player.busy = 0.55; player.dodgeCD = 1.2;
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 2.8, fade: 0.04 });
  slowmo = 0.5; slowmoT = 0.4; flash('#ff2a2a');
  banner('DESPERATION!', 'bad');
  sfx('whoosh', 0.8, false, 0.7); sfx('hit3', 0.8, false, 0.9);
  burst(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 30, 0xff4d4d, 6);
  for (const e of enemies.slice()) {
    if (e.hp > 0 && Math.abs(e.px - player.px) < 2.6 && Math.abs(e.pz - player.pz) < 1.8)
      landHit(e, Math.round(26 * player.dmgMult), 'DESPERATION', 0.08, 0.35, false, false);
  }
  damageDestructibles(2.6);
  setHud(); ev('desperation', {});
}
function doSpecial2(fd) {
  const sp = fd.spc2 || { name: 'RUSH', cost: 50 };
  player.energy = Math.max(0, player.energy - sp.cost);
  slowmo = 0.4; slowmoT = 0.7; shake = 0.55; flash('#ff4fd8');
  banner(sp.name + '!', 'spc');
  sfx('hit3', 1, false, 0.7); sfx('whoosh', 0.8, false, 0.8);
  const kind = { kidblue: 'dash', viper: 'dash', ghost: 'blink', brick: 'slam', kingpin: 'slam', sledge: 'slam' }[fd.id] || 'slam';
  if (kind === 'dash') {
    const dir = player.face || 1, dist = 4.2;
    player.px = clamp(player.px + dir * dist, 0.5, mission.len === Infinity ? 1e6 : mission.len - 1.5);
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 30, 0xff4fd8, 6);
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - (player.px - dir * dist / 2)) < dist / 2 + 0.8 && Math.abs(e.pz - player.pz) < 1.6)
        landHit(e, Math.round(30 * player.dmgMult), sp.name, 0.08, 0.35, false, false);
    }
  } else if (kind === 'blink') {
    const near = enemies.filter((e) => e.hp > 0).sort((a, b) =>
      (Math.abs(a.px - player.px) - Math.abs(b.px - player.px))).slice(0, 3);
    for (const e of near) {
      burst(e.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 18, 0x7af0ff, 5);
      landHit(e, Math.round(26 * player.dmgMult), sp.name, 0.06, 0.25, false, false);
    }
    if (!near.length) popText('NO TARGET', '', innerWidth / 2, innerHeight * 0.4);
  } else { // slam: radial shockwave + launch
    burst(player.root.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 45, 0xffb03d, 8);
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - player.px) < 3.4 && Math.abs(e.pz - player.pz) < 2.2)
        landHit(e, Math.round(34 * player.dmgMult), sp.name, 0.09, 0.4, true, false);
    }
  }
  damageDestructibles(3.4);
  setHud();
}
let lastDodgeTap = 0;
function doDodge() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
  unlockAudio();
  const now = performance.now();
  if (now - lastDodgeTap < 320 && player.dodgeCD <= 0) { lastDodgeTap = 0; doDesperation(); return; }
  lastDodgeTap = now;
  if (player.dodgeCD > 0) return;
  player.dodgeCD = 0.9 * (1 - (blessFx().dodgeCd || 0)); player.dodgeT = 0.35;
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
  if (player) player.energy = clamp(player.energy + 8 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
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
  pushT = 0.85; pushPos.copy(e.root.position);
  $('ko').classList.add('show'); setTimeout(() => $('ko').classList.remove('show'), 900);
  const base = e.boss ? 60 : 8 + Math.round(distWalked * 0.2);
  awardCash(base, e.root.position.clone());
  if (combo >= 5) awardCash(Math.min(combo, 20), e.root.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 'COMBO');
  if (mission.crowd) crowdCheer();
  if (R_safe() < 0.32) {
    const roll = R_safe();
    spawnPickup(roll < 0.4 ? 'health' : roll < 0.8 ? 'cash' : 'special',
      clamp(e.root.position.x + rnd(-0.8, 0.8), 0.5, 1e6), clamp(e.root.position.z + rnd(-0.8, 0.8), -1.4, 1.4));
  }
  if (player && player.hp > 0) {
    player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.06 + (blessFx().lifesteal || 0)); // OLD BLOOD
    player.energy = clamp(player.energy + 15 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
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
  dmg = Math.max(1, Math.round(dmg * (1 - (blessFx().armor || 0)))); // IRON SKIN
  player.hp -= dmg; combo = 0; shake = 0.3; hitstop = 0.05; flash('#ff2a2a'); sfx('hit2', 0.8, false, 0.7);
  player.energy = clamp(player.energy + 12 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
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
  bind('btnAtk', doPunch); bind('btnHvy', doHeavy); bind('btnDdg', doDodge); bind('btnSpc', doSpecial); bind('btnJmp', doJump);
  document.addEventListener('pointerdown', (e) => {
    if (cine && (cine.mode !== 'mega' || cine.t > 1.5)) { endCine(); return; } // tap to skip cinematics
    if (e.target.closest('.abtn,button,.card,.skinDot,.shopItem,.mcard,.skinDot')) return;
    unlockAudio();
    if (state === 'title') { playIntro(); return; }
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
  $('fightBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); showMission(); });
  $('againBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); showMission(); });
  $('backBtn').addEventListener('click', (e) => { e.stopPropagation(); sfx('uiclick', 0.8); showSelect(); });
  $('pauseBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
  $('tauntBtn').addEventListener('click', (e) => { e.stopPropagation(); doTaunt(); });
  $('resumeBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(false); });
  $('restartBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(false); startMission(mission.id); });
  $('quitBtn').addEventListener('click', (e) => { e.stopPropagation(); setPaused(false); $('pauseOv').classList.add('hidden'); showMission(); });
  $('muteBtn').addEventListener('click', (e) => { e.stopPropagation(); save.muted = !save.muted; e.target.textContent = save.muted ? 'OFF' : 'ON'; writeSave(); sfx('uiclick', 0.7); });
  $('qualityBtn').addEventListener('click', (e) => { e.stopPropagation(); save.quality = save.quality === 'auto' ? 'low' : save.quality === 'low' ? 'high' : 'auto'; e.target.textContent = save.quality.toUpperCase(); writeSave(); sfx('uiclick', 0.7); applyQuality(); });
  $('muteBtn').textContent = save.muted ? 'OFF' : 'ON';
  $('qualityBtn').textContent = save.quality.toUpperCase();
  $('boardBtn').addEventListener('click', (e) => { e.stopPropagation(); sfx('uiclick', 0.8); renderBoard(); $('boardOv').classList.remove('hidden'); });
  $('boardClose').addEventListener('click', (e) => { e.stopPropagation(); sfx('uiclick', 0.7); $('boardOv').classList.add('hidden'); });
  $('tipBtnTitle').addEventListener('click', (e) => { e.stopPropagation(); tipJar(); });
  $('tipBtnResults').addEventListener('click', (e) => { e.stopPropagation(); tipJar(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p') { togglePause(); return; }
    if (state !== 'fight') return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') stick.dx = -1;
    if (k === 'arrowright' || k === 'd') stick.dx = 1;
    if (k === 'arrowup' || k === 'w') stick.dy = -1;
    if (k === 'arrowdown' || k === 's') stick.dy = 1;
    if (k === 'j') doPunch();
    if (k === 'k') doHeavy();
    if (k === 'l') doDodge();
    if (k === 'u') doSpecial();
    if (k === 't') doTaunt();
    if (k === ' ') { e.preventDefault(); doJump(); }
  });
  document.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if ((k === 'arrowleft' || k === 'a') && stick.dx < 0) stick.dx = 0;
    if ((k === 'arrowright' || k === 'd') && stick.dx > 0) stick.dx = 0;
    if ((k === 'arrowup' || k === 'w') && stick.dy < 0) stick.dy = 0;
    if ((k === 'arrowdown' || k === 's') && stick.dy > 0) stick.dy = 0;
  });
  addEventListener('resize', resize);
}

// ---------- enemy AI ----------
let camX = 2;
function enemyAI(e, dt) {
  if (e.hp <= 0) return;
  if (window.__cdfreeze) return; // test hook: freeze enemy AI for deterministic verification
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
      // ENEMY SIGNATURES (owner 2026-10-06): every archetype has its own signature move
      e.sigUse = e.sig && Math.random() < (window.__cdSigChance ?? e.sig.chance);
      e.windup = e.sigUse ? 0.9 : (e.move === 'flurry' ? 0.5 : 0.75);
      showWarn(e, e.sigUse ? e.sig.name : undefined);
      playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
    }
  } else if (e.ai === 'windup') {
    e.windup -= dt;
    if (e.windup <= 0) { hideWarn(e); enemyStrike(e); e.ai = 'recover'; e.aiT = rnd(0.8, 1.7) / (e.aggro || 1); }
  } else if (e.ai === 'recover') {
    e.aiT -= dt; if (e.aiT <= 0) { e.ai = 'walk'; playAnim(e, 'Running_A', { loop: true }); }
  }
  syncPos(e);
}
function enemyStrike(e) {
  if (e.hp <= 0 || state !== 'fight' || missionOver || ended) return;
  if (e.sigUse && e.sig) { execEnemySig(e); return; }
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
// ---------- ENEMY SIGNATURE MOVES (owner 2026-10-06): every archetype has its own ----------
// Data-driven: ENEMY_FAMS[].sig = { id, name, chance }. Original names, distinct behavior.
// Guard helper: delayed hit on the player if still in range (dodge-aware).
function sigHitPlayer(e, rx, rz, dmg, label, delay, opts = {}) {
  setTimeout(() => {
    if (!e || e.hp <= 0 || state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
    const dx = Math.abs(player.px - e.px), dz = Math.abs(player.pz - e.pz);
    if (dx < rx && dz < rz) {
      if (player.dodgeT > 0) { nearMiss(e); return; }
      hurtPlayer(dmg);
      const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 1.6, 0)));
      popText(label, 'spc', sp.x, sp.y - 50);
      if (opts.slow) { player.slowT = opts.slow; }
      if (opts.heal) { e.hp = Math.min(e.maxHp, e.hp + Math.round(dmg * opts.heal)); }
      if (opts.burst) { const bp = e.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)); burst(bp, 22, opts.burst, 6); shake = Math.max(shake, 0.45); }
    }
  }, delay);
}
function execEnemySig(e) {
  const id = e.sig.id, dir = Math.sign(player.px - e.px) || 1;
  T.esig = T.esig || {}; T.esig[id] = (T.esig[id] || 0) + 1; // test hook
  const base = Math.round(14 * e.dmgMult);
  if (id === 'curbcheck') { // STREET THUG: heavy overhand, big shake
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.3 });
    sigHitPlayer(e, 1.8, 0.9, Math.round(base * 1.6), 'CURB CHECK', 320, { burst: 0xffb03d });
  } else if (id === 'debtcollector') { // BIG RICO: wide shoulder-slam AOE
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.1 });
    sfx('hit3', 0.9, false, 0.8);
    sigHitPlayer(e, 2.4, 1.4, Math.round(base * 1.3), 'DEBT COLLECTOR', 380, { burst: 0x9a6bff });
  } else if (id === 'hundredhands') { // JABBER: 4-hit rapid flurry
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.6 });
    for (let i = 0; i < 4; i++) sigHitPlayer(e, 1.6, 0.8, Math.round(base * 0.55), i === 3 ? 'HUNDRED HANDS' : '', 200 + i * 170);
  } else if (id === 'freighttrain') { // HEAVY D: signature charge, hits on pass
    banner('FREIGHT TRAIN');
    e.chargeT = 0.7; e.chargeDx = dir; e.chargeHit = false; e.chargeDmg = Math.round(base * 1.5);
    playAnim(e, 'Running_A', { ts: 2.6 }); sfx('hit2', 1, false, 0.6);
  } else if (id === 'shivrain') { // STRAY: double knife slash, second cuts deeper
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.2 });
    sigHitPlayer(e, 1.7, 0.85, Math.round(base * 0.9), '', 220);
    sigHitPlayer(e, 1.7, 0.85, Math.round(base * 1.6), 'SHIV RAIN', 460, { burst: 0xd8d8e8 });
  } else if (id === 'harvestmoon') { // JACK: leaping slam, pumpkin shockwave ring
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.2 });
    sfx('hit3', 1, false, 0.7);
    sigHitPlayer(e, 2.3, 1.3, Math.round(base * 1.4), 'HARVEST MOON', 400, { burst: 0xff7a1a });
  } else if (id === 'gravebite') { // ROTTEN: lunge bite, drains life
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.8 });
    sfx('hit2', 0.9, false, 0.8);
    sigHitPlayer(e, 2.0, 1.0, Math.round(base * 1.2), 'GRAVEBITE', 300, { burst: 0x7a9a5a, heal: 0.4 });
  } else if (id === 'hellfirearc') { // HELLION: fire wave projectile
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.4 });
    banner('HELLFIRE ARC');
    fireProj({ x: e.px + dir * 0.8, z: e.pz, y: 1.15, vx: dir * 7.5, kind: 'shock', dmg: Math.round(base * 1.2), color: 0xff5a1a, fromPlayer: false, life: 1.4, label: 'HELLFIRE ARC' });
  } else if (id === 'websnare') { // WEAVER: web shot that slows
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.4 });
    fireProj({ x: e.px + dir * 0.8, z: e.pz, y: 1.0, vx: dir * 6.5, kind: 'orb', dmg: Math.round(base * 0.9), color: 0xd8d8e8, fromPlayer: false, life: 1.6, label: 'WEB SNARE' });
    // web applies slow on hit — hooked in the projectile update via label
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
  // BOSS SIGNATURES (owner 2026-10-06): 25% of the time the boss uses its personal signature
  if (e.boss.sig && Math.random() < 0.25) {
    e.pat = 'sig'; e.ai = 'windup'; e.windup = 1.0;
    playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
    showWarn(e, e.boss.sig.name);
    return;
  }
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
  if (pat === 'sig') { execBossSig(e); return; }
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
// ---------- BOSS SIGNATURE MOVES (owner 2026-10-06): each boss has its own ----------
function execBossSig(e) {
  const id = e.boss.sig.id, dir = Math.sign(player.px - e.px) || 1;
  T.bsig = T.bsig || {}; T.bsig[id] = (T.bsig[id] || 0) + 1; // test hook
  const base = Math.round(22 * e.dmgMult);
  const bp = e.root.position.clone();
  if (id === 'kingsdecree') { // KINGPIN: double shockwave rings
    banner("KING'S DECREE");
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.0 });
    for (let w = 0; w < 2; w++) setTimeout(() => {
      if (!e || e.hp <= 0 || state !== 'fight' || missionOver || ended) return;
      burst(bp.clone().add(new THREE.Vector3(0, 0.4, 0)), 30, 0xffb03d, 7); shake = 0.55; sfx('hit3', 1, false, 0.7);
      const dx = Math.abs(player.px - e.px), dz = Math.abs(player.pz - e.pz);
      if (dx < 3.2 && dz < 1.8) { if (player.dodgeT > 0) nearMiss(e); else hurtPlayer(Math.round(base * (w ? 1.2 : 0.9))); }
    }, 250 + w * 550);
  } else if (id === 'wreckingball') { // SLEDGE: 360 spin, hits everything around
    banner('WRECKING BALL');
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 2.2 });
    burst(bp.clone().add(new THREE.Vector3(0, 0.5, 0)), 26, 0xb3541e, 6); shake = 0.5; sfx('hit3', 1, false, 0.6);
    sigHitPlayer(e, 3.0, 1.8, Math.round(base * 1.3), 'WRECKING BALL', 350, { burst: 0xb3541e });
  } else if (id === 'serpentsembrace') { // VIPER: venom dash through the player
    banner("SERPENT'S EMBRACE");
    e.chargeT = 0.5; e.chargeDx = dir; e.chargeHit = false; e.chargeDmg = Math.round(base * 1.1);
    playAnim(e, 'Running_A', { ts: 3.0 }); sfx('hit2', 1, false, 0.8);
  } else if (id === 'ruststorm') { // RUST: debris vortex, 3 ticks
    banner('RUST STORM');
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.2 });
    for (let w = 0; w < 3; w++) setTimeout(() => {
      if (!e || e.hp <= 0 || state !== 'fight' || missionOver || ended) return;
      burst(bp.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 0.8, (Math.random() - 0.5) * 1.4)), 18, 0xc0c9d6, 5);
      shake = Math.max(shake, 0.4); sfx('hit2', 0.8, false, 0.9);
      const dx = Math.abs(player.px - e.px), dz = Math.abs(player.pz - e.pz);
      if (dx < 2.8 && dz < 1.6) { if (player.dodgeT > 0) nearMiss(e); else hurtPlayer(Math.round(base * 0.7)); }
    }, 300 + w * 450);
  } else if (id === 'dragonsmaw') { // CONCRETE DRAGON: 3-fireball spread
    banner("DRAGON'S MAW");
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.3 });
    for (let i = -1; i <= 1; i++) fireProj({ x: e.px + dir * 1.2, z: e.pz, y: 1.6, vx: dir * 8, vz: i * 1.6, kind: 'fire', dmg: Math.round(base * 0.8), color: 0xff4d00, fromPlayer: false, life: 1.6, label: "DRAGON'S MAW" });
  } else if (id === 'pumpkingslam') { // PUMPKIN KING: royal harvest — giant pumpkin shockwave
    banner('ROYAL HARVEST');
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.0 });
    burst(bp.clone().add(new THREE.Vector3(0, 0.6, 0)), 34, 0xff7a1a, 7); shake = 0.6; sfx('hit3', 1, false, 0.6);
    sigHitPlayer(e, 3.4, 2.0, Math.round(base * 1.4), 'ROYAL HARVEST', 400, { burst: 0xff7a1a });
  }
  e.ai = 'recover'; e.aiT = 1.4 / (e.aggro || 1);
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
        let fam = s.fam;
        if (hasMod('brutes') && fam === 'thug' && missionR() < 0.5) fam = 'heavyd';
        let n = s.n + (hasMod('rush') ? Math.ceil(s.n / 2) : 0);
        for (let i = 0; i < n; i++) spawnEnemy(fam, mi, player.px + 9 + i * 1.6, rnd(-1.2, 1.2));
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
let dbgFrames = 0;
function playerUpdate(dt) {
  dbgFrames++;
  const p = player;
  if (p.dodgeT > 0) p.dodgeT -= dt;
  if (p.dodgeCD > 0) p.dodgeCD -= dt;
  if (p.spinT > 0) p.spinT -= dt;
  if (p.slowT > 0) p.slowT -= dt; // WEB SNARE slow
  const spd = 4.4 * (p.spd || 1) * (p.slowT > 0 ? 0.45 : 1) * (1 + (blessFx().moveSpd || 0));
  let mx = stick.dx * spd, mz = stick.dy * spd;
  if (p.dodgeT > 0) { mx = p.dodgeDx * 10; mz = p.dodgeDz * 10; }
  const maxX = mission.len === Infinity ? 1e6 : mission.len - 1.5;
  p.px = clamp(p.px + mx * dt, 0.5, maxX);
  p.pz = clamp(p.pz + mz * dt, -1.4, 1.4);
  for (const c of colliders) { // solid props block movement (owner bug report 2026-10-06)
    if (c.dead) continue;
    const cx = p.px - c.x, cz = p.pz - c.z, rr = c.r + 0.45;
    const d2 = cx * cx + cz * cz;
    if (d2 < rr * rr && d2 > 0.0001) { const d = Math.sqrt(d2); p.px = c.x + cx / d * rr; p.pz = c.z + cz / d * rr; }
  }
  if (p.airT > 0) { // jump physics
    p.airT += dt; p.vy -= 22 * dt; p.py = Math.max(0, (p.py || 0) + p.vy * dt);
    if (p.py <= 0) { p.py = 0; p.airT = 0; p.vy = 0;
      burst(p.root.position.clone().add(new THREE.Vector3(0, 0.1, 0)), 8, 0x999999, 2);
      if (p.busy <= 0) playAnim(p, 'Melee_Unarmed_Idle', { loop: true });
    }
  }
  if (p.spinT > 0) { // IRON CYCLONE: spinning travel, multi-hit
    const maxX = mission.len === Infinity ? 1e6 : mission.len - 1.5;
    p.px = clamp(p.px + p.face * 9.5 * dt, 0.5, maxX);
    p.root.rotation.y += dt * 16 * p.face;
    for (const e of enemies) {
      if (!e.dead && e.hp > 0 && !p.spinHit.has(e) && Math.abs(e.px - p.px) < 1.6 && Math.abs(e.pz - p.pz) < 1.25) {
        p.spinHit.add(e);
        landHit(e, Math.round((p.spinDmg || 16) * p.dmgMult), p.spinName || 'SPIN', 0.05, 0.3, false, false);
      }
    }
    if (Math.random() < 0.65) sparkFX(p.px, 0.9, p.pz, p.spinColor || 0x80ed99, 3);
  } else {
    const tgt = nearestEnemy(99);
    if (tgt) { p.face = tgt.px >= p.px ? 1 : -1; p.root.rotation.y = p.face > 0 ? Math.PI / 2 : -Math.PI / 2; }
    else if (Math.abs(mx) > 0.4) { p.face = mx > 0 ? 1 : -1; p.root.rotation.y = p.face > 0 ? Math.PI / 2 : -Math.PI / 2; }
  }
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
        if (p.dodgeT > 0) nearMiss(e); else hurtPlayer(e.chargeDmg || Math.round(20 * e.dmgMult));
      }
      if (e.chargeT <= 0) { e.chargeHit = false; e.ai = 'recover'; e.aiT = 1.0; playAnim(e, 'Melee_Unarmed_Idle', { loop: true }); }
    }
  }
}
// ---------- fighting-game motion inputs (SF/KoF style on touch) ----------
// The stick feeds a direction-history buffer; button presses complete motions:
//   ↓→ + HIT = projectile special · ←→ + HIT = dash strike · ↓↑ + HIT = rising launcher
//   ↑↑↓←→ + SPC = MEGA SUPER (cinematic). Base tap combat is untouched.
const inputHist = []; // {d:'U'|'D'|'L'|'R'|'UR'|'DR'|'DL'|'UL', t}
let lastQDir = '';
const sstep = (t) => t * t * (3 - 2 * t);
function quantDir(dx, dy) {
  if (Math.hypot(dx, dy) < 0.32) return '';
  const a = Math.atan2(dy, dx) * 180 / Math.PI; // dy+ = down on screen
  if (a >= -22.5 && a < 22.5) return 'R';
  if (a >= 22.5 && a < 67.5) return 'DR';
  if (a >= 67.5 && a < 112.5) return 'D';
  if (a >= 112.5 && a < 157.5) return 'DL';
  if (a >= 157.5 || a < -157.5) return 'L';
  if (a >= -157.5 && a < -112.5) return 'UL';
  if (a >= -112.5 && a < -67.5) return 'U';
  return 'UR';
}
function recordStick() {
  if (state !== 'fight' || cine || !player) return;
  const q = quantDir(stick.dx, stick.dy);
  if (q && q !== lastQDir) { inputHist.push({ d: q, t: gameTime }); if (inputHist.length > 24) inputHist.shift(); }
  if (!q) lastQDir = '';
}
// pattern elements fuzzy-match diagonals ('DR' counts as 'D' or 'R')
function seqMatch(pattern, window) {
  const n = inputHist.length;
  if (!n || gameTime - inputHist[n - 1].t > 0.4) return false; // motion must be fresh
  let pi = pattern.length - 1;
  for (let i = n - 1; i >= 0 && pi >= 0; i--) {
    const h = inputHist[i];
    if (gameTime - h.t > window) break;
    if (h.d === pattern[pi] || h.d.indexOf(pattern[pi]) >= 0) pi--;
  }
  return pi < 0;
}
function detectMotion() {
  const f = player.face > 0 ? 'R' : 'L', b = player.face > 0 ? 'L' : 'R';
  if (seqMatch(['D', f], 0.65)) return 'qcf';
  if (seqMatch([b, f], 0.6)) return 'bf';
  if (seqMatch(['D', 'U'], 0.6)) return 'du';
  return null;
}
// ---------- projectiles (motion-input specials) ----------
const projs = []; // {spr,x,y,z,vx,vy,vz,kind,dmg,from,color,pierce,life,arc,radius,hitSet}
function fireProj(o) {
  const mat = new THREE.SpriteMaterial({ map: sparkTex, color: o.color, transparent: true, opacity: 1, depthWrite: false });
  const s = new THREE.Sprite(mat);
  const sc = o.kind === 'beam' ? [1.9, 0.6] : o.kind === 'shock' ? [1.3, 0.55] : o.kind === 'orb' ? [1.15, 1.15] : [0.9, 0.9];
  s.scale.set(sc[0], sc[1], 1);
  s.position.set(o.x, o.y || 1.15, o.z);
  scene.add(s);
  projs.push({ spr: s, x: o.x, y: o.y || 1.15, z: o.z, vx: o.vx, vy: o.vy || 0, vz: o.vz || 0, kind: o.kind, label: o.label || null, dmg: o.dmg, from: o.fromPlayer ? 'p' : 'e', color: o.color, pierce: o.pierce || 0, life: o.life || 1.6, arc: o.arc || 0, radius: o.radius || 0.55, hitSet: new Set() });
  sfx(520, 0.25, 'square', 0.3);
  shake=Math.max(shake,0.25);
}
function projHitEnemy(p, e) {
  if (p.hitSet.has(e)) return;
  p.hitSet.add(e);
  landHit(e, Math.round(p.dmg), p.label || (p.kind === 'orb' ? 'ORB BURST' : 'PROJ'), 0.06, 0.35, p.kind === 'orb' || p.kind === 'spin', false);
  sparkFX(p.x, p.y, p.z, p.color, 10);
  if (p.kind === 'orb') { // explosive orb: AOE
    for (const o of enemies) { if (o !== e && !o.dead && o.hp > 0 && Math.abs(o.px - p.x) < 2.4 && Math.abs(o.pz - p.z) < 1.8) landHit(o, Math.round(p.dmg * 0.7), 'ORB BURST', 0.06, 0.4, true, false); }
    sparkFX(p.x, p.y, p.z, 0xffffff, 16); shake=Math.max(shake,0.5); sfx(180, 0.4, 'sawtooth', 0.5);
  }
  addHitstop(0.05);
}
function updateProjs(dt) {
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i];
    p.life -= dt;
    if (p.arc) p.vy -= 14 * dt;
    p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
    if (p.y < 0.15) { p.y = 0.15; p.vy = 0; if (p.arc) { sparkFX(p.x, 0.3, p.z, p.color, 6); p.life = 0; } }
    p.spr.position.set(p.x, p.y, p.z);
    p.spr.material.rotation += dt * 9;
    if (Math.random() < 0.45) sparkFX(p.x, p.y, p.z, p.color, 2);
    if (p.kind === 'fangwave' && Math.random() < 0.7) sparkFX(p.x, 0.18, p.z, p.color, 3);
    let dead = p.life <= 0 || Math.abs(p.x) > 32 || Math.abs(p.z) > 15;
    if (!dead && p.from === 'p') {
      for (const e of enemies) {
        if (e.dead || e.hp <= 0 || (p.hitSet.has(e) && p.pierce < 99)) continue;
        if (Math.abs(e.px - p.x) < 0.75 + p.radius * 0.3 && Math.abs(e.pz - p.z) < 1.15 && p.y < 2.8) {
          projHitEnemy(p, e);
          if (!p.pierce) { dead = true; break; }
        }
      }
      if (!dead) for (const d of destructibles) {
        if (!d.dead && Math.abs(d.px - p.x) < 1.0 && Math.abs(d.pz - p.z) < 1.0) { destroyDestructible(d); if (!p.pierce) { dead = true; break; } }
      }
    } else if (!dead && p.from === 'e' && player && player.hp > 0) {
      if (Math.abs(player.px - p.x) < 0.8 && Math.abs(player.pz - p.z) < 1.1 && p.y < 2.4) {
        hurtPlayer(p.dmg, p.vx >= 0 ? 1 : -1); dead = true;
        if (p.label === 'WEB SNARE') { // WEAVER signature: webbed = slowed
          player.slowT = 1.6;
          const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 1.6, 0)));
          popText('WEBBED!', 'bad', sp.x, sp.y - 50); sfx('hit2', 0.7, false, 0.6);
        }
      }
    }
    if (dead) { scene.remove(p.spr); p.spr.material.dispose(); projs.splice(i, 1); }
  }
}
// ---------- motion specials (25 energy each) ----------
function doMotionSpecial(kind) {
  const fd = fighterDef();
  inputHist.length = 0;
  if (player.energy < 25) { const sp = screenPos(player.root.position); popText('NOT ENOUGH ENERGY', 'bad', sp.x, sp.y - 60); sfx(140, 0.15, 'square', 0.3); return; }
  player.energy = Math.max(0, player.energy - 25); setHud();
  if (kind === 'qcf') {
    // SIGNATURE ATTACKS (owner 2026-10-06): only Kid Blue throws a fireball.
    // Every fighter's ↓→ + HIT is their own personal special, SF-style.
    const pr = fd.qcf, dmgM = player.dmgMult;
    const sp = screenPos(player.root.position);
    const present = () => {
      popText(pr.name, 'spc', sp.x, sp.y - 80);
      banner(pr.name, 'spc');
      addHitstop(0.08); addSlowmo(0.3, 0.35);
      flash('#' + pr.color.toString(16).padStart(6, '0'));
      if (navigator.vibrate) navigator.vibrate(25);
    };
    if (pr.sigkind === 'fireball' || pr.sigkind === 'orb') {
      playAnim(player, 'Melee_Unarmed_Attack_Punch_A', { once: true, dur: 0.35 });
      player.busy = Math.max(player.busy, 0.3);
      fireProj({ x: player.px + player.face * 0.8, z: player.pz, y: 1.15, vx: player.face * pr.speed, vy: pr.arc ? 4.5 : 0, kind: pr.kind, label: pr.name, dmg: pr.dmg * dmgM, color: pr.color, fromPlayer: true, life: pr.sigkind === 'orb' ? 2.4 : 1.5, radius: 0.55, arc: pr.arc || 0 });
      present();
    } else if (pr.sigkind === 'groundwave') {
      playAnim(player, 'Melee_Unarmed_Attack_Kick_A', { once: true, dur: 0.35 });
      player.busy = Math.max(player.busy, 0.3);
      fireProj({ x: player.px + player.face * 0.8, z: player.pz, y: 0.28, vx: player.face * pr.speed, kind: 'fangwave', label: pr.name, dmg: pr.dmg * dmgM, color: pr.color, fromPlayer: true, pierce: 99, life: 1.1, radius: 0.9 });
      present();
    } else if (pr.sigkind === 'teleport') {
      const e = nearestEnemy(9);
      playAnim(player, 'Melee_Unarmed_Attack_Punch_A', { once: true, dur: 0.35 });
      player.busy = Math.max(player.busy, 0.35);
      sparkFX(player.px, 1.1, player.pz, pr.color, 12);
      sfx(880, 0.2, 'sine', 0.35);
      if (e) {
        player.px = clamp(e.px - player.face * 1.15, 0.5, 1e6); player.pz = e.pz; syncPos(player);
        sparkFX(player.px, 1.1, player.pz, pr.color, 14);
        landHit(e, Math.round(pr.dmg * dmgM), pr.name, 0.09, 0.45, false, false);
      }
      present();
    } else if (pr.sigkind === 'grab') {
      playAnim(player, 'Melee_Unarmed_Attack_Punch_A', { once: true, dur: 0.4 });
      player.busy = Math.max(player.busy, 0.6);
      const e = nearestEnemyFront(3.4);
      if (e) {
        e.px = player.px + player.face * 0.95; e.pz = player.pz; syncPos(e);
        playAnim(e, 'Hit_A', { ts: 1.2 });
        sparkFX(e.px, 1.2, e.pz, pr.color, 12);
        sfx(220, 0.25, 'sawtooth', 0.5);
        setTimeout(() => {
          if (state !== 'fight' || !e || e.hp <= 0) return;
          landHit(e, Math.round(pr.dmg * player.dmgMult), pr.name, 0.12, 0.6, true, false);
          for (const o of enemies) { if (o !== e && !o.dead && o.hp > 0 && Math.abs(o.px - e.px) < 2.2 && Math.abs(o.pz - e.pz) < 1.6) landHit(o, Math.round(20 * player.dmgMult), 'SHOCKWAVE', 0.06, 0.35, false, false); }
          burst(new THREE.Vector3(e.px, 0.4, e.pz), 18, pr.color, 5);
          shake = Math.max(shake, 0.55);
        }, 300);
      } else {
        player.px = clamp(player.px + player.face * 1.4, 0.5, 1e6); syncPos(player);
      }
      present();
    } else if (pr.sigkind === 'spin') {
      playAnim(player, 'Melee_Unarmed_Attack_Punch_A', { once: true, dur: 0.5 });
      player.busy = Math.max(player.busy, 0.55);
      player.spinT = 0.55; player.spinHit = new Set();
      player.spinName = pr.name; player.spinColor = pr.color; player.spinDmg = pr.dmg;
      sfx(300, 0.4, 'sawtooth', 0.4);
      present();
    } else if (pr.sigkind === 'erupt') {
      playAnim(player, 'Melee_Unarmed_Attack_Kick_A', { once: true, dur: 0.4 });
      player.busy = Math.max(player.busy, 0.45);
      const targets = enemies.filter(e => !e.dead && e.hp > 0 && Math.hypot(e.px - player.px, e.pz - player.pz) < 5.5);
      targets.forEach((e, i) => {
        setTimeout(() => {
          if (state !== 'fight' || !e || e.hp <= 0) return;
          burst(new THREE.Vector3(e.px, 0.25, e.pz), 14, pr.color, 5);
          sparkFX(e.px, 0.6, e.pz, 0x8a6b3d, 8);
          landHit(e, Math.round(pr.dmg * player.dmgMult), pr.name, 0.07, 0.42, true, false);
          shake = Math.max(shake, 0.4); sfx(120, 0.3, 'sawtooth', 0.5);
        }, i * 90);
      });
      if (!targets.length) sparkFX(player.px + player.face, 0.3, player.pz, pr.color, 8);
      present();
    }
  } else if (kind === 'bf') {
    playAnim(player, 'Melee_Unarmed_Attack_Kick_A', { once: true, dur: 0.35 });
    player.busy = 0.45; player.dodgeT = 0.35; player.dodgeDX = player.face * 16; player.dodgeCD = 0.6;
    const sp = screenPos(player.root.position); popText(fd.bfname, 'spc', sp.x, sp.y - 80);
    setTimeout(() => { for (const e of enemies) { if (!e.dead && e.hp > 0 && Math.abs(e.px - player.px) < 2.8 && Math.abs(e.pz - player.pz) < 1.5) landHit(e, Math.round(26 * player.dmgMult), fd.bfname, 0.07, 0.4, false, false); } sparkFX(player.px + player.face * 1.5, 1.1, player.pz, 0x7af0ff, 8); }, 150);
    addSlowmo(0.35, 0.3);
  } else if (kind === 'du') {
    playAnim(player, 'Melee_Unarmed_Attack_Punch_B', { once: true, dur: 0.4 });
    player.busy = 0.5; player.airT = 0.35; player.vy = 6;
    const sp = screenPos(player.root.position); popText(fd.duname, 'spc', sp.x, sp.y - 80);
    setTimeout(() => { for (const e of enemies) { if (!e.dead && e.hp > 0 && Math.abs(e.px - player.px) < 1.7 && Math.abs(e.pz - player.pz) < 1.3) landHit(e, Math.round(30 * player.dmgMult), fd.duname, 0.08, 0.4, true, false); } sparkFX(player.px, 1.6, player.pz, 0xffe14d, 10); }, 130);
    addHitstop(0.08); addSlowmo(0.35, 0.35);
  }
}
// ---------- MEGA SUPER (full energy, cinematic) ----------
function doMega() {
  const fd = fighterDef();
  player.energy = 0; setHud(); inputHist.length = 0;
  playAnim(player, 'Melee_Unarmed_Idle', { ts: 0.35 });
  cine = { mode: 'mega', t: 0, dur: 3.2, hit: false };
  document.body.classList.add('cine');
  const mn = $('megaName'); mn.textContent = fd.mega.name;
  mn.classList.remove('slam'); void mn.offsetWidth; mn.classList.add('slam');
  flash('#ffe14d');
  sfx(880, 0.5, 'sawtooth', 0.5); sfx(110, 0.9, 'square', 0.5);
  shake=Math.max(shake,0.7);
  if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
}
function megaHit() {
  const fd = fighterDef();
  const dmg = 110 * player.dmgMult;
  for (const e of enemies) {
    if (e.dead) continue;
    if (Math.abs(e.px - player.px) < 7.5 && Math.abs(e.pz - player.pz) < 3.4)
      landHit(e, Math.round(dmg * (e.boss ? 0.55 : 1)), fd.mega.name, 0.12, 0.9, !e.boss, false);
  }
  for (let i = -2; i <= 2; i++) // projectile fan for spectacle
    fireProj({ x: player.px + player.face, z: player.pz, y: 1.25 + Math.abs(i) * 0.2, vx: player.face * (10 + Math.abs(i) * 1.5), vz: i * 1.4, kind: 'fire', dmg: 20 * player.dmgMult, color: fd.qcf.color, fromPlayer: true, life: 1.0 });
  sparkFX(player.px + player.face * 1.5, 1.2, player.pz, 0xffe14d, 42);
  sparkFX(player.px + player.face * 1.5, 1.2, player.pz, 0xff4fd8, 30);
  flash('#ffffff');
  shake=Math.max(shake,0.9);
  sfx(220, 0.9, 'sawtooth', 0.6); sfx(55, 1.2, 'square', 0.6);
  if (navigator.vibrate) navigator.vibrate(150);
}
// ---------- cinematics (letterbox / captions / camera) ----------
// Nintendo-style presentation: letterbox bars, slow push-ins, timed text cards,
// logo slam for megas, tap-to-skip. Gameplay freezes during 'mega'; intro/card play over the scene.
let cine = null; // {mode, t, dur, caps:[{t,html}], capIdx, cam(t), onDone, hit}
function letterbox(on) { document.body.classList.toggle('cine', on); }
function playCine(o) {
  cine = Object.assign({ t: 0, caps: [], capIdx: -1 }, o);
  letterbox(true);
  $('cineCap').innerHTML = '';
  $('cineCap').classList.remove('on');
}
function endCine() {
  const cb = cine && cine.onDone;
  cine = null;
  letterbox(false);
  $('cineCap').classList.remove('on');
  if (cb) cb();
}
function updateCine(dt) {
  if (!cine) return;
  cine.t += dt;
  const caps = cine.caps || [];
  for (let i = 0; i < caps.length; i++) {
    if (cine.t >= caps[i].t && cine.capIdx < i) {
      cine.capIdx = i;
      $('cineCap').innerHTML = caps[i].html;
      $('cineCap').classList.remove('on'); void $('cineCap').offsetWidth; $('cineCap').classList.add('on');
    }
  }
  if (cine.mode === 'mega' && player) {
    const t = cine.t, p = player;
    const bx = camX, by = 2.6, bz = 7.6;
    const cx = p.px + 1.7, cy = 1.75, cz = 4.4;
    let k;
    if (t < 0.7) k = sstep(Math.min(1, t / 0.7));
    else if (t > 2.4) k = 1 - sstep(Math.min(1, (t - 2.4) / 0.8));
    else k = 1;
    const jx = (Math.random() - 0.5) * shake * 0.08, jy = (Math.random() - 0.5) * shake * 0.08;
    camera.position.set(lerp(bx, cx, k) + jx, lerp(by, cy, k) + jy, lerp(bz, cz, k));
    camera.lookAt(lerp(bx + 0.2, p.px, k), lerp(1.25, 1.35, k), 0);
    if (!cine.hit && t >= 0.95) { cine.hit = true; megaHit(); }
  } else if (cine.cam) cine.cam(cine.t);
  if (cine.t >= cine.dur) endCine();
}
// cinematic intro: plays once from the title screen, then character select
function playIntro() {
  showOnly(null);
  playCine({
    mode: 'intro', dur: 7.5,
    caps: [
      { t: 0.4, html: '<div class="cc1">CONCRETE DRAGON</div>' },
      { t: 2.6, html: '<div class="cc2">EVERY BLOCK HAS A KING</div><div class="cc3">Neon streets. Heavy fists.<br>No backup coming.</div>' },
      { t: 5.0, html: '<div class="cc2">TAKE IT BACK</div>' },
    ],
    cam: (t) => {
      const k = Math.min(1, t / 7.5);
      camera.position.set(lerp(-9, 9, k), 2.4 - k * 0.7, 9.5 - k * 2.5);
      camera.lookAt(lerp(-4, 4, k), 1.0, 0);
    },
    onDone: () => showSelect(),
  });
  sfx(98, 1.6, 'sawtooth', 0.35);
}
// boss beat: non-blocking letterboxed name card when a boss enters
function bossBeat(name) {
  if (cine) return;
  letterbox(true);
  $('cineCap').innerHTML = '<div class="cc1" style="font-size:34px">' + name + '</div><div class="cc2">BOSS</div>';
  $('cineCap').classList.add('on');
  setTimeout(() => { letterbox(false); $('cineCap').classList.remove('on'); }, 1400);
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
  $('spc').style.width = clamp(player.energy / energyMax() * 100, 0, 100) + '%';
  $('btnSpc').classList.toggle('ready', player.energy >= 60);
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
  if (cine) { updateCine(dt); updateFx(dt); updateProjs(dt); renderer.render(scene, camera); return; }
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
    camera.position.set(0, 1.0, 5.2);
    camera.lookAt(0, 0.1, 0);
  } else if (state === 'mission') {
    camera.position.set(6, 2.8, 8.5);
    camera.lookAt(6, 1.2, 0);
  } else if (state === 'fight' && player) {
    playerUpdate(dt);
    recordStick(); // fighting-game motion input history
    director(dt);
    for (const e of enemies.slice()) enemyAI(e, dt);
    for (const e of enemies) positionWarn(e);
    for (const e of enemies) if (e.dotT > 0 && e.hp > 0 && !e.dead) { e.dotT -= dt; e.hp -= e.dotDps * dt; sparkFX(e.px, 1.2, e.pz, 0x7cff6b, 1); if (e.hp <= 0) killEnemy(e); }
    if (comboT > 0 && (comboT -= dt) <= 0) { combo = 0; setHud(); }
    if (gameTime > 2 && !save.seenHint) hint(false);
    updatePickups(dt);
    updateRain(dt);
    updateProjs(dt);
    player.energy = Math.min(energyMax(), player.energy + 5 * dt); // energy trickles back
    setHud();
    camX += ((player.px + 0.8) - camX) * Math.min(1, dt * 5);
    if (pushT > 0) { // KO camera push-in (F6): lean toward the fallen enemy during slow-mo
      pushT -= dt;
      const tx = pushPos.x - 0.6;
      camera.position.set(tx + (Math.random() - 0.5) * shake, 2.2 + (Math.random() - 0.5) * shake, 6.4);
      camera.lookAt(tx + 0.2, 1.1, pushPos.z);
    } else {
      camera.position.set(camX + (Math.random() - 0.5) * shake, 2.6 + (Math.random() - 0.5) * shake, 7.6);
      camera.lookAt(camX + 0.2, 1.25, 0);
    }
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
  // texture variants: capture the GLB's embedded map as 'original', decode patchwork PNG
  fighterTemplate.traverse((o) => { if (o.isMesh && o.material && o.material.map && !texObjs.original) texObjs.original = o.material.map; });
  await loadTexVariants();
  const box = new THREE.Box3().setFromObject(fighterTemplate); fighterHeight = box.max.y - box.min.y;
  const s = 1.8 / fighterHeight; fighterTemplate.scale.setScalar(s); fighterHeight = 1.8;
  await loadPartTemplates(); // species head attachments (pumpkin, masks...)
  await loadCreatureTemplates(); // whole-body species (zombie, demon, spider, dragon)
  streetParts = {}; st.scene.children.slice().forEach((c) => { streetParts[c.name] = c; });
  resize(); $('loading').style.display = 'none';
  applyQuality();
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
  tp2: (x, z) => { if (player) { player.px = x; player.pz = z; } },
  projCount: () => projs.length,
  projDbg: () => projs.map((p) => ({ x: +p.x.toFixed(2), y: +p.y.toFixed(2), vx: +p.vx.toFixed(2), kind: p.kind, life: +p.life.toFixed(2) })),
  simDbg: () => ({ hs: +hitstop.toFixed(3), sm: slowmo, smT: +slowmoT.toFixed(3), st: state }),
  unpause: () => setPaused(false),
  freeze: (on) => { window.__cdfreeze = !!on; },
  spawnBoss: (id) => { if (player) return spawnBoss(id || 'kingpin', player.px + 6); },
  spawnFam: (famId) => { if (player) return spawnEnemy(famId, 0, player.px + 3, 0); },
  sigChance: (v) => { window.__cdSigChance = v; },
  forceBossSig: () => { if (bossRef) { bossRef.pat = 'sig'; bossRef.ai = 'windup'; bossRef.windup = 0.01; } },
  forceFoeSig: () => { const e = enemies.find(x => x.hp > 0 && !x.boss); if (e) { e.ai = 'windup'; e.windup = 0.01; e.sigUse = !!e.sig; } },
  clearFoes: () => { for (const e of enemies.slice()) { removeFighter(e); const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1); } bossRef = null; },
  healPlayer: () => { if (player) { player.hp = player.maxHp || 100; setHud(); } },
  esigLog: () => T.esig || {}, bsigLog: () => T.bsig || {},
  showMission: () => showMission(),
  dbgBoss: (id) => { const b = bossDef(id); return b ? { name: b.name, hp: b.hp, proc: !!b.proc, sig: b.sig ? b.sig.name : null } : null; },
  seasonFams: () => { const s = activeSeason(); return s ? s.fams : []; },
  dbgBless: (ids) => { save.blessings = ids; writeSave(); return { fx: blessFx(), duo: blessDuo() ? blessDuo().name : null }; },
  dbgRep: (r) => { save.rep = r; writeSave(); const d = effDiff(); return { hpMul: +d.hpMul.toFixed(2), dmgMul: +d.dmgMul.toFixed(2), cash: +repMult().cash.toFixed(2) }; },
  spawnCreature: (cid) => { if (player) { const e = makeCreatureRaw(cid, 0xffffff, player.px + 3, -Math.PI / 2, 1); if (e) { e.maxHp = e.hp = 200; e.dmgMult = 1; e.spd = 1.5; e.px = player.px + 3; e.pz = 0; e.ai = 'walk'; e.aiT = 1; syncPos(e); playAnim(e, 'Running_A', { loop: true }); enemies.push(e); } return e; } },
  hurt: (n) => { if (player) hurtPlayer(n); },
  doJump, doPunch, doHeavy, doSpecial, doTaunt, doDesperation,
  step: (dt) => { playerUpdate(dt || 1 / 60); }, // drive the real physics deterministically
  dbg: () => player ? { st: state, mo: missionOver, en: ended, hp: player.hp, busy: player.busy, airT: player.airT, py: player.py, vy: player.vy, frames: dbgFrames } : null,
  setStick: (dx, dy) => { stick.dx = dx; stick.dy = dy; },
  playerPos: () => player ? { px: +player.px.toFixed(2), pz: +player.pz.toFixed(2), py: +(player.py || 0).toFixed(2), airT: +(player.airT || 0).toFixed(2) } : null,
  props: () => destructibles.map((d) => ({ name: d.name, px: +d.px.toFixed(1), pz: +d.pz.toFixed(1), hp: d.hp, minY: +(d.mesh.position.y).toFixed(3) })),
  colliders: () => colliders.map((c) => ({ x: +c.x.toFixed(1), z: +c.z.toFixed(1), r: +c.r.toFixed(2), dead: c.dead })),
  pickups: () => pickups.map((p) => p.type),
  smash: (i) => { const d = destructibles[i]; if (d) destroyDestructible(d); },
  setDiff: (id) => { save.difficulty = id; writeSave(); },
  info: () => ({ px: player ? +player.px.toFixed(1) : 0, hp: player ? Math.round(player.hp) : 0, foes: enemies.length, boss: bossRef ? Math.round(bossRef.hp) : 0, cash: cashRun, kills }),
  foes: () => enemies.map((e) => ({ px: +e.px.toFixed(2), pz: +(e.pz || 0).toFixed(2), ai: e.ai, hp: Math.round(e.hp), name: e.name, wu: +((e.windup || 0).toFixed(2)) })),
  // combat+cinematics wave: motion inputs, energy, mega, projectiles, cine
  energy: () => player ? Math.round(player.energy) : 0,
  setEnergy: (v) => { if (player) { player.energy = v; setHud(); } },
  motion: (dirs) => { for (const d of dirs) inputHist.push({ d, t: gameTime }); }, // feed stick history, e.g. ['D','DR','R']
  doMotion: (k) => doMotionSpecial(k),
  doMega: () => doMega(),
  cine: () => !!cine,
  cineMode: () => cine ? cine.mode : null,
  skipCine: () => endCine(),
  playIntro: () => playIntro(),
  projs: () => projs.length,
  fireTest: () => fireProj({ x: player.px + 1, z: player.pz, y: 1.15, vx: 8, kind: 'fire', dmg: 10, color: 0xff7a2a, fromPlayer: true, life: 1 }),
  fin: () => fighterDef().fin,
  qcfName: () => fighterDef().qcf.name,
  megaName: () => fighterDef().mega.name,
  setFighter: (id) => { if (FIGHTERS.some(f => f.id === id)) { save.selected = id; writeSave(); } },
  qcfKind: () => fighterDef().qcf.sigkind,
  texName: () => texVar(save.selected).id,
  setTex: (id) => { save.tex[save.selected] = id; writeSave(); refreshShowcase(); },
};

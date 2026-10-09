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
  up_dodge: 0, up_magnet: 0, up_revive: 0, up_crit: 0, up_regen: 0, up_luck: 0, up_energy: 0, up_counter: 0, up_speed: 0,
  best_wave: 0, selected: 'kidblue', skins: {}, tex: {},
  unlocked: ['kidblue', 'ghost', 'brick'], missionsDone: [],
  daily: { date: '', score: 0 }, boards: {}, seenHint: false,
  muted: false, quality: 'auto', difficulty: 'normal', circuitN: 0, blessings: [], rep: 0, goldCards: [],
  gearInv: {}, gearTier: {}, gearEq: {}, charm: null, charmsUnlocked: [],
  assist: false, missionGrades: {}, scoutRoster: [], loadouts: {},
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
  if (!save.gearInv || typeof save.gearInv !== 'object') save.gearInv = {};
  if (!save.gearTier || typeof save.gearTier !== 'object') save.gearTier = {};
  if (!save.gearEq || typeof save.gearEq !== 'object') save.gearEq = {};
  if (!Array.isArray(save.charmsUnlocked)) save.charmsUnlocked = [];
  if (!Array.isArray(save.scoutRoster)) save.scoutRoster = [];
  if (!save.loadouts || typeof save.loadouts !== 'object') save.loadouts = {};
  if (!save.missionGrades || typeof save.missionGrades !== 'object') save.missionGrades = {};
  for (const k of ['up_dodge','up_magnet','up_revive','up_crit','up_regen','up_luck','up_energy','up_counter','up_speed'])
    if (typeof save[k] !== 'number') save[k] = 0;
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
const upCost = (lvl) => 100 * (lvl + 1);
const powerMult = () => 1 + save.up_power * 0.12;
const toughBonus = () => save.up_tough * 12;
const hustleMult = () => 1 + save.up_hustle * 0.15;

// ---------- data: roster (data-driven; unlock via missions/bosses) ----------
const FIGHTERS = [
  { id: 'kidblue', wrestle: 'DRAGON SUPLEX', name: 'KID BLUE', tag: 'Balanced brawler. Big heart, bigger hands.', hp: 100, dmg: 1.0, spd: 1.0, unlock: { type: 'start' },
    spc2: { name: 'DRAGON RUSH', cost: 35, desc: 'Shoulder-first dash through the whole pack.' },
    qcf: { name: "DRAGON'S BREATH", sigkind: 'fireball', kind: 'fire', dmg: 30, speed: 9.5, color: 0xff7a2a, desc: 'Fireball', tag: 'Fireball projectile — 25 energy' },
    bfname: 'STREET DASH', blitzname: 'DRAGON BLITZ', duname: 'SKY UPPER',
    mega: { name: "DRAGON'S JUDGMENT" },
    stance: { name: "RUSH STANCE", dmg: 0.85, spd: 1.25, desc: "All hands, no brakes. Faster, lighter hits." },
    stanceFin: { name: "HUNDRED HAND SLAP", kind: 'flurry', color: 0xff7a2a, desc: 'Rapid open-palm flurry. Eats guards alive.' },
    fin: 'launch', finname: 'LAUNCHER', findesc: 'Pop-up finisher — juggle them in the air',
    moves: [
      ['STREET JAB', 'HIT', 'Quick jab. Chains into cross and kick.'],
      ['DRAGON LUNGE', '→ + HIT', 'Dash punch. Closes distance fast.'],
      ['DRAGON BLITZ', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['DRAGON BACKFIST', '← + HIT', 'Step back, spinning backfist with knockback.'],
      ['DRAGON SWEEP', '↓ + HIT', 'Sweep the legs — launches for juggles.'],
      ['DRAGON HOOK', 'HVY', 'Slow, crushing hook. Big damage.'],
      ['HUNDRED HAND SLAP', 'STANCE + HVY', 'Rapid open-palm flurry. Eats guards alive.'],
      ['DRAGON DROP', 'JUMP, then HIT', 'Aerial dive kick. Hits on the way down.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['DRAGON RUSH', '↓ + SPC (50 meter)', 'Shoulder dash straight through the pack.'],
    ] },
  { id: 'ghost', wrestle: 'PHANTOM DRIVER', name: 'GHOST', tag: 'Fast striker. Blink and you lose.', hp: 85, dmg: 0.9, spd: 1.25, unlock: { type: 'start' },
    spc2: { name: 'BLINK FLURRY', cost: 35, desc: 'Blink between the 3 nearest enemies, striking each.' },
    qcf: { name: 'PHANTOM STEP', sigkind: 'teleport', dmg: 36, color: 0x9a7bff, desc: 'Blink behind the nearest enemy and strike', tag: 'Teleport strike — 25 energy' },
    bfname: 'PHASE STEP', blitzname: 'PHANTOM BLITZ', duname: 'WRAITH RISE',
    mega: { name: 'MIDNIGHT REQUIEM' },
    stance: { name: "WRAITH STANCE", dmg: 1.2, spd: 0.95, desc: "Blinks hit harder. Meaner, not faster." },
    stanceFin: { name: "AFTERIMAGE ASSAULT", kind: 'blinkback', color: 0x9a7bff, desc: 'Blink through them — strike from behind.' },
    fin: 'blink', finname: 'BLINK STRIKE', findesc: 'Teleports behind — the unseen finisher',
    moves: [
      ['PHANTOM JAB', 'HIT', 'Fastest jab in the game. Chains into cross and kick.'],
      ['BLINK STEP', '→ + HIT', 'Blink-step punch. Closes distance instantly.'],
      ['PHANTOM BLITZ', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['WRAITH FADE', '← + HIT', 'Fade back, snapping backfist.'],
      ['ANKLE BITER', '↓ + HIT', 'Ankle sweep — launches for juggles.'],
      ['WRAITH HOOK', 'HVY', 'Charged hook. Big damage.'],
      ['AFTERIMAGE ASSAULT', 'STANCE + HVY', 'Blink through them — strike from behind.'],
      ['GHOST DROP', 'JUMP, then HIT', 'Aerial dive kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['BLINK FLURRY', '↓ + SPC (50 meter)', 'Blink between the 3 nearest enemies.'],
    ] },
  { id: 'brick', wrestle: 'RENT-A-POWERBOMB', name: 'BRICK', tag: 'Walking wall. Hits like rent day.', hp: 135, dmg: 1.25, spd: 0.85, unlock: { type: 'start' },
    spc2: { name: 'SEISMIC SLAM', cost: 35, desc: 'Ground pound: shockwave launches everyone near.' },
    qcf: { name: 'RENT COLLECTION', sigkind: 'grab', dmg: 46, color: 0xffb02e, desc: 'Command grab — yank and slam', tag: 'Command grab — 25 energy' },
    bfname: 'PAVEMENT RUSH', blitzname: 'BATTERING RAM', duname: 'HIGH-RISE',
    mega: { name: 'RENT DUE' },
    stance: { name: "PAYLOAD STANCE", dmg: 1.35, spd: 0.78, desc: "The wall walks forward." },
    stanceFin: { name: "WRECKING BALL", kind: 'spin', color: 0xffb02e, desc: '360° wrecking spin. The whole circle pays.' },
    fin: 'slam', finname: 'CURB STOMP', findesc: 'AOE slam — shakes the whole block',
    moves: [
      ['CONCRETE JAB', 'HIT', 'Heavy jab. Chains into cross and kick.'],
      ['BULLDOZER', '→ + HIT', 'Bulldozer dash punch.'],
      ['BATTERING RAM', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['WRECKING BACKFIST', '← + HIT', 'Step back, wrecking-ball backfist.'],
      ['TREE-TRUNK SWEEP', '↓ + HIT', 'Tree-trunk sweep — launches for juggles.'],
      ['RENT COLLECTOR', 'HVY', 'The rent collector. Huge damage.'],
      ['WRECKING BALL', 'STANCE + HVY', '360° wrecking spin. The whole circle pays.'],
      ['CURB DROP', 'JUMP, then HIT', 'Aerial drop kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['SEISMIC SLAM', '↓ + SPC (50 meter)', 'Ground pound launches everyone nearby.'],
    ] },
  { id: 'kingpin', wrestle: 'HOSTILE SUPLEX', name: 'KINGPIN', tag: 'Used to run this block. Now he runs with you.', hp: 150, dmg: 1.3, spd: 0.9, unlock: { type: 'boss', boss: 'kingpin' },
    spc2: { name: "KINGPIN'S WRATH", cost: 35, desc: 'Royal beatdown: massive AOE around him.' },
    qcf: { name: 'ROYAL DECREE', sigkind: 'orb', kind: 'orb', dmg: 40, speed: 5, color: 0xffd166, desc: 'Slow explosive orb', tag: 'Explosive orb — 25 energy' },
    bfname: 'HOSTILE MARCH', blitzname: 'ROYAL CHARGE', duname: 'THRONE RISE',
    mega: { name: 'HOSTILE TAKEOVER' },
    stance: { name: "IRON THRONE", dmg: 1.2, spd: 0.92, desc: "Every decree lands heavier." },
    stanceFin: { name: "ROYAL EDICT", kind: 'pound', color: 0xffd166, desc: 'Decree from above: radial shockwave slam.' },
    fin: 'gavel', finname: 'GAVEL DROP', findesc: 'Heavy single hit — long hit-stop',
    moves: [
      ['BOSS JAB', 'HIT', 'Boss-grade jab. Chains into cross and kick.'],
      ['POWER MARCH', '→ + HIT', 'Power dash punch.'],
      ['ROYAL CHARGE', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['ROYAL BACKHAND', '← + HIT', 'Step back, royal backhand.'],
      ['CANE SWEEP', '↓ + HIT', 'Cane sweep — launches for juggles.'],
      ['THE GAVEL', 'HVY', 'The gavel. Enormous damage.'],
      ['ROYAL EDICT', 'STANCE + HVY', 'Decree from above: radial shockwave slam.'],
      ['THRONE STOMP', 'JUMP, then HIT', 'Aerial stomp kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ["KINGPIN'S WRATH", '↓ + SPC (50 meter)', 'Massive shockwave around him.'],
    ] },
  { id: 'sledge', wrestle: 'DEMOLITION DRIVER', name: 'SLEDGE', tag: 'Yard enforcer. Swings first, talks never.', hp: 165, dmg: 1.45, spd: 0.8, unlock: { type: 'boss', boss: 'sledge' },
    spc2: { name: 'WRECKING SWING', cost: 35, desc: '360° swing that clears the whole circle.' },
    qcf: { name: 'IRON CYCLONE', sigkind: 'spin', dmg: 16, color: 0x80ed99, desc: 'Traveling spin — multi-hit', tag: 'Traveling spin — 25 energy' },
    bfname: 'WRECKING RUSH', blitzname: 'SLEDGEHAMMER RUN', duname: 'CRANE UPPER',
    mega: { name: 'DEMOLITION DAY' },
    stance: { name: "DEMOLITION STANCE", dmg: 1.3, spd: 0.85, desc: "Swinging for the fences." },
    stanceFin: { name: "SCRAP YARD", kind: 'smash', color: 0x8a929e, desc: 'Overhead crusher. Launches the whole pack.' },
    fin: 'demo', finname: 'DEMOLITION', findesc: 'Far knockback — total wreckage',
    moves: [
      ['SLEDGE JAB', 'HIT', 'Sledgehammer jab. Chains into cross and kick.'],
      ['TACKLE CHARGE', '→ + HIT', 'Charging shoulder tackle.'],
      ['SLEDGEHAMMER RUN', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['YARD SWING', '← + HIT', 'Step back, wrecking swing.'],
      ['DEMOLITION SWEEP', '↓ + HIT', 'Demolition sweep — launches for juggles.'],
      ['FULL SLEDGE', 'HVY', 'Full sledge. Devastating.'],
      ['SCRAP YARD', 'STANCE + HVY', 'Overhead crusher. Launches the whole pack.'],
      ['WRECKING DROP', 'JUMP, then HIT', 'Aerial demolition kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['WRECKING SWING', '↓ + SPC (50 meter)', '360° swing clears the whole circle.'],
    ] },
  { id: 'viper', wrestle: 'VENOM POWERBOMB', name: 'VIPER', tag: 'Fast hands, faster mouth.', hp: 95, dmg: 1.05, spd: 1.35, unlock: { type: 'boss', boss: 'viper' },
    spc2: { name: 'VENOM DASH', cost: 35, desc: 'Serpent dash: strikes everything in a line.' },
    qcf: { name: "SERPENT'S WAKE", sigkind: 'groundwave', kind: 'fangwave', dmg: 26, speed: 9, color: 0x7cff6b, desc: 'Ground fang wave', tag: 'Ground fang wave — 25 energy' },
    bfname: 'SERPENT DASH', blitzname: 'VIPER STRIKE', duname: 'COIL SPRING',
    mega: { name: "SERPENT'S COIL" },
    stance: { name: "COIL STANCE", dmg: 1.1, spd: 1.22, desc: "Strike from anywhere." },
    stanceFin: { name: "SERPENT'S EMBRACE", kind: 'linedash', color: 0x4dff88, desc: 'Coil through the line — everything gets bit.' },
    fin: 'dot', finname: 'FANG BARB', findesc: 'Venom keeps chewing — damage over time',
    moves: [
      ['FANG FLICKER', 'HIT', 'Flicker jab. Chains into cross and kick.'],
      ['SERPENT STRIKE', '→ + HIT', 'Serpent strike dash.'],
      ['VIPER STRIKE', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['SLITHER BACK', '← + HIT', 'Slither back, snapping strike.'],
      ['TAIL SWEEP', '↓ + HIT', 'Tail sweep — launches for juggles.'],
      ['THE FANG', 'HVY', 'The fang. Big damage.'],
      ["SERPENT'S EMBRACE", 'STANCE + HVY', 'Coil through the line — everything gets bit.'],
      ['VIPER DROP', 'JUMP, then HIT', 'Aerial fang kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['VENOM DASH', '↓ + SPC (50 meter)', 'Dash in a line, striking everything.'],
    ] },
  { id: 'dust', wrestle: 'DUST DEVIL DRIVER', name: 'DUST', tag: 'Quick hands. Gone before you blink.', hp: 80, dmg: 0.95, spd: 1.4, unlock: { type: 'boss', boss: 'rust' },
    spc2: { name: 'DUST DEVIL', cost: 35, desc: 'Spin into the pack: AOE hits while moving.' },
    qcf: { name: 'DESERT SPIKES', sigkind: 'erupt', dmg: 30, color: 0xd8b56b, desc: 'Spikes erupt under nearby enemies', tag: 'Ground eruption — 25 energy' },
    bfname: 'DUST RUSH', blitzname: 'DUST DEVIL', duname: 'HABOOB RISE',
    mega: { name: 'DUST BOWL' },
    stance: { name: "STORM STANCE", dmg: 1.05, spd: 1.3, desc: "Become the weather." },
    stanceFin: { name: "SANDSTORM", kind: 'storm', color: 0xd8b25a, desc: 'The storm closes in. Nowhere to stand.' },
    fin: 'cyclone', finname: 'CYCLONE LIFT', findesc: 'Extended air — juggle them longer',
    moves: [
      ['DUST JAB', 'HIT', 'Fastest hands on the block. Chains into cross and kick.'],
      ['SMOKE STEP', '→ + HIT', 'Dust-step punch. Closes distance like smoke.'],
      ['DUST DEVIL', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['WHIP BACKFIST', '← + HIT', 'Slip back, whipping backfist.'],
      ['DUST-CLOUD SWEEP', '↓ + HIT', 'Dust-cloud sweep — launches for juggles.'],
      ['STORM BACKHAND', 'HVY', 'The backhand of the storm. Big damage.'],
      ['SANDSTORM', 'STANCE + HVY', 'The storm closes in. Nowhere to stand.'],
      ['CYCLONE KICK', 'JUMP, then HIT', 'Aerial cyclone kick.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['DUST DEVIL', '↓ + SPC (50 meter)', 'Spinning AOE that travels through the pack.'],
    ] },
  { id: 'jack', wrestle: 'HARVEST SUPLEX', name: 'JACK', tag: 'He wears the harvest. The harvest wears you.', hp: 95, dmg: 1.05, spd: 1.05,
    unlock: { type: 'boss', boss: 'pumpkinking' }, head: 'pumpkin', tint: 0xe07b1f,
    spc2: { name: 'CANDLE RUSH', cost: 35, desc: 'Burning dash: leaves a fire trail through the pack.' },
    qcf: { name: 'PUMPKIN BOMB', sigkind: 'fireball', kind: 'fire', dmg: 34, speed: 8, color: 0xff7a1a, arc: 1, desc: 'Lobbed flaming pumpkin', tag: 'Lobbed pumpkin bomb — 25 energy' },
    bfname: 'PATCH SPRINT', blitzname: 'HARVEST RUSH', duname: 'SCARECROW RISE',
    mega: { name: 'GREAT PUMPKIN' },
    stance: { name: "HARVEST STANCE", dmg: 1.25, spd: 0.9, desc: "The patch feeds on pain." },
    stanceFin: { name: "HARVEST MOON", kind: 'launcher', color: 0xff8c2a, desc: 'Rising gourd uppercut. Sends them skyward.' },
    fin: 'launch', finname: 'PORCH STOMP', findesc: 'Curb stomp with a burning grin',
    moves: [
      ['PATCH JAB', 'HIT', 'Quick vine jab. Chains into cross and kick.'],
      ['VINE LUNGE', '→ + HIT', 'Vine-whip lunge punch. Closes distance fast.'],
      ['HARVEST RUSH', '→→ + HIT', 'Blitz: double-tap toward, then HIT. Lunging character strike.'],
      ['HAYMAKER', '← + HIT', 'Step back, haymaker backfist with knockback.'],
      ['ROOT SWEEP', '↓ + HIT', 'Root sweep — launches for juggles.'],
      ['GOURD CRUSHER', 'HVY', 'Overhead gourd crusher. Big damage.'],
      ['HARVEST MOON', 'STANCE + HVY', 'Rising gourd uppercut. Sends them skyward.'],
      ['HARVEST DROP', 'JUMP, then HIT', 'Aerial harvest drop kick.'],
      ['DESPERATION', 'DDG ×2', '360° panic spin. Costs 10% HP.'],
      ['TAUNT', 'TAUNT btn / T', 'Talk trash, gain special meter.'],
      ['TECH', 'HIT while knocked down', 'Instant recovery + bounce + brief invuln. Never helpless.'],
      ['DUST LAUNCHER', '↓ + HVY', 'Universal overhead launcher. Pops them up for juggles.'],
      ['TAG SPOT', 'TAUNT near a glowing wall', 'Spray the wall (3s, vulnerable). Big cash + 15 REP.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
      ['DRAGON FURY', 'SPC (full meter)', 'Signature: shockwave hits everyone close.'],
      ['CANDLE RUSH', '↓ + SPC (50 meter)', 'Burning dash through the pack.'],
      ['GRAPPLE', 'GRP btn / G on staggered foe', 'Wrestling finisher: suplex/piledriver/powerbomb. Big moment.'],
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
    ['JUMP + SPC', 'AIR ' + f.qcf.name, 'Your signature, from above — 25 energy'],
    ['PARRY', '→ toward attacker on !', 'Negate + stagger them, gain energy. No damage.'],
    ['HEAT', 'HVY on staggered foe', 'Contextual finisher — big damage, slow-mo'],
    ['FOCUS', 'HOLD HVY 0.45s', 'Absorb one hit, release = crumple strike'],
    ['BURST', '↑ + SPC while juggled', 'Combo breaker — 50 energy'],
    ['DESPERATION', '↓ + SPC under 50% HP', 'Trade 10% HP for a huge blast'],
    ['RAGE', 'Take damage', 'Full rage bar = 8s +40% damage'],
    ['DASH STRIKE', 'DDG into enemy', 'Your dodge is a weapon — 18 dmg on contact'],
    ['WALL SPLAT', 'Launch near props', 'Slam them into scenery for bonus damage'],
    ['↑↑↓←→ + SPC', f.mega.name, 'MEGA SUPER — needs FULL energy. Cinematic.'],
    ['4TH HIT', f.finname, f.findesc],
    ['STANCE', 'TAUNT ×2 / double-tap T', 'Swap loadouts: ' + (f.stance ? f.stance.name + ' — ' + f.stance.desc : 'balanced')],
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
  { key: 'up_dodge', name: 'SLIPPERY', desc: '+8% dodge recharge / lvl' },
  { key: 'up_magnet', name: 'MAGNET', desc: '+20% pickup radius / lvl' },
  { key: 'up_revive', name: 'SECOND CHANCE', desc: 'Revive once per mission' },
  { key: 'up_crit', name: 'KILLER INSTINCT', desc: '+4% crit chance / lvl' },
  { key: 'up_regen', name: 'REGEN', desc: '+1 HP / 2s / lvl' },
  { key: 'up_luck', name: 'STREET SMARTS', desc: '+8% luck / lvl' },
  { key: 'up_energy', name: 'DEEP BREATH', desc: '+10 max energy / lvl' },
  { key: 'up_counter', name: 'COUNTER PUNCHER', desc: '+10% counter dmg / lvl' },
  { key: 'up_speed', name: 'ROADWORK', desc: '+4% move speed / lvl' },
];
// gym-derived helpers (Hades Mirror-inspired: every mission pays in, win or lose)
const critCh = () => 0.03 + (save.up_crit || 0) * 0.04 + (blessFx().crit || 0);
const luckMult = () => 1 + (save.up_luck || 0) * 0.08 + (blessFx().luck || 0);
const dodgeRechargeMult = () => (1 - Math.min(0.6, (save.up_dodge || 0) * 0.08)) * (1 - (blessFx().dodgeCd || 0) - (blessFx().dodge || 0));
const magnetR = () => 1.6 * (1 + (save.up_magnet || 0) * 0.2) * (1 + mascotMagnetBonus());
const fighterDef = (id) => FIGHTERS.find((f) => f.id === (id || save.selected)) || scoutFighter(id || save.selected) || variantFighter(id) || FIGHTERS[0];
// INFINITE UNLOCKS (owner 2026-10-06): titled challenger variants (e.g. kingpin_nightmare)
// resolve dynamically by cloning the base fighter with boosted stats + title flair
const variantCache = {};
function variantFighter(id) {
  if (!id || !id.includes('_')) return null;
  if (variantCache[id]) return variantCache[id];
  const [baseId, title] = id.split('_');
  const base = FIGHTERS.find((f) => f.id === baseId);
  if (!base) return null;
  const v = Object.assign({}, base, {
    id, name: title.toUpperCase() + ' ' + base.name,
    tag: 'Challenger variant. Earned in the endless road.',
    hp: Math.round(base.hp * 1.25), dmg: +(base.dmg * 1.15).toFixed(2),
    unlock: { type: 'variant', base: baseId, title },
  });
  variantCache[id] = v; return v;
}
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
  if (f.unlock.type === 'scout') return 'SCOUTED — INFINITE CREW';
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
  { id: 'witch', name: 'HEX', tint: 0x6a3aa0, hp: 70, dmg: 1.0, scale: 1.0, spd: 1.8, creature: 'witch',
    sig: { id: 'hexbolt', name: 'HEX BOLT', chance: 0.26 },
    variants: [
      { at: 0 },
      { at: 4, name: 'HEX COVEN', tint: 0x4a2a80, hpMul: 1.6, dmgMul: 1.3, move: 'flurry' },
    ] },
  { id: 'vbat', name: 'NIGHTWING', tint: 0x2a2a3a, hp: 45, dmg: 0.8, scale: 1.0, spd: 3.2, creature: 'vampirebat',
    sig: { id: 'blooddive', name: 'BLOOD DIVE', chance: 0.28 },
    variants: [
      { at: 0 },
      { at: 4, name: 'NIGHTWING SWARM', tint: 0x1a1a26, hpMul: 1.5, dmgMul: 1.2, move: 'flurry' },
    ] },
  { id: 'hghost', name: 'HAPPY HAUNT', tint: 0xf0f0ff, hp: 40, dmg: 0.7, scale: 1.0, spd: 2.2, creature: 'ghosthappy',
    sig: { id: 'spook', name: 'SPOOK', chance: 0.24 },
    variants: [ { at: 0 }, { at: 4, name: 'HAUNT MOB', tint: 0xd0d0f0, hpMul: 1.6, dmgMul: 1.2, move: 'flurry' } ] },
  { id: 'sghost', name: 'SAD HAUNT', tint: 0xa0a0d0, hp: 55, dmg: 0.9, scale: 1.0, spd: 1.8, creature: 'ghostsad',
    sig: { id: 'wail', name: 'WAIL', chance: 0.24 },
    variants: [ { at: 0 }, { at: 4, name: 'WAILING MOB', tint: 0x8080b0, hpMul: 1.6, dmgMul: 1.3, move: 'flurry' } ] },
  { id: 'skull', name: 'SKULL HEAD', tint: 0xe8e0d0, hp: 35, dmg: 0.8, scale: 1.0, spd: 2.6, creature: 'skull',
    sig: { id: 'headbutt', name: 'HEADBUTT', chance: 0.26 },
    variants: [ { at: 0 }, { at: 4, name: 'SKULL PILE', tint: 0xc8bca8, hpMul: 1.7, dmgMul: 1.2, move: 'flurry' } ] },
  { id: 'baller1', name: 'HOOP DREAM', tint: 0xd06018, hp: 75, dmg: 1.0, scale: 1.0, spd: 1.9, creature: 'bball1',
    sig: { id: 'dunkshot', name: 'DUNK SHOT', chance: 0.26 },
    variants: [ { at: 0 }, { at: 4, name: 'HOOP SQUAD', tint: 0xa04810, hpMul: 1.6, dmgMul: 1.2, move: 'flurry' } ] },
  { id: 'baller2', name: 'STREET BALLER', tint: 0x2060c0, hp: 70, dmg: 1.0, scale: 1.0, spd: 2.1, creature: 'bball2',
    sig: { id: 'crossover', name: 'CROSSOVER', chance: 0.26 },
    variants: [ { at: 0 }, { at: 4, name: 'BLACKTOP CREW', tint: 0x184880, hpMul: 1.6, dmgMul: 1.2, move: 'flurry' } ] },
  { id: 'bbones', name: 'DEAD BALLER', tint: 0xc8b898, hp: 60, dmg: 1.1, scale: 1.0, spd: 1.7, creature: 'bbones',
    sig: { id: 'curveball', name: 'CURVEBALL', chance: 0.26 },
    variants: [ { at: 0 }, { at: 4, name: 'BONE LEAGUE', tint: 0xa89878, hpMul: 1.6, dmgMul: 1.3, move: 'flurry' } ] },
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
  { id: 'carmilla', name: 'CARMILLA', tint: 0x8a1a2a, hp: 620, dmg: 1.5, scale: 1.1, spd: 1.8, creature: 'carmilla',
    patterns: ['slam', 'flurry', 'summon'],
    sig: { id: 'bloodmoon', name: 'BLOOD MOON' },
    intro: 'THE VAMPIRE QUEEN' },
  { id: 'foreman', name: 'THE FOREMAN', tint: 0xb08030, hp: 700, dmg: 1.55, scale: 1.5, spd: 1.35,
    patterns: ['slam', 'charge', 'summon'],
    unlockSkin: { fighter: 'sledge', id: 'foreman', name: 'Shop Foreman', tint: 0xb08030 },
    sig: { id: 'overtime', name: 'OVERTIME' },
    intro: 'THE SHIFT NEVER ENDS' },
  { id: 'warden', name: 'THE WARDEN', tint: 0x5a6a7a, hp: 760, dmg: 1.6, scale: 1.4, spd: 1.5,
    patterns: ['flurry', 'slam', 'summon'],
    unlockSkin: { fighter: 'brick', id: 'warden', name: 'Cell Block', tint: 0x5a6a7a },
    sig: { id: 'lockdown', name: 'LOCKDOWN' },
    intro: 'NO ONE LEAVES' },
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
  { id: 'tunnels', name: 'THE UNDERGROUND', sky: 0x080a10, fog: [0x080a10, 6, 20], hemi: [0x6a8ab0, 0x080a10, 0.9],
    moon: [0x8ab8d8, 1.0], rim: [0x3a6a8a, 1.3], lampA: 0xffd166, lampB: 0x3a6a8a, ground: 0x16181e, sw: ['#ffd166', '#3a6a8a'] },
  { id: 'factory', name: 'THE WORKS', sky: 0x140d08, fog: [0x140d08, 7, 24], hemi: [0xffb37a, 0x241008, 1.2],
    moon: [0xffd9a0, 1.3], rim: [0xff6a00, 1.6], lampA: 0xff8c42, lampB: 0x6ab8d8, ground: 0x241c16, sw: ['#ff8c42', '#6ab8d8'] },
  { id: 'overpass', name: 'THE OVERPASS', sky: 0x141020, fog: [0x141020, 10, 30], hemi: [0xffc98a, 0x141020, 1.1],
    moon: [0xcfd8ff, 1.1], rim: [0x5a8aa8, 1.4], lampA: 0xffb347, lampB: 0x7af0ff, ground: 0x22242c, sw: ['#ffb347', '#7af0ff'] },
  { id: 'industrial', name: 'THE IRONWORKS', sky: 0x141821, fog: [0x141821, 8, 26], hemi: [0xf0f4ff, 0x3a3a44, 1.5],
    moon: [0xd8e8ff, 1.6], rim: [0xff7a1a, 1.7], lampA: 0xffb35c, lampB: 0x4de1ff, ground: 0x333338, sw: ['#ffb35c', '#4de1ff'] },
];
const districtDef = (id) => DISTRICTS.find((d) => d.id === id) || DISTRICTS[0];

// ---------- data: zones (mission arcs — owner 2026-10-06) ----------
// A zone = several missions ending with a boss. Missions keep flat defs;
// `zone` groups them under a zone header in the select screen.
const ZONES = [
  { id: 'z1', name: 'ZONE 1 — CONCRETE ORIGINS', card: 'Where it all started. Four blocks, four lessons.', unlock: { type: 'start' } },
  { id: 'z2', name: 'ZONE 2 — DEAD OF NIGHT', card: 'The graveyard shift. Things walk that should not.', unlock: { type: 'mission', id: 'm2' } },
  { id: 'z3', name: 'ZONE 3 — THE MAZE', card: 'Dead ends, ambush pockets. The block fights back.', unlock: { type: 'mission', id: 'h3' } },
  { id: 'z4', name: 'ZONE 4 — HIGH RISE', card: 'Up is the only way through. Jump.', unlock: { type: 'mission', id: 'z1' } },
  { id: 'z5', name: 'ZONE 5 — THE UNDERGROUND', card: 'Below the streets, the tunnels remember everything.', unlock: { type: 'mission', id: 'p3' } },
  { id: 'z6', name: 'ZONE 6 — THE WORKS', card: 'The factory never stopped. Neither do you.', unlock: { type: 'mission', id: 'u3' } },
  { id: 'z7', name: 'ZONE 7 — STEEL CELL', card: 'Four walls, one way out. Through them.', unlock: { type: 'mission', id: 'w3' } },
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
// WHAT'S NEW (soul law: community as co-designer) — patch notes live in-game
const PATCH_NOTES = [
  ['2026-10-07', 'Wave 6: SOUL LAWS (COMEBACK CASH, RUN-IT-BACK rematch, STREAK SHIELD), ENDLESS MUTATORS, deeper proc-bosses, ARENA DRESSING, STANCE FINISHERS, Zones 6-7'],
  ['2026-10-06', 'Wave 4: BLITZ lunging strikes, WITCH TIME last-instant dodge, FOCUS absorb, BURST combo breaker, RADICAL MODE, RECRUIT crew system'],
  ['2026-10-05', 'Wave 3: 15 bosses with signatures, 5 districts, style meter, mission grades'],
];
function renderPatchNotes() {
  const pn = $('patchNotes');
  if (!pn) return;
  pn.innerHTML = '<div class="subtitle" style="margin-top:12px">WHAT\'S NEW</div>' +
    PATCH_NOTES.map(([d, t]) => `<div style="font-size:12px;line-height:1.5;margin:4px 0"><b style="color:#ffd166">${d}</b> — ${t}</div>`).join('');
}
// ---------- INFINITE BOSSES (owner 2026-10-06): data-driven boss generation ----------
// procBoss(n) scales a base boss template into an endless challenger.
// mission.boss can be 'pb12' etc.; bossDef() resolves both static and generated.
const PB_TITLES = ['NIGHTMARE', 'IRON', 'BLOOD', 'RUSTED', 'HOWLING', 'VENOM', 'ASHEN', 'BRASS', 'HOLLOW', 'SAVAGE', 'CRIMSON', 'OBSIDIAN'];
function procBoss(n) {
  const R = seedPRNG(n * 104729 + 7);
  const bases = ['kingpin', 'sledge', 'viper', 'rust', 'dragon', 'pumpkinking', 'foreman', 'warden'];
  const b0 = BOSSES.find((x) => x.id === bases[Math.floor(R() * bases.length)]);
  const title = PB_TITLES[Math.floor(R() * PB_TITLES.length)];
  const pool = ['slam', 'flurry', 'charge', 'summon', 'shoot'];
  const pats = [];
  while (pats.length < 3) { const q = pool[Math.floor(R() * pool.length)]; if (!pats.includes(q)) pats.push(q); }
  return Object.assign({}, b0, {
    id: 'pb' + n, name: title + ' ' + b0.name,
    hp: Math.round(b0.hp * (1 + n * 0.25)), dmg: b0.dmg + n * 0.05,
    scale: b0.scale * (1 + Math.min(0.3, n * 0.015)),
    patterns: pats, // wave-6: shuffled kit — no two challengers fight alike
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
    spawns: [{ at: 10, fam: 'jabber', n: 3 }, { at: 26, fam: 'thug', n: 3 }, { at: 42, fam: 'rico', n: 3 }, { at: 58, fam: 'heavyd', n: 3 }, { at: 64, fam: 'baller2', n: 2 }, { at: 70, fam: 'thug', n: 4 }],
    card: 'The heat never left this street.', boss: 'viper', unlock: { type: 'mission', id: 'm2' }, reward: 'Unlocks VIPER as playable' },
  { id: 'm4', zone: 'z1', district: 'docks', name: 'RUST BELT', len: 100, crowd: true,
    spawns: [{ at: 12, fam: 'stray', n: 3 }, { at: 28, fam: 'heavyd', n: 2 }, { at: 44, fam: 'stray', n: 4 }, { at: 60, fam: 'rico', n: 3 }, { at: 78, fam: 'stray', n: 4 }, { at: 90, fam: 'heavyd', n: 2 }],
    card: 'Everything here is for sale. Even kings.', boss: 'rust', unlock: { type: 'mission', id: 'm3' }, reward: 'Unlocks DUST as playable' },
  { id: 'm5', zone: 'z1', district: 'overpass', name: 'OVERPASS RUN', len: 90, crowd: false,
    spawns: [{ at: 10, fam: 'rico', n: 3 }, { at: 26, fam: 'heavyd', n: 2 }, { at: 42, fam: 'jabber', n: 3 }, { at: 58, fam: 'rico', n: 4 }, { at: 74, fam: 'heavyd', n: 3 }],
    card: 'Six lanes. No exits. No mercy.', boss: 'sledge', purse: 750, unlock: { type: 'mission', id: 'm4' }, reward: 'SLEDGE rematch + $750 purse' },
  { id: 'm6', zone: 'z1', district: 'industrial', name: 'FACTORY FLOOR', len: 110, crowd: false,
    spawns: [{ at: 12, fam: 'rico', n: 3 }, { at: 30, fam: 'heavyd', n: 2 }, { at: 48, fam: 'jabber', n: 3 }, { at: 66, fam: 'rico', n: 4 }, { at: 86, fam: 'heavyd', n: 3 }],
    card: 'Smoke, steel, and no way out.', boss: 'foreman', purse: 750, unlock: { type: 'mission', id: 'm5' }, reward: 'THE FOREMAN rematch + $750 purse' },
  { id: 'h1', zone: 'z2', district: 'graveyard', name: 'GRAVEYARD SHIFT', len: 60, crowd: false,
    spawns: [{ at: 10, fam: 'zombie', n: 2 }, { at: 24, fam: 'pumpkin', n: 2 }, { at: 38, fam: 'witch', n: 2 }, { at: 50, fam: 'spider', n: 2 }],
    card: 'They rose with the fog.', boss: null, unlock: { type: 'mission', id: 'm2' }, reward: 'The dead walk' },
  { id: 'h2', zone: 'z2', district: 'graveyard', name: 'HARVEST MOON', len: 75, crowd: false,
    spawns: [{ at: 10, fam: 'pumpkin', n: 3 }, { at: 26, fam: 'demon', n: 2 }, { at: 42, fam: 'vbat', n: 3 }, { at: 58, fam: 'hghost', n: 3 }],
    card: 'The moon is full and so are the graves.', boss: null, unlock: { type: 'mission', id: 'h1' }, reward: 'Something stirs' },
  { id: 'h3', zone: 'z2', district: 'graveyard', name: 'ALL HALLOWS', len: 90, crowd: false,
    spawns: [{ at: 10, fam: 'demon', n: 2 }, { at: 26, fam: 'pumpkin', n: 3 }, { at: 44, fam: 'sghost', n: 3 }, { at: 62, fam: 'skull', n: 3 }, { at: 78, fam: 'demon', n: 2 }],
    card: 'He wears the harvest.', boss: 'pumpkinking', unlock: { type: 'mission', id: 'h2' }, reward: 'Unlocks JACK as playable' },
  { id: 'mz1', zone: 'z3', district: 'docks', name: 'RAT RUN', len: 85, crowd: false, layout: 'maze',
    spawns: [{ at: 12, fam: 'stray', n: 3 }, { at: 28, fam: 'thug', n: 3 }, { at: 46, fam: 'jabber', n: 3 }, { at: 64, fam: 'stray', n: 4 }],
    card: 'The alleys loop. So do the rats.', boss: null, unlock: { type: 'mission', id: 'h3' }, reward: 'Maze layouts unlocked' },
  { id: 'mz2', zone: 'z3', district: 'yards', name: 'SCRAP LABYRINTH', len: 95, crowd: false, layout: 'maze',
    spawns: [{ at: 12, fam: 'heavyd', n: 2 }, { at: 30, fam: 'rico', n: 3 }, { at: 50, fam: 'heavyd', n: 3 }, { at: 70, fam: 'zombie', n: 3 }],
    card: 'Every dead end has teeth.', boss: 'rust', unlock: { type: 'mission', id: 'z1' }, reward: 'The maze deepens' },
  { id: 'mz3', zone: 'z3', district: 'graveyard', name: 'CRYPT WALK', len: 100, crowd: false, layout: 'maze',
    spawns: [{ at: 12, fam: 'zombie', n: 3 }, { at: 30, fam: 'spider', n: 3 }, { at: 52, fam: 'demon', n: 2 }, { at: 74, fam: 'pumpkin', n: 3 }],
    card: 'The crypts rearrange when you blink.', boss: 'carmilla', unlock: { type: 'mission', id: 'mz2' }, reward: 'The Vampire Queen falls' },
  { id: 'p1', zone: 'z4', district: 'neon', name: 'ROOFTOP RUN', len: 85, crowd: false, layout: 'platform',
    spawns: [{ at: 12, fam: 'jabber', n: 3 }, { at: 30, fam: 'thug', n: 3 }, { at: 50, fam: 'stray', n: 3 }, { at: 60, fam: 'baller1', n: 2 }, { at: 68, fam: 'jabber', n: 4 }],
    card: 'The street is below you now.', boss: null, unlock: { type: 'mission', id: 'mz1' }, reward: 'Platform layouts unlocked' },
  { id: 'p2', zone: 'z4', district: 'havana', name: 'FIRE ESCAPE', len: 95, crowd: false, layout: 'platform',
    spawns: [{ at: 12, fam: 'rico', n: 3 }, { at: 32, fam: 'heavyd', n: 2 }, { at: 54, fam: 'demon', n: 2 }, { at: 66, fam: 'bbones', n: 2 }, { at: 76, fam: 'rico', n: 4 }],
    card: 'Climb or get climbed.', boss: 'viper', unlock: { type: 'mission', id: 'p1' }, reward: 'Skyline fighter' },
  { id: 'p3', zone: 'z4', district: 'docks', name: 'CRANE YARD', len: 105, crowd: true, layout: 'platform',
    spawns: [{ at: 12, fam: 'heavyd', n: 3 }, { at: 32, fam: 'spider', n: 3 }, { at: 56, fam: 'demon', n: 3 }, { at: 80, fam: 'zombie', n: 4 }],
    card: 'The highest fight in the city.', boss: 'sledge', unlock: { type: 'mission', id: 'p2' }, reward: 'King of the high rise' },
  { id: 'u1', zone: 'z5', district: 'tunnels', name: 'TUNNEL RATS', len: 90, crowd: false, layout: 'maze',
    spawns: [{ at: 12, fam: 'stray', n: 3 }, { at: 30, fam: 'thug', n: 3 }, { at: 50, fam: 'stray', n: 4 }, { at: 70, fam: 'jabber', n: 3 }],
    card: 'The subway never closed. It just changed owners.', boss: null, unlock: { type: 'mission', id: 'p3' }, reward: 'Maze layouts unlocked' },
  { id: 'u2', zone: 'z5', district: 'tunnels', name: 'GHOST PLATFORM', len: 100, crowd: false, layout: 'maze',
    spawns: [{ at: 12, fam: 'ghost', n: 2 }, { at: 32, fam: 'zombie', n: 3 }, { at: 54, fam: 'skull', n: 3 }, { at: 76, fam: 'demon', n: 2 }],
    card: 'Trains that never arrive. Passengers that never left.', boss: 'rust', unlock: { type: 'mission', id: 'u1' }, reward: 'The deep dark' },
  { id: 'u3', zone: 'z5', district: 'tunnels', name: 'TERMINUS', len: 110, crowd: false, layout: 'maze',
    spawns: [{ at: 12, fam: 'demon', n: 3 }, { at: 34, fam: 'spider', n: 3 }, { at: 58, fam: 'zombie', n: 4 }, { at: 82, fam: 'pumpkin', n: 3 }],
    card: 'End of the line. Something waits on the tracks.', boss: 'dragon', unlock: { type: 'mission', id: 'u2' }, reward: 'The Concrete Dragon stirs below' },
  { id: 'w1', zone: 'z6', district: 'factory', name: 'CONVEYOR LINE', len: 100, crowd: false, layout: 'skyline',
    spawns: [{ at: 12, fam: 'thug', n: 3 }, { at: 32, fam: 'heavyd', n: 2 }, { at: 54, fam: 'rico', n: 3 }, { at: 78, fam: 'jabber', n: 4 }],
    card: 'The line never stops. Neither do the fists.', boss: null, unlock: { type: 'mission', id: 'u3' }, reward: 'Skyline layouts unlocked' },
  { id: 'w2', zone: 'z6', district: 'factory', name: 'FURNACE FLOOR', len: 110, crowd: true, layout: 'plaza',
    spawns: [{ at: 12, fam: 'stray', n: 3 }, { at: 34, fam: 'demon', n: 3 }, { at: 58, fam: 'heavyd', n: 3 }, { at: 84, fam: 'rico', n: 4 }],
    card: 'The whole floor is watching. Give them a show.', boss: null, unlock: { type: 'mission', id: 'w1' }, reward: 'Plaza layouts unlocked' },
  { id: 'w3', zone: 'z6', district: 'factory', name: 'SMOKESTACK', len: 120, crowd: false, layout: 'skyline',
    spawns: [{ at: 14, fam: 'heavyd', n: 3 }, { at: 38, fam: 'zombie', n: 3 }, { at: 64, fam: 'rico', n: 4 }, { at: 92, fam: 'demon', n: 3 }],
    card: 'Climb the smoke. He is waiting at the top.', boss: 'foreman', unlock: { type: 'mission', id: 'w2' }, reward: 'Unlocks FOREMAN skin' },
  { id: 'c1', zone: 'z7', district: 'yards', name: 'CHAIN LINK', len: 80, crowd: true, layout: 'ring',
    spawns: [{ at: 10, fam: 'jabber', n: 3 }, { at: 26, fam: 'thug', n: 3 }, { at: 46, fam: 'rico', n: 3 }, { at: 64, fam: 'jabber', n: 4 }],
    card: 'Four walls. No ref. No excuses.', boss: null, unlock: { type: 'mission', id: 'w3' }, reward: 'Steel cell layouts unlocked' },
  { id: 'c2', zone: 'z7', district: 'yards', name: 'LOCKDOWN', len: 95, crowd: true, layout: 'ring',
    spawns: [{ at: 12, fam: 'rico', n: 3 }, { at: 32, fam: 'heavyd', n: 3 }, { at: 54, fam: 'zombie', n: 3 }, { at: 74, fam: 'rico', n: 4 }],
    card: 'The gate is shut. Somebody is getting carried out.', boss: null, unlock: { type: 'mission', id: 'c1' }, reward: 'The cell holds' },
  { id: 'c3', zone: 'z7', district: 'yards', name: 'TOP OF THE CELL', len: 110, crowd: true, layout: 'ring',
    spawns: [{ at: 12, fam: 'heavyd', n: 3 }, { at: 36, fam: 'demon', n: 3 }, { at: 62, fam: 'rico', n: 4 }, { at: 88, fam: 'spider', n: 3 }],
    card: 'He built the cell. Now fight him in it.', boss: 'warden', unlock: { type: 'mission', id: 'c2' }, reward: 'Unlocks WARDEN skin' },
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
  { id: 'onehit', name: 'ONE-HIT', desc: 'Everyone dies in one hit. Slow-mo planning at wave start.', minWild: 5 }, // KATANA ZERO: hardcore mission mutator
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
  const add = (o) => { for (const k in o) fx[k] = (fx[k] || 0) + o[k]; };
  for (const id of (save.blessings || [])) {
    const b = BLESSINGS.find((x) => x.id === id);
    if (!b) continue;
    add(b.fx);
  }
  add(gearFx());   // gear: persistent build layer, tier-scaled
  add(charmFx());  // charm: pre-mission loadout choice
  return fx;
}
function blessDuo() {
  const figs = new Set((save.blessings || []).map((id) => (BLESSINGS.find((x) => x.id === id) || {}).fig));
  return BLESS_DUOS.find((d) => d.figs.every((f) => figs.has(f))) || null;
}
const energyMax = () => 100 + (blessFx().energyMax || 0) + (save.up_energy || 0) * 10;
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
// ---------- GEAR (owner 2026-10-06, Brotato-inspired): tags + merge tiers ----------
// 5 slots, 4 tiers (IRON/BRONZE/SILVER/GOLD), tags BRAWLER/STREET/HEAVY/SWIFT/LOUD.
// Two of the same piece merge into +1 tier. Store stock weights toward owned tags.
// Gear feeds the SAME stat vocabulary as blessings (blessFx merges all) — builds cohere.
const GEAR_SLOTS = ['GLOVES', 'WRAPS', 'CHAINS', 'BOOTS', 'JACKET'];
const GEAR_TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD'];
const GEAR_TIERM = [1, 1.7, 2.6, 3.8];
const GEAR = [
  { id: 'g_tape', slot: 'GLOVES', name: 'TAPE JOB', tags: ['BRAWLER'], fx: { punchDmg: 0.06 }, desc: '+6% punch dmg / tier' },
  { id: 'g_brass', slot: 'GLOVES', name: 'BRASS KNUCKS', tags: ['STREET'], fx: { punchDmg: 0.04, crit: 0.05 }, desc: '+4% punch dmg, +5% crit / tier' },
  { id: 'g_mma', slot: 'GLOVES', name: 'MMA GLOVES', tags: ['SWIFT'], fx: { punchDmg: 0.03, spd: 0.04 }, desc: '+3% dmg, +4% speed / tier' },
  { id: 'g_work', slot: 'GLOVES', name: 'WORK GLOVES', tags: ['HEAVY'], fx: { punchDmg: 0.08, spd: -0.02 }, desc: '+8% punch dmg, -2% speed / tier' },
  { id: 'g_wraps', slot: 'WRAPS', name: 'HAND WRAPS', tags: ['BRAWLER'], fx: { counterDmg: 0.15 }, desc: '+15% counter dmg / tier' },
  { id: 'g_chainw', slot: 'WRAPS', name: 'CHAIN WRAPS', tags: ['LOUD'], fx: { counterDmg: 0.10, dmg: 0.04 }, desc: '+10% counter, +4% dmg / tier' },
  { id: 'g_speedw', slot: 'WRAPS', name: 'SPEED WRAPS', tags: ['SWIFT'], fx: { crit: 0.08 }, desc: '+8% crit / tier' },
  { id: 'g_cuffs', slot: 'WRAPS', name: 'STEEL CUFFS', tags: ['HEAVY'], fx: { armor: 0.04 }, desc: '+4% armor / tier' },
  { id: 'g_chain', slot: 'CHAINS', name: 'BIKE CHAIN', tags: ['HEAVY'], fx: { armor: 0.05 }, desc: '+5% armor / tier' },
  { id: 'g_gold', slot: 'CHAINS', name: 'GOLD CHAIN', tags: ['LOUD'], fx: { armor: 0.03, luck: 0.05 }, desc: '+3% armor, +5% luck / tier' },
  { id: 'g_dog', slot: 'CHAINS', name: 'DOG TAGS', tags: ['STREET'], fx: { lifesteal: 2 }, desc: '+2 HP per KO / tier' },
  { id: 'g_band', slot: 'CHAINS', name: 'SWEATBAND', tags: ['SWIFT'], fx: { dodge: 0.10 }, desc: 'Dodge recharges 10% faster / tier' },
  { id: 'g_grillz', slot: 'CHAINS', name: 'GRILLZ', tags: ['LOUD'], fx: { lifesteal: 2, punchDmg: 0.02 }, desc: '+2 HP/KO, +2% punch dmg / tier' },
  { id: 'g_boots', slot: 'BOOTS', name: 'STEEL TOES', tags: ['HEAVY'], fx: { spd: 0.04, dmg: 0.03 }, desc: '+4% speed, +3% dmg / tier' },
  { id: 'g_sneak', slot: 'BOOTS', name: 'SNEAKERS', tags: ['SWIFT'], fx: { spd: 0.08 }, desc: '+8% speed / tier' },
  { id: 'g_timbs', slot: 'BOOTS', name: 'TIMBS', tags: ['STREET'], fx: { spd: 0.04, armor: 0.02 }, desc: '+4% speed, +2% armor / tier' },
  { id: 'g_jean', slot: 'JACKET', name: 'JEAN JACKET', tags: ['STREET'], fx: { hp: 10 }, desc: '+10 max HP / tier' },
  { id: 'g_leather', slot: 'JACKET', name: 'LEATHER JACKET', tags: ['LOUD'], fx: { hp: 8, armor: 0.02 }, desc: '+8 HP, +2% armor / tier' },
  { id: 'g_hoodie', slot: 'JACKET', name: 'HOODIE', tags: ['SWIFT'], fx: { energyGain: 0.15 }, desc: '+15% energy gain / tier' },
  { id: 'g_puffer', slot: 'JACKET', name: 'PUFFER', tags: ['BRAWLER'], fx: { hp: 12, spd: -0.02 }, desc: '+12 HP, -2% speed / tier' },
  { id: 'g_snap', slot: 'JACKET', name: 'SNAPBACK', tags: ['STREET'], fx: { luck: 0.08 }, desc: '+8% luck / tier' },
];
const gearTier = (id) => ((save.gearTier || {})[id] || 0);
function gearFx() { // equipped gear, tier-scaled — feeds the shared stat vocabulary
  const fx = {};
  for (const slot of GEAR_SLOTS) {
    const id = (save.gearEq || {})[slot]; if (!id) continue;
    const g = GEAR.find((x) => x.id === id); if (!g) continue;
    const m = GEAR_TIERM[gearTier(id)] || 1;
    for (const k in g.fx) fx[k] = (fx[k] || 0) + g.fx[k] * m;
  }
  return fx;
}
function ownedTags() {
  const s = new Set();
  for (const slot of GEAR_SLOTS) {
    const id = (save.gearEq || {})[slot]; const g = GEAR.find((x) => x.id === id);
    if (g) g.tags.forEach((t) => s.add(t));
  }
  return s;
}
function gearStock(n = 3) { // store stock weights toward tags you already run (Brotato's quiet genius)
  const tags = ownedTags();
  const out = []; const cp = GEAR.slice();
  while (out.length < n && cp.length) {
    let tw = 0; const ws = cp.map((g) => { const w = 10 + (g.tags.some((t) => tags.has(t)) ? 18 : 0); tw += w; return w; });
    let r = Math.random() * tw, pi = 0;
    for (let i = 0; i < cp.length; i++) { r -= ws[i]; if (r <= 0) { pi = i; break; } }
    out.push(cp[pi]); cp.splice(pi, 1);
  }
  return out;
}
const gearCost = (g) => Math.round(120 * (gearTier(g.id) + 1));
function grantGear(id) { // mission reward drop
  save.gearInv = save.gearInv || {}; save.gearInv[id] = (save.gearInv[id] || 0) + 1;
  const g = GEAR.find((x) => x.id === id);
  banner('GEAR: ' + (g ? g.name : id)); sfx('coin', 0.9, false, 1.1);
  writeSave();
}
function tryMergeGear(id) { // 2 of the same -> +1 tier
  save.gearInv = save.gearInv || {}; save.gearTier = save.gearTier || {};
  if ((save.gearInv[id] || 0) >= 2 && gearTier(id) < 3) {
    save.gearInv[id] -= 2; save.gearTier[id] = gearTier(id) + 1;
    const g = GEAR.find((x) => x.id === id);
    banner((g ? g.name : id) + ' → ' + GEAR_TIERS[gearTier(id)]); sfx('bell', 1, true);
    writeSave(); return true;
  }
  return false;
}
// ---------- CHARMS (owner 2026-10-06, Hades keepsake-inspired): one pre-mission loadout choice ----------
// Equip one before a mission. Earned from bosses / milestones. Loads the dice without removing RNG.
const CHARMS = [
  { id: 'c_brass', name: 'BRASS KNUCKLES', fx: { dmg: 0.10 }, desc: '+10% all damage', unlock: { type: 'boss', boss: 'kingpin' } },
  { id: 'c_dice', name: 'LUCKY DICE', fx: { luck: 0.15 }, desc: '+15% luck (drops + store)', unlock: { type: 'circuit', n: 5 } },
  { id: 'c_wind', name: 'SECOND WIND', fx: {}, desc: 'Revive once per mission at 1 HP', unlock: { type: 'boss', boss: 'sledge' }, revive: true },
  { id: 'c_magnet', name: 'CASH MAGNET', fx: { cash: 0.25 }, desc: '+25% cash earned', unlock: { type: 'boss', boss: 'viper' } },
  { id: 'c_adren', name: 'ADRENALINE', fx: { energyGain: 0.20 }, desc: '+20% energy gain', unlock: { type: 'boss', boss: 'rust' } },
  { id: 'c_iron', name: 'IRON WILL', fx: { hp: 15 }, desc: '+15 max HP', unlock: { type: 'boss', boss: 'pumpkinking' } },
];
function charmUnlocked(c) {
  if ((save.charmsUnlocked || []).includes(c.id)) return true;
  const u = c.unlock || {};
  if (u.type === 'boss') { const done = save.missionsDone || []; if (done.some((id) => String(id).includes(u.boss) || missionDef(id).boss === u.boss)) { save.charmsUnlocked.push(c.id); writeSave(); return true; } }
  if (u.type === 'circuit' && (save.circuitN || 0) >= u.n) { save.charmsUnlocked.push(c.id); writeSave(); return true; }
  return false;
}
function charmFx() {
  const c = CHARMS.find((x) => x.id === save.charm);
  return c ? c.fx : {};
}
// ---------- STYLE METER (DMC-inspired): grades move VARIETY, not just hit count ----------
// Spamming one move tanks your rank; variety raises it. The anti-spam, pro-expression layer.
let styleRank = 0, styleT = 0;
const styleHist = [];
const STYLE_RANKS = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const STYLE_COLORS = ['#8a8a8a', '#9ad1ff', '#7af0ff', '#80ed99', '#ffd166', '#ff9df0', '#ff5a5a'];
function styleHit(label) {
  if (label) { styleHist.push(label); if (styleHist.length > 10) styleHist.shift(); }
  const uniq = new Set(styleHist).size;
  styleRank = Math.min(6, Math.floor(uniq * 6 / 10) + (combo >= 12 ? 1 : 0));
  styleT = 4; // rank holds 4s without new variety
}
function lastStandFx() { // Garou TOP: screen edges burn while you're dangerous
  const e = $('lsEdge'); if (e) e.style.opacity = '1';
  setTimeout(() => { const x = $('lsEdge'); if (x && (!player || player.hp >= player.maxHp * 0.3)) x.style.opacity = '0'; }, 600);
}
// SHRINE node: mid-mission blessing offer (Hades door-preview payoff)
function offerMidBlessing() {
  paused = true;
  const ov = el('div', 'overlay');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,6,24,.85);z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px';
  ov.appendChild(el('div', 'storeTitle', '✦ SHRINE — CHOOSE A BLESSING ✦'));
  const rarColor = { common: '#9a9a9a', rare: '#4fa3ff', epic: '#c77dff' };
  for (const b of rollBlessings()) {
    const c = el('div', 'blessCard panel9');
    c.appendChild(el('div', 'bf', b.fname));
    c.appendChild(el('div', 'bn', b.name));
    c.appendChild(el('div', 'bd', b.desc));
    c.appendChild(el('div', 'br', b.rar.toUpperCase()));
    c.querySelector('.br').style.color = rarColor[b.rar] || '#fff';
    c.onclick = (e) => {
      e.stopPropagation(); save.blessings.push(b.id); writeSave();
      sfx('bell', 0.9, true); document.body.removeChild(ov); paused = false;
      const duo = blessDuo(); if (duo) banner('DUO: ' + duo.name);
    };
    ov.appendChild(c);
  }
  document.body.appendChild(ov);
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
    await Promise.all(['hit1', 'hit2', 'hit3', 'bell', 'crowd', 'music', 'click', 'whoosh', 'step', 'crack', 'coin', 'uiclick', 'swing1', 'swing2', 'swing3'].map(async (k) => { sbuf[k] = await actx.decodeAudioData(b64ToBuf(A[k + '.mp3'])); }));
    sfx('music', 0.32, true); sfx('crowd', 0.25, true);
  } catch (e) { T.errors.push('audio:' + e); }
}
function sfx(k, vol = 1, loop = false, rate = 1) {
  if (!actx || !sbuf[k] || muted) return null;
  const s = actx.createBufferSource(); s.buffer = sbuf[k]; s.loop = loop; s.playbackRate.value = rate;
  const g = actx.createGain(); g.gain.value = vol; s.connect(g).connect(actx.destination); s.start(); return s;
}
// S2 swing whooshes (TIER 3 item 10, owner 2026-10-07): dedicated attack-swing SFX from Kenney RPG
// Audio (CC0 1.0) — swing1/knifeSlice, swing2/knifeSlice2, swing3/chop — distinct from the generic
// whoosh.mp3 (kept for dodge S3, fanfares, specials). whiff=true marks a MISSED attack (no enemy
// hit): played louder so whiffs read. T.swingSfx / T.whiffSfx are playtest counters.
function sfxSwing(vol = 0.5, whiff = false) {
  const k = ['swing1', 'swing2', 'swing3'][Math.floor(Math.random() * 3)];
  T.swingSfx = (T.swingSfx || 0) + 1;
  if (whiff) T.whiffSfx = (T.whiffSfx || 0) + 1;
  sfx(k, vol, false, 1 + (Math.random() * 0.16 - 0.08));
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
// OWNER 2026-10-07 (readability polish): soft key light that follows the player
// so the fighter pops from the background in every district/lighting setup.
const playerKey = new THREE.PointLight(0xfff2d8, 14, 7, 1.7);
playerKey.position.set(0, 3.2, 1.6); scene.add(playerKey);
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
let roadParts = {}; // overpass district kit (Kenney city-kit-roads)
let indParts = {};  // industrial district kit (Kenney city-kit-industrial)
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
  colliders.length = 0; destructibles.length = 0; platforms.length = 0; clearPickups();
}
// buildLayout: zone parts 3/4 — maze-like pockets and platformer pieces (owner 2026-10-06)
function buildLayout(kind, L, R, place, curb, K) {
  if (kind === 'maze') {
    // winding fence pockets: dead-ends with bonus pickups + ambush spawns
    for (let px = 14; px < L - 8; px += rnd(16, 24)) {
      const side = R() < 0.5 ? -1 : 1;
      const pz = side * (curb + 1.5);
      // U-shaped pocket: 3 dumpster walls (solid, block movement)
      place('dumpster', px - 2.5, pz, 0, K); place('dumpster', px + 2.5, pz, 0, K);
      place('dumpster', px, pz + side * 2.2, Math.PI / 2, K);
      // wave-6: construction dressing — cones, barriers, fence segments
      placeProp('k_cone', px - 4.5, -side * 1.2, R() * 3, 1.4);
      placeProp('k_cone', px + 4.5, side * 1.2, R() * 3, 1.4);
      if (R() < 0.5) placeProp('k_barrier', px, -side * (curb + 0.5), 0, 1.5);
      // loot in the pocket
      if (R() < 0.7) spawnPickup('cash', px, clamp(pz - side * 0.8, -1.4, 1.4));
      if (R() < 0.4) spawnPickup('health', px + 1, clamp(pz - side * 0.8, -1.4, 1.4));
    }
  } else if (kind === 'platform') {
    // raised platforms: jump up for vantage + bonus pickups (platformer beat-em-up)
    for (let px = 12; px < L - 10; px += rnd(14, 20)) {
      const pz = rnd(-1, 1), w = rnd(3, 5), d = rnd(1.6, 2.4), top = rnd(1.1, 1.9);
      const geo = new THREE.BoxGeometry(w, top, d);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3a3348, roughness: 0.9 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, top / 2 - 0.02, pz); m.castShadow = true; m.receiveShadow = true;
      streetGroup.add(m);
      platforms.push({ x: px, z: pz, w, d, top });
      if (R() < 0.6) spawnPickup(R() < 0.5 ? 'cash' : 'special', px, pz);
      // visual edge stripe
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.08, d + 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffcf2e }));
      edge.position.set(px, top + 0.02, pz); streetGroup.add(edge);
    }
  } else if (kind === 'skyline') {
    // ZONE 6: multi-tier catwalk staircases — chained jumps, gaps, loot on the high steel
    let top = 0;
    for (let px = 12; px < L - 12; px += rnd(7, 10)) {
      top = Math.min(3.0, Math.max(0.9, top + (R() < 0.55 ? rnd(0.6, 1.0) : -rnd(0.4, 0.9))));
      const pz = rnd(-1.2, 1.2), w = rnd(4, 6), d = rnd(2, 3);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.7, metalness: 0.35 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, top, d), mat);
      m.position.set(px, top / 2 - 0.02, pz); m.castShadow = true; m.receiveShadow = true;
      streetGroup.add(m);
      platforms.push({ x: px, z: pz, w, d, top });
      // railing posts — visual only
      for (const ex of [-w / 2 + 0.3, w / 2 - 0.3]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12),
          new THREE.MeshStandardMaterial({ color: 0x8a929e, roughness: 0.4, metalness: 0.7 }));
        post.position.set(px + ex, top + 0.45, pz + d / 2 - 0.15); streetGroup.add(post);
      }
      if (R() < 0.55) spawnPickup(top > 1.8 ? (R() < 0.5 ? 'special' : 'health') : 'cash', px, pz);
    }
  } else if (kind === 'ring') {
    // ZONE 7: steel cell — smashable dumpster walls box the fight in; break out or get broken
    const cx0 = 18, cw = 20, ch = 9;
    const wallTint = 0x8a929e; // bare steel
    for (let wx = cx0 - cw / 2; wx <= cx0 + cw / 2; wx += 3.4) {
      place('dumpster', wx, -ch / 2, 0, K, wallTint); place('dumpster', wx, ch / 2, 0, K, wallTint);
    }
    for (let wz = -ch / 2 + 3.4; wz <= ch / 2 - 3.4; wz += 3.4) {
      place('dumpster', cx0 - cw / 2, wz, Math.PI / 2, K, wallTint); place('dumpster', cx0 + cw / 2, wz, Math.PI / 2, K, wallTint);
    }
    // corner spotlights
    place('streetlight', cx0 - cw / 2 - 1, -ch / 2 - 1, 0, K); place('streetlight', cx0 + cw / 2 + 1, ch / 2 + 1, 0, K);
    if (R() < 0.8) spawnPickup('health', cx0, 0);
  } else if (kind === 'plaza') {
    // open multidirectional plaza: central barricade cluster, four approach lanes, crowd ring
    const cx0 = L * 0.55;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + R() * 0.5, rr = rnd(1.5, 3.2);
      const nm = i % 2 ? 'tnt_crate' : 'box_A';
      place(nm, cx0 + Math.cos(a) * rr, Math.sin(a) * rr * 0.7, R() * 3, K);
    }
    place('dumpster', cx0, 0, R() * 3, K);
    // wave-6: street cafe wreckage — tables and chairs, all smashable
    for (let i = 0; i < 3; i++) {
      const a = R() * Math.PI * 2, rr = rnd(4.5, 6.5);
      placeProp('k_table', cx0 + Math.cos(a) * rr, Math.sin(a) * rr * 0.7, R() * 3, 1.6);
      placeProp('k_chair', cx0 + Math.cos(a) * (rr + 1.2), Math.sin(a) * (rr + 1.2) * 0.7, R() * 3, 1.6);
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      place('streetlight', cx0 + sx * 9, sz * 5, 0, K);
      if (R() < 0.6) place('trash_A', cx0 + sx * rnd(4, 7), sz * rnd(3, 5), R() * 3, K);
    }
    if (R() < 0.7) spawnPickup('special', cx0 + 4, 0);
  }
}
function buildStreet(district, missionLen, seedFn) {
  if (districtDef(district).id === 'overpass') return buildRoads(district, missionLen, seedFn);
  if (districtDef(district).id === 'industrial') return buildIndustrial(district, missionLen, seedFn);
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
  if (mission && mission.layout) buildLayout(mission.layout, L, R, place, curb, K); // zone parts 3/4
  return { curb, roadW: rw };
}

// ---------- overpass district (A5 wiring queue: Kenney city-kit-roads — owner 2026-10-06) ----------
// Elevated highway deck: road tiles, bridge pillars, guardrails, lamps, construction
// flavor. Same KayKit-scaled world (K=2.2) so fighters/enemies/colliders behave identically.
function buildRoads(district, missionLen, seedFn) {
  clearStreet();
  const d = districtDef(district);
  applyDistrict(d, (mission && mission.circuitN || 0) * 31 + (mission && mission.id ? mission.id.length : 0) + 11);
  const R = seedFn || Math.random;
  const K = 2.2;
  const place = (name, x, z, ry = 0, sc = K, tint = null) => placeProp(name, x, z, ry, sc, tint, roadParts);
  const rb = new THREE.Box3().setFromObject(roadParts.road_seg);
  const tile = Math.max(rb.max.x - rb.min.x, rb.max.z - rb.min.z) * K; // square tile
  const rw = tile;
  const L = isFinite(missionLen) ? missionLen + 30 : 220;
  for (let x = -tile; x < L; x += tile) { const o = place('road_seg', x + tile / 2, 0, Math.PI / 2); if (o) o.position.y = -0.02 * K; }
  for (let x = 10; x < L; x += tile * 6) {
    place(R() < 0.5 ? 'pillar' : 'pillar_wide', x, rw / 2 + 1.6, 0);
    place(R() < 0.5 ? 'pillar' : 'pillar_wide', x + tile * 3, -rw / 2 - 1.6, 0);
  }
  const gb = new THREE.Box3().setFromObject(roadParts.guardrail);
  const gl = Math.max(gb.max.x - gb.min.x, gb.max.z - gb.min.z) * K;
  for (let x = 0; x < L; x += gl) { place('guardrail', x + gl / 2, rw / 2 + 0.25, Math.PI / 2); place('guardrail', x + gl / 2, -rw / 2 - 0.25, Math.PI / 2); }
  for (let px = 8; px < L; px += 11) {
    const side = (Math.floor(px / 11) % 2 === 0) ? 1 : -1;
    place('lamp', px, side * (rw / 2 + 0.9), side > 0 ? Math.PI : 0);
    if (R() < 0.55) place('fence', px + rnd(-3, 3), -side * (rw / 2 + 0.9), (side > 0 ? 0 : Math.PI) + rnd(-0.3, 0.3), 1.6);
    if (R() < 0.4) place('worklight', px + rnd(-4, 4), side * (rw / 2 - 0.6), R() * 3, 1.4);
    if (R() < 0.5) { const cx = px + rnd(-2, 2); place('cone', cx, rnd(-1, 1), R() * 3, 1.6); if (R() < 0.5) place('cone', cx + rnd(0.8, 1.4), rnd(-1, 1), R() * 3, 1.6); }
    if (R() < 0.35) place('dumpster', px + rnd(-3, 3), side * (rw / 2 - 0.4), R() * 3);
  }
  place('hwy_sign', 16, rw / 2 + 1.2, 0);
  place('trafficlight', L * 0.55, rw / 2 + 0.6, Math.PI);
  const cx = place('crossing', L * 0.55, 0, Math.PI / 2); if (cx) cx.position.y += 0.03; // avoid z-fight with deck
  if (R() < 0.8) place('sign_stop', 30, -rw / 2 - 0.7, 0.3, 1.6);
  if (R() < 0.8) place('sign_warn', L - 24, rw / 2 + 0.7, -0.3, 1.6);
  lampL.position.set(4, 3.6, rw / 2 + 0.8); lampR.position.set(12, 3.4, -rw / 2 - 0.8);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(L + 60, 80), new THREE.MeshStandardMaterial({ color: d.ground, roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.position.set(L / 2 - 10, -0.06, 0); g.receiveShadow = true; streetGroup.add(g);
  return { curb: -rw / 2, roadW: rw };
}

// ---------- industrial district (A5 wiring queue item 17: Kenney city-kit-industrial — owner 2026-10-06) ----------
// Warehouse yard: factory blocks flank the lane with chimneys behind, shipping containers
// and fuel tanks in the yard, water-tower landmark, solar arrays. Same KayKit-scaled world
// (K=2.2) so fighters/enemies/colliders behave identically.
function buildIndustrial(district, missionLen, seedFn) {
  clearStreet();
  const d = districtDef(district);
  applyDistrict(d, (mission && mission.circuitN || 0) * 31 + (mission && mission.id ? mission.id.length : 0) + 13);
  const R = seedFn || Math.random;
  const K = 2.2;
  const place = (name, x, z, ry = 0, sc = K, tint = null) => placeProp(name, x, z, ry, sc, tint, indParts);
  const L = isFinite(missionLen) ? missionLen + 30 : 220;
  const blocks = ['ind_building_a', 'ind_building_c', 'ind_building_e', 'ind_building_g',
    'ind_building_i', 'ind_building_l', 'ind_building_p', 'ind_building_r'];
  const chims = ['ind_chimney_s', 'ind_chimney_m', 'ind_chimney_l'];
  for (let x = 0; x < L; x += 24) {
    const side = (Math.floor(x / 24) % 2 === 0) ? 1 : -1;
    place(blocks[Math.floor(R() * blocks.length)], x + rnd(-4, 4), side * rnd(12, 16),
      (side > 0 ? Math.PI : 0) + rnd(-0.25, 0.25), 3.1);
    if (R() < 0.6) place(chims[Math.floor(R() * chims.length)], x + rnd(-9, 9), -side * rnd(13, 17), R() * 3, 2.8);
    if (R() < 0.45) place('ind_solar_l', x + rnd(-6, 6), side * rnd(10, 13), R() * 3, 2.6);
  }
  // container yard: stacks along the lane edges, fuel tanks, solar arrays
  for (let x = 10; x < L; x += 13) {
    if (R() < 0.75) place(['ind_container_a', 'ind_container_b', 'ind_container_c'][Math.floor(R() * 3)],
      x + rnd(-3, 3), (R() < 0.5 ? -1 : 1) * rnd(4.5, 7), rnd(-0.15, 0.15));
    if (R() < 0.4) place('ind_tank_large', x + rnd(-4, 4), (R() < 0.5 ? -1 : 1) * rnd(7, 10), R() * 3);
    if (R() < 0.35) place('ind_solar', x + rnd(-3, 3), (R() < 0.5 ? -1 : 1) * rnd(3.2, 5), R() * 3, 2.4);
  }
  place('ind_water_tower', L * 0.62, -9.5, 0.4, 3.0); // district landmark
  place('ind_windmill', 14, 13.5, 0.3, 3.2);
  for (let x = 6; x < L; x += 16) placeProp('streetlight', x, (Math.floor(x / 16) % 2 === 0 ? 1 : -1) * 4.4, 0);
  const g2 = new THREE.Mesh(new THREE.PlaneGeometry(L + 70, 70), new THREE.MeshStandardMaterial({ color: d.ground, roughness: 1 }));
  g2.rotation.x = -Math.PI / 2; g2.position.set(L / 2 - 10, -0.06, 0); g2.receiveShadow = true; streetGroup.add(g2);
  return { curb: -6, roadW: 12 };
}

// ---------- destructibles + collision (SoR/Fatal Fury style: smash cars/crates, spill pickups) ----------
const DESTRUCT_DEFS = {
  box_A: { hp: 20, name: 'CRATE', pickups: ['cash', 'cash'] },
  tnt_crate: { hp: 15, name: 'TNT CRATE', pickups: [], tnt: true },
  trash_A: { hp: 15, name: 'TRASH CAN', pickups: ['cash'] },
  trash_B: { hp: 15, name: 'TRASH CAN', pickups: ['health'] },
  dumpster: { hp: 45, name: 'DUMPSTER', pickups: ['cash', 'health', 'special'] },
  barrier: { hp: 25, name: 'BARRIER', pickups: ['cash'] },   // overpass kit
  cone: { hp: 12, name: 'CONE', pickups: ['cash'] },          // overpass kit
  ind_container_a: { hp: 35, name: 'SHIPPING CONTAINER', pickups: ['cash', 'health'] }, // industrial kit
  ind_container_b: { hp: 35, name: 'SHIPPING CONTAINER', pickups: ['cash', 'health'] }, // industrial kit
  ind_container_c: { hp: 35, name: 'SHIPPING CONTAINER', pickups: ['cash', 'health'] }, // industrial kit
  ind_tank: { hp: 50, name: 'FUEL TANK', pickups: ['cash', 'cash', 'health'] },          // industrial kit
  ind_solar: { hp: 15, name: 'SOLAR PANEL', pickups: ['cash'] },                        // industrial kit
  car_taxi: { hp: 70, name: 'TAXI', pickups: ['cash', 'cash', 'cash', 'special'] },
  car_police: { hp: 70, name: 'SQUAD CAR', pickups: ['cash', 'cash', 'health', 'special'] },
};
const SOLID_PROPS = new Set(['streetlight', 'firehydrant', 'k_barrier', 'k_fence', 'k_lamppost',
  'lamp', 'trafficlight', 'hwy_sign', 'pole', 'pillar', 'pillar_wide', 'worklight', 'fence', 'guardrail', // overpass kit
  'ind_building_a', 'ind_building_c', 'ind_building_e', 'ind_building_g', 'ind_building_i',
  'ind_building_l', 'ind_building_p', 'ind_building_r', 'ind_chimney_s', 'ind_chimney_m',
  'ind_chimney_l', 'ind_tank_large', 'ind_water_tower', 'ind_windmill', 'ind_solar_l']); // industrial kit
// wave-6 arena dressing: Kenney CC0 smashables
Object.assign(DESTRUCT_DEFS, {
  k_cone: { hp: 8, name: 'TRAFFIC CONE', pickups: ['cash'] },
  k_trafficone: { hp: 8, name: 'TRAFFIC CONE', pickups: ['cash'] },
  k_chair: { hp: 12, name: 'CHAIR', pickups: ['cash'] },
  k_table: { hp: 18, name: 'TABLE', pickups: ['cash', 'health'] },
  k_tire: { hp: 14, name: 'TIRE', pickups: ['cash'] },
});
const colliders = [];    // {x, z, r, dead} — block player movement (owner bug report 2026-10-06)
const destructibles = []; // {mesh, px, pz, r, hp, maxHp, name, def, col}
const platforms = [];     // {x, z, w, d, top} — jumpable platforms (zone 4, platformer layouts)
// placeProp: ground-aligns via bounding box (BUG FIX 2026-10-06: cars sank), registers collision + destructible HP
function placeProp(name, x, z, ry = 0, sc = 2.2, tint = null, parts = null) {
  const SP = parts || streetParts;
  const part = SP[name] || streetParts[name] || (name === 'tnt_crate' ? streetParts['box_A'] : null);
  if (!part) return null;
  if (name === 'tnt_crate' && tint === null) tint = 0xff3a1a; // TNT painted red
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
  // TNT CRATE (Crash taxonomy): chain explosion — hurts enemies AND you. Risk assessment.
  if (d.def.tnt) {
    burst(pos.clone().add(new THREE.Vector3(0, 0.9, 0)), 40, 0xff7a1a, 8);
    burst(pos.clone().add(new THREE.Vector3(0, 0.5, 0)), 24, 0xffd166, 6);
    sfx('hit3', 1, false, 0.5); shake = Math.max(shake, 0.7); flash('#ff7a1a');
    streetGroup.remove(d.mesh);
    const sp = screenPos(pos.clone().add(new THREE.Vector3(0, 1.4, 0)));
    popText('TNT!', 'bad', sp.x, sp.y);
    for (const e of enemies.slice()) {
      if (!e.dead && e.hp > 0 && Math.hypot(e.px - d.px, e.pz - d.pz) < 4) {
        landHit(e, Math.round(40 * (player ? player.dmgMult : 1)), 'TNT', 0.1, 0.6, true, false);
      }
    }
    if (player && Math.hypot(player.px - d.px, player.pz - d.pz) < 2.5) hurtPlayer(20);
    // chain: other TNT nearby
    for (const o of destructibles) {
      if (o !== d && !o.col.dead && o.def.tnt && Math.hypot(o.px - d.px, o.pz - d.pz) < 4) {
        setTimeout(() => { if (!o.col.dead) { o.hp = 0; destroyDestructible(o); } }, 250);
      }
    }
    ev('smash', { name: 'TNT' });
    return;
  }
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
  const over = district === 'overpass', ind = district === 'industrial';
  const names = over ? ['barrier', 'cone', 'dumpster']
    : ind ? ['box_A', 'ind_container_a', 'ind_container_b', 'ind_tank', 'ind_solar']
    : ['trash_A', 'trash_B', 'box_A', 'tnt_crate'];
  const P = over ? roadParts : ind ? indParts : null, SC = over ? 1.6 : 2.2;
  const step = (typeof hasMod === 'function' && mission && hasMod('party')) ? 5 : 9;
  for (let px = 8; px < L; px += rnd(step, step + 7)) {
    const nm = names[Math.floor(R() * names.length)];
    placeProp(nm, px + rnd(-2, 2), rnd(-1.5, 1.5), R() * 3, SC, null, P);
  }
}
// ---------- pickups: health / cash / special (dropped by enemies + destructibles) ----------
const pickups = []; // {type, mesh, px, pz, t}
const PICKUP_DEFS = {
  health: { color: 0xff4d6d, label: '+HP' },
  cash: { color: 0x80ed99, label: '+$' },
  special: { color: 0x7af0ff, label: '+SPC' },
  food: { color: 0xffb020, label: '+FOOD' }, // RIVER CITY RANSOM: food heals big — eat between beatdowns
};
function spawnPickup(type, x, z) {
  const d = PICKUP_DEFS[type]; if (!d) return;
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: d.color, emissive: d.color, emissiveIntensity: 0.55, roughness: 0.4 });
  if (type === 'health') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.2), mat);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.2), mat);
    g.add(a, b);
  } else if (type === 'food') {
    // burger: bun + patty
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat); g.add(bun);
    const patty = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.8 })); patty.position.y = -0.05; g.add(patty);
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
    if (dist < magnetR() && dist > 0.01) { // magnet (gym MAGNET widens it)
      const pull = (magnetR() - dist) * 4 * dt;
      pk.px += dx / dist * pull; pk.pz += dz / dist * pull;
      pk.mesh.position.x = pk.px; pk.mesh.position.z = pk.pz;
    }
    if (dist < 0.75) {
      const d = PICKUP_DEFS[pk.type];
      const sp = screenPos(pk.mesh.position.clone());
      if (pk.type === 'health') { player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.3); popText('+HP', 'gold', sp.x, sp.y); }
      else if (pk.type === 'food') { player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.5); player.energy = clamp(player.energy + 20, 0, energyMax()); popText('+FOOD! +HP +SPC', 'gold', sp.x, sp.y); }
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

// ---------- GRAFFITI TAG SPOTS (Jet Set Radio) ----------
// Tag spots: claim the block with style. Stand in the zone + TAUNT to spray (3s channel, vulnerable).
// Complete = big style cash + district REP. THE street-brawler mechanic.
let tagSpots = [];
function spawnTagSpots(mission, R) {
  for (const s of tagSpots) streetGroup.remove(s.mesh);
  tagSpots = [];
  const n = 1 + Math.floor(R() * 2); // 1-2 spots per mission
  const len = mission.len || 30;
  for (let i = 0; i < n; i++) {
    const x = 6 + R() * (len - 12), z = (R() < 0.5 ? -1 : 1) * (1.1 + R() * 0.3);
    const g = new THREE.Group();
    // blank wall panel awaiting paint
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x2a2d3a, roughness: 0.9, emissive: 0x111122, emissiveIntensity: 0.4 }));
    panel.position.y = 1.1; g.add(panel);
    // glowing outline = "paint me"
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    edge.position.set(0, 1.1, -0.02); g.add(edge);
    g.position.set(x, 0, z);
    g.rotation.y = z > 0 ? Math.PI : 0;
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    streetGroup.add(g);
    tagSpots.push({ mesh: g, panel, edge, px: x, pz: z, done: false, t: Math.random() * 6 });
  }
}
function nearestTagSpot(range) {
  let best = null, bd = range;
  for (const s of tagSpots) {
    if (s.done) continue;
    const d = Math.hypot(player.px - s.px, player.pz - s.pz);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}
function updateTagSpots(dt) {
  for (const s of tagSpots) {
    if (s.done) continue;
    s.t += dt;
    s.edge.material.opacity = 0.25 + Math.sin(s.t * 4) * 0.15; // pulsing "paint me" glow
    // spraying channel
    if (player && player.sprayT > 0 && player.spraySpot === s) {
      player.sprayT -= dt;
      // paint particles
      if (Math.random() < dt * 20) {
        const cols = [0xff4fd8, 0x7af0ff, 0xffe14d, 0x80ed99];
        sparkFX(s.px + rnd(-1, 1), 1.1 + rnd(-0.6, 0.6), s.pz, cols[Math.floor(Math.random() * cols.length)], 2);
      }
      s.panel.material.emissive.setHex(0x7744aa); // filling in...
      s.panel.material.emissiveIntensity = Math.min(1, (s.panel.material.emissiveIntensity || 0.4) + dt * 0.5);
      if (player.sprayT <= 0) completeTag(s);
    }
  }
}
function completeTag(s) {
  s.done = true;
  player.sprayT = 0; player.spraySpot = null; player.busy = 0;
  playAnim(player, 'Melee_Unarmed_Idle', { loop: true });
  // the piece: hot pink + cyan throw-up
  s.panel.material.color.setHex(0xff4fd8);
  s.panel.material.emissive.setHex(0xff4fd8); s.panel.material.emissiveIntensity = 0.7;
  s.edge.material.color.setHex(0x7af0ff);
  const cash = Math.round(120 * hustleMult() * (1 + (mission.wild || 0) * 0.2));
  awardCash(cash, new THREE.Vector3(s.px, 1.5, s.pz), 'TAGGED');
  save.rep = (save.rep || 0) + 15; writeSave(); // district REP
  banner('TAGGED!', 'spc');
  const sp = screenPos(new THREE.Vector3(s.px, 2.2, s.pz));
  popText('+' + cash + ' + 15 REP', 'gold', sp.x, sp.y);
  sfx('bell', 1, false, 1.2); flash('#ff4fd8');
  sparkFX(s.px, 1.4, s.pz, 0xff4fd8, 24);
  T.tags = (T.tags || 0) + 1; ev('tag', {}); setHud();
}
function startSpray(s) {
  // 3s vulnerable channel — getting hit cancels it
  player.sprayT = 3; player.spraySpot = s; player.busy = 3;
  playAnim(player, 'Melee_Unarmed_Idle', { ts: 0.6, fade: 0.1 });
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)));
  popText('SPRAYING...', 'spc', sp.x, sp.y);
  sfx('whoosh', 0.5, false, 1.4);
  ev('spray', {});
}

// ---------- CORNER-CREW MASCOTS (Castle Crashers animal-orb-inspired) ----------
// Unlockable street mascots that follow you and grant small perks. Pure charm layer — style, not power.
// PIGEON: +30% pickup magnet radius. DOG: pickups glow brighter + bark when a tag spot is near.
const MASCOTS = [
  { id: 'm_pigeon', name: 'PIGEON', color: 0x9aa5b1, desc: '+30% pickup magnet radius', unlock: { type: 'missions', n: 10 } },
  { id: 'm_dog', name: 'STRAY DOG', color: 0xc98d4b, desc: 'Pickups glow; barks near tag spots', unlock: { type: 'recruits', n: 5 } },
];
function mascotUnlocked(m) {
  save.mascotsUnlocked = save.mascotsUnlocked || [];
  if (save.mascotsUnlocked.includes(m.id)) return true;
  const u = m.unlock || {};
  if (u.type === 'missions' && (save.wins || 0) >= u.n) { save.mascotsUnlocked.push(m.id); writeSave(); return true; }
  if (u.type === 'recruits') { const n = Object.values(save.scouts || {}).reduce((a, b) => a + b, 0); if (n >= u.n) { save.mascotsUnlocked.push(m.id); writeSave(); return true; } }
  return false;
}
let mascotMesh = null, mascotId = null;
function spawnMascot() {
  if (mascotMesh) { streetGroup.remove(mascotMesh); mascotMesh = null; }
  mascotId = save.mascot || null;
  if (!mascotId) return;
  const m = MASCOTS.find(x => x.id === mascotId);
  if (!m || !mascotUnlocked(m)) { mascotId = null; return; }
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.7 });
  if (m.id === 'm_pigeon') {
    // little pigeon: body + head + beak
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat); body.position.y = 0.35; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), mat); head.position.set(0.16, 0.52, 0); g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 6), new THREE.MeshStandardMaterial({ color: 0xffb020 })); beak.rotation.z = -Math.PI / 2; beak.position.set(0.3, 0.52, 0); g.add(beak);
  } else {
    // stray dog: body + head + tail
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.24), mat); body.position.y = 0.32; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.22), mat); head.position.set(0.32, 0.5, 0); g.add(head);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), mat); tail.rotation.z = 0.7; tail.position.set(-0.3, 0.5, 0); g.add(tail);
  }
  g.traverse((x) => { if (x.isMesh) x.castShadow = true; });
  streetGroup.add(g);
  mascotMesh = g;
}
function updateMascot(dt) {
  if (!mascotMesh || !player || player.hp <= 0) return;
  // follow the player with a lag (charming, not robotic)
  const tx = player.px - (player.face || 1) * 1.6, tz = player.pz + 0.7;
  const m = mascotMesh.position;
  m.x += (tx - m.x) * Math.min(1, dt * 4);
  m.z += (tz - m.z) * Math.min(1, dt * 4);
  m.y = Math.abs(Math.sin(performance.now() * 0.006)) * 0.25; // hop
  mascotMesh.rotation.y = (player.face || 1) > 0 ? 0 : Math.PI;
  // DOG: bark when a tag spot is near
  if (mascotId === 'm_dog' && Math.random() < dt * 0.5) {
    const s = tagSpots.find(s => !s.done && Math.hypot(player.px - s.px, player.pz - s.pz) < 6);
    if (s) { sfx('uiclick', 0.7, false, 1.8); sparkFX(m.x, 0.8, m.z, 0xc98d4b, 3); }
  }
}
function mascotMagnetBonus() { return mascotId === 'm_pigeon' ? 0.3 : 0; } // +30% magnet radius
function mascotGlowBonus() { return mascotId === 'm_dog' ? 1 : 0; } // pickups glow brighter

// ---------- DOJO SHOP (River City Ransom) ----------
// Buyable MOVES (not stats — style-not-power keeps stats out of the shop). New combat options, permanently unlocked.
// FOOD pickups heal more than standard health packs — eat between beatdowns.
const DOJO_MOVES = [
  { id: 'd_spin', name: 'SPINNING BACKFIST', input: '← + SPC', cost: 500, energy: 20, desc: '360° spin strike. Clears space around you.' },
  { id: 'd_tackle', name: 'SHOULDER TACKLE', input: '→ + SPC', cost: 750, energy: 25, desc: 'Dash tackle with big knockback.' },
  { id: 'd_upper', name: 'RISING UPPERCUT', input: '↓ + SPC', cost: 1000, energy: 25, desc: 'Rising launcher uppercut. Juggle starter.' },
];
function dojoUnlocked(id) {
  save.dojoMoves = save.dojoMoves || [];
  return save.dojoMoves.includes(id);
}
function doDojoMove(id) {
  const mv = DOJO_MOVES.find(m => m.id === id);
  if (!mv || !dojoUnlocked(id)) return false;
  if (player.energy < mv.energy || player.busy > 0) return false;
  player.energy -= mv.energy; player.busy = 0.6;
  unlockAudio(); T.taps++; hint(false);
  const dir = player.face || 1;
  if (id === 'd_spin') {
    playAnim(player, 'Melee_Unarmed_Attack_Punch_B', { ts: 1.8, fade: 0.05 });
    sfx('whoosh', 0.8, false, 0.7);
    setTimeout(() => {
      if (state !== 'fight' || missionOver || ended) return;
      for (const e of enemies.slice()) {
        if (e.hp > 0 && Math.abs(e.px - player.px) < 2.6 && Math.abs(e.pz - player.pz) < 1.8)
          landHit(e, Math.round(28 * player.dmgMult), mv.name, 0.08, 0.5, false, false);
      }
      damageDestructibles(2.6); sparkFX(player.px, 1.2, player.pz, 0xffe14d, 16);
    }, 180);
  } else if (id === 'd_tackle') {
    playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.6, fade: 0.05 });
    player.dodgeDX = dir * 14; player.dodgeT = 0.3;
    sfx('whoosh', 0.8, false, 0.9);
    setTimeout(() => {
      if (state !== 'fight' || missionOver || ended) return;
      for (const e of enemies.slice()) {
        if (e.hp > 0 && Math.abs(e.px - player.px) < 2.2 && Math.abs(e.pz - player.pz) < 1.4) {
          landHit(e, Math.round(32 * player.dmgMult), mv.name, 0.09, 0.6, false, false);
          e.px = clamp(e.px + dir * 2.5, 0.5, 1e6); syncPos(e);
        }
      }
      damageDestructibles(2.2);
    }, 150);
  } else if (id === 'd_upper') {
    playAnim(player, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.7, fade: 0.05 });
    sfx('whoosh', 0.8, false, 1.1);
    setTimeout(() => {
      if (state !== 'fight' || missionOver || ended) return;
      const t = nearestEnemy(2.0);
      if (t && !t.boss) landHit(t, Math.round(26 * player.dmgMult), mv.name, 0.09, 0.5, true, false);
      else if (t) landHit(t, Math.round(26 * player.dmgMult), mv.name, 0.09, 0.5, false, false);
      sparkFX(player.px + dir, 1.4, player.pz, 0x7af0ff, 12);
    }, 160);
  }
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)));
  popText(mv.name + '!', 'spc', sp.x, sp.y);
  T.dojomove = (T.dojomove || 0) + 1; ev('dojomove', { id }); setHud();
  return true;
}
function renderDojo(into) {
  into.appendChild(el('div', 'storeTitle', '🥋 DOJO — BUY MOVES'));
  save.dojoMoves = save.dojoMoves || [];
  for (const m of DOJO_MOVES) {
    const owned = save.dojoMoves.includes(m.id);
    const c = el('div', 'storeCard panel9');
    c.appendChild(el('div', 'sn', (owned ? '✅ ' : '') + m.name));
    c.appendChild(el('div', 'st', m.input + ' · ' + m.energy + ' energy'));
    c.appendChild(el('div', 'st', m.desc));
    if (!owned) {
      const b = el('button', 'buyBtn', 'BUY $' + m.cost);
      b.onclick = (e) => {
        e.stopPropagation();
        if ((save.cash || 0) < m.cost) { sfx('uiclick', 0.5, false, 0.6); popText('NOT ENOUGH CASH', 'bad', innerWidth / 2, innerHeight * 0.4); return; }
        save.cash -= m.cost; save.dojoMoves.push(m.id); writeSave();
        sfx('bell', 1, false, 1.2); banner(m.name + ' LEARNED!', 'spc');
        renderDojo(into); setHud(); ev('dojobuy', { id: m.id });
      };
      c.appendChild(b);
    }
    into.appendChild(c);
  }
}

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
// ---------- modular cosmetic parts (owner 2026-10-07): infinite character + customization ----------
// LEGO color-blocked aesthetic: colors stay locked to character identity AND body area.
// Parts are Three.js primitive builds parented to NAMED BONES (PART_HEADS pattern),
// so they follow animation. STYLE-NOT-POWER (inviolable): cosmetics never touch stats.
const PART_SLOTS = ['head', 'torso', 'arms', 'legs', 'boots', 'shoulders', 'back', 'accessory'];
const PART_ZONES = ['skin', 'primary', 'secondary', 'accent', 'metal'];
const ZONE_DEFAULTS = { skin: 0xd9a066, primary: 0x2e7dd1, secondary: 0xd1403c, accent: 0xffd166, metal: 0x9aa4b2 };
// per-fighter LOCKED palettes: colors stick to identity + body area, never randomized
const FIGHTER_PALETTES = {
  kidblue: { skin: 0xd9a066, primary: 0x2e7dd1, secondary: 0xd1403c, accent: 0xffd166, metal: 0x9aa4b2 },
  ghost:   { skin: 0xe8c39a, primary: 0x2b2b38, secondary: 0x4dff88, accent: 0x7af0ff, metal: 0x8a8f98 },
  brick:   { skin: 0xc98a5a, primary: 0xff8c42, secondary: 0x5a3a22, accent: 0xffd166, metal: 0x7a7f88 },
  kingpin: { skin: 0xb07a4a, primary: 0xffb03d, secondary: 0x2b1a3a, accent: 0xf0f0ff, metal: 0xc9a227 },
  sledge:  { skin: 0xd9a066, primary: 0xb3541e, secondary: 0x2e2e2e, accent: 0xffd166, metal: 0x6a7078 },
  viper:   { skin: 0xe8c39a, primary: 0x39d353, secondary: 0x1a2e1a, accent: 0xd8ff4d, metal: 0x9aa4b2 },
  dust:    { skin: 0xc9a06a, primary: 0xb8b0a0, secondary: 0x6a625a, accent: 0xd8b56b, metal: 0x8a8f96 },
  jack:    { skin: 0xd9a066, primary: 0xe07b1f, secondary: 0x2e1a0e, accent: 0xffd166, metal: 0x7a7f88 },
};
// locked street palettes for procedurally scouted fighters (seeded pick — never free-random)
const SCOUT_PALETTES = [
  { skin: 0xd9a066, primary: 0x8a2a3a, secondary: 0x2b2b38, accent: 0xffd166, metal: 0x7a7f88 },
  { skin: 0xb07a4a, primary: 0x1a5a8a, secondary: 0xd1403c, accent: 0x4fd1ff, metal: 0x9aa4b2 },
  { skin: 0xe8c39a, primary: 0x2e6b3a, secondary: 0x1a2e1a, accent: 0xd8ff4d, metal: 0x6a7078 },
  { skin: 0xc98a5a, primary: 0x5a3a8a, secondary: 0x2b1a3a, accent: 0xff4fd8, metal: 0x8a8f98 },
  { skin: 0xd9a066, primary: 0xb3541e, secondary: 0x3a2a1a, accent: 0xff8c42, metal: 0x7a7f88 },
  { skin: 0xa06a3a, primary: 0x2b2b38, secondary: 0x5a5a6a, accent: 0x9a4dff, metal: 0xc9c9d9 },
  { skin: 0xe8c39a, primary: 0x8a1a2a, secondary: 0x2b2b38, accent: 0xf0f0ff, metal: 0x9aa4b2 },
  { skin: 0xc98a5a, primary: 0x1a6a5a, secondary: 0x0e2e2a, accent: 0x2affd5, metal: 0x6a7078 },
  { skin: 0xd9a066, primary: 0x6a6a2e, secondary: 0x2e2e1a, accent: 0xd8b56b, metal: 0x8a8f96 },
  { skin: 0xb07a4a, primary: 0x3a3a3a, secondary: 0x8a8a8a, accent: 0xffd166, metal: 0xc9c9d9 },
  { skin: 0xe8c39a, primary: 0x0e4a8a, secondary: 0x4fd1ff, accent: 0xf0f0ff, metal: 0x7a7f88 },
  { skin: 0xa06a3a, primary: 0x7a2e0e, secondary: 0xd1403c, accent: 0xffb03d, metal: 0x6a7078 },
];
function zoneMat(zones, zone) {
  return new THREE.MeshStandardMaterial({ color: zones[zone], roughness: zone === 'metal' ? 0.32 : 0.65, metalness: zone === 'metal' ? 0.8 : 0.08 });
}
function pmesh(geo, mat, x, y, z, rx, ry, rz, sx, sy, sz) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
  if (sx || sy || sz) m.scale.set(sx || 1, sy || 1, sz || 1);
  m.castShadow = true; return m;
}
// Each part: id, name, slot, bones (named bones, parented like PART_HEADS), off, build(g, M).
const PART_DEFS = [
  // ---- head ----
  { id: 'headband', name: 'Headband', slot: 'head', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.145, 0.032, 10, 24), M.accent, 0, 0.04, 0, Math.PI / 2)); } },
  { id: 'beanie', name: 'Beanie', slot: 'head', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.145, 0.158, 0.12, 14), M.primary, 0, 0.12, 0)); g.add(pmesh(new THREE.SphereGeometry(0.06, 10, 8), M.accent, 0, 0.2, 0)); } },
  { id: 'visor', name: 'Street Visor', slot: 'head', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.26, 0.06, 0.14), M.secondary, 0, 0.07, 0.1)); g.add(pmesh(new THREE.BoxGeometry(0.28, 0.025, 0.16), M.secondary, 0, 0.045, 0.2)); } },
  { id: 'goggles', name: 'Goggles', slot: 'head', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), M.metal, -0.075, 0.03, 0.11, Math.PI / 2)); g.add(pmesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), M.metal, 0.075, 0.03, 0.11, Math.PI / 2)); g.add(pmesh(new THREE.TorusGeometry(0.14, 0.015, 8, 20), M.accent, 0, 0.03, 0, Math.PI / 2)); } },
  { id: 'topknot', name: 'Topknot', slot: 'head', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 10), M.secondary, 0, 0.18, 0)); } },
  { id: 'headphones', name: 'Headphones', slot: 'head', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.16, 0.03, 8, 20, Math.PI), M.primary, 0, 0.02, 0)); g.add(pmesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), M.accent, -0.16, 0, 0, 0, 0, Math.PI / 2)); g.add(pmesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), M.accent, 0.16, 0, 0, 0, 0, Math.PI / 2)); } },
  // ---- torso: Street Fighter clothing + Gundam armor ----
  { id: 'givest', name: 'Gi Vest', slot: 'torso', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.5, 0.5, 0.34), M.primary, 0, -0.05, 0)); g.add(pmesh(new THREE.BoxGeometry(0.44, 0.08, 0.3), M.accent, 0, -0.3, 0)); } },
  { id: 'jacket', name: 'Street Jacket', slot: 'torso', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.52, 0.55, 0.36), M.secondary, 0, -0.02, 0)); g.add(pmesh(new THREE.BoxGeometry(0.04, 0.5, 0.02), M.accent, 0, -0.02, 0.19)); } },
  { id: 'chestplate', name: 'Gundam Chestplate', slot: 'torso', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.46, 0.4, 0.1), M.metal, 0, -0.02, 0.16)); g.add(pmesh(new THREE.BoxGeometry(0.3, 0.06, 0.12), M.accent, 0, -0.14, 0.16)); } },
  { id: 'straps', name: 'Harness Straps', slot: 'torso', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.1, 0.55, 0.36), M.accent, -0.14, -0.02, 0)); g.add(pmesh(new THREE.BoxGeometry(0.1, 0.55, 0.36), M.accent, 0.14, -0.02, 0)); g.add(pmesh(new THREE.BoxGeometry(0.44, 0.1, 0.36), M.accent, 0, -0.25, 0)); } },
  { id: 'chestchains', name: 'Chest Chains', slot: 'torso', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.5, 0.03, 0.02), M.metal, 0, -0.05, 0.18, 0, 0, 0.6)); g.add(pmesh(new THREE.BoxGeometry(0.5, 0.03, 0.02), M.metal, 0, -0.05, 0.18, 0, 0, -0.6)); } },
  // ---- arms ----
  { id: 'bracer', name: 'Bracers', slot: 'arms', bones: ['lowerarml', 'lowerarmr'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.085, 0.095, 0.2, 10), M.secondary, 0, -0.02, 0)); } },
  { id: 'elbowpad', name: 'Elbow Pads', slot: 'arms', bones: ['lowerarml', 'lowerarmr'], build(g, M) { g.add(pmesh(new THREE.SphereGeometry(0.1, 10, 8), M.primary, 0, 0.1, -0.02, 0, 0, 0, 1, 0.8, 1)); } },
  { id: 'gauntlet', name: 'Gauntlet', slot: 'arms', bones: ['lowerarml', 'lowerarmr'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.17, 0.2, 0.17), M.metal, 0, -0.06, 0)); } },
  { id: 'handtape', name: 'Hand Tape', slot: 'arms', bones: ['handl', 'handr'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 10), M.accent, 0, -0.04, 0)); } },
  // ---- legs ----
  { id: 'kneepad', name: 'Knee Pads', slot: 'legs', bones: ['lowerlegl', 'lowerlegr'], build(g, M) { g.add(pmesh(new THREE.SphereGeometry(0.105, 10, 8), M.primary, 0, 0.16, 0.03, 0, 0, 0, 1, 0.85, 0.7)); } },
  { id: 'thighstrap', name: 'Thigh Straps', slot: 'legs', bones: ['upperlegl', 'upperlegr'], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.115, 0.028, 8, 18), M.accent, 0, -0.1, 0, Math.PI / 2)); } },
  { id: 'shinguard', name: 'Shin Guards', slot: 'legs', bones: ['lowerlegl', 'lowerlegr'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.09, 0.1, 0.24, 10), M.metal, 0, -0.05, 0)); } },
  { id: 'cargopad', name: 'Cargo Plates', slot: 'legs', bones: ['upperlegl', 'upperlegr'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.2, 0.24, 0.06), M.secondary, 0, -0.08, 0.12)); } },
  // ---- boots ----
  { id: 'toecap', name: 'Toe Caps', slot: 'boots', bones: ['footl', 'footr'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.17, 0.09, 0.12), M.metal, 0, -0.02, 0.1)); } },
  { id: 'thicksole', name: 'Thick Soles', slot: 'boots', bones: ['footl', 'footr'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.18, 0.06, 0.26), M.secondary, 0, -0.09, 0.03)); } },
  { id: 'hightop', name: 'High Tops', slot: 'boots', bones: ['footl', 'footr'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.095, 0.105, 0.16, 10), M.primary, 0, 0.06, -0.02)); } },
  { id: 'anklestrap', name: 'Ankle Straps', slot: 'boots', bones: ['footl', 'footr'], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16), M.accent, 0, 0.05, 0, Math.PI / 2)); } },
  // ---- shoulders: Gundam armor + vehicle parts ----
  { id: 'pauldron', name: 'Pauldrons', slot: 'shoulders', bones: ['upperarml', 'upperarmr'], off: [0, 0.14, 0], build(g, M) { g.add(pmesh(new THREE.SphereGeometry(0.14, 12, 10), M.primary, 0, 0, 0, 0, 0, 0, 1.1, 0.75, 1.1)); } },
  { id: 'spikepad', name: 'Spike Pads', slot: 'shoulders', bones: ['upperarml', 'upperarmr'], off: [0, 0.14, 0], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.2, 0.06, 0.2), M.secondary, 0, -0.02, 0)); g.add(pmesh(new THREE.ConeGeometry(0.06, 0.14, 10), M.metal, 0, 0.08, 0)); } },
  { id: 'shoulderfin', name: 'Gundam Fins', slot: 'shoulders', bones: ['upperarml', 'upperarmr'], off: [0, 0.14, 0], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.03, 0.22, 0.12), M.accent, 0, 0.08, -0.04)); } },
  { id: 'tirepad', name: 'Tire Pads', slot: 'shoulders', bones: ['upperarml', 'upperarmr'], off: [0, 0.14, 0], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.11, 0.045, 10, 20), M.secondary, 0, 0, 0, Math.PI / 2)); } },
  // ---- back: vehicle-inspired mechanical ----
  { id: 'cape', name: 'Cape', slot: 'back', bones: ['chest'], off: [0, 0, -0.24], build(g, M) { const m = pmesh(new THREE.PlaneGeometry(0.55, 0.75), M.primary, 0, -0.55, -0.02, 0.12); m.material = m.material.clone(); m.material.side = THREE.DoubleSide; g.add(m); } },
  { id: 'jetpack', name: 'Jetpack', slot: 'back', bones: ['chest'], off: [0, 0, -0.24], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.42, 0.5, 0.2), M.metal, 0, -0.1, 0)); g.add(pmesh(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 10), M.secondary, -0.12, -0.42, 0)); g.add(pmesh(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 10), M.secondary, 0.12, -0.42, 0)); g.add(pmesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), M.accent, -0.12, -0.52, 0)); g.add(pmesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), M.accent, 0.12, -0.52, 0)); } },
  { id: 'exhaustpipes', name: 'Exhaust Pipes', slot: 'back', bones: ['chest'], off: [0, 0, -0.26], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 10), M.metal, -0.14, -0.05, 0, 0.3)); g.add(pmesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 10), M.metal, 0.14, -0.05, 0, 0.3)); } },
  { id: 'cratepack', name: 'Supply Crate', slot: 'back', bones: ['chest'], off: [0, 0, -0.28], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.4, 0.34, 0.24), M.secondary, 0, -0.15, 0)); g.add(pmesh(new THREE.BoxGeometry(0.42, 0.05, 0.26), M.accent, 0, 0.04, 0)); } },
  // ---- accessory ----
  { id: 'neckchain', name: 'Neck Chain', slot: 'accessory', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.16, 0.022, 8, 22), M.metal, 0, -0.3, 0.12, 1.2)); } },
  { id: 'medal', name: 'Street Medal', slot: 'accessory', bones: ['chest'], build(g, M) { g.add(pmesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), M.secondary, 0, -0.26, 0.17)); g.add(pmesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), M.accent, 0, -0.36, 0.17, Math.PI / 2)); } },
  { id: 'shackle', name: 'Shackle', slot: 'accessory', bones: ['wristr'], build(g, M) { g.add(pmesh(new THREE.TorusGeometry(0.08, 0.025, 8, 18), M.metal, 0, 0, 0)); } },
  { id: 'cornermic', name: 'Corner Mic', slot: 'accessory', bones: ['head'], build(g, M) { g.add(pmesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), M.metal, 0.12, -0.04, 0.06, 0.4, 0, 0.5)); g.add(pmesh(new THREE.SphereGeometry(0.025, 8, 6), M.accent, 0.155, -0.1, 0.1)); } },
];
// swatch set for the customize color pickers (LEGO-blocked hues + metal tones)
const ZONE_SWATCHES = [0xd1403c, 0xff5a5a, 0xff8c42, 0xffb03d, 0xffd166, 0xd8b56b, 0x4fd1ff, 0x2e7dd1, 0x39d353, 0x4dff88, 0x9a4dff, 0xff4fd8, 0x8a7f6a, 0x9aa4b2, 0x6a7078, 0x2b2b38, 0xf0f0ff, 0x0f0f14, 0xd9a066, 0xe8c39a];
function fighterLoadout(fid) {
  const lo = (save.loadouts && save.loadouts[fid]) || {};
  return { parts: lo.parts || {}, zones: lo.zones || {} };
}
function fighterZones(fid) {
  const lo = fighterLoadout(fid);
  const s = (save.scoutRoster || []).find((x) => x.id === fid);
  const base = s ? s.zones : (FIGHTER_PALETTES[fid] || ZONE_DEFAULTS);
  const z = {};
  for (const zn of PART_ZONES) z[zn] = (lo.zones[zn] != null) ? lo.zones[zn] : (base[zn] != null ? base[zn] : ZONE_DEFAULTS[zn]);
  return z;
}
function bodyTint(fid) {
  const lo = fighterLoadout(fid);
  if (lo.zones.skin != null) return lo.zones.skin;
  return skinTint(fid);
}
function attachPart(f, pid, M) {
  const p = PART_DEFS.find((x) => x.id === pid); if (!p) return;
  for (const bn of p.bones) {
    const bone = f.root.getObjectByName(bn); if (!bone) continue;
    const g = new THREE.Group(); g.name = 'cpart_' + pid;
    if (p.off) g.position.set(p.off[0], p.off[1], p.off[2]);
    p.build(g, M);
    bone.add(g);
  }
}
// Apply saved/customized cosmetics to a fighter instance (player or showcase).
// Scout fighters use their seeded generated parts unless the player customized them.
function applyFighterCosmetics(f, fid) {
  if (!f || !f.root) return;
  const lo = fighterLoadout(fid);
  const zones = fighterZones(fid);
  const M = {}; for (const zn of PART_ZONES) M[zn] = zoneMat(zones, zn);
  const s = (save.scoutRoster || []).find((x) => x.id === fid);
  const ids = [];
  for (const slot of PART_SLOTS) {
    let pid = lo.parts[slot];
    if (!pid || pid === 'none') pid = (s && s.parts) ? s.parts[slot] : null;
    if (!pid || pid === 'none') continue;
    attachPart(f, pid, M); ids.push(pid);
  }
  f.partIds = ids;
}

// ---------- SCOUT system (owner 2026-10-07): infinite procedurally generated fighters ----------
// Seeded (mulberry32) generation: parts from the catalog + a LOCKED palette + body scale.
// STYLE-NOT-POWER: stats come from the family archetype only — never from parts/colors.
// No canon/lore is invented: these are street-crew names in the game's existing style.
const SCOUT_ARCHES = ['kidblue', 'ghost', 'brick', 'kingpin', 'sledge', 'viper', 'dust', 'jack'];
const SCOUT_ADJ = ['IRON', 'STEEL', 'CONCRETE', 'BLOCK', 'PIER', 'ALLEY', 'ROOF', 'SEWER', 'YARD', 'DOCK', 'SUBWAY', 'RIVER', 'CROSS', 'MAIN', 'NEON', 'RUST', 'ASH', 'SMOKE', 'DIESEL', 'TURBO', 'GRIT', 'VOLT', 'BLAZE', 'EMBER', 'FROST', 'STORM', 'COBRA', 'WOLF', 'BULL', 'RAVEN', 'TIGER', 'SHARK', 'RAT', 'MULE', 'OX', 'RAM', 'BOAR', 'FALCON', 'HOUND', 'JACKAL', 'RED', 'BLACK', 'GREY', 'OLD', 'BIG', 'LITTLE', 'FAST', 'HEAVY', 'QUIET', 'LOUD', 'WILD', 'COLD', 'DARK'];
const SCOUT_NOUN = ['KNUCKLE', 'FIST', 'ELBOW', 'JAW', 'TOOTH', 'HAMMER', 'WRENCH', 'CROWBAR', 'ANVIL', 'NAIL', 'SPIKE', 'CHAIN', 'BOLT', 'GEAR', 'PISTON', 'AXLE', 'REBAR', 'CRANE', 'FORKLIFT', 'MUFFLER', 'BUMPER', 'FENDER', 'GRILLE', 'EXHAUST', 'RIVET', 'TAR', 'GRAVEL', 'PAVEMENT', 'CURB', 'HYDRANT', 'DUMPSTER', 'PALLET', 'CRATE', 'BARREL', 'CONE', 'LADDER', 'SCAFFOLD', 'SLAB', 'STONE', 'CORNER', 'AVENUE', 'LANE', 'ROW', 'LOT', 'BASEMENT', 'TUNNEL', 'OVERPASS', 'BILLBOARD', 'MARQUEE', 'FARE', 'TOKEN', 'METER', 'BOUNCER', 'COOK', 'JANITOR', 'PORTER', 'DRIVER', 'MOVER', 'ROOFER', 'WELDER', 'PLUMBER', 'PAINTER', 'CARPENTER', 'MASON', 'FANG', 'CLAW', 'HORN', 'SLAM', 'CRASH', 'BASH', 'THUMP', 'JOLT', 'SURGE', 'REBEL', 'OUTLAW', 'DRIFTER', 'HUSTLER', 'BRAWLER', 'SLUGGER', 'SCRAPPER', 'FIXER', 'RUNNER', 'DIVER'];
function scoutGenName(R) {
  const r = R();
  if (r < 0.45) return SCOUT_ADJ[Math.floor(R() * SCOUT_ADJ.length)] + ' ' + SCOUT_NOUN[Math.floor(R() * SCOUT_NOUN.length)];
  if (r < 0.65) return 'CONCRETE ' + SCOUT_NOUN[Math.floor(R() * SCOUT_NOUN.length)];
  if (r < 0.8) return SCOUT_NOUN[Math.floor(R() * SCOUT_NOUN.length)];
  return ['BIG', 'LITTLE', 'OLD', 'YOUNG', 'FAST'][Math.floor(R() * 5)] + ' ' + SCOUT_NOUN[Math.floor(R() * SCOUT_NOUN.length)];
}
function scoutNameUnique(name) {
  const taken = new Set(FIGHTERS.map((f) => f.name));
  for (const s of save.scoutRoster || []) taken.add(s.name);
  if (!taken.has(name)) return name;
  for (const suf of [' II', ' III', ' IV', ' V', ' X']) if (!taken.has(name + suf)) return name + suf;
  return name + ' ' + ((Math.random() * 900 + 100) | 0);
}
function genScout(seed) {
  const R = seedPRNG(seed);
  const arch = SCOUT_ARCHES[Math.floor(R() * SCOUT_ARCHES.length)];
  const parts = {};
  for (const slot of PART_SLOTS) {
    const pool = PART_DEFS.filter((p) => p.slot === slot);
    parts[slot] = (R() < 0.8 && pool.length) ? pool[Math.floor(R() * pool.length)].id : 'none';
  }
  // guarantee at least two visible parts so every scout reads as customized
  const vis = PART_SLOTS.filter((s) => parts[s] !== 'none');
  if (vis.length < 2) {
    for (const slot of PART_SLOTS) {
      if (parts[slot] !== 'none') continue;
      const pool = PART_DEFS.filter((p) => p.slot === slot);
      parts[slot] = pool[Math.floor(R() * pool.length)].id;
      if (PART_SLOTS.filter((s) => parts[s] !== 'none').length >= 2) break;
    }
  }
  const zones = Object.assign({}, SCOUT_PALETTES[Math.floor(R() * SCOUT_PALETTES.length)]);
  return { arch, parts, zones, scale: +(0.92 + R() * 0.22).toFixed(2), name: scoutNameUnique(scoutGenName(R)) };
}
function scoutFighter(id) {
  if (!id || !id.startsWith('scout_')) return null;
  const s = (save.scoutRoster || []).find((x) => x.id === id);
  if (!s) return null;
  const arch = FIGHTERS.find((f) => f.id === s.arch) || FIGHTERS[0];
  // stats copied from the family archetype only — style-not-power
  return Object.assign({}, arch, {
    id: s.id, name: s.name,
    tag: 'Scouted crew. Fights ' + arch.name + '-style. (style only — no power)',
    unlock: { type: 'scout' }, scout: true, scoutScale: s.scale, archId: arch.id,
  });
}
function scoutTotalRecruits() { let n = 0; for (const k of Object.keys(save.scouts || {})) n += save.scouts[k] || 0; return n; }
function scoutCost() {
  const n = (save.scoutRoster || []).length;
  let c = 400 + 250 * n;
  if (scoutTotalRecruits() >= 10) c = Math.round(c / 2); // crew milestone: half price
  return Math.round(c / 10) * 10;
}
function scoutNew() {
  const seed = (Math.random() * 0xffffffff) >>> 0;
  const g = genScout(seed);
  const id = 'scout_' + seed.toString(16).padStart(8, '0');
  const s = { id, seed, name: g.name, arch: g.arch, parts: g.parts, zones: g.zones, scale: g.scale };
  save.scoutRoster.push(s);
  if (!save.unlocked.includes(id)) save.unlocked.push(id);
  save.scouts = save.scouts || {}; save.scouts['__crew'] = (save.scouts['__crew'] || 0) + 1; // wire into existing save.scouts
  writeSave();
  return s;
}
function doScout() {
  const cost = scoutCost();
  if (save.cash < cost) { banner('NOT ENOUGH CASH', 'gold'); sfx('deny', 0.8); return; }
  save.cash -= cost;
  const s = scoutNew();
  save.selected = s.id; writeSave();
  sfx('bell', 0.9); banner('SCOUTED: ' + s.name, 'spc');
  ev('scout', { name: s.name, arch: s.arch });
  refreshShowcase(); showSelectCards(); renderScoutRow(); renderMeta();
}
function renderScoutRow() {
  const sr = $('scoutRow'); if (!sr) return; sr.innerHTML = '';
  sr.appendChild(el('div', 'cap', 'Scouted crew — infinite (style only — no power)'));
  for (const s of save.scoutRoster) {
    const arch = FIGHTERS.find((f) => f.id === s.arch);
    const c = el('div', 'card ' + (s.id === save.selected ? 'panel9g' : 'panel9'));
    c.appendChild(el('div', 'nm', s.name));
    c.appendChild(el('div', 'lk', 'Scouted — fights ' + (arch ? arch.name : '?') + '-style'));
    c.onclick = () => { save.selected = s.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelectCards(); renderScoutRow(); };
    sr.appendChild(c);
  }
  const cost = scoutCost();
  const b = el('button', 'scoutBtn', '🔍 SCOUT CREW — $' + cost);
  b.title = 'Spend cash to scout a new procedurally generated fighter. Stats come from the crew archetype only — cosmetics never affect power.' + (scoutTotalRecruits() >= 10 ? ' Crew milestone reached: half price!' : '');
  b.disabled = save.cash < cost;
  b.onclick = () => doScout();
  sr.appendChild(b);
  sr.appendChild(el('div', 'scoutMeta', 'Recruited crew: ' + scoutTotalRecruits() + ' / 10 for half-price scouts'));
}
// ---------- CUSTOMIZE UI (owner 2026-10-07): part + color pickers on the live 3D turntable ----------
let customizing = false;
function openCustomize() { customizing = true; renderCustomize(); $('customOv').classList.remove('hidden'); }
function closeCustomize() { customizing = false; $('customOv').classList.add('hidden'); }
function setPart(fid, slot, pid) {
  const lo = (save.loadouts[fid] = save.loadouts[fid] || {}); lo.parts = lo.parts || {};
  lo.parts[slot] = pid; writeSave(); sfx('click', 0.7);
  refreshShowcase(); renderCustomize();
}
function setZone(fid, zone, c) {
  const lo = (save.loadouts[fid] = save.loadouts[fid] || {}); lo.zones = lo.zones || {};
  lo.zones[zone] = c; writeSave(); sfx('click', 0.7);
  refreshShowcase(); renderCustomize();
}
function renderCustomize() {
  const fid = save.selected; const fd = fighterDef(fid);
  const lo = fighterLoadout(fid); const zones = fighterZones(fid);
  const b = $('customBody'); b.innerHTML = '';
  b.appendChild(el('div', 'czTitle', 'CUSTOMIZE — ' + fd.name));
  b.appendChild(el('div', 'czSub', 'Parts + colors on the live model. Style only — never power.'));
  for (const slot of PART_SLOTS) {
    const row = el('div', 'czRow');
    row.appendChild(el('div', 'czLab', slot.toUpperCase()));
    const cur = lo.parts[slot] || 'none';
    const scoutD = (save.scoutRoster || []).find((x) => x.id === fid);
    const genPid = scoutD && scoutD.parts ? scoutD.parts[slot] : null;
    const mk = (pid, name, gen) => {
      const btn = el('button', 'partBtn' + (cur === pid ? ' sel' : ''), (gen ? '★ ' : '') + name);
      if (gen) btn.title = 'Seeded generated part';
      btn.onclick = () => setPart(fid, slot, pid);
      return btn;
    };
    row.appendChild(mk('none', 'NONE'));
    for (const p of PART_DEFS.filter((x) => x.slot === slot)) row.appendChild(mk(p.id, p.name, genPid === p.id && cur === 'none'));
    b.appendChild(row);
  }
  for (const zn of PART_ZONES) {
    const row = el('div', 'czRow');
    row.appendChild(el('div', 'czLab', zn.toUpperCase()));
    for (const sw of ZONE_SWATCHES) {
      const d = el('div', 'zoneSw' + (zones[zn] === sw ? ' sel' : ''));
      d.style.background = hex(sw); d.title = zn + ' ' + hex(sw);
      d.onclick = () => setZone(fid, zn, sw);
      row.appendChild(d);
    }
    b.appendChild(row);
  }
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
  witch: { file: 'parts/witch.glb', height: 1.7,
    clips: { idle: 'CharacterArmature|Idle', walk: 'CharacterArmature|Run', attack: 'CharacterArmature|Punch_Left', hit: 'CharacterArmature|HitRecieve', dead: 'CharacterArmature|Death' } },
  vampirebat: { file: 'parts/vampire-bat.glb', height: 0.6,
    clips: { idle: 'Bat_Flying', walk: 'Bat_Flying', attack: 'Bat_Attack', hit: 'Bat_Flying', dead: 'Bat_Die' } },
  carmilla: { file: 'parts/carmilla.glb', height: 1.7, clips: {} }, // static posed model (JellyLion, CC-BY)
  ghosthappy: { file: 'parts/ghost-happy.glb', height: 0.9, clips: {} }, // static floaters (JellyLion, CC-BY)
  ghostsad: { file: 'parts/ghost-sad.glb', height: 0.9, clips: {} },
  skull: { file: 'parts/skull.glb', height: 0.5, clips: {} },
  bball1: { file: 'parts/basketball-tulio.glb', height: 1.9, clips: {} }, // static (Tulio Portela, CC-BY)
  bball2: { file: 'parts/basketball-rj.glb', height: 1.9, clips: {} }, // static (Raj_Kumar_Jadhav, CC-BY)
  bbones: { file: 'parts/baseball-skeleton.glb', height: 1.8, clips: {} }, // static (VanHyfte_Clement, CC-BY)
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
  updateVfx(dt); // wave-17 pooled Kenney sprite bursts
}
let shake = 0, hitstop = 0, slowmo = 1, slowmoT = 0;
const lerp = (a, b, t) => a + (b - a) * t;
function sparkFX(x, y, z, color, n) { burst(new THREE.Vector3(x, y, z), n || 10, color); }

// ---------- WAVE 17 VFX (TIER 6 item 25, owner 2026-10-06): Kenney Particle Pack (CC0)
// Billboarded sprite bursts for KO bursts, hit-impact pops, special-move VFX, edge-bounce
// dust. Pooled sprites (zero per-frame allocation), burst counts capped on lowFx.
// Textures decode from build/assets/vfx/*.png (manifest-embedded, like tex-patchwork.png).
const VFXTEX = ['circle', 'dirt', 'fire', 'flame', 'flare', 'light', 'magic', 'muzzle', 'smoke', 'spark', 'star', 'twirl'];
const vfxTex = {}; // name -> THREE.Texture (decoded PNG)
function loadVfxTex() {
  return Promise.all(VFXTEX.map((n) => new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      vfxTex[n] = t; res();
    };
    img.onerror = () => res(); // sprite family unavailable: recipes skip it gracefully
    img.src = 'data:image/png;base64,' + A['vfx/' + n + '.png'];
  })));
}
const VFXMAX = 320; // hard cap on live pooled sprites
const vfxPool = [], vfxLive = [];
function vfxGet() {
  for (let i = vfxPool.length - 1; i >= 0; i--) { const s = vfxPool[i]; vfxPool.splice(i, 1); vfxLive.push(s); return s; }
  if (vfxLive.length >= VFXMAX) { const s = vfxLive.shift(); vfxLive.push(s); return s; } // recycle oldest
  const mk = (additive) => new THREE.SpriteMaterial({ transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const s = new THREE.Sprite(mk(true));
  s.userData.matA = s.material; s.userData.matN = mk(false);
  s.visible = false; scene.add(s); vfxLive.push(s); return s;
}
function vfxKill(s) {
  s.visible = false;
  const i = vfxLive.indexOf(s); if (i >= 0) vfxLive.splice(i, 1);
  vfxPool.push(s);
}
// one pooled billboard sprite. tex: key into VFXTEX. vel/grav/drag/grow/spin in world units.
function vfxOne(tex, pos, { color = 0xffffff, size = 0.4, vel = null, life = 0.5, grav = 0, grow = 0, spin = 0, additive = true, opacity = 1, drag = 0 } = {}) {
  const t = vfxTex[tex]; if (!t) return; // texture not decoded yet: skip, never throw
  const s = vfxGet(), u = s.userData;
  s.material = additive ? u.matA : u.matN;
  const m = s.material;
  m.map = t; m.color.setHex(color); m.opacity = opacity; m.rotation = Math.random() * Math.PI * 2;
  s.position.copy(pos); s.scale.set(size, size, size); s.visible = true;
  u.v = vel ? vel.clone() : new THREE.Vector3();
  u.life = life; u.maxLife = life; u.grav = grav; u.grow = grow; u.spin = spin; u.opacity = opacity; u.drag = drag; u.size = size;
}
function updateVfx(dt) {
  for (let i = vfxLive.length - 1; i >= 0; i--) {
    const s = vfxLive[i], u = s.userData;
    u.life -= dt;
    if (u.life <= 0) { vfxKill(s); continue; }
    u.v.y -= u.grav * dt;
    if (u.drag) u.v.multiplyScalar(Math.max(0, 1 - u.drag * dt));
    s.position.addScaledVector(u.v, dt);
    const k = u.life / u.maxLife;
    s.material.opacity = u.opacity * Math.min(1, k * 2.4);
    const sc = u.size * (1 + u.grow * (1 - k));
    s.scale.set(sc, sc, sc);
    if (u.spin) s.material.rotation += u.spin * dt;
  }
}
const vfxQ = () => (lowFx ? 0.45 : 1); // low-quality mode (U9 / auto-degrade) halves burst counts
// Hit-impact pop: muzzle flash + star/spark flecks, on EVERY landed hit.
function vfxImpact(pos, heavy) {
  const q = vfxQ();
  vfxOne('muzzle', pos, { color: 0xfff2c0, size: heavy ? 1.0 : 0.62, life: 0.16, additive: true, opacity: 0.95 });
  const n = Math.max(1, Math.round((heavy ? 5 : 3) * q));
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 3.5;
    vfxOne(i % 2 ? 'star' : 'spark', pos, {
      color: i % 3 ? 0xffd27a : 0xffffff, size: 0.3 + Math.random() * 0.2,
      vel: new THREE.Vector3(Math.cos(a) * sp, 1 + Math.random() * 3, Math.sin(a) * sp),
      life: 0.3 + Math.random() * 0.2, grav: 12 });
  }
  T.vfxHit = (T.vfxHit || 0) + 1;
}
// KO burst: expanding shockwave ring + flare + smoke + spark shower.
function vfxKO(pos, boss) {
  const q = vfxQ();
  vfxOne('circle', pos, { color: 0xfff6d8, size: 0.5, life: 0.45, grow: 6, additive: true, opacity: 0.9 });
  vfxOne('flare', pos, { color: 0xffffff, size: boss ? 2.2 : 1.4, life: 0.2, additive: true });
  const ns = Math.max(2, Math.round(4 * q));
  for (let i = 0; i < ns; i++)
    vfxOne('smoke', pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.2 + Math.random() * 0.6, (Math.random() - 0.5) * 1.2)), {
      color: 0x9a9aa2, size: 0.7 + Math.random() * 0.6,
      vel: new THREE.Vector3((Math.random() - 0.5) * 2, 1 + Math.random() * 1.5, (Math.random() - 0.5) * 2),
      life: 0.7 + Math.random() * 0.4, grow: 1.6, additive: false, opacity: 0.75 });
  const n = Math.max(4, Math.round((boss ? 26 : 14) * q));
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 5;
    vfxOne(i % 3 ? 'spark' : 'star', pos, {
      color: [0xffd166, 0xffffff, 0xff7a1a][i % 3], size: 0.32 + Math.random() * 0.25,
      vel: new THREE.Vector3(Math.cos(a) * sp, 2 + Math.random() * 4.5, Math.sin(a) * sp),
      life: 0.5 + Math.random() * 0.3, grav: 14 });
  }
  T.vfxKo = (T.vfxKo || 0) + 1;
}
// Special-move VFX: 'flame' for damage specials, 'magic' for BURST-style / tech specials.
function vfxSpecial(pos, kind) {
  const q = vfxQ();
  if (kind === 'flame' || kind === 'both') {
    vfxOne('circle', pos, { color: 0xff6a1a, size: 0.6, life: 0.5, grow: 4.5, additive: true, opacity: 0.85 });
    const n = Math.max(3, Math.round(12 * q));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3;
      vfxOne(i % 2 ? 'flame' : 'fire', pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.2, (Math.random() - 0.5) * 0.8)), {
        color: [0xff7a1a, 0xffc14d, 0xff3d00][i % 3], size: 0.45 + Math.random() * 0.35,
        vel: new THREE.Vector3(Math.cos(a) * sp, 2.5 + Math.random() * 3, Math.sin(a) * sp),
        life: 0.45 + Math.random() * 0.25, grav: -2, additive: true });
    }
  }
  if (kind === 'magic' || kind === 'both') {
    vfxOne('magic', pos, { color: 0x7CFC00, size: 1.2, life: 0.6, grow: 1.8, spin: 2.4, additive: true, opacity: 0.9 });
    vfxOne('twirl', pos, { color: 0xbfff9a, size: 1.6, life: 0.5, grow: 1.2, spin: -3.2, additive: true, opacity: 0.7 });
    const n = Math.max(2, Math.round(8 * q));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 3;
      vfxOne('light', pos, {
        color: 0x9dff57, size: 0.3 + Math.random() * 0.25,
        vel: new THREE.Vector3(Math.cos(a) * sp, 1.5 + Math.random() * 3, Math.sin(a) * sp),
        life: 0.4 + Math.random() * 0.25, grav: -1, additive: true });
    }
  }
  T.vfxSpc = (T.vfxSpc || 0) + 1;
}
// Edge-bounce wall thud (wave 9): smoke + dirt puffs where the enemy hits the wall.
function vfxDust(pos) {
  const q = vfxQ(), n = Math.max(2, Math.round(5 * q));
  for (let i = 0; i < n; i++)
    vfxOne(i % 2 ? 'smoke' : 'dirt', pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.1 + Math.random() * 0.4, (Math.random() - 0.5) * 0.8)), {
      color: i % 2 ? 0x8a8a92 : 0xa0805a, size: 0.5 + Math.random() * 0.4,
      vel: new THREE.Vector3((Math.random() - 0.5) * 3, 1 + Math.random() * 2, (Math.random() - 0.5) * 3),
      life: 0.5 + Math.random() * 0.3, grow: 2.2, drag: 1.5, additive: false, opacity: 0.8 });
  T.vfxDust = (T.vfxDust || 0) + 1;
}
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
// ---------- GEAR / CHARM / CORNER STORE UI ----------
function renderGear() {
  const row = $('gearRow'); if (!row) return;
  row.querySelectorAll('.gearSlot').forEach((d) => d.remove());
  for (const slot of GEAR_SLOTS) {
    const id = (save.gearEq || {})[slot];
    const g = GEAR.find((x) => x.id === id);
    const d = el('div', 'gearSlot' + (g ? ' sel' : ''));
    d.innerHTML = `<div>${slot}</div><div class="gt">${g ? g.name + ' · ' + GEAR_TIERS[gearTier(id)] : '— empty —'}</div>`;
    d.title = g ? g.desc + ' [' + g.tags.join('/') + ']' : 'Equip gear from your inventory';
    d.onclick = () => openGearPanel(slot);
    row.appendChild(d);
  }
}
function openGearPanel(slot) {
  const row = $('gearRow'); if (!row) return;
  row.querySelectorAll('.gearSlot').forEach((d) => d.remove());
  const inv = save.gearInv || {};
  const list = GEAR.filter((g) => g.slot === slot && (inv[g.id] || 0) > 0);
  if (!list.length) {
    const d = el('div', 'gearSlot'); d.textContent = 'No ' + slot + ' gear yet — win missions, check the corner store';
    d.onclick = () => renderGear(); row.appendChild(d); return;
  }
  for (const g of list) {
    const d = el('div', 'gearSlot' + ((save.gearEq || {})[slot] === g.id ? ' sel' : ''));
    d.innerHTML = `<div>${g.name} ×${inv[g.id]}</div><div class="gt">${GEAR_TIERS[gearTier(g.id)]} · ${g.tags.join('/')} · ${g.desc}</div>`;
    d.onclick = () => {
      save.gearEq = save.gearEq || {}; save.gearEq[slot] = g.id; writeSave();
      sfx('uiclick', 0.8); renderGear();
    };
    row.appendChild(d);
    if ((inv[g.id] || 0) >= 2 && gearTier(g.id) < 3) {
      const m = el('div', 'gearSlot'); m.innerHTML = `<div>⚒ MERGE</div><div class="gt">${g.name} → ${GEAR_TIERS[gearTier(g.id) + 1]}</div>`;
      m.onclick = (e) => { e.stopPropagation(); if (tryMergeGear(g.id)) renderGear(); };
      row.appendChild(m);
    }
  }
  const back = el('div', 'gearSlot'); back.textContent = '← back';
  back.onclick = () => renderGear(); row.appendChild(back);
}
function renderCharms() {
  const row = $('charmRow'); if (!row) return;
  row.querySelectorAll('.charmDot').forEach((d) => d.remove());
  const avail = CHARMS.filter((c) => charmUnlocked(c));
  if (!avail.length) {
    const d = el('div', 'charmDot'); d.textContent = 'Beat bosses to earn charms';
    d.style.cursor = 'default'; row.appendChild(d); return;
  }
  for (const c of avail) {
    const d = el('div', 'charmDot' + (save.charm === c.id ? ' sel' : ''));
    d.innerHTML = `<div>${c.name}</div><div class="gt">${c.desc}</div>`;
    d.onclick = () => { save.charm = save.charm === c.id ? null : c.id; writeSave(); sfx('uiclick', 0.8); renderCharms(); };
    row.appendChild(d);
  }
  renderMascots(); // CORNER-CREW MASCOTS: pick your ride-or-die
}
function renderMascots() {
  const row = $('charmRow'); if (!row) return;
  row.querySelectorAll('.mascotDot').forEach((d) => d.remove());
  const avail = MASCOTS.filter((m) => mascotUnlocked(m));
  if (!avail.length) return;
  for (const m of avail) {
    const d = el('div', 'mascotDot charmDot' + (save.mascot === m.id ? ' sel' : ''));
    d.innerHTML = `<div>🐾 ${m.name}</div><div class="gt">${m.desc}</div>`;
    d.onclick = () => { save.mascot = save.mascot === m.id ? null : m.id; writeSave(); sfx('uiclick', 0.8); renderCharms(); };
    row.appendChild(d);
  }
}
// CORNER STORE: between-mission gear shop (Brotato shop loop) — buy, reroll, recycle
let storeStock = [];
function renderStore(into) {
  into.innerHTML = '';
  into.appendChild(el('div', 'storeTitle', '🏪 CORNER STORE — GEAR'));
  if (!storeStock.length) storeStock = gearStock(3);
  for (const g of storeStock) {
    const cost = gearCost(g);
    const c = el('div', 'storeCard panel9');
    c.appendChild(el('div', 'sn', g.name));
    c.appendChild(el('div', 'st', g.slot + ' · ' + GEAR_TIERS[gearTier(g.id)] + ' · ' + g.tags.join('/')));
    c.appendChild(el('div', 'sd', g.desc));
    const b = el('button', '', '$' + cost + (save.cash < cost ? ' 🔒' : ''));
    b.disabled = save.cash < cost;
    b.onclick = (e) => {
      e.stopPropagation(); if (save.cash < cost) return;
      save.cash -= cost; save.gearInv = save.gearInv || {}; save.gearInv[g.id] = (save.gearInv[g.id] || 0) + 1;
      // auto-equip if slot empty
      save.gearEq = save.gearEq || {};
      if (!save.gearEq[g.slot]) save.gearEq[g.slot] = g.id;
      storeStock = storeStock.filter((x) => x.id !== g.id);
      writeSave(); sfx('coin', 0.9); renderStore(into); renderMeta();
    };
    c.appendChild(b); into.appendChild(c);
  }
  const rr = el('button', '', '🎲 REROLL $50');
  rr.disabled = save.cash < 50;
  rr.onclick = (e) => { e.stopPropagation(); if (save.cash < 50) return; save.cash -= 50; storeStock = gearStock(3); writeSave(); sfx('uiclick', 0.8); renderStore(into); renderMeta(); };
  into.appendChild(rr);
  // recycle: sell back owned gear for partial refund
  const inv = save.gearInv || {};
  const owned = GEAR.filter((g) => (inv[g.id] || 0) > 0 && (save.gearEq || {})[g.slot] !== g.id);
  if (owned.length) {
    const rc = el('div', 'storeCard panel9');
    rc.appendChild(el('div', 'sn', '♻ RECYCLE'));
    const sel = el('select', '');
    for (const g of owned) { const o = el('option', '', `${g.name} ×${inv[g.id]} (+$40)`); o.value = g.id; sel.appendChild(o); }
    rc.appendChild(sel);
    const rb = el('button', '', 'SELL $40');
    rb.onclick = (e) => { e.stopPropagation(); const id = sel.value; if ((save.gearInv[id] || 0) > 0) { save.gearInv[id]--; save.cash += 40; writeSave(); sfx('coin', 0.8); renderStore(into); renderMeta(); } };
    rc.appendChild(rb); into.appendChild(rc);
  }
  renderDojo(into); // DOJO (River City Ransom): buyable moves live in the corner store too
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
    b.onclick = (e) => { e.stopPropagation(); if (save.cash < cost) return; save.cash -= cost; save[u.key]++; writeSave(); sfx('uiclick', 0.8); renderShop(into); renderMeta(); refreshShowcase(); renderScoutRow(); };
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
  showcase = makeFighterRaw(bodyTint(fd.id), 0, 0, fd.scoutScale || 1, texObj(fd.id));
  applyFighterCosmetics(showcase, fd.id);
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
  $('loginBonus').textContent = '';
  renderPatchNotes();
  // DAILY LOGIN BONUS (soul law: generosity) — free cash, escalating streak
  const today = new Date().toISOString().slice(0, 10);
  if (save.lastLogin !== today) {
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    save.loginStreak = (save.lastLogin === yest) ? (save.loginStreak || 0) + 1 : 1;
    save.lastLogin = today;
    const bonus = 100 + Math.min(500, save.loginStreak * 50);
    save.cash += bonus; writeSave();
    $('loginBonus').textContent = '★ DAY ' + save.loginStreak + ' — WELCOME BACK BONUS $' + bonus + ' ★';
    setTimeout(() => { sfx('coin', 0.8, false, 1.2); }, 600);
    ev('loginbonus', { streak: save.loginStreak, bonus });
  }
}
function showSelect() {
  state = 'select'; clearFighters(); clearCrowd();
  applyDistrict(districtDef('neon'));
  buildStreet('neon', 40, Math.random);
  refreshShowcase();
  const cards = $('cards'); cards.innerHTML = '';
  // INFINITE UNLOCKS: unlocked challenger variants appear after their base fighter
  const allFighters = [...FIGHTERS];
  for (const uid of save.unlocked) { const vf = scoutFighter(uid) || variantFighter(uid); if (vf && !allFighters.find((f) => f.id === uid)) allFighters.push(vf); }
  for (const f of allFighters) {
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
  renderScoutRow(); // SCOUT CREW (owner 2026-10-07): infinite procedural fighters for cash
  renderShop($('shopRow')); renderGear(); renderCharms(); renderMeta();
  showOnly('select');
}
function showSelectCards() { // re-render cards row only (after pick)
  const cards = $('cards'); cards.innerHTML = '';
  const allFighters = [...FIGHTERS];
  for (const uid of save.unlocked) { const vf = scoutFighter(uid) || variantFighter(uid); if (vf && !allFighters.find((f) => f.id === uid)) allFighters.push(vf); }
  for (const f of allFighters) {
    const locked = !isUnlocked(f);
    const c = el('div', 'card ' + (f.id === save.selected && !locked ? 'panel9g' : 'panel9') + (locked ? ' locked' : '') + ((save.goldCards || []).includes(f.id) ? ' goldcard' : ''));
    c.appendChild(el('div', 'nm', locked ? '???' : ((save.goldCards || []).includes(f.id) ? '★ ' : '') + f.name));
    c.appendChild(el('div', 'lk', locked ? unlockText(f) : f.tag));
    if (!locked) c.onclick = () => { save.selected = f.id; writeSave(); sfx('click', 0.7); refreshShowcase(); showSelectCards(); renderScoutRow(); };
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
      const map = el('button', 'go', '🗺 MAP');
      map.style.marginLeft = '6px';
      map.title = 'Branching circuit map — choose your next fight and its reward';
      map.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); renderCircuitMap(list, n); };
      card.appendChild(map);
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
        // INFINITE UNLOCKS: every 5th endless kill unlocks a titled challenger variant as playable
        if (save.pbKills % 5 === 0) {
          const titles = ['nightmare', 'iron', 'blood', 'savage', 'obsidian'];
          const baseIds = ['kingpin', 'sledge', 'viper', 'dust', 'jack'];
          const vid = baseIds[(save.pbKills / 5 - 1) % baseIds.length] + '_' + titles[(save.pbKills / 5 - 1) % titles.length];
          if (!save.unlocked.includes(vid)) {
            save.unlocked.push(vid); writeSave();
            const vf = variantFighter(vid);
            setTimeout(() => { ub.textContent = '★ ' + (vf ? vf.name : vid) + ' UNLOCKED AS PLAYABLE ★'; ub.classList.add('show'); sfx('bell', 0.9, true); }, 2200);
          }
        }
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
  } else {
    // SOUL LAWS (wave 6): COMEBACK CASH — the block takes care of its own.
    // First loss of the day: full run cash refunded. After that: keep 25%.
    const today = todayStr();
    const full = save.comebackDay !== today;
    if (full) save.comebackDay = today; else save.losses++;
    const kept = full ? cashRun : Math.round(cashRun * 0.25);
    if (kept > 0) { save.cash += kept; setTimeout(() => popText((full ? 'BLOCK COVERS YOU +$' : 'COMEBACK CASH +$') + kept, 'gold', innerWidth/2, innerHeight*0.35), 900); ev('comeback', { full, kept }); }
  }
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
  // CORNER STORE + GEAR DROP + MISSION GRADE (roguelite run loop)
  const sr = $('storeRow'); sr.innerHTML = '';
  if (win) {
    const grade = recordGrade(mission, stats);
    const gc = { S: '#ff5a5a', A: '#ffd166', B: '#80ed99', C: '#9ad1ff' }[grade];
    $('resStats').innerHTML += `<div class="stat">RANK <b style="color:${gc};font-size:22px">${grade}</b> ${grade === 'S' ? '— FLAWLESS' : ''}</div>`;
    // gear drop: 45% chance, weighted to unowned — GUARANTEED on GEAR CACHE nodes
    if (mission.nodeGear || Math.random() < 0.45 * luckMult()) {
      const unowned = GEAR.filter((g) => !((save.gearInv || {})[g.id] || 0) && (save.gearEq || {})[g.slot] !== g.id);
      const drop = (unowned.length ? unowned : GEAR)[Math.floor(Math.random() * (unowned.length ? unowned.length : GEAR.length))];
      grantGear(drop.id);
    }
    storeStock = []; // fresh stock each win
    renderStore(sr);
  }
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
let gameTime = 0, combo = 0, comboT = 0, maxCombo = 0, atkIdx = 0, dmgTaken = 0, missionMaxHp = 100;
let cashRun = 0, kills = 0, distWalked = 0, endlessT = 3, endlessTier = 0, endlessMuts = [];
function hint(on) { $('hint').style.opacity = on ? 1 : 0; }
function awardCash(base, pos, tag) {
  const fever = (mission && mission.endless && (endlessMuts || []).includes('FEVER')) ? 2 : 1;
  const amount = Math.max(1, Math.round(base * hustleMult() * (1 + (blessFx().cash || 0)) * ((mission && mission.cashMult) || 1) * fever));
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
// ---------- BRANCHING CIRCUIT MAP (Hades chamber-inspired): visible choices, visible rewards ----------
// The next circuit mission is a choice of 3 nodes, each previewing its reward.
const NODE_REWARDS = [
  { id: 'gear', name: 'GEAR CACHE', icon: '⚙', desc: 'Guaranteed gear drop' },
  { id: 'bless', name: 'SHRINE', icon: '✦', desc: 'Mid-mission blessing' },
  { id: 'cash', name: 'PAYDAY', icon: '$', desc: '+50% cash' },
  { id: 'boss', name: 'CHALLENGER', icon: '👑', desc: 'Boss fight, big bounty' },
];
function circuitNodeOptions(n) {
  const R = seedPRNG(n * 331 + 7);
  const pool = NODE_REWARDS.slice();
  const out = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const r = pool.splice(Math.floor(R() * pool.length), 1)[0];
    const preview = procMission(n);
    out.push({ reward: r, name: preview.name, district: preview.district });
  }
  return out;
}
function renderCircuitMap(into, n) {
  into.innerHTML = '';
  into.appendChild(el('div', 'storeTitle', '🗺 CIRCUIT MAP — CHOOSE YOUR NEXT FIGHT'));
  for (const opt of circuitNodeOptions(n)) {
    const c = el('div', 'circuitNode panel9');
    c.appendChild(el('div', 'cn', opt.reward.icon + ' ' + opt.reward.name));
    c.appendChild(el('div', 'cr', opt.reward.desc));
    c.appendChild(el('div', 'cr', '#' + (n + 1) + ' ' + opt.name));
    c.onclick = (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); startMission('circuit', opt.reward.id); };
    into.appendChild(c);
  }
  const back = el('button', 'ghostBtn', '← back');
  back.onclick = (e) => { e.stopPropagation(); showMission(); };
  into.appendChild(back);
}
function startMission(id, node) {
  mission = id === 'circuit' ? procMission(save.circuitN || 0) : missionDef(id);
  if (node) { // branching circuit map choice
    mission.node = node;
    if (node === 'cash') mission.cashMult = 1.5;
    if (node === 'boss' && !mission.boss) mission.boss = 'pb' + (save.circuitN || 0);
    if (node === 'gear') mission.nodeGear = true;
    if (node === 'bless') mission.nodeBless = true;
  }
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
  spawnTagSpots(mission, R); // JET SET RADIO: graffiti tag spots — claim the block with style
  spawnMascot(); // CORNER-CREW MASCOTS: your ride-or-die follows you in
  if (mission.crowd) spawnCrowd(R); // CONDITIONAL crowd only — owner directive
  setRain(hasMod('rain'));
  const fd = fighterDef();
  player = makeFighterRaw(bodyTint(fd.id), 0, Math.PI / 2, fd.scoutScale || 1, texObj(fd.id));
  if (fd.head) attachHead(player, fd.head); // species head for playable fighters (JACK...)
  applyFighterCosmetics(player, fd.id); // modular parts + color zones (style only — no power)
  player.isPlayer = true;
  player.maxHp = Math.round(fd.hp + toughBonus() + (blessFx().hp || 0));
  player.hp = player.maxHp;
  player.dmgMult = fd.dmg * powerMult() * (1 + (blessFx().dmg || 0));
  player.baseDmgMult = player.dmgMult; // RADICAL MODE scales off base
  player.spd = fd.spd * (1 + (blessFx().spd || 0) + (blessFx().moveSpd || 0) + (save.up_speed || 0) * 0.04);
  player.baseSpd = player.spd;
  player.px = 2; player.pz = 0; player.face = 1;
  player.energy = 50; player.dodgeT = 0; player.dodgeCD = 0; player.busy = 0; player.spinT = 0;
  player.animMove = false; player.stance = 0; // mixtape stance resets to balanced each mission
  playAnim(player, 'Melee_Unarmed_Idle', { loop: true });
  spawnQueue = mission.spawns.map((s) => Object.assign({}, s, { done: false })).sort((a, b) => a.at - b.at);
  bossSpawned = false; bossRef = null; missionOver = false; ended = false;
  gameTime = 0; combo = 0; comboT = 0; maxCombo = 0; atkIdx = 0; dmgTaken = 0; missionMaxHp = player.maxHp;
  cashRun = 0; kills = 0; distWalked = 0; endlessT = 3; endlessTier = 0; endlessMuts = [];
  camX = 2;
  state = 'fight'; ev('mission_start', { id: mission.id });
  // ONE-HIT (Katana Zero): brief planning slow-mo at mission start — survey the room, then move
  if (hasMod('onehit')) {
    addSlowmo(0.25, 2.0);
    banner('ONE-HIT — PLAN YOUR MOVES', 'bad');
    sfx('bell', 1, false, 0.7);
  }
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
// OWNER 2026-10-07: attacks snap to face the nearest enemy at press time,
// so strikes aim correctly now that walking no longer magnet-faces enemies.
function faceNearestEnemy() {
  if (!player) return;
  const t = nearestEnemy(99);
  if (t) {
    player.face = t.px >= player.px ? 1 : -1;
    player.root.rotation.y = player.face > 0 ? Math.PI / 2 : -Math.PI / 2;
  }
  player.animMove = false; // run anim yields to the attack; state machine restarts it after
}
function nearestEnemyFront(range) {  let best = null, bd = range;
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
  // GOLDEN (surprise density, Soul Law B): rare shiny variant — 2x HP, 5x cash. A story you retell.
  else if (missionR() < 0.03 && !v.boss) {
    e.golden = true; e.maxHp = e.hp = Math.round(e.hp * 2);
    e.root.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.color = new THREE.Color(0xffd166); o.material.emissive = new THREE.Color(0x8a6b1a); } });
    e.name = 'GOLDEN ' + v.name;
    banner('✦ GOLDEN ' + v.name.toUpperCase() + ' ✦', 'gold'); sfx('bell', 1, true);
  }
  const df = effDiff();
  e.isPlayer = false; e.name = v.name; e.maxHp = e.hp = Math.round(v.hp * df.hpMul);
  e.dmgMult = v.dmg * df.dmgMul; e.spd = v.spd; e.move = v.move; e.sig = fam.sig || null; e.sigUse = false; e.famId = famId;
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
// PARRY (Fight'N Rage-inspired): tap TOWARD the attacker on the '!' — negate, stagger, free energy
function doParry(e) {
  e.windup = 0; hideWarn(e); e.stagger = 1.2;
  playAnim(e, 'Hit_A', { ts: 1.4 });
  player.energy = clamp(player.energy + 20 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
  sparkFX(player.px + player.face * 0.8, 1.2, player.pz, 0x7af0ff, 16);
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.0, 0)));
  popText('PARRY!', 'spc', sp.x, sp.y);
  sfx('hit3', 0.7, false, 1.4); addHitstop(0.06);
  player.busy = 0.25; setHud(); ev('parry', {});
}
function doPunch() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  faceNearestEnemy();
  unlockAudio();
  T.taps++; hint(false); save.seenHint = true;
  // fighting-game motion input + HIT (additive: plain tap combat unchanged)
  const mot = detectMotion();
  if (mot) { doMotionSpecial(mot); return; }
  // BLITZ (Streets of Rage 4): double-tap toward + HIT = character-specific lunging strike
  const _fdir = player.face > 0 ? 'R' : 'L';
  if (seqMatch([_fdir, _fdir], 0.5) && (player.blitzCD || 0) <= 0) { doBlitz(); return; }
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
  sfxSwing(0.5); // S2: dedicated swing whoosh on the swing
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    if (ce && ce.hp > 0) {
      // PARRY vs COUNTER: stick toward the attacker = parry (stagger + free energy); else counter
      const toward = Math.sign(ce.px - player.px) || 1;
      if (dx * toward > 0.5) { doParry(ce); return; }
      ce.windup = 0; hideWarn(ce);
      const bfx = blessFx();
      landHit(ce, Math.round(dmg * player.dmgMult * 2 * (1 + (bfx.counterDmg || 0) + (save.up_counter || 0) * 0.1)), 'COUNTER', 0.12, 0.35, false, true);
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
    } else sfxSwing(0.8, true); // S2: whiff — the attack missed, make the miss read
    damageDestructibles(1.7);
    damageDestructibles(range);
  }, delay * 1000);
}
function doBlitz() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  faceNearestEnemy();
  const fd = fighterDef(player.fid);
  const face = player.face || 1;
  player.blitzCD = 1.4; player.busy = 0.34;
  const lunge = 2.6 * face;
  const x0 = player.px;
  player.px = clamp(player.px + lunge, 0.5, mission.len === Infinity ? 1e6 : mission.len - 1.5);
  player.blitzX0 = x0; player.blitzX1 = player.px;
  playAnim(player, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.6 * (player.spd || 1), fade: 0.05 });
  sfxSwing(0.6); // S2: dedicated swing whoosh
  sparkFX(player.px + face * 0.6, 1.1, player.pz, 0xffd166, 10);
  ev('blitz', {});
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    const bfx = blessFx();
    const xa = Math.min(player.blitzX0 ?? player.px, player.blitzX1 ?? player.px) - 1.1;
    const xb = Math.max(player.blitzX0 ?? player.px, player.blitzX1 ?? player.px) + 1.1;
    let blitzHit = false;
    for (const e of enemies) {
      if (e.hp <= 0 || e.dead) continue;
      if (e.px > xa && e.px < xb && Math.abs(e.pz - player.pz) < 1.25) {
        landHit(e, Math.round(24 * player.dmgMult * (1 + (bfx.punchDmg || 0))), (fd.blitzname || 'BLITZ'), 0.08, 0.35, false, false);
        blitzHit = true;
      }
    }
    if (!blitzHit) sfxSwing(0.8, true); // S2: whiff
    damageDestructibles(2.4);
  }, 140);
}
function releaseFocus() {
  // FOCUS (SFIV) release: charged strike that crumples (long vulnerable stun) non-boss enemies
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
  player.focusT = 0; player.busy = 0.5;
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.6, fade: 0.05 });
  sfxSwing(0.6); // S2: dedicated swing whoosh
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    const t = nearestEnemy(2.4);
    if (t) {
      landHit(t, Math.round(34 * player.dmgMult), 'FOCUS', 0.1, 0.4, false, false);
      if (!t.boss && t.hp > 0) { t.ai = 'recover'; t.aiT = 2.4; playAnim(t, 'Hit_A', {}); } // crumple
    } else sfxSwing(0.8, true); // S2: whiff
    damageDestructibles(2);
  }, 200);
  ev('focusrelease', {});
}
function doTech() {
  // TECH (Smash-inspired): tap HIT while knocked down = instant recovery, small bounce, 0.6s invuln.
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return false;
  if (!(player.knockT > 0)) return false;
  player.knockT = 0; player.busy = 0; player.techInvulnT = 0.6;
  player.vy = 4.5; player.airT = 0.001; player.py = 0.001; // small bounce back to your feet
  playAnim(player, 'Melee_Unarmed_Idle', { ts: 1.6, fade: 0.05 });
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
  popText('TECH!', 'spc', sp.x, sp.y);
  sfx('uiclick', 0.9, false, 1.3); sparkFX(player.px, 1.0, player.pz, 0x7af0ff, 10);
  T.techs = (T.techs || 0) + 1; ev('tech', {}); setHud();
  return true;
}
function doGrapple() {
  // WRESTLING FINISHERS (No More Heroes): staggered enemy + GRAPPLE = suplex/piledriver/powerbomb.
  // Stun an enemy (parry/counter), then style on them. Wrestling flavor for the wrestling-rooted roster.
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0 || player.airT > 0) return;
  faceNearestEnemy();
  unlockAudio(); T.taps++; hint(false);
  const t = nearestEnemy(2.4);
  if (!t || !(t.stagger > 0) || t.boss) {
    // whiff: small stumble, no penalty beyond the beat
    player.busy = 0.3;
    playAnim(player, 'Melee_Unarmed_Idle', { ts: 0.8, fade: 0.1 });
    return;
  }
  const fd = fighterDef();
  const wname = fd.wrestle || 'STREET SUPLEX';
  player.busy = 1.0;
  playAnim(player, 'Melee_Unarmed_Attack_Punch_B', { ts: 1.2, fade: 0.05 });
  banner(wname + '!', 'spc'); sfx('hit3', 1, false, 0.55); flash('#ffd166');
  addSlowmo(0.5, 0.5); shake = 0.7; // big moment: slow-mo allowed
  const sp = screenPos(t.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)));
  popText(wname + '!', 'big', sp.x, sp.y);
  sparkFX(t.px, 1.2, t.pz, 0xffd166, 24);
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    landHit(t, Math.round(48 * player.dmgMult), wname, 0.12, 0.8, true, false);
    damageDestructibles(2.4);
  }, 300);
  T.grapples = (T.grapples || 0) + 1; ev('grapple', { name: wname }); setHud();
}
function doTaunt() {
  // TMNT taunt: talk trash, build special meter. Pure addition — costs a beat of vulnerability.
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0 || player.airT > 0) return;
  unlockAudio();
  // JET SET RADIO: near a tag spot, TAUNT starts spraying instead of trash-talking
  const tag = nearestTagSpot(2.2);
  if (tag) { startSpray(tag); setHud(); return; }
  // RADICAL MODE (TMNT: Shredder's Revenge): FULL meter + taunt = 12s powered state
  if (player.energy >= energyMax() - 0.5 && !(player.radicalT > 0)) {
    player.radicalT = 12; player.energy = 0; player.busy = 0.8;
    playAnim(player, 'Melee_Unarmed_Idle', { ts: 1.4, fade: 0.1 });
    banner('RADICAL MODE!', 'spc'); sfx('bell', 1, false, 0.6); flash('#ffd166');
    sparkFX(player.px, 1.2, player.pz, 0xffd166, 24);
    setHud(); ev('radical', {}); return;
  }
  player.busy = 0.8;
  playAnim(player, 'Melee_Unarmed_Idle', { ts: 0.7, fade: 0.1 });
  player.energy = clamp(player.energy + 25 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
  popText('COME ON!', 'spc', sp.x, sp.y);
  sfx('uiclick', 0.6, false, 0.7);
  setHud(); ev('taunt', {});
}
function doStance() {
  // MIXTAPE STANCE SYSTEM (Double Dragon Neon): two switchable loadouts mid-fight.
  // Double-tap TAUNT swaps stances — trade damage for speed or vice versa. Style, not power: pure tradeoff.
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0 || player.airT > 0) return;
  unlockAudio();
  const fd = fighterDef();
  player.stance = player.stance ? 0 : 1;
  const st = fd.stance;
  const baseD = fd.dmg * powerMult() * (1 + (blessFx().dmg || 0));
  const baseS = fd.spd * (1 + (blessFx().spd || 0) + (blessFx().moveSpd || 0) + (save.up_speed || 0) * 0.04);
  if (player.stance === 1 && st) {
    player.baseDmgMult = baseD * st.dmg; player.baseSpd = baseS * st.spd;
    banner(st.name, 'spc');
    const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)));
    popText(st.desc, 'gold', sp.x, sp.y);
  } else {
    player.baseDmgMult = baseD; player.baseSpd = baseS;
    banner('BALANCED STANCE', 'spc');
  }
  // RADICAL/RAGE recompute from base every frame; otherwise snap current values now
  if (!(player.radicalT > 0) && !(player.rageT > 0)) { player.dmgMult = player.baseDmgMult; player.spd = player.baseSpd; }
  player.busy = 0.4;
  playAnim(player, 'Melee_Unarmed_Idle', { ts: 1.6, fade: 0.1 });
  sfx('uiclick', 0.9, false, 1.2);
  sparkFX(player.px, 1.4, player.pz, 0xff4fd8, 10);
  setHud(); ev('stance', { stance: player.stance });
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
  sfxSwing(0.55); // S2: dedicated swing whoosh
  const hitR = 2.3;
  let hitAny = false;
  for (const e of enemies.slice()) {
    if (e.hp > 0 && Math.abs(e.px - player.px) < hitR && Math.abs(e.pz - player.pz) < 1.6) {
      landHit(e, Math.round(18 * player.dmgMult), 'DIVE KICK', 0.07, 0.3, false, false);
      hitAny = true;
    }
  }
  damageDestructibles(hitR);
  if (hitAny) { shake = Math.max(shake, 0.3); } else sfxSwing(0.8, true); // S2: whiff
}
function doStanceFin(fd) {
  // Stance-exclusive finisher: only available in stance mode (double-tap TAUNT). Style, not power: a tradeoff move.
  const fin = fd.stanceFin; if (!fin) return;
  T.sfin = T.sfin || {}; T.sfin[fin.kind] = (T.sfin[fin.kind] || 0) + 1; // test hook
  player.busy = 0.8; unlockAudio(); T.taps++; hint(false);
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.6, fade: 0.05 });
  banner(fin.name + '!', 'spc'); sfx('hit3', 1, false, 0.65); flash('#ffd166');
  const dir = player.face || 1;
  const hitAll = (r, zr, dmg, label, launcher) => {
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - player.px) < r && Math.abs(e.pz - player.pz) < zr)
        landHit(e, Math.round(dmg * player.dmgMult), label, 0.1, 0.5, launcher, false);
    }
  };
  if (fin.kind === 'flurry') { // KID BLUE: 5 rapid palm strikes in a cone
    burst(player.root.position.clone().add(new THREE.Vector3(dir * 1.2, 1.2, 0)), 24, fin.color, 6);
    for (let i = 0; i < 5; i++) setTimeout(() => {
      if (state !== 'fight' || missionOver || ended) return;
      const t = nearestEnemy(2.6);
      if (t && Math.sign(t.px - player.px) === dir) { landHit(t, Math.round(11 * player.dmgMult), fin.name, 0.05, 0.25, false, false); sfx('hit2', 0.9, false, 0.7); }
    }, i * 90);
  } else if (fin.kind === 'blinkback') { // GHOST: blink through nearest, strike from behind
    const t = nearestEnemy(6);
    if (t) { player.px = t.px - dir * 1.4; burst(player.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 26, fin.color, 7); landHit(t, Math.round(34 * player.dmgMult), fin.name, 0.1, 0.5, false, false); }
    else popText('NO TARGET', '', innerWidth / 2, innerHeight * 0.4);
  } else if (fin.kind === 'spin') { // BRICK: 360 wrecking spin
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 34, fin.color, 7); shake = 0.6;
    hitAll(3.0, 2.0, 30, fin.name, false); damageDestructibles(3.0);
  } else if (fin.kind === 'pound') { // KINGPIN: royal decree slam, radial shockwave
    burst(player.root.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 40, fin.color, 8); shake = 0.7;
    hitAll(3.8, 2.2, 32, fin.name, true); damageDestructibles(3.8);
  } else if (fin.kind === 'smash') { // SLEDGE: overhead crusher, launches pack
    const t = nearestEnemy(3.0);
    burst(player.root.position.clone().add(new THREE.Vector3(dir * 1.0, 1.4, 0)), 36, fin.color, 7); shake = 0.7;
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(dir * 1.0, 1.4, 0)), 'flame'); // wave 17
    hitAll(2.8, 1.8, 38, fin.name, true); damageDestructibles(2.8);
  } else if (fin.kind === 'linedash') { // VIPER: coil through the line
    const dist = 4.6;
    player.px = clamp(player.px + dir * dist, 0.5, mission.len === Infinity ? 1e6 : mission.len - 1.5);
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 30, fin.color, 6);
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 'flame'); // wave 17
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - (player.px - dir * dist / 2)) < dist / 2 + 0.8 && Math.abs(e.pz - player.pz) < 1.6)
        landHit(e, Math.round(28 * player.dmgMult), fin.name, 0.08, 0.35, false, false);
    }
  } else if (fin.kind === 'storm') { // DUST: sandstorm closes in
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 44, fin.color, 8); shake = 0.55;
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 'flame'); // wave 17
    hitAll(3.4, 2.4, 26, fin.name, false); damageDestructibles(3.4);
  } else if (fin.kind === 'launcher') { // JACK: rising gourd uppercut
    const t = nearestEnemy(2.6);
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1.6, 0)), 30, fin.color, 7);
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1.6, 0)), 'flame'); // wave 17
    if (t) landHit(t, Math.round(36 * player.dmgMult), fin.name, 0.12, 0.7, true, false);
    else popText('WHIFF', '', innerWidth / 2, innerHeight * 0.4);
  }
  setHud(); ev('stancefin', { kind: fin.kind });
}
function doHeavy() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0 || player.busy > 0) return;
  faceNearestEnemy();
  unlockAudio(); T.taps++; hint(false);
  // DUST LAUNCHER (Guilty Gear): ↓+HVY = universal overhead launcher, same for every fighter.
  // The combo system has a common language: down+heavy always pops them up.
  if (typeof stick !== 'undefined' && stick.dy > 0) {
    player.busy = 0.55;
    playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.5, fade: 0.05 });
    sfxSwing(0.6); // S2: dedicated swing whoosh
    setTimeout(() => {
      if (state !== 'fight' || missionOver || ended) return;
      const t = nearestEnemy(2.4);
      if (t && !t.boss) {
        landHit(t, Math.round(20 * player.dmgMult), 'DUST LAUNCHER', 0.09, 0.5, true, false);
        const sp = screenPos(t.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)));
        popText('DUST LAUNCHER!', 'spc', sp.x, sp.y);
      } else if (t) {
        landHit(t, Math.round(20 * player.dmgMult), 'DUST LAUNCHER', 0.09, 0.5, false, false);
      } else sfxSwing(0.8, true); // S2: whiff
      damageDestructibles(2.0);
    }, 200);
    T.dustlaunch = (T.dustlaunch || 0) + 1; ev('dustlauncher', {});
    return;
  }
  // HEAT ACTION (Yakuza): staggered enemy in range + HVY = contextual finisher
  const heatT = nearestEnemy(2.4);
  if (heatT && heatT.stagger > 0 && !heatT.boss) {
    player.busy = 0.9;
    playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.8, fade: 0.05 });
    banner('HEAT!', 'spc'); sfx('hit3', 1, false, 0.6); flash('#ff6a00');
    addSlowmo(0.5, 0.35); shake = 0.7;
    setTimeout(() => {
      if (state !== 'fight' || missionOver || ended) return;
      landHit(heatT, Math.round(55 * player.dmgMult), 'HEAT', 0.12, 0.8, true, false);
      sparkFX(heatT.px, 1.2, heatT.pz, 0xff6a00, 20);
      damageDestructibles(2.4);
    }, 250);
    ev('heat', {}); return;
  }
  // STANCE FINISHER (wave 6): HVY while in stance fires your stance-exclusive move
  const _fd0 = fighterDef();
  if (player.stance === 1 && _fd0.stanceFin) { doStanceFin(_fd0); return; }
  player.busy = 0.5;
  playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.25, fade: 0.05 });
  sfxSwing(0.55); // S2: dedicated swing whoosh (heavy had none)
  setTimeout(() => {
    if (state !== 'fight' || missionOver || ended) return;
    const t = nearestEnemy(2.2);
    if (t) landHit(t, Math.round(24 * player.dmgMult), 'HEAVY', 0.09, 0.4, false, false);
    else sfxSwing(0.8, true); // S2: whiff
    damageDestructibles(1.9);
  }, 230);
}
function doSpecial() {
  if (state !== 'fight' || missionOver || ended || !player || player.hp <= 0) return;
  faceNearestEnemy();
  unlockAudio();
  const fd = fighterDef();
  // DOJO MOVES (River City Ransom): directional SPC fires purchased dojo techniques
  if (stick.dx < -0.5 && doDojoMove('d_spin')) return;
  if (stick.dx > 0.5 && doDojoMove('d_tackle')) return;
  if (stick.dy > 0.5 && doDojoMove('d_upper')) return;
  // DESPERATION (Final Fight): DOWN + SPC at <50% HP = trade 10% max HP for a huge AOE blast
  if (stick.dy > 0.5 && player.hp < player.maxHp * 0.5) {
    inputHist.length = 0;
    const cost = Math.round(player.maxHp * 0.1);
    player.hp = Math.max(1, player.hp - cost); player.busy = 0.6;
    banner('DESPERATION!', 'bad'); sfx('hit3', 1, false, 0.5); flash('#ff4444');
    addSlowmo(0.4, 0.5); shake = 0.8;
    playAnim(player, 'Melee_Unarmed_Attack_Kick', { ts: 1.8, fade: 0.05 });
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 44, 0xff4444, 8);
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 'flame'); // wave 17
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - player.px) < 4.2 && Math.abs(e.pz - player.pz) < 2.2) {
        landHit(e, Math.round(38 * player.dmgMult), 'DESPERATION', 0.1, 0.9, true, false);
        e.px = clamp(e.px + (e.px >= player.px ? 3 : -3), 0.5, 1e6); syncPos(e);
      }
    }
    damageDestructibles(3.5); setHud(); ev('desperation', {}); return;
  }
  // ASSIST (accessibility): one-button specials — SPC fires your signature when affordable
  if (save.assist) {
    inputHist.length = 0;
    if (player.energy >= 25) { doMotionSpecial('qcf'); return; }
    popText('CHARGING…', 'gold', innerWidth / 2, innerHeight * 0.4);
    return;
  }
  // BURST (Guilty Gear): juggled (3+ hits in 2.5s) + ↑ + SPC = combo breaker, 50 energy
  if (stick.dy < -0.5 && (player.jugN || 0) >= 3) {
    inputHist.length = 0;
    if (player.energy < 50) { popText('NEED 50 ENERGY', 'bad', innerWidth / 2, innerHeight * 0.4); return; }
    player.energy -= 50; player.jugN = 0; player.jugT = 0; player.busy = 0.4;
    banner('BURST!', 'spc'); sfx('hit3', 1, false, 0.7); flash('#7CFC00');
    addSlowmo(0.4, 0.5); shake = 0.5;
    burst(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 36, 0x7CFC00, 6);
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 'magic'); // wave 17: BURST combo-breaker
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - player.px) < 3.4 && Math.abs(e.pz - player.pz) < 1.8) {
        landHit(e, Math.round(22 * player.dmgMult), 'BURST', 0.09, 0.6, true, false);
        e.px = clamp(e.px + (e.px >= player.px ? 2.2 : -2.2), 0.5, 1e6); syncPos(e);
      }
    }
    setHud(); ev('burst', {}); return;
  }
  // MEGA SUPER: ↑↑↓←→ + SPC — cinematic super attack, needs FULL energy
  if (seqMatch(['U', 'U', 'D', 'L', 'R'], 1.8)) {
    inputHist.length = 0;
    if (player.energy >= 100) { doMega(); return; }
    popText('MEGA NEEDS FULL ENERGY', 'bad', innerWidth / 2, innerHeight * 0.4);
    sfx(140, 0.2, 'square', 0.3);
    return;
  }
  // AIR SPECIAL: SPC in air = your signature, from above (25 energy) — per-fighter aerial identity
  if (player.airT > 0) {
    if (player.energy < 25) { popText('NOT ENOUGH ENERGY', 'bad', innerWidth / 2, innerHeight * 0.4); return; }
    player.energy = Math.max(0, player.energy - 25); setHud();
    doMotionSpecial('qcf', true);
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
  vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 'flame'); // wave 17: panic-button desperation
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
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 'magic'); // wave 17: dash special
    for (const e of enemies.slice()) {
      if (e.hp > 0 && Math.abs(e.px - (player.px - dir * dist / 2)) < dist / 2 + 0.8 && Math.abs(e.pz - player.pz) < 1.6)
        landHit(e, Math.round(30 * player.dmgMult), sp.name, 0.08, 0.35, false, false);
    }
  } else if (kind === 'blink') {
    const near = enemies.filter((e) => e.hp > 0).sort((a, b) =>
      (Math.abs(a.px - player.px) - Math.abs(b.px - player.px))).slice(0, 3);
    for (const e of near) {
      burst(e.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 18, 0x7af0ff, 5);
      vfxSpecial(e.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 'magic'); // wave 17: blink special
      landHit(e, Math.round(26 * player.dmgMult), sp.name, 0.06, 0.25, false, false);
    }
    if (!near.length) popText('NO TARGET', '', innerWidth / 2, innerHeight * 0.4);
  } else { // slam: radial shockwave + launch
    burst(player.root.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 45, 0xffb03d, 8);
    vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 'flame'); // wave 17: slam special
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
  player.dodgeCD = 0.9 * dodgeRechargeMult(); player.dodgeT = 0.35; player.dashStruck = false;
  const m = Math.hypot(stick.dx, stick.dy);
  if (m > 0.25) { player.dodgeDx = stick.dx / m; player.dodgeDz = stick.dy / m; }
  else { const t = nearestEnemy(99); player.dodgeDx = t && t.px < player.px ? 1 : -1; player.dodgeDz = 0; }
  playAnim(player, 'Running_A', { ts: 2.6 });
  // S3 DODGE SFX (TIER 2 item 5, owner 2026-10-07): dedicated dodge whoosh — light + fast, distinct
  // from attack whooshes — plus a small dust kick so the i-frame dodge reads audibly AND visually.
  sfx('whoosh', 0.4, false, 1.6);
  burst(player.root.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 8, 0xcfcfcf, 3);
  T.dodgeSfx = (T.dodgeSfx || 0) + 1; // test hook
  ev('dodge', {});
}
function landHit(e, dmg, label, hs, sh, launcher, counter) {
  if (mission && mission.endless && (endlessMuts || []).includes('GLASS JAW')) dmg = Math.round(dmg * 1.5);
  if (!e || e.hp <= 0 || state !== 'fight') return;
  // ONE-HIT (Katana Zero): everyone dies in one hit — bosses take heavy damage instead
  if (mission && hasMod('onehit')) { if (e.boss) dmg = Math.max(dmg, 150); else dmg = 99999; }
  T.hits++; if (counter) T.counters++;
  // CRIT (gear/gym) + LAST STAND (Garou TOP-inspired): below 30% HP you hit 25% harder
  let dealt = dmg, critOn = false, lsOn = false;
  if (Math.random() < critCh()) { dealt = Math.round(dealt * 1.6); critOn = true; }
  if (player && player.hp > 0 && player.hp < player.maxHp * 0.3) { dealt = Math.round(dealt * 1.25); lsOn = true; lastStandFx(); }
  e.hp -= dealt; combo++; comboT = 2.5; maxCombo = Math.max(maxCombo, combo); // SoR4 combo keep-alive: 2.5s rhythm
  // ANTI-INFINITE (Skullgirls Undizzy): same move 3x in one juggle = auto-drop with a "READ!" popup. Fairness by design.
  if (e.airborne) {
    e.jugSeq = e.jugSeq || [];
    e.jugSeq.push(label);
    if (e.jugSeq.length > 3) e.jugSeq.shift();
    if (e.jugSeq.length === 3 && e.jugSeq[0] === e.jugSeq[1] && e.jugSeq[1] === e.jugSeq[2]) {
      e.airborne = false; e.vy = 0; e.root.position.y = 0; e.ai = 'recover'; e.aiT = 0.9; e.jugSeq = [];
      playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
      const rsp = screenPos(e.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
      popText('READ!', 'bad', rsp.x, rsp.y);
      sfx('uiclick', 0.8, false, 0.6); ev('antiinfinite', { label });
      T.antiinf = (T.antiinf || 0) + 1; // test hook
    }
  } else { e.jugSeq = []; }
  styleHit(label); // DMC-style variety grading
  if (player) player.energy = clamp(player.energy + 8 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
  const head = e.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 0.78 * e.sc, 0.15));
  burst(head, counter ? 30 : 16, counter ? 0x7af0ff : 0xffd27a, counter ? 6 : 4);
  vfxImpact(head, counter); // wave 17: Kenney muzzle/star impact pops on every landed hit
  shake = sh; hitstop = hs; // snappy: tiny freeze on light hits, bigger only for counter/heavy/special/KO
  sfx(['hit1', 'hit2', 'hit3'][Math.floor(Math.random() * 3)], 0.9, false, 0.9 + Math.random() * 0.2);
  const sp = screenPos(head); popText((critOn ? 'CRIT ' : '') + (lsOn ? 'LAST STAND ' : '') + (counter ? 'COUNTER! -' : '-') + dealt, counter ? 'big' : '', sp.x, sp.y - 30);
  if (counter) flash('#7af0ff');
  if (launcher && !e.boss) {
    e.airborne = true; e.vy = 5.2; e.ai = 'launched';
    // F8 EDGE-BOUNCE (owner 2026-10-07, wave 9): launched enemies carry horizontal knock
    // velocity — arena walls bounce them back into juggle range (Urban Reign style)
    // instead of clamping them dead at the bounds.
    const ldir = (player && (player.face || 0)) || ((e.px >= (player ? player.px : 0)) ? 1 : -1) || 1;
    e.kvx = ldir * 7.5; e.kvz = ((e.pz || 0) >= 0 ? 1 : -1) * rnd(1.5, 3);
    playAnim(e, 'Hit_B', { ts: 1.2 });
    popText('LAUNCH!', 'spc', sp.x, sp.y - 60);
    // WALL SPLAT (TMNT-inspired): launched into a prop/wall = bonus damage + crumple
    for (const c of colliders) {
      if (!c.dead && Math.hypot(e.px - c.x, e.pz - c.z) < c.r + 1.2) {
        e.hp -= Math.round(12 * player.dmgMult);
        popText('WALL SPLAT!', 'spc', sp.x, sp.y - 90);
        burst(head, 20, 0xffcf2e, 5); shake = Math.max(shake, 0.5);
        break;
      }
    }
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
  vfxKO(e.root.position.clone().add(new THREE.Vector3(0, 1, 0)), !!e.boss); // wave 17: Kenney ring+smoke+spark KO burst
  pushT = 0.85; pushPos.copy(e.root.position);
  $('ko').classList.add('show'); setTimeout(() => $('ko').classList.remove('show'), 900);
  const base = e.boss ? 60 : (8 + Math.round(distWalked * 0.2)) * (e.golden ? 5 : 1);
  awardCash(base, e.root.position.clone());
  if (combo >= 5) awardCash(Math.min(combo, 20), e.root.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 'COMBO');
  if (mission.crowd) crowdCheer();
  if (R_safe() < 0.32 * luckMult()) {
    const roll = R_safe();
    spawnPickup(roll < 0.35 ? 'health' : roll < 0.65 ? 'cash' : roll < 0.85 ? 'special' : 'food',
      clamp(e.root.position.x + rnd(-0.8, 0.8), 0.5, 1e6), clamp(e.root.position.z + rnd(-0.8, 0.8), -1.4, 1.4));
  }
  // RECRUIT (River City Girls): KO'd grunts sometimes join your crew for the mission
  if (!e.boss && player && player.hp > 0 && R_safe() < 0.08) {
    player.crew = (player.crew || 0) + 1; player.crewT = Math.min(player.crewT || 99, 1.2);
    banner('RECRUITED!', 'spc'); sfx('bell', 1, false, 1.3);
    sparkFX(e.root.position.x, 1.4, e.root.position.z, 0x7CFC00, 14);
    const fam = e.famId || 'street';
    save.scouts = save.scouts || {}; save.scouts[fam] = (save.scouts[fam] || 0) + 1; writeSave();
    ev('recruit', { name: e.name, fam });
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
  if (mission && mission.endless && (endlessMuts || []).includes('GLASS JAW')) dmg = Math.round(dmg * 1.5);
  if (!player || player.hp <= 0 || missionOver || ended) return;
  if (player.techInvulnT > 0) return; // TECH recovery: brief invuln after a successful tech
  // ONE-HIT (Katana Zero): you die in one hit too — revives still trigger below (hardcore with kindness)
  if (mission && hasMod('onehit')) dmg = 99999;
  // getting hit cancels an in-progress spray (Jet Set Radio vulnerability)
  if (player.sprayT > 0) {
    player.sprayT = 0; player.spraySpot = null; player.busy = 0;
    playAnim(player, 'Hit_A', { ts: 1.4 });
    const csp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
    popText('SPRAY RUINED!', 'bad', csp.x, csp.y);
  }
  // FOCUS (SFIV): absorb one hit while in focus stance — no damage, +15 energy
  if (player.focusT > 0 && !player.focusHit) {
    player.focusHit = true; player.focusT = 0; hvyFocusing = false;
    player.energy = clamp(player.energy + 15, 0, energyMax());
    hitstop = 0.06; sfx('hit2', 0.7, false, 1.2);
    sparkFX(player.px, 1.2, player.pz, 0xffffff, 12);
    const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)));
    popText('ABSORBED', 'gold', sp.x, sp.y);
    setHud(); ev('focusabsorb', {}); return;
  }
  // WITCH TIME (Bayonetta): dodge at the last instant — the world slows for you (a big moment, not every hit)
  if (player.dodgeT > 0) {
    if (player.dodgeT > 0.16 && (player.witchCD || 0) <= 0) {
      player.witchCD = 3;
      addSlowmo(0.22, 1.1); shake = 0.35; flash('#9a7bff');
      banner('WITCH TIME'); sfx('bell', 1, true);
      player.energy = clamp(player.energy + 20 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
      sparkFX(player.px, 1.2, player.pz, 0x9a7bff, 18);
      ev('witchtime', {});
    }
    return;
  }
  dmg = Math.max(1, Math.round(dmg * (1 - (blessFx().armor || 0)))); // IRON SKIN
  dmgTaken += dmg; player.hp -= dmg; combo = 0; shake = 0.3; hitstop = 0.05; flash('#ff2a2a'); sfx('hit2', 0.8, false, 0.7);
  player.jugN = (player.jugN || 0) + 1; player.jugT = 2.5; // BURST (Guilty Gear): juggle tracking
  // RAGE METER (The TakeOver): damage taken builds rage; full bar = 8s +40% damage
  if (!(player.rageT > 0)) {
    player.rage = clamp((player.rage || 0) + dmg, 0, 100);
    if (player.rage >= 100) {
      player.rage = 0; player.rageT = 8;
      banner('RAGE!', 'bad'); sfx('hit3', 1, false, 0.5); flash('#ff2222');
      sparkFX(player.px, 1.2, player.pz, 0xff2222, 24);
      ev('rage', {});
    }
  }
  player.energy = clamp(player.energy + 12 * (1 + (blessFx().energyGain || 0)), 0, energyMax());
  playAnim(player, 'Hit_A', { ts: 1.4 });
  // TECH (Smash-inspired): heavy hits knock you down — tap HIT while down to tech (instant recovery + bounce + brief invuln).
  // Never helpless: knockdown is a decision, not a cutscene.
  if (dmg >= 18 && player.hp > 0 && !(player.knockT > 0)) {
    player.knockT = 0.9; player.busy = 0.9;
    playAnim(player, 'Hit_B', { ts: 0.9 });
    const ksp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.0, 0)));
    popText('KNOCKDOWN — tap HIT!', 'bad', ksp.x, ksp.y);
    ev('knockdown', {});
  }
  const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 0.8, 0)));
  popText('-' + dmg, 'bad', sp.x, sp.y - 20);
  setHud();
  if (player.hp <= 0) {
    // SECOND CHANCE (gym) + SECOND WIND (charm): revive once per mission — no shame, training aid
    const charmRevive = save.charm === 'c_wind' && !player.usedCharmRevive;
    if (!player.usedGymRevive && (save.up_revive || 0) >= 1) {
      player.usedGymRevive = true; player.hp = Math.round(player.maxHp * 0.3);
      banner('SECOND CHANCE'); flash('#80ed99'); sfx('bell', 1, true); setHud(); return;
    }
    if (charmRevive) {
      player.usedCharmRevive = true; player.hp = 1;
      banner('SECOND WIND'); flash('#7af0ff'); sfx('bell', 1, true); setHud(); return;
    }
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
let tauntLastT = 0, tauntKeyLastT = 0; // double-tap detection for stance swap
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
  bind('btnAtk', () => { if (player && player.knockT > 0) doTech(); else doPunch(); }); bind('btnDdg', doDodge); bind('btnSpc', doSpecial); bind('btnJmp', doJump);
  bind('btnGrp', doGrapple); // WRESTLING FINISHERS (No More Heroes): GRAPPLE on staggered foes
  // FOCUS (SFIV): HOLD HVY 0.45s = focus stance (absorb one hit), release = crumple strike; tap = normal heavy
  { const el = $('btnHvy');
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); hvyPressT = performance.now(); hvyFocusing = false; }, { passive: false });
    const hvyUp = (e) => { e.stopPropagation(); if (hvyFocusing) releaseFocus(); else doHeavy(); hvyFocusing = false; hvyPressT = 0; };
    el.addEventListener('pointerup', hvyUp, { passive: false });
    el.addEventListener('pointercancel', hvyUp, { passive: false });
  }
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
  $('customizeBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); openCustomize(); });
  $('customClose').addEventListener('click', (e) => { e.stopPropagation(); sfx('uiclick', 0.8); closeCustomize(); });
  $('againBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); showMission(); });
  $('rematchBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('uiclick', 0.8); if (mission) startMission(mission.id); }); // soul law: one-tap rematch
  $('backBtn').addEventListener('click', (e) => { e.stopPropagation(); sfx('uiclick', 0.8); showSelect(); });
  $('pauseBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
  $('tauntBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    // double-tap TAUNT = stance swap (mixtape system); single = taunt
    const now = performance.now();
    if (now - tauntLastT < 350) { tauntLastT = 0; doStance(); } else { tauntLastT = now; doTaunt(); }
  });
  $('resumeBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(false); });
  $('restartBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePause(false); startMission(mission.id); });
  $('quitBtn').addEventListener('click', (e) => { e.stopPropagation(); setPaused(false); $('pauseOv').classList.add('hidden'); showMission(); });
  $('muteBtn').addEventListener('click', (e) => { e.stopPropagation(); save.muted = !save.muted; e.target.textContent = save.muted ? 'OFF' : 'ON'; writeSave(); sfx('uiclick', 0.7); });
  $('qualityBtn').addEventListener('click', (e) => { e.stopPropagation(); save.quality = save.quality === 'auto' ? 'low' : save.quality === 'low' ? 'high' : 'auto'; e.target.textContent = save.quality.toUpperCase(); writeSave(); sfx('uiclick', 0.7); applyQuality(); });
  // CREDITS (CC-BY attributions — owner 2026-10-06)
  const CREDITS = [
    ['Carmilla the vampire, happy/sad ghosts, cute skull — JellyLion (OpenGameArt)', 'CC-BY 4.0 — https://opengameart.org'],
    ['Witch — Quaternius', 'CC-BY 4.0'],
    ['Vampire bat — rubberduck (OpenGameArt)', 'CC0 1.0'],
    ['Basketball player — Tulio Portela (Sketchfab)', 'CC-BY 4.0'],
    ['Basketball player — Raj_Kumar_Jadhav (Sketchfab)', 'CC-BY 4.0'],
    ['Dead baseball player — VanHyfte_Clement (Sketchfab)', 'CC-BY 4.0'],
    ['All other models, code, music — Orion Enterprises LLC', 'Original / CC0'],
  ];
  $('creditsBody').innerHTML = CREDITS.map((c) => '<div>• ' + c[0] + '<br><span style="opacity:.7">' + c[1] + '</span></div>').join('');
  $('creditsBtn').addEventListener('click', (e) => { e.stopPropagation(); $('creditsOv').classList.remove('hidden'); sfx('uiclick', 0.7); });
  $('creditsClose').addEventListener('click', (e) => { e.stopPropagation(); $('creditsOv').classList.add('hidden'); sfx('uiclick', 0.7); });
  // ASSIST (SF6 Modern-controls-inspired, Soul Law 7: accessibility is respect)
  $('assistBtn').textContent = save.assist ? 'ON' : 'OFF';
  $('assistBtn').title = 'ASSIST: SPC button fires your best special automatically';
  $('assistBtn').addEventListener('click', (e) => { e.stopPropagation(); save.assist = !save.assist; e.target.textContent = save.assist ? 'ON' : 'OFF'; writeSave(); sfx('uiclick', 0.7); });
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
    if (k === 'j') { if (player && player.knockT > 0) { doTech(); } else doPunch(); }
    if (k === 'g') doGrapple(); // WRESTLING FINISHERS: GRAPPLE on staggered foes
    if (k === 'k') doHeavy();
    if (k === 'l') doDodge();
    if (k === 'u') doSpecial();
    if (k === 't') { const now = performance.now(); if (now - tauntKeyLastT < 350) { tauntKeyLastT = 0; doStance(); } else { tauntKeyLastT = now; doTaunt(); } }
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
    // F8 EDGE-BOUNCE (owner 2026-10-07, wave 9): horizontal knock velocity integrates with
    // air drag; hitting an arena bound BOUNCES the enemy back into juggle range (Urban Reign
    // style) instead of clamping them dead. NOTE: set x/z directly — syncPos() would zero
    // the airborne y.
    if (e.kvx || e.kvz) {
      const mLen = (typeof mission !== 'undefined' && mission) ? mission.len : Infinity;
      const maxX = mLen === Infinity ? 1e6 : mLen - 1.5;
      e.px += (e.kvx || 0) * dt; e.pz += (e.kvz || 0) * dt;
      const drag = Math.max(0, 1 - 1.8 * dt);
      e.kvx = (e.kvx || 0) * drag; e.kvz = (e.kvz || 0) * drag;
      if (Math.abs(e.kvx) < 0.3) e.kvx = 0; if (Math.abs(e.kvz) < 0.3) e.kvz = 0;
      let bounced = false;
      if (e.px < 0.5) { e.px = 0.5; e.kvx = Math.abs(e.kvx) * 0.75; bounced = true; }
      else if (e.px > maxX) { e.px = maxX; e.kvx = -Math.abs(e.kvx) * 0.75; bounced = true; }
      if (e.pz < -1.4) { e.pz = -1.4; e.kvz = Math.abs(e.kvz) * 0.75; bounced = true; }
      else if (e.pz > 1.4) { e.pz = 1.4; e.kvz = -Math.abs(e.kvz) * 0.75; bounced = true; }
      if (bounced) {
        if (e.root.position.y < 1.2) e.vy = Math.max(e.vy, 1.8); // keep the juggle alive off the wall
        sfx('crack', 0.55, false, 0.6); // CC0 Kenney crack pitched down = wall thud
        burst(e.root.position.clone(), 10, 0xcfcfcf, 4);
        vfxDust(e.root.position.clone().add(new THREE.Vector3(0, 0.4, 0))); // wave 17: Kenney smoke+dirt wall-thud puffs
        const bsp = screenPos(e.root.position.clone().add(new THREE.Vector3(0, 1.6, 0)));
        popText('EDGE BOUNCE!', 'spc', bsp.x, bsp.y);
        T.bounces = (T.bounces || 0) + 1; ev('edgebounce', {});
        shake = Math.max(shake, 0.25);
      }
      e.root.position.x = e.px; e.root.position.z = e.pz;
    }
    if (e.root.position.y <= 0) {
      e.root.position.y = 0; e.airborne = false; e.vy = 0;
      playAnim(e, 'Melee_Unarmed_Idle', { loop: true });
      e.ai = 'recover'; e.aiT = 0.9;
    }
    return;
  }
  if (e.chargeT > 0) return; // handled in playerUpdate (bosses)
  if (e.stagger > 0) { e.stagger -= dt; syncPos(e); return; } // parried: staggered, can't act
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
  } else if (id === 'hexbolt') { // HEX (witch): triple purple bolt spread
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.5 });
    sfx('hit3', 0.8, false, 1.1);
    for (const dz of [-0.35, 0, 0.35]) {
      fireProj({ x: e.px + dir * 0.8, z: e.pz + dz, y: 1.15, vx: dir * 8, kind: 'orb', dmg: Math.round(base * 0.7), color: 0xc77dff, fromPlayer: false, life: 1.3, label: 'HEX BOLT' });
    }
  } else if (id === 'blooddive') { // NIGHTWING: screaming dive at the player
    banner('BLOOD DIVE');
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.2 });
    e.chargeT = 0.6; e.chargeDx = dir; e.chargeHit = false; e.chargeDmg = Math.round(base * 1.4);
    sfx('hit2', 1, false, 1.3);
  } else if (id === 'spook') { // HAPPY HAUNT: jumpscare burst, brief stun
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.0 });
    banner('SPOOK!');
    sigHitPlayer(e, 1.8, 0.9, Math.round(base * 0.8), 'SPOOKED', 300, { burst: 0xffffff });
    sfx('bell', 0.9, false, 1.5);
  } else if (id === 'wail') { // SAD HAUNT: slowing wail AOE
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.2 });
    sfx('hit3', 0.8, false, 0.6);
    sigHitPlayer(e, 2.2, 1.2, Math.round(base * 0.9), 'WAIL', 350, { burst: 0x8080d0 });
    if (player) player.slowT = Math.max(player.slowT || 0, 2.0);
  } else if (id === 'headbutt') { // SKULL HEAD: flying headbutt charge
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.4 });
    e.chargeT = 0.5; e.chargeDx = dir; e.chargeHit = false; e.chargeDmg = Math.round(base * 1.2);
    sfx('hit2', 0.9, false, 1.1);
  } else if (id === 'dunkshot') { // HOOP DREAM: leaping slam dunk, shockwave ring
    banner('DUNK SHOT');
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.6 });
    sfx('hit3', 0.9, false, 0.8);
    sigHitPlayer(e, 2.2, 1.4, Math.round(base * 1.5), 'DUNK SHOT', 380, { burst: 0xff8c1a });
  } else if (id === 'crossover') { // STREET BALLER: ankle-breaker dash-through
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 2.4 });
    e.chargeT = 0.45; e.chargeDx = dir; e.chargeHit = false; e.chargeDmg = Math.round(base * 1.2);
    sfx('whoosh', 0.9, false, 1.2);
  } else if (id === 'curveball') { // DEAD BALLER: spinning bone-ball projectile
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.5 });
    sfx('whoosh', 0.8, false, 1.0);
    fireProj({ x: e.px + dir * 0.8, z: e.pz, y: 1.15, vx: dir * 9, kind: 'orb', dmg: Math.round(base * 1.1), color: 0xe8d8a8, fromPlayer: false, life: 1.2, label: 'CURVEBALL' });
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
  } else if (id === 'bloodmoon') { // CARMILLA: blood moon — 3 bat projectiles + heal on hit
    banner('BLOOD MOON');
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.4 });
    sfx('hit3', 1, false, 0.7);
    for (let i = -1; i <= 1; i++) fireProj({ x: e.px + dir * 1.0, z: e.pz + i * 0.5, y: 1.4, vx: dir * 7.5, kind: 'orb', dmg: Math.round(base * 0.8), color: 0x8a1a2a, fromPlayer: false, life: 1.5, label: 'BLOOD MOON' });
  } else if (id === 'overtime') { // FOREMAN: double-time — two shockwave slams, second one bigger
    banner('OVERTIME');
    playAnim(e, 'Melee_Unarmed_Attack_Kick', { ts: 1.1 });
    for (let w = 0; w < 2; w++) setTimeout(() => {
      if (!e || e.hp <= 0 || state !== 'fight' || missionOver || ended) return;
      burst(bp.clone().add(new THREE.Vector3(0, 0.4, 0)), 26, 0xb08030, 6); shake = Math.max(shake, 0.5); sfx('hit3', 1, false, 0.65);
      sigHitPlayer(e, 3.0 + w * 0.8, 1.8, Math.round(base * (w ? 1.5 : 1.0)), 'OVERTIME', 350, { burst: 0xb08030 });
    }, 250 + w * 600);
  } else if (id === 'lockdown') { // WARDEN: lockdown — ring of shock projectiles closes in
    banner('LOCKDOWN');
    playAnim(e, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.2 });
    sfx('hit3', 1, false, 0.7);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fireProj({ x: e.px + Math.cos(a) * 3.2, z: e.pz + Math.sin(a) * 2.2, y: 1.2, vx: -Math.cos(a) * 4.5, vz: -Math.sin(a) * 3.2, kind: 'orb', dmg: Math.round(base * 0.9), color: 0x5a6a7a, fromPlayer: false, life: 1.6, label: 'LOCKDOWN' });
    }
  }
  e.ai = 'recover'; e.aiT = 1.4 / (e.aggro || 1);
}
// ---------- spawn director ----------
function director(dt) {
  if (missionOver || ended) return;
  const mi = missionIndex(mission);
  if (mission.endless) {
    endlessT -= dt;
    // ENDLESS MUTATORS (wave 6): every 30m the street fights dirtier — announced, escalating
    const tier = Math.floor(distWalked / 30);
    if (tier > (endlessTier || 0)) {
      endlessTier = tier;
      const MUT = ['SWARM', 'BRUTES', 'FEVER', 'SECOND WIND', 'GLASS JAW'];
      const mut = MUT[(tier - 1) % MUT.length];
      (endlessMuts = endlessMuts || []).push(mut);
      banner(mut + '!', tier % 2 ? 'spc' : 'bad'); sfx('bell', 0.8, false, 0.7);
      const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)));
      popText(['The pack grows', 'Heavies walk in', 'Double cash', 'Catch your breath', 'Hit harder, break easier'][(tier - 1) % MUT.length], 'gold', sp.x, sp.y);
      ev('mutator', { mut, tier });
    }
    if (endlessT <= 0) {
      endlessT = Math.max(1.6, 4 - distWalked * 0.006);
      if (enemies.length < 5) {
        const fams = ['thug', 'rico', 'jabber', 'heavyd'];
        const lv = Math.floor(distWalked / 25);
        let n = Math.min(4, 1 + Math.floor(distWalked / 45));
        if ((endlessMuts || []).includes('SWARM')) n += 1;
        for (let i = 0; i < n; i++) {
          let fam = fams[Math.floor(missionR() * fams.length)];
          if ((endlessMuts || []).includes('BRUTES') && fam === 'thug' && missionR() < 0.6) fam = 'heavyd';
          spawnEnemy(fam, lv, player.px + 9 + i * 1.6, rnd(-1.2, 1.2));
        }
      }
      // SECOND WIND: slow regen in deep endless
      if ((endlessMuts || []).includes('SECOND WIND') && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + dt * 1.2); setHud();
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
// ---------- MISSION GRADES (Sonic S-rank chase): D→S on combo + damage discipline ----------
function missionGrade(stats) {
  const dmgRatio = stats.dmgTaken / Math.max(1, missionMaxHp || 100);
  if (stats.maxCombo >= 15 && dmgRatio <= 0.25) return 'S';
  if (stats.maxCombo >= 10 && dmgRatio <= 0.5) return 'A';
  if (stats.maxCombo >= 6) return 'B';
  return 'C';
}
const GRADE_ORDER = ['C', 'B', 'A', 'S'];
function recordGrade(mission, stats) {
  const g = missionGrade(stats);
  const key = mission.proc ? 'circuit' : mission.id;
  const prev = (save.missionGrades || {})[key];
  if (!prev || GRADE_ORDER.indexOf(g) > GRADE_ORDER.indexOf(prev)) {
    save.missionGrades = save.missionGrades || {}; save.missionGrades[key] = g; writeSave();
  }
  return g;
}
function missionComplete(win) {
  if (ended) return; ended = true; missionOver = true;
  $('touch').classList.remove('on');
  for (const e of enemies) hideWarn(e);
  const stats = { kills, maxCombo, cash: cashRun, dist: distWalked, waveBonus: 0, dmgTaken, time: gameTime };
  if (win) {
    if (mission.purse) stats.cash += mission.purse; // m5+ purse missions pay a clear bonus
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
  if (p.blitzCD > 0) p.blitzCD -= dt;
  if (p.witchCD > 0) p.witchCD -= dt;
  // RADICAL MODE (TMNT): +30% dmg, +15% speed while active
  if (p.radicalT > 0) {
    p.radicalT -= dt;
    p.dmgMult = p.baseDmgMult * 1.3; p.spd = p.baseSpd * 1.15;
    if (Math.random() < dt * 8) sparkFX(p.px + rnd(-0.5, 0.5), 1.2 + rnd(0, 0.8), p.pz + rnd(-0.3, 0.3), 0xffd166, 2);
    if (p.radicalT <= 0) { p.dmgMult = p.baseDmgMult; p.spd = p.baseSpd; popText('RADICAL OVER', 'gold', innerWidth / 2, innerHeight * 0.35); }
  }
  // RAGE (The TakeOver): +40% damage while raging; rage bar decays out of combat
  if (p.rageT > 0) {
    p.rageT -= dt;
    p.dmgMult = p.baseDmgMult * (p.radicalT > 0 ? 1.3 : 1) * 1.4;
    if (Math.random() < dt * 10) sparkFX(p.px + rnd(-0.5, 0.5), 1.0 + rnd(0, 1), p.pz + rnd(-0.3, 0.3), 0xff2222, 2);
    if (p.rageT <= 0) { p.dmgMult = p.baseDmgMult * (p.radicalT > 0 ? 1.3 : 1); popText('RAGE SPENT', 'bad', innerWidth / 2, innerHeight * 0.35); }
  } else if ((p.rage || 0) > 0) { p.rage = Math.max(0, p.rage - dt * 6); } // rage bleeds off
  // BURST juggle tracking (Guilty Gear): hits taken within a 2.5s window
  if (p.jugT > 0) { p.jugT -= dt; if (p.jugT <= 0) p.jugN = 0; }
  // TECH knockdown (Smash-inspired): tick down; teching is handled in the input layer
  if (p.knockT > 0) {
    p.knockT -= dt;
    if (p.knockT <= 0) { p.knockT = 0; playAnim(p, 'Melee_Unarmed_Idle', { loop: true }); }
  }
  // Tech invuln window
  if (p.techInvulnT > 0) p.techInvulnT -= dt;
  // FOCUS charge decay (SFIV)
  if (p.focusT > 0 && !hvyFocusing) p.focusT = 0;
  // RECRUIT crew: every 7s a crew member hurls a bottle at the nearest enemy
  if (p.crew > 0) {
    p.crewT = (p.crewT || 0) - dt;
    if (p.crewT <= 0) {
      p.crewT = 7; const t = nearestEnemy(99);
      if (t) { fireProj({ x: p.px - (p.face || 1) * 2, y: 1.5, z: p.pz, vx: (t.px >= p.px ? 1 : -1) * 9, kind: 'bottle', dmg: Math.round(16 * p.dmgMult), fromPlayer: true, color: 0x7CFC00, label: 'CREW' }); sfx('whoosh', 0.5, false, 1.2); }
    }
  }
  // FOCUS hold detection (SFIV): hold HVY 0.45s to enter focus stance
  if (window.__focusDbg && hvyPressT) window.__focusDbg.push([Math.round(performance.now()-hvyPressT), state, player.busy, hvyFocusing]);
  if (hvyPressT && !hvyFocusing && performance.now() - hvyPressT > 450 && state === 'fight' && !missionOver && !ended && player.hp > 0 && player.busy <= 0) {
    hvyFocusing = true; player.focusT = 99; player.focusHit = false;
    playAnim(player, 'Melee_Unarmed_Idle', { ts: 0.5, fade: 0.1 });
    banner('FOCUS', 'spc'); sfx('uiclick', 0.7, false, 0.6);
  }
  // DASH STRIKE (Ruiner-inspired): the dodge IS a weapon — plow through an enemy once per dodge
  if (p.dodgeT > 0 && !p.dashStruck) {
    for (const e of enemies) {
      if (!e.dead && e.hp > 0 && Math.abs(e.px - p.px) < 1.3 && Math.abs(e.pz - p.pz) < 1.1) {
        p.dashStruck = true;
        landHit(e, Math.round(18 * p.dmgMult), 'DASH STRIKE', 0.05, 0.25, false, false);
        break;
      }
    }
  }
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
  if (p.airT > 0) { // jump physics (platform-aware)
    p.airT += dt; p.vy -= 22 * dt; p.py = (p.py || 0) + p.vy * dt;
    let ground = 0;
    if (p.vy <= 0) for (const pl of platforms) { // land on platform tops
      if (Math.abs(p.px - pl.x) < pl.w / 2 && Math.abs(p.pz - pl.z) < pl.d / 2 && p.py <= pl.top && p.py >= pl.top - 1.4) { ground = pl.top; break; }
    }
    if (p.py <= ground) { p.py = ground; p.airT = 0; p.vy = 0;
      burst(p.root.position.clone().add(new THREE.Vector3(0, 0.1, 0)), 8, 0x999999, 2);
      if (p.busy <= 0) playAnim(p, 'Melee_Unarmed_Idle', { loop: true });
    }
  } else if ((p.py || 0) > 0) { // walked off a platform -> fall
    let over = false;
    for (const pl of platforms) if (Math.abs(p.px - pl.x) < pl.w / 2 && Math.abs(p.pz - pl.z) < pl.d / 2) { over = true; break; }
    if (!over) { p.airT = 0.01; p.vy = 0; }
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
  } else if (p.busy <= 0 && p.dodgeT <= 0) {
    // OWNER 2026-10-07: face MOVEMENT direction while walking/running.
    // No more magnet-facing enemies — attacks snap to the enemy at press time
    // (faceNearestEnemy in doPunch/doHeavy/doBlitz/doGrapple/doSpecial).
    // Idle keeps current facing: never auto-snap.
    const spdNow2 = Math.hypot(mx, mz);
    if (spdNow2 > 0.6 && Math.abs(mx) > 0.25) {
      p.face = mx > 0 ? 1 : -1;
      p.root.rotation.y = p.face > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
  } else if (p.busy > 0) {
    // mid-action: track nearest enemy so strikes aim correctly
    const tgt = nearestEnemy(99);
    if (tgt) { p.face = tgt.px >= p.px ? 1 : -1; p.root.rotation.y = p.face > 0 ? Math.PI / 2 : -Math.PI / 2; }
  }
  const spdNow = Math.hypot(mx, mz);
  const wantRun = spdNow > 0.6 && p.dodgeT <= 0 && p.busy <= 0 && (p.airT || 0) <= 0 && (p.knockT || 0) <= 0;
  if (wantRun) {
    // OWNER 2026-10-07: run anim starts IMMEDIATELY on movement and its speed
    // tracks velocity every frame — no sliding, no foot-skate.
    const ts = Math.min(1.9, Math.max(0.75, spdNow / 4.4));
    if (!p.animMove) { p.animMove = true; playAnim(p, 'Running_A', { loop: true, ts }); }
    else if (p.cur) p.cur.timeScale = ts;
  } else if (p.animMove && p.dodgeT <= 0 && p.busy <= 0) {
    p.animMove = false;
    playAnim(p, 'Melee_Unarmed_Idle', { loop: true });
  }
  syncPos(p);
  if (typeof playerKey !== 'undefined') playerKey.position.set(p.px, 3.2, p.pz + 1.6);
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
let hvyPressT = 0, hvyFocusing = false; // FOCUS (SFIV) hold-to-charge state
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
function doMotionSpecial(kind, free) {
  const fd = fighterDef();
  inputHist.length = 0;
  if (!free) {
    if (player.energy < 25) { const sp = screenPos(player.root.position); popText('NOT ENOUGH ENERGY', 'bad', sp.x, sp.y - 60); sfx(140, 0.15, 'square', 0.3); return; }
    player.energy = Math.max(0, player.energy - 25); setHud();
  }
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
      vfxSpecial(player.root.position.clone().add(new THREE.Vector3(0, 1.1, 0)), // wave 17: signature special VFX
        (pr.sigkind === 'fireball' || pr.sigkind === 'orb' || pr.sigkind === 'groundwave') ? 'flame' : 'magic');
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
  vfxSpecial(new THREE.Vector3(player.px + player.face * 1.5, 1.2, player.pz), 'both'); // wave 17: MEGA SUPER
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
  $('pname').textContent = fd.name + (player.stance && fd.stance ? ' — ' + fd.stance.name : '');
  const e = (bossRef && bossRef.hp > 0) ? bossRef : nearestEnemy(99);
  if (e) { $('ehp').style.width = Math.max(0, e.hp / e.maxHp * 100) + '%'; $('ename').textContent = e.name; }
  else { $('ehp').style.width = '0%'; $('ename').textContent = ''; }
  $('cash').textContent = 'CASH: $' + (save.cash + cashRun);
  $('combo').style.opacity = combo >= 2 ? 1 : 0;
  $('combo').textContent = combo + ' HIT COMBO';
  const sr2 = $('styleRank');
  if (sr2) {
    sr2.style.opacity = styleRank >= 2 && combo >= 3 ? 1 : 0;
    sr2.textContent = STYLE_RANKS[styleRank] + ' STYLE';
    sr2.style.color = STYLE_COLORS[styleRank];
  }
  // LAST STAND edge glow persists while dangerous
  const lse = $('lsEdge');
  if (lse) lse.style.opacity = (player.hp > 0 && player.hp < player.maxHp * 0.3) ? '1' : '0';
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
  frame(Math.min(clock.getDelta(), 0.05), true);
}
function frame(dt, doRender = true) {
  const RR = () => { if (doRender) renderer.render(scene, camera); };
  if (paused) { RR(); return; }
  if (cine) { updateCine(dt); updateFx(dt); updateProjs(dt); RR(); return; }
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
    if (styleT > 0 && (styleT -= dt) <= 0) { styleRank = 0; styleHist.length = 0; } // style rank decays
    if ((save.up_regen || 0) > 0 && player.hp > 0 && player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + (save.up_regen * 0.5) * dt); // REGEN: +1 HP/2s/lvl
    }
    if (gameTime > 2 && !save.seenHint) hint(false);
    if (mission.nodeBless && !mission.blessOffered && isFinite(mission.len) && player.px > mission.len * 0.5) {
      mission.blessOffered = true; offerMidBlessing();
    }
    updatePickups(dt);
    updateTagSpots(dt); // JET SET RADIO: tag-spot glow + spray channel
    updateMascot(dt); // CORNER-CREW MASCOTS: follow + perks
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
// ---------- arena dressing (wave 6): Kenney CC0 props merged into streetParts ----------
const ARENA_PROPS = [
  ['props/k_cone.glb', 'k_cone'], ['props/k_barrier.glb', 'k_barrier'],
  ['props/k_fence.glb', 'k_fence'], ['props/k_lamppost.glb', 'k_lamppost'],
  ['props/k_chair.glb', 'k_chair'], ['props/k_table.glb', 'k_table'],
  ['props/k_trafficone.glb', 'k_trafficone'], ['props/k_tire.glb', 'k_tire'],
];
async function loadArenaProps() {
  for (const [file, key] of ARENA_PROPS) {
    try {
      const g = await parse(file);
      const grp = new THREE.Group();
      while (g.scene.children.length) grp.add(g.scene.children[0]);
      grp.name = key;
      streetParts[key] = grp;
    } catch (e) { T.errors.push('prop:' + key + ':' + String(e && e.message || e).slice(0, 80)); }
  }
}
async function boot() {
  loadSave();
  const [fg, am, ag, amv, st, rd, ix] = await Promise.all(['fighter.glb', 'anim_melee.glb', 'anim_general.glb', 'anim_move.glb', 'street.glb', 'roads.glb', 'industrial.glb'].map(parse));
  for (const g of [am, ag, amv]) for (const c of g.animations) clips[c.name] = c;
  fighterTemplate = fg.scene;
  const names = new Set(); fighterTemplate.traverse((o) => names.add(o.name));
  for (const c of Object.values(clips)) c.tracks = c.tracks.filter((t) => names.has(t.name.split('.')[0]));
  // texture variants: capture the GLB's embedded map as 'original', decode patchwork PNG
  fighterTemplate.traverse((o) => { if (o.isMesh && o.material && o.material.map && !texObjs.original) texObjs.original = o.material.map; });
  await loadTexVariants();
  await loadVfxTex(); // wave 17: Kenney Particle Pack billboard sprites (TIER 6 item 25)
  const box = new THREE.Box3().setFromObject(fighterTemplate); fighterHeight = box.max.y - box.min.y;
  const s = 1.8 / fighterHeight; fighterTemplate.scale.setScalar(s); fighterHeight = 1.8;
  await loadPartTemplates(); // species head attachments (pumpkin, masks...)
  await loadCreatureTemplates(); // whole-body species (zombie, demon, spider, dragon)
  streetParts = {}; st.scene.children.slice().forEach((c) => { streetParts[c.name] = c; });
  await loadArenaProps(); // Kenney CC0 arena dressing
  roadParts = {}; rd.scene.children.slice().forEach((c) => { roadParts[c.name] = c; });
  indParts = {}; ix.scene.children.slice().forEach((c) => { indParts[c.name] = c; });
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
  pickupDbg: () => pickups.map((p) => ({ type: p.type, px: +p.px.toFixed(2), pz: +p.pz.toFixed(2) })),
  projDbg: () => projs.map((p) => ({ x: +p.x.toFixed(2), y: +p.y.toFixed(2), vx: +p.vx.toFixed(2), kind: p.kind, life: +p.life.toFixed(2) })),
  simDbg: () => ({ hs: +hitstop.toFixed(3), sm: slowmo, smT: +slowmoT.toFixed(3), st: state }),
  unpause: () => setPaused(false),
  freeze: (on) => { window.__cdfreeze = !!on; },
  spawnBoss: (id) => { if (player) return spawnBoss(id || 'kingpin', player.px + 6); },
  spawnFam: (famId) => { if (player) return spawnEnemy(famId, 0, player.px + 3, 0); },
  sigChance: (v) => { window.__cdSigChance = v; },
  playerDbg: () => player ? { busy: +player.busy.toFixed(2), stance: player.stance||0, hp: Math.round(player.hp), state, fid: fighterDef().id, hasFin: !!fighterDef().stanceFin, face: player.face, animMove: !!player.animMove, animTs: player.cur ? +player.cur.timeScale.toFixed(2) : 0, px: +player.px.toFixed(2) } : null,
  fireStanceFin: (fid) => { const fd = FIGHTERS.find(f => f.id === fid); if (fd && fd.stanceFin && player) { player.stance = 1; doStanceFin(fd); return fd.stanceFin.kind; } return null; },
  forceStance: () => { if (player && player.stance !== 1) doStance(); return true; },
  forceBossSig: () => { if (bossRef) { bossRef.pat = 'sig'; bossRef.ai = 'windup'; bossRef.windup = 0.01; } },
  spawnBoss: (id, bx) => spawnBoss(id, bx == null ? (player ? player.px + 6 : 10) : bx),
  layoutInfo: () => ({ platforms: platforms.length, destruct: destructibles.length, colliders: colliders.length }),
  forceFoeSig: () => { const e = enemies.find(x => x.hp > 0 && !x.boss); if (e) { e.ai = 'windup'; e.windup = 0.01; e.sigUse = !!e.sig; } },
  clearFoes: () => { for (const e of enemies.slice()) { removeFighter(e); const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1); } bossRef = null; },
  healPlayer: () => { if (player) { player.hp = player.maxHp || 100; setHud(); } },
  esigLog: () => T.esig || {}, bsigLog: () => T.bsig || {},
  showMission: () => showMission(),
  dbgBlitz: () => { doBlitz(); return player.blitzCD; },
  dbgHurt: (d) => hurtPlayer(d),
  dbgDodgeT: (v) => { if (player) player.dodgeT = v; return player.dodgeT; },
  dbgEvents: () => T.events.map((e) => e.name),
  dbgPlayer: () => player ? { hp: player.hp, energy: Math.round(player.energy), px: +player.px.toFixed(2), witchCD: +(player.witchCD||0).toFixed(2), blitzCD: +(player.blitzCD||0).toFixed(2) } : null,
  dbgBoss: (id) => { const b = bossDef(id); return b ? { name: b.name, hp: b.hp, proc: !!b.proc, sig: b.sig ? b.sig.name : null } : null; },
  seasonFams: () => { const s = activeSeason(); return s ? s.fams : []; },
  dbgBless: (ids) => { save.blessings = ids; writeSave(); return { fx: blessFx(), duo: blessDuo() ? blessDuo().name : null }; },
  dbgGear: (inv, tier, eq) => { save.gearInv = inv; save.gearTier = tier; save.gearEq = eq; writeSave(); return gearFx(); },
  showSelect: () => showSelect(),
  forceFoeSigBy: (famId) => { const e = enemies.find(x => x.hp > 0 && x.famId === famId); if (e) { e.ai = 'windup'; e.windup = 0.01; e.sigUse = !!e.sig; } return !!e; },
  // wave-5 batch 2 debug hooks (harvest mechanics)
  dbgRecruit: () => { if (player) { player.crew = (player.crew || 0) + 1; player.crewT = 0.1; } return player ? player.crew : 0; },
  dbgRadical: () => { if (player) { player.energy = energyMax(); player.busy = 0; doTaunt(); } return player ? { rad: +(player.radicalT || 0).toFixed(1), dmg: +player.dmgMult.toFixed(2), base: +player.baseDmgMult.toFixed(2) } : null; },
  dbgFocusHold: () => { hvyPressT = performance.now() - 500; return true; },
  dbgFocusWhy: () => ({ pressT: Math.round(hvyPressT), now: Math.round(performance.now()),
    state, missionOver, ended, busy: player ? player.busy : 'noplayer', hp: player ? player.hp : 0,
    focusing: hvyFocusing, focusT: player ? +(player.focusT || 0).toFixed(1) : 0 }),
  dbgFocusState: () => ({ focusing: hvyFocusing, focusT: player ? +(player.focusT || 0).toFixed(1) : 0 }),
  dbgReleaseFocus: () => { if (hvyFocusing) releaseFocus(); return true; },
  dbgBurst: () => { if (player) { player.jugN = 3; player.jugT = 2.5; player.energy = 100; player.busy = 0; stick.dy = -1; } return true; },
  dbgStickUp: (v) => { stick.dy = v ? -1 : 0; },
  dbgCrew: () => player ? { crew: player.crew || 0, scouts: save.scouts || {} } : null,
  // infinite character + customization debug hooks (owner 2026-10-07)
  dbgScout: () => { const s = scoutNew(); return { id: s.id, name: s.name, arch: s.arch, scale: s.scale, parts: Object.values(s.parts).filter((p) => p !== 'none'), zones: s.zones }; },
  scoutInfo: () => (save.scoutRoster || []).map((s) => ({ id: s.id, name: s.name, arch: s.arch })),
  scoutCost: () => scoutCost(),
  dbgParts: () => player ? (player.partIds || []).slice() : null,
  dbgShowcaseParts: () => showcase ? (showcase.partIds || []).slice() : null,
  dbgCustomize: () => { openCustomize(); return customizing; },
  dbgCloseCustomize: () => { closeCustomize(); return customizing; },
  dbgSetPart: (slot, pid) => { setPart(save.selected, slot, pid); return (showcase ? showcase.partIds : []).slice(); },
  dbgSetZone: (zone, c) => { setZone(save.selected, zone, c); return fighterZones(save.selected); },
  dbgSetFighter: (id) => { const d = fighterDef(id); if (d && d.id === id) { save.selected = id; writeSave(); refreshShowcase(); } return fighterDef().id; },
  dbgCash: (v) => { save.cash = v; writeSave(); renderMeta(); return save.cash; },
  dbgRep: (r) => { save.rep = r; writeSave(); const d = effDiff(); return { hpMul: +d.hpMul.toFixed(2), dmgMul: +d.dmgMul.toFixed(2), cash: +repMult().cash.toFixed(2) }; },
  spawnCreature: (cid) => { if (player) { const e = makeCreatureRaw(cid, 0xffffff, player.px + 3, -Math.PI / 2, 1); if (e) { e.maxHp = e.hp = 200; e.dmgMult = 1; e.spd = 1.5; e.px = player.px + 3; e.pz = 0; e.ai = 'walk'; e.aiT = 1; syncPos(e); playAnim(e, 'Running_A', { loop: true }); enemies.push(e); } return e; } },
  hurt: (n) => { if (player) hurtPlayer(n); },
  doJump, doPunch, doHeavy, doSpecial, doTaunt, doDesperation, doStance, doTech, doGrapple, doDodge,
  swingDbg: () => ({ swing: T.swingSfx || 0, whiff: T.whiffSfx || 0 }), // S2 swing-whoosh tranche (owner 2026-10-07)
  swingClear: () => { T.swingSfx = 0; T.whiffSfx = 0; },
  audioDbg: (ks) => (ks || []).map(k => ({ k, ok: !!(sbuf[k] && sbuf[k] instanceof AudioBuffer) })), // S2: prove swing SFX decoded
  vfxDbg: () => ({ // wave 17 VFX tranche (owner 2026-10-06): per-category burst counters + texture decode proof
    ko: T.vfxKo || 0, hit: T.vfxHit || 0, spc: T.vfxSpc || 0, dust: T.vfxDust || 0,
    tex: VFXTEX.slice(),
    texOk: VFXTEX.filter((n) => !!(vfxTex[n] && vfxTex[n].image && vfxTex[n].image.width)).length,
    live: vfxLive.length, pool: vfxPool.length }),
  vfxClear: () => { T.vfxKo = T.vfxHit = T.vfxSpc = T.vfxDust = 0; return true; },
  dodgeTest: () => { // S3 dodge SFX tranche (owner 2026-10-07): verify dodge fires SFX hook + i-frames
    if (!player || state !== 'fight') return { ok: 0, why: 'no-fight' };
    player.dodgeCD = 0; player.busy = 0; lastDodgeTap = 0; // single tap: dodge, not double-tap desperation
    const before = T.dodgeSfx || 0;
    try { doDodge(); } catch (err) { return { ok: 0, why: 'doDodge-threw' }; }
    return { ok: 1, sfxFired: (T.dodgeSfx || 0) > before, iFrames: player.dodgeT > 0 };
  },
  antiInfTest: () => {
    const e = enemies.find(x => x.hp > 0 && !x.boss);
    if (!e) return { ok: 0, why: 'no-enemy' };
    e.airborne = true; e.vy = 5; e.hp = Math.max(e.hp, 500);
    const before = T.antiinf || 0;
    for (let i = 0; i < 3; i++) { try { landHit(e, 5, 'TESTJAB', 0.01, 0.1, false, false); } catch (err) { return { ok: 0, why: 'landHit-threw' }; } }
    return { ok: 1, fired: (T.antiinf || 0) > before, airborne: e.airborne };
  },
  edgeBounceTest: () => { // F8 edge-bounce tranche (owner 2026-10-07, wave 9): launch a foe at
    // the left wall and step airborne physics until it bounces — velocity must reflect (+x)
    // and the enemy must stay clamped in-bounds, still airborne.
    const e = enemies.find(x => x.hp > 0 && !x.boss);
    if (!e) return { ok: 0, why: 'no-enemy' };
    e.hp = Math.max(e.hp, 500);
    const b0 = T.bounces || 0;
    try {
      e.px = 1.2; e.pz = 0; e.root.position.set(1.2, 0, 0);
      e.airborne = true; e.vy = 5.2; e.ai = 'launched';
      e.kvx = -30; e.kvz = 0; // straight at the left wall
      let bounced = false, frames = 0;
      while (!bounced && frames < 600 && e.airborne) {
        enemyAI(e, 1 / 60); frames++;
        if ((T.bounces || 0) > b0) bounced = true;
        if (e.root.position.y <= 0 && !e.airborne) break; // landed before bounce (fail path)
      }
      return { ok: 1, bounced, frames, bouncesDelta: (T.bounces || 0) - b0,
        stillAirborne: e.airborne, px: +e.px.toFixed(2), kvx: +(e.kvx || 0).toFixed(2) };
    } catch (err) { return { ok: 0, why: 'threw: ' + err.message.slice(0, 80) }; }
  },
  launchFoeAt: (px, pz, kvx, kvz) => { // wave 9: live visual drill setup (launch a foe toward a wall)
    const e = enemies.find(x => x.hp > 0 && !x.boss);
    if (!e) return { ok: 0, why: 'no-enemy' };
    e.hp = Math.max(e.hp, 500);
    e.px = px; e.pz = pz; e.root.position.set(px, 0, pz);
    e.airborne = true; e.vy = 5.2; e.ai = 'launched'; e.kvx = kvx; e.kvz = kvz;
    return { ok: 1 };
  },
  foeAir: () => { // wave 9: live foe airborne/knock-velocity state
    const e = enemies.find(x => x.hp > 0 && !x.boss);
    return e ? { air: e.airborne, kvx: +(e.kvx || 0).toFixed(2), kvz: +(e.kvz || 0).toFixed(2),
      px: +e.px.toFixed(2), y: +e.root.position.y.toFixed(2), hp: Math.round(e.hp) } : null;
  },
  tagTest: () => {
    if (!tagSpots.length) return { ok: 0, why: 'no-spots' };
    const s = tagSpots[0];
    player.px = s.px; player.pz = s.pz; syncPos(player);
    player.busy = 0;
    doTaunt();
    return { ok: 1, spraying: player.sprayT > 0 };
  },
  tagDbg: () => ({
    sprayT: player ? player.sprayT : 'no-player',
    spots: tagSpots.length,
    busy: player ? player.busy : 0,
    state: typeof state !== 'undefined' ? state : '?'
  }),
  tagFastFwd: () => { if (player && player.sprayT > 0) { player.sprayT = 0.05; return { ok: 1 }; } return { ok: 0 }; },
  mascotTest: (id) => {
    save.mascotsUnlocked = save.mascotsUnlocked || [];
    if (!save.mascotsUnlocked.includes(id)) save.mascotsUnlocked.push(id);
    save.mascot = id; writeSave(); spawnMascot();
    return { ok: 1, spawned: !!mascotMesh, id: mascotId };
  },
  dojoTest: (id) => {
    save.dojoMoves = save.dojoMoves || [];
    if (!save.dojoMoves.includes(id)) save.dojoMoves.push(id);
    player.energy = 100; player.busy = 0;
    const before = T.dojomove || 0;
    const ok = doDojoMove(id);
    return { ok, fired: (T.dojomove || 0) > before };
  },
  onehitTest: () => {
    mission.mods = ['onehit'];
    const e = enemies.find(x => x.hp > 0 && !x.boss);
    if (!e) return { ok: 0, why: 'no-enemy' };
    const ehp = e.hp;
    try { landHit(e, 5, 'TESTJAB', 0.01, 0.1, false, false); } catch (err) { return { ok: 0, why: 'threw' }; }
    const php = player.hp;
    try { hurtPlayer(5); } catch (err) { return { ok: 0, why: 'hurt-threw' }; }
    mission.mods = mission.mods.filter(m => m !== 'onehit');
    return { ok: 1, enemyKilled: e.hp <= 0, wasHp: ehp, playerHit: player.hp < php };
  },
  grappleTest: () => {
    const e = enemies.find(x => x.hp > 0 && !x.boss);
    if (!e) return { ok: 0, why: 'no-enemy' };
    e.stagger = 1.2; e.hp = Math.max(e.hp, 500);
    player.px = e.px - 1; player.pz = e.pz; syncPos(player); player.busy = 0;
    const before = T.grapples || 0;
    doGrapple();
    return { ok: 1, fired: (T.grapples || 0) > before };
  },
  walkTo: (x) => { if (player) { player.px = x; } return true; },
  procBossInfo: () => { try { const a = procBoss(3); return { ok: 1, name: a && a.name, pats: a && a.patterns, typeof_pb: typeof procBoss }; } catch (e) { return { ok: 0, err: String(e && e.message || e).slice(0, 120) }; } },
  muts: () => ({ tier: endlessTier || 0, muts: (endlessMuts || []).slice() }),
  propKeys: () => Object.keys(streetParts).filter(k => k.startsWith('k_')),
  sfin: () => (window.__playable && window.__playable.sfin) || {},
  stanceInfo: () => player ? { stance: player.stance || 0, name: (player.stance && fighterDef().stance) ? fighterDef().stance.name : 'BALANCED', dmg: +player.dmgMult.toFixed(2), spd: +player.spd.toFixed(2) } : null,
  step: (dt) => { playerUpdate(dt || 1 / 60); }, // drive the real physics deterministically
  estep: (dt) => { for (const e of enemies.slice()) enemyAI(e, dt || 1 / 60); }, // drive enemy AI deterministically (test only)
  dbg: () => player ? { st: state, mo: missionOver, en: ended, hp: player.hp, busy: player.busy, airT: player.airT, py: player.py, vy: player.vy, frames: dbgFrames } : null,
  setStick: (dx, dy) => { stick.dx = dx; stick.dy = dy; },
  playerPos: () => player ? { px: +player.px.toFixed(2), pz: +player.pz.toFixed(2), py: +(player.py || 0).toFixed(2), airT: +(player.airT || 0).toFixed(2) } : null,
  props: () => destructibles.map((d) => ({ name: d.name, px: +d.px.toFixed(1), pz: +d.pz.toFixed(1), hp: d.hp, minY: +(d.mesh.position.y).toFixed(3) })),
  colliders: () => colliders.map((c) => ({ x: +c.x.toFixed(1), z: +c.z.toFixed(1), r: +c.r.toFixed(2), dead: c.dead })),
  pickups: () => pickups.map((p) => p.type),
  smash: (i) => { const d = destructibles[i]; if (d) destroyDestructible(d); },
  setDiff: (id) => { save.difficulty = id; writeSave(); },
  zeroBusy: () => { if (player) player.busy = 0; },
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
  setFighter: (id) => { const d = fighterDef(id); if (d && d.id === id) { save.selected = id; writeSave(); } },
  qcfKind: () => fighterDef().qcf.sigkind,
  texName: () => texVar(save.selected).id,
  setTex: (id) => { save.tex[save.selected] = id; writeSave(); refreshShowcase(); },
};

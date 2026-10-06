// Concrete Dragon — full 3D street brawler. Orion Enterprises LLC.
// Three.js, single self-contained HTML. All art/audio CC0 (see CREDITS in the build).
// Foundation: the 3D fight core (fighters, combat feel, street). Systems ported
// from the M1 design spec: character select, cash/upgrades, localStorage save,
// endless scaling waves, combo scoring. Style-not-power: no pay-to-win, ever.
//
// IMPACT PACING (owner tuning 2026-10-06): light hits stay SNAPPY — tiny hit-stop
// only (jab 30ms / cross 40ms), NO slow-mo on normal hits. Slow-mo + long
// hit-stop are reserved for big moments: KO blows, counters, heavy kicks.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const CFG = Object.assign({
  idleHintSeconds: 3,  // re-show tutorial hand after this much idle
}, window.GAME_CONFIG || {});

const $ = (id) => document.getElementById(id);
const b64ToBuf = (b64) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
const A = window.__ASSETS;

// ---------- telemetry (debug/QA) ----------
const T = window.__playable = { state: 'loading', taps: 0, hits: 0, counters: 0, kos: 0, events: [], errors: [] };
const ev = (name, data) => { T.events.push({ t: +performance.now().toFixed(0), name, ...data }); };

// ---------- save (localStorage, ported from M1 SaveData) ----------
const SAVE_KEY = 'concretedragon.save.v1';
const save = { cash: 0, up_power: 0, up_tough: 0, up_hustle: 0, wins: 0, losses: 0, best_wave: 0, selected: 'kidblue', skins: {}, seenHint: false };
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && typeof s === 'object') for (const k of Object.keys(save)) if (k in s) save[k] = s[k];
  } catch (e) { /* fresh save */ }
  if (!save.skins || typeof save.skins !== 'object') save.skins = {};
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
const upCost = (lvl) => 100 * (lvl + 1);
const powerMult = () => 1 + save.up_power * 0.12;
const toughBonus = () => save.up_tough * 12;
const hustleMult = () => 1 + save.up_hustle * 0.15;

// ---------- data: roster, skins, upgrades (data-driven) ----------
const FIGHTERS = [
  { id: 'kidblue', name: 'KID BLUE', desc: 'Balanced brawler. Big heart, bigger hands.', hp: 100, dmg: 1.0, spd: 1.0 },
  { id: 'ghost', name: 'GHOST', desc: 'Fast striker. Blink and you lose.', hp: 85, dmg: 0.9, spd: 1.25 },
  { id: 'brick', name: 'BRICK', desc: 'Walking wall. Hits like rent day.', hp: 135, dmg: 1.25, spd: 0.85 },
];
const SKINS = { // style only — zero power. New packs drop in here.
  kidblue: [
    { id: 'street', name: 'Street Blue', tint: 0x4fd1ff },
    { id: 'noir', name: 'Noir', tint: 0x2b2b38 },
    { id: 'gold', name: 'Champion Gold', tint: 0xffd166 },
  ],
  ghost: [
    { id: 'street', name: 'Ghost Mint', tint: 0x4dff88 },
    { id: 'noir', name: 'Noir', tint: 0x2b2b38 },
    { id: 'volt', name: 'Volt', tint: 0x7af0ff },
  ],
  brick: [
    { id: 'street', name: 'Brick', tint: 0xff8c42 },
    { id: 'noir', name: 'Noir', tint: 0x2b2b38 },
    { id: 'blood', name: 'Bloodline', tint: 0xc1121f },
  ],
};
const UPS = [
  { key: 'up_power', name: 'POWER', desc: '+12% damage' },
  { key: 'up_tough', name: 'TOUGH', desc: '+12 max HP' },
  { key: 'up_hustle', name: 'HUSTLE', desc: '+15% cash' },
];
const fighterDef = () => FIGHTERS.find((f) => f.id === save.selected) || FIGHTERS[0];
const skinTint = (fid) => {
  const list = SKINS[fid] || SKINS.kidblue;
  const s = list.find((x) => x.id === save.skins[fid]) || list[0];
  return s.tint;
};
// Endless enemy generator — street names in the 3D demo's style. Boss every 5th wave.
function waveSpec(w) {
  if (w % 5 === 0) return { name: 'KINGPIN', tint: 0xffb03d, hp: 130 + w * 22, dmg: 1.25 + w * 0.05, scale: 1.35, boss: true };
  const cycle = [
    { name: 'STREET THUG', tint: 0xff5a5a, hp: 70, dmg: 1.0, scale: 1.0 },
    { name: 'BIG RICO', tint: 0x9a6bff, hp: 100, dmg: 1.1, scale: 1.15 },
    { name: 'JABBER', tint: 0x7af0ff, hp: 60, dmg: 0.9, scale: 0.95 },
    { name: 'HEAVY D', tint: 0xff8c42, hp: 105, dmg: 1.2, scale: 1.18 },
  ];
  const b = cycle[(w - 1) % cycle.length];
  return { name: b.name, tint: b.tint, hp: Math.round(b.hp + w * 8), dmg: b.dmg + w * 0.04, scale: b.scale, boss: false };
}

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
scene.background = new THREE.Color(0x150f2a);
scene.fog = new THREE.Fog(0x150f2a, 9, 26);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
scene.add(new THREE.HemisphereLight(0x8fa8ff, 0x2a1830, 1.25));
const moon = new THREE.DirectionalLight(0xbfd0ff, 1.4); moon.position.set(-4, 9, 6); moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(moon);
const rim = new THREE.DirectionalLight(0xff4fd8, 1.6); rim.position.set(3, 3, -5); scene.add(rim);
const lampL = new THREE.PointLight(0xffa64d, 22, 9, 1.6); lampL.position.set(-3.2, 3.2, -1.2); scene.add(lampL);
const lampR = new THREE.PointLight(0x4de1ff, 18, 9, 1.6); lampR.position.set(3.4, 3.0, -1.2); scene.add(lampR);

const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const parse = (name) => new Promise((res, rej) => loader.parse(b64ToBuf(A[name]), '', res, rej));

// ---------- fighters ----------
const clips = {};
const fighters = [];
let fighterTemplate = null, fighterHeight = 1.8;
function makeFighter(tint, x, face, scale = 1) {
  const root = skClone(fighterTemplate);
  root.scale.multiplyScalar(scale);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.color = new THREE.Color(tint); } });
  root.position.set(x, 0, 0); root.rotation.y = face; scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const f = { root, mixer, cur: null, hp: 100, maxHp: 100, busy: 0, x, face, tint, sc: scale, dmgMult: 1 };
  mixer.addEventListener('finished', (e) => { if (e.action === f.cur && f.onDone) { const d = f.onDone; f.onDone = null; d(); } });
  fighters.push(f); return f;
}
function clearFighters() { for (const f of fighters) scene.remove(f.root); fighters.length = 0; }
function play(f, name, { loop = false, fade = 0.08, ts = 1, done = null, clamp = false } = {}) {
  const a = f.mixer.clipAction(clips[name]);
  a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = clamp || !loop; a.timeScale = ts;
  if (f.cur && f.cur !== a) a.crossFadeFrom(f.cur, fade, false);
  a.play(); f.cur = a; f.onDone = done || (loop ? null : () => play(f, 'Melee_Unarmed_Idle', { loop: true, fade: 0.15 }));
}

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
  const w = innerWidth, h = innerHeight;
  popText(txt, 'big ' + (cls || ''), w / 2, h * 0.3);
}
function screenPos(v) { const p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight }; }
function flash(color) { const f = $('flash'); f.style.background = color; f.style.opacity = 0.55; setTimeout(() => (f.style.opacity = 0), 60); }

// ---------- game state ----------
let player, enemy, wave = 0, state = 'loading';
let tStart = 0, lastTap = 0, combo = 0, comboT = 0, maxCombo = 0, atkIdx = 0, enemyTimer = 2.4, windup = 0, gameTime = 0;
let cashRun = 0, kills = 0, runStartWave = 1;
// [clip, timeScale, impact delay (s), dmg, label, hitstop (s), shake]
// PACING (owner 2026-10-06): light hits = tiny snap only, NO slow-mo. Slow-mo reserved for KO/counter/heavy.
const ATK = [
  ['Melee_Unarmed_Attack_Punch_A', 1.9, 0.16, 9, 'JAB', 0.03, 0.12],
  ['Melee_Unarmed_Attack_Punch_A', 2.1, 0.15, 10, 'CROSS', 0.04, 0.15],
  ['Melee_Unarmed_Attack_Kick', 1.7, 0.2, 15, 'KICK', 0.08, 0.25],
];

function setHud() {
  const fd = fighterDef();
  $('php').style.width = Math.max(0, player.hp / player.maxHp * 100) + '%';
  $('ehp').style.width = enemy ? Math.max(0, enemy.hp / enemy.maxHp * 100) + '%' : '0%';
  $('pname').textContent = fd.name;
  $('ename').textContent = enemy ? enemy.name : '';
  $('wave').textContent = state === 'fight' || state === 'ko' ? 'WAVE ' + wave : '';
  $('cash').textContent = 'CASH: $' + (save.cash + cashRun);
  $('combo').style.opacity = combo >= 2 ? 1 : 0; $('combo').textContent = combo + ' HIT COMBO';
}
function spawnPlayer() {
  const fd = fighterDef();
  player = makeFighter(skinTint(fd.id), -0.8, Math.PI / 2);
  player.maxHp = Math.round(fd.hp + toughBonus());
  player.hp = player.maxHp;
  player.dmgMult = fd.dmg * powerMult();
  player.spd = fd.spd;
  play(player, 'Melee_Unarmed_Idle', { loop: true });
}
function spawnEnemy() {
  const spec = waveSpec(wave);
  enemy = makeFighter(spec.tint, 5.5, -Math.PI / 2, spec.scale);
  Object.assign(enemy, { hp: spec.hp, maxHp: spec.hp, name: spec.name, dmgMult: spec.dmg, boss: !!spec.boss, entering: true });
  play(enemy, 'Running_A', { loop: true });
  state = 'enter'; setHud();
}
function nextWave() {
  wave++;
  save.best_wave = Math.max(save.best_wave, wave); writeSave();
  enemyTimer = Math.max(1.2, 2.6 - wave * 0.08);
  const spec = waveSpec(wave);
  banner(spec.boss ? 'BOSS: ' + spec.name : 'WAVE ' + wave);
  spawnEnemy();
}
function hint(on) { $('hint').style.opacity = on ? 1 : 0; }

// ---------- screens ----------
function el(tag, cls, html) { const d = document.createElement(tag); if (cls) d.className = cls; if (html !== undefined) d.innerHTML = html; return d; }
function hex(tint) { return '#' + tint.toString(16).padStart(6, '0'); }

function renderShop(into) {
  into.innerHTML = '';
  for (const u of UPS) {
    const lvl = save[u.key], cost = upCost(lvl);
    const box = el('div', 'shopItem');
    box.appendChild(el('div', 'un', `${u.name} <span style="font-size:11px;opacity:.7">Lv${lvl}</span>`));
    box.appendChild(el('div', 'ud', u.desc));
    const b = el('button', '', save.cash >= cost ? `$${cost}` : `$${cost}`);
    b.disabled = save.cash < cost;
    b.onclick = (e) => { e.stopPropagation(); if (save.cash < cost) return; save.cash -= cost; save[u.key]++; writeSave(); sfx('click', 0.8); renderShop(into); renderMeta(); };
    box.appendChild(b); into.appendChild(box);
  }
}
function renderMeta() {
  const m1 = $('metaLine'), m2 = $('metaLine2');
  const html = `CASH: <b>$${save.cash}</b> &nbsp;·&nbsp; WINS ${save.wins} &nbsp; LOSSES ${save.losses} &nbsp;·&nbsp; BEST WAVE ${save.best_wave}`;
  if (m1) m1.innerHTML = html;
  if (m2) m2.innerHTML = html;
}
function showSelect() {
  state = 'select';
  clearFighters();
  // preview fighter idling behind the cards
  player = makeFighter(skinTint(save.selected), -0.8, Math.PI / 2);
  player.maxHp = 1; player.hp = 1;
  play(player, 'Melee_Unarmed_Idle', { loop: true });
  enemy = null; setHud();
  $('wave').textContent = ''; $('cash').textContent = '';
  const cards = $('cards'); cards.innerHTML = '';
  for (const f of FIGHTERS) {
    const c = el('div', 'card' + (f.id === save.selected ? ' sel' : ''));
    c.appendChild(el('div', 'nm', f.name));
    const dot = el('div', 'dot'); dot.style.background = hex((SKINS[f.id].find((s) => s.id === save.skins[f.id]) || SKINS[f.id][0]).tint);
    c.insertBefore(dot, c.firstChild);
    c.appendChild(el('div', 'ds', f.desc));
    c.appendChild(el('div', 'st', `HP ${f.hp} · DMG ${Math.round(f.dmg * 100)}% · SPD ${Math.round(f.spd * 100)}%`));
    c.onclick = () => { save.selected = f.id; writeSave(); sfx('click', 0.7); showSelect(); };
    cards.appendChild(c);
  }
  const sr = $('skinsRow'); sr.querySelectorAll('.skinDot').forEach((d) => d.remove());
  for (const s of SKINS[save.selected] || SKINS.kidblue) {
    const d = el('div', 'skinDot' + ((save.skins[save.selected] || 'street') === s.id ? ' sel' : ''));
    d.style.background = hex(s.tint); d.title = s.name;
    d.onclick = () => { save.skins[save.selected] = s.id; writeSave(); sfx('click', 0.7); showSelect(); };
    sr.appendChild(d);
  }
  renderShop($('shopRow')); renderMeta();
  $('results').classList.add('hidden'); $('select').classList.remove('hidden');
}
function showResults() {
  state = 'results';
  const waveBonus = wave * 5;
  const total = cashRun + waveBonus;
  save.cash += total; save.losses++; save.streak = 0; writeSave();
  $('resTitle').textContent = 'KNOCKED OUT';
  $('resStats').innerHTML =
    `<div class="stat">REACHED <b>WAVE ${wave}</b></div>` +
    `<div class="stat"><b>${kills}</b> K.O.s &nbsp;·&nbsp; BEST COMBO <b>${maxCombo}</b></div>`;
  $('cashLines').innerHTML =
    `<div>Fight cash <b>+$${cashRun}</b></div><div>Wave bonus <b>+$${waveBonus}</b></div>` +
    `<div style="font-size:19px;margin-top:6px">TOTAL <b>+$${total}</b></div>`;
  renderShop($('shopRow2')); renderMeta();
  $('select').classList.add('hidden'); $('results').classList.remove('hidden');
  setHud();
}
function startFight() {
  clearFighters();
  $('select').classList.add('hidden'); $('results').classList.add('hidden');
  wave = 0; cashRun = 0; kills = 0; maxCombo = 0; combo = 0; atkIdx = 0;
  runStartWave = 1;
  spawnPlayer();
  nextWave();
  if (!save.seenHint) { hint(true); }
}

// ---------- combat ----------
function onTap() {
  if (state === 'loading' || state === 'select' || state === 'results') return;
  unlockAudio();
  T.taps++; lastTap = gameTime; hint(false);
  if (state === 'intro') { state = 'fight'; tStart = gameTime; ev('first_interaction'); sfx('bell', 0.6); save.seenHint = true; writeSave(); }
  if (state !== 'fight' || player.busy > 0 || !enemy || enemy.hp <= 0 || enemy.entering) return;
  const [clip, ts, delay, dmg, label, hs, sh] = ATK[atkIdx % ATK.length]; atkIdx++;
  player.busy = delay + 0.12;
  play(player, clip, { ts: ts * (player.spd || 1), fade: 0.05 });
  const countering = windup > 0;
  const finalDmg = Math.round(dmg * player.dmgMult * (countering ? 2 : 1));
  setTimeout(() => landHit(finalDmg, countering ? 'COUNTER!' : label, countering, countering ? 0.12 : hs, countering ? 0.35 : sh), delay * 1000);
}
function landHit(dmg, label, counter, hs, sh) {
  if (!enemy || enemy.hp <= 0 || state !== 'fight') return;
  T.hits++; if (counter) { T.counters++; windup = 0; enemyTimer = 2.6; $('warn').style.opacity = 0; }
  enemy.hp -= dmg; combo++; comboT = 1.2; maxCombo = Math.max(maxCombo, combo);
  const head = enemy.root.position.clone().add(new THREE.Vector3(-0.25, fighterHeight * 0.78 * enemy.sc, 0.15));
  burst(head, counter ? 30 : 16, counter ? 0x7af0ff : 0xffd27a, counter ? 6 : 4);
  shake = sh; hitstop = hs; // snappy: tiny freeze on light hits, bigger only for counter/heavy/KO
  sfx(['hit1', 'hit2', 'hit3'][Math.floor(Math.random() * 3)], 0.9, false, 0.9 + Math.random() * 0.2);
  const sp = screenPos(head); popText(counter ? 'COUNTER! -' + dmg : '-' + dmg, counter ? 'big' : '', sp.x, sp.y - 30);
  if (counter) flash('#7af0ff');
  enemy.root.position.x = Math.min(enemy.root.position.x + (counter ? 0.35 : 0.12), 2.2);
  if (enemy.hp <= 0) return ko();
  play(enemy, Math.random() < 0.5 ? 'Hit_A' : 'Hit_B', { ts: 1.4, fade: 0.04 });
  setHud();
}
function awardCash(base, pos, tag) {
  const amount = Math.max(1, Math.round(base * hustleMult()));
  cashRun += amount;
  const txt = tag ? tag + ' +$' + amount : '+$' + amount;
  const sp = pos ? screenPos(pos) : { x: innerWidth / 2, y: innerHeight * 0.45 };
  popText(txt, 'gold', sp.x + (Math.random() * 60 - 30), sp.y);
  sfx('click', 0.7, false, 1.3);
}
function ko() {
  T.kos++; ev('ko', { wave });
  save.wins++; writeSave();
  play(enemy, 'Death_A', { ts: 0.8, clamp: true, done: () => {} });
  slowmo = 0.3; slowmoT = 0.9; shake = 0.5; hitstop = 0.1; // KO = the big slow-mo moment (stays)
  sfx('bell', 0.8); flash('#ffffff');
  $('ko').classList.add('show'); setHud(); state = 'ko'; $('warn').style.opacity = 0; windup = 0;
  // cash: base scales with wave, combo bonus, bosses pay more
  const spec = waveSpec(wave);
  const base = spec.boss ? 40 + wave * 3 : 8 + wave * 2;
  const epos = enemy.root.position.clone();
  awardCash(base, epos);
  if (combo >= 5) awardCash(Math.min(combo, 20), epos.clone().add(new THREE.Vector3(0, 0.4, 0)), 'COMBO');
  // heal a little so runs keep rolling
  player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.12);
  setTimeout(() => {
    $('ko').classList.remove('show');
    scene.remove(enemy.root); fighters.splice(fighters.indexOf(enemy), 1);
    kills++; combo = 0; setHud();
    nextWave();
  }, 1700);
}
function enemyAttack() {
  if (!enemy || enemy.hp <= 0 || state !== 'fight') return;
  play(enemy, 'Melee_Unarmed_Attack_Punch_A', { ts: 1.6 });
  setTimeout(() => {
    if (!enemy || enemy.hp <= 0 || state !== 'fight') return;
    const dmg = Math.round(14 * (enemy.dmgMult || 1));
    player.hp -= dmg; combo = 0; shake = 0.3; hitstop = 0.05; flash('#ff2a2a'); sfx('hit2', 0.8, false, 0.7);
    play(player, 'Hit_A', { ts: 1.4 });
    const sp = screenPos(player.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 0.8, 0))); popText('-' + dmg, 'bad', sp.x, sp.y - 20);
    setHud();
    if (player.hp <= 0) {
      play(player, 'Death_A', { clamp: true, done: () => {} });
      state = 'ko';
      setTimeout(showResults, 1400);
    }
  }, 260);
}

// ---------- layout ----------
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  const portrait = h > w;
  camera.fov = portrait ? 50 : 38;
  camera.userData.base = portrait ? new THREE.Vector3(2.6, 2.5, 7.4) : new THREE.Vector3(1.0, 2.0, 6.2);
  camera.userData.look = new THREE.Vector3(0.05, portrait ? 1.75 : 1.15, 0);
  camera.updateProjectionMatrix();
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
  buildStreet(st.scene);
  resize(); $('loading').style.display = 'none';
  T.state = 'ready'; ev('loaded');
  showSelect();
  requestAnimationFrame(loop);
}
function buildStreet(src) {
  const parts = {}; src.children.slice().forEach((c) => { parts[c.name] = c; });
  const place = (name, x, z, ry = 0, sc = 1) => { const p = parts[name]; if (!p) return; const o = p.clone(); o.position.x = x; o.position.z = z; o.rotation.y = ry; o.scale.multiplyScalar(sc); o.traverse((m) => { if (m.isMesh) { m.receiveShadow = true; m.castShadow = true; } }); scene.add(o); return o; };
  const K = 2.2;
  const road = parts.road_straight; const rb = new THREE.Box3().setFromObject(road);
  const seg = (rb.max.z - rb.min.z) * K, rw = (rb.max.x - rb.min.x) * K;
  for (let i = -6; i <= 6; i++) place('road_straight', i * seg, 0.0, Math.PI / 2, K).position.y = -0.02 * K;
  const bl = ['building_C', 'building_E', 'building_B', 'building_G', 'building_D', 'building_F', 'building_H', 'building_A'];
  const curb = -rw / 2;
  let x = -12;
  for (let i = 0; x < 13 && i < 40; i++) {
    const n = bl[i % bl.length]; const b = new THREE.Box3().setFromObject(parts[n]); const w = Math.max(0.5, (b.max.x - b.min.x) * K);
    place(n, x + w / 2, curb - (b.max.z - b.min.z) * K / 2 - 0.3, 0, K); x += w + 0.05;
  }
  place('streetlight', -3.0, curb + 0.2, 0, K); place('streetlight', 3.4, curb + 0.2, 0, K);
  place('dumpster', -2.0, curb - 0.1, 0, K); place('trash_A', -1.1, curb + 0.1, 0.4, K); place('trash_B', 2.4, curb + 0.1, 0, K);
  place('firehydrant', 1.7, curb + 0.3, 0, K); place('box_A', -2.8, curb + 0.5, 0.3, K);
  place('car_taxi', -5.6, curb + 1.2, Math.PI / 2, K); place('car_police', 6.4, curb + 1.3, -Math.PI / 2, K);
  lampL.position.set(-3.0, 3.4, curb + 0.8); lampR.position.set(3.4, 3.2, curb + 0.8);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x2a2438, roughness: 1 })); g.rotation.x = -Math.PI / 2; g.position.y = -0.06; g.receiveShadow = true; scene.add(g);
}

const clock = new THREE.Clock(); let lowFx = false; const fpsAcc = [];
function loop() {
  requestAnimationFrame(loop);
  const _f0 = performance.now(); T.frames = (T.frames || 0) + 1;
  let dt = Math.min(clock.getDelta(), 0.05);
  if (paused) { renderer.render(scene, camera); return; }
  gameTime += dt;
  if (hitstop > 0) { hitstop -= dt; dt *= 0.05; }
  if (slowmoT > 0) { slowmoT -= dt; dt *= slowmo; }
  for (const f of fighters) { f.mixer.update(dt); if (f.busy > 0) f.busy -= dt; }

  if (enemy && enemy.entering) {
    enemy.root.position.x -= dt * 3.2;
    if (enemy.root.position.x <= 0.8) {
      enemy.root.position.x = 0.8; enemy.entering = false; play(enemy, 'Melee_Unarmed_Idle', { loop: true, fade: 0.2 });
      enemyTimer = Math.max(1.2, 2.6 - wave * 0.08);
      if (state === 'enter') { state = T.taps ? 'fight' : 'intro'; if (state === 'intro') hint(true); }
    }
  }
  if (enemy && !enemy.entering && enemy.hp > 0 && enemy.root.position.x > 0.8) enemy.root.position.x = Math.max(0.8, enemy.root.position.x - dt * 0.8);

  if (state === 'fight') {
    if (gameTime - lastTap > CFG.idleHintSeconds && !save.seenHint) hint(true);
    if (windup > 0) { windup -= dt; if (windup <= 0) { $('warn').style.opacity = 0; enemyAttack(); enemyTimer = Math.max(1.2, 2.6 - wave * 0.08) + Math.random() * 0.8; } }
    else if ((enemyTimer -= dt) <= 0) { windup = 0.75; $('warn').style.opacity = 1; ev('telegraph'); }
    if (comboT > 0 && (comboT -= dt) <= 0) { combo = 0; setHud(); }
  }
  if (enemy && windup > 0) { const p = screenPos(enemy.root.position.clone().add(new THREE.Vector3(0, fighterHeight * 1.12 * enemy.sc, 0))); const w = $('warn'); w.style.left = p.x + 'px'; w.style.top = p.y + 'px'; }
  updateFx(dt);
  const base = camera.userData.base, look = camera.userData.look;
  camera.position.set(base.x + (Math.random() - 0.5) * shake, base.y + (Math.random() - 0.5) * shake, base.z);
  camera.lookAt(look); shake *= Math.pow(0.002, dt);
  lampL.intensity = 22 + Math.sin(gameTime * 23) * (Math.random() < 0.03 ? 10 : 1);
  if (!lowFx) { fpsAcc.push(clock.elapsedTime); if (fpsAcc.length > 40) { const span = fpsAcc[fpsAcc.length - 1] - fpsAcc[fpsAcc.length - 41]; fpsAcc.shift(); if (span / 40 > 0.045) { lowFx = true; renderer.shadowMap.enabled = false; renderer.setPixelRatio(1); scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); ev('low_fx'); } } }
  renderer.render(scene, camera);
  T.state = state; T.frameMs = +(performance.now() - _f0).toFixed(1); T.drawCalls = renderer.info.render.calls; T.tris = renderer.info.render.triangles;
}

addEventListener('pointerdown', (e) => {
  if (e.target.closest && e.target.closest('button,.card,.skinDot,.shopItem')) return;
  onTap(e);
}, { passive: true });
addEventListener('resize', resize);
$('fightBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('click', 0.8); startFight(); });
$('againBtn').addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); sfx('click', 0.8); showSelect(); });
boot().catch((e) => { T.errors.push(String(e && e.stack || e)); console.error(e); });

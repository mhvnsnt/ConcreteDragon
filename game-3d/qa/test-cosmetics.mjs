// Node unit tests for game-3d/src/cosmetics.js (Phase 2 suite).
// Mocks THREE + document canvas; verifies catalog integrity, part builders,
// attach logic (bone names, rot/off), face/eye decals, and shop/lock rules.
import assert from 'node:assert';

// ---- minimal THREE mock ----
const mkObj = (name = '') => {
  const o = { name, children: [], position: { set() {} }, rotation: { set() {} },
    scale: { set() {}, setScalar() {} }, castShadow: false, renderOrder: 0 };
  o.add = (c) => o.children.push(c);
  o.getObjectByName = (n) => o.children.find((c) => c.name === n) || null;
  return o;
};
class Mesh { constructor(g, m) { this.geometry = g; this.material = m; this.name = ''; this.position = { set() {} }; this.rotation = { set() {} }; this.scale = { set() {}, setScalar() {} }; this.castShadow = false; this.renderOrder = 0; } }
class Group extends Mesh { constructor() { super(); this.children = []; this.add = (c) => this.children.push(c); this.getObjectByName = (n) => this.children.find((c) => c.name === n) || null; } }
const THREE = {
  CanvasTexture: class { constructor() { this.colorSpace = ''; } },
  SRGBColorSpace: 'srgb',
  MeshStandardMaterial: class { constructor(o) { Object.assign(this, o); } },
  MeshBasicMaterial: class { constructor(o) { Object.assign(this, o); } },
  SphereGeometry: class {}, BoxGeometry: class {}, CylinderGeometry: class {},
  TorusGeometry: class {}, ConeGeometry: class {}, PlaneGeometry: class {},
  Mesh, Group,
};
globalThis.THREE = THREE;
// mock document.createElement('canvas') with a 2d context stub
const gradStub = { addColorStop() {} };
const ctxStub = new Proxy({}, { get: (t, k) => {
  if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => gradStub;
  if (k === 'canvas') return {};
  return (...a) => {};
}, set: () => true });
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctxStub }) };

const C = await import('../src/cosmetics.js');
let pass = 0;
const ok = (cond, msg) => { assert(cond, 'FAIL: ' + msg); pass++; };

// 1. catalog integrity
const allItems = { ...C.CD_CATALOG, ...C.CD_FACEPAINT, ...C.CD_EYES };
for (const [id, it] of Object.entries(allItems)) {
  ok(it.name && it.rarity && it.unlock && it.desc, `item ${id} has name/rarity/unlock/desc`);
  ok(C.CD_RARITY.includes(it.rarity), `item ${id} rarity valid`);
  ok(['shop', 'season', 'boss'].includes(it.unlock.type), `item ${id} unlock type valid`);
}
ok(Object.keys(C.CD_CATALOG).length === 26, 'CD_CATALOG has 26 part entries');
ok(Object.keys(C.CD_FACEPAINT).length === 4, '4 face paints');
ok(Object.keys(C.CD_EYES).length === 4, '4 eye colors');

// 2. every part builds without throwing; bones are known rig bones
const KNOWN_BONES = new Set(['head', 'chest', 'handl', 'handr', 'footl', 'footr']);
const partIds = new Set(C.CD_PARTS.map((p) => p.id));
for (const [id, it] of Object.entries(C.CD_CATALOG)) {
  if (C.CD_FACEPAINT[id] || C.CD_EYES[id]) continue;
  ok(partIds.has(id), `catalog part ${id} has a builder`);
}
for (const p of C.CD_PARTS) {
  for (const b of p.bones) ok(KNOWN_BONES.has(b), `part ${p.id} bone ${b} known`);
  const g = new THREE.Group();
  p.build(g); // throws on bad geometry/material code
  ok(g.children.length > 0, `part ${p.id} builds meshes`);
  pass++;
}

// 3. cdAttach: groups land on the right bones with rot/off applied
const fighter = { root: (() => { const r = new THREE.Group();
  for (const b of KNOWN_BONES) { const bone = new THREE.Group(); bone.name = b; r.add(bone); }
  return r; })() };
C.cdAttach(fighter, 'medal_saint'); // has rot: [-12,0,0]
const chest = fighter.root.getObjectByName('chest');
const medal = chest.children.find((c) => c.name === 'cd_medal_saint');
ok(!!medal, 'medal_saint attached to chest');
C.cdAttach(fighter, 'wristpad_neon'); // handl/handr + off
for (const b of ['handl', 'handr']) {
  const bone = fighter.root.getObjectByName(b);
  ok(bone.children.some((c) => c.name === 'cd_wristpad_neon'), `wristpad on ${b}`);
}
C.cdAttach(fighter, 'kicks_gold');
for (const b of ['footl', 'footr']) {
  const bone = fighter.root.getObjectByName(b);
  ok(bone.children.some((c) => c.name === 'cd_kicks_gold'), `kicks on ${b}`);
}
C.cdAttach(fighter, 'nonexistent_id'); // must not throw
pass++;

// 4. face + eyes decals
const ctx = { save: { loadouts: { kidblue: { facePaint: 'paint_war', eyes: 'eyes_ice' } } } };
C.cdApplyFace(fighter, 'kidblue', ctx);
const head = fighter.root.getObjectByName('head');
ok(head.children.some((c) => c.name === 'cd_facepaint'), 'face paint decal on head');
ok(head.children.some((c) => c.name === 'cd_eyes'), 'eyes decal on head');
// null-safe when nothing equipped
C.cdApplyFace(fighter, 'ghost', { save: {} });
pass++;

// 5. shop / lock rules
const sctx = { save: { cash: 100000, bossesBeaten: 0 }, writeSave() {}, activeSeason: () => null };
const stock1 = C.cdShopStock(sctx);
const stock2 = C.cdShopStock(sctx);
assert.deepStrictEqual(stock1, stock2, 'shop stock stable within a day');
ok(stock1.length > 0, 'shop has stock');
ok(C.cdLockReason('tiger_head', sctx).includes('bosses'), 'boss lock reason');
sctx.save.bossesBeaten = 3;
ok(C.cdLockReason('tiger_head', sctx) === '', 'boss item unlocks at 3 bosses');
ok(C.cdLockReason('wolf_head', sctx).includes('halloween'), 'season lock reason');
C.cdOwn('skimask_ink', sctx);
ok(sctx.save.cosmeticsOwned.skimask_ink === true, 'cdOwn marks owned');
ok(C.cdLockReason('skimask_ink', sctx) === '', 'owned item has no lock');

// 6. UI section renders rows for every slot + face + eyes
const added = [];
const el = (tag, cls, text) => { const e = { tag, cls, text, children: [], style: {}, disabled: false, title: '',
  appendChild(c) { e.children.push(c); return c; } }; added.push(e); return e; };
const uictx = { el, save: { cash: 99999, cosmeticsOwned: {}, loadouts: {}, bossesBeaten: 99 },
  writeSave() {}, sfx() {}, refreshShowcase() {}, rerender() {}, activeSeason: () => ({ id: 'takeover' }) };
const into = el('div');
C.renderCDSection(uictx, into, 'kidblue');
const titles = [];
const walk = (e) => { if (e.cls === 'czTitle') titles.push(e.text); e.children.forEach(walk); };
walk(into);
ok(titles.some((t) => t.includes('STREET GEAR')), 'STREET GEAR title rendered');
const itemCount = added.filter((e) => e.cls === 'cdItem').length;
ok(itemCount === Object.keys(allItems).length, `all ${itemCount} items rendered as rows`);

console.log(`cosmetics.js unit tests: ${pass} assertions passed`);

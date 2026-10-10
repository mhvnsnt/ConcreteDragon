// Concrete Dragon — character customization suite, 3D side (Phase 2, Track 2).
// Universe-tailored CONTENT on the ported TECH: bone-attach parts with painted
// canvas textures (LOOK LAW — every part carries a painted multi-piece texture
// in the game's hand-drawn ink style; flat untextured parts are banned).
// Pendant orientation fix (ported from AshLane): part defs carry `rot`
// (degrees XYZ) applied as a rigid rotation on the holder before parenting.
// Slots map 1:1 onto the EXISTING customizer slots (head/arms/boots/accessory)
// — no parallel slots. Face paint + eyes are decal planes on the head bone.
// All art below is ORIGINAL (canvas-painted by this module) — no third-party
// assets, no license encumbrance. Cosmetic-only: zero stats, never power.
import * as THREE from 'three';

export const CD_RARITY = ['Street', 'Rare', 'Epic', 'Legendary'];
export const CD_RARITY_COLOR = { Street: '#9aa0a8', Rare: '#59a7ff', Epic: '#b46bff', Legendary: '#ffd166' };

// ---------- ink-style canvas textures (the painted look) ----------
// base: main color; dark: shade/ink lines; pattern: optional detail painter.
export function inkTex(base, dark, pattern) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  // bottom shade + top light (hand-painted volume)
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, 'rgba(255,255,255,0.16)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.28)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  // cross-hatch
  g.strokeStyle = 'rgba(0,0,0,0.10)'; g.lineWidth = 2;
  for (let i = -128; i < 256; i += 14) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke();
  }
  if (pattern) pattern(g);
  // ink border (reads as the outline at any UV seam)
  g.strokeStyle = dark; g.lineWidth = 10; g.strokeRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function cdMat(base, dark, pattern, opts) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { map: inkTex(base, dark, pattern), roughness: 0.72, metalness: 0.06 }, opts || {}));
}
function pm(g, mesh, x, y, z, rx, ry, rz, sx, sy, sz) {
  mesh.position.set(x, y, z);
  if (rx || ry || rz) mesh.rotation.set(rx || 0, ry || 0, rz || 0);
  if (sx || sy || sz) mesh.scale.set(sx || 1, sy || 1, sz || 1);
  mesh.castShadow = true; g.add(mesh); return mesh;
}
const INK = '#26232b';

// ---------- catalog (mirrors game/assets/customize/catalog.json) ----------
// slot: existing customizer slot. unlock: {type:'shop',price} | {type:'season',season} | {type:'boss',boss}
export const CD_CATALOG = {
  // ---- head ----
  skimask_ink:   { name: 'Ink Ski Mask', slot: 'head', rarity: 'Street', unlock: { type: 'shop', price: 150 }, desc: 'Full-face ink balaclava. Nobody knows.' },
  bandana_crimson: { name: 'Crimson Bandana', slot: 'head', rarity: 'Street', unlock: { type: 'shop', price: 150 }, desc: 'Barrio colors, tied tight.' },
  hoodie_up:     { name: 'Up Hoodie', slot: 'head', rarity: 'Street', unlock: { type: 'shop', price: 200 }, desc: 'Hood up. Neon downtown uniform.' },
  mohawk_ink:    { name: 'Ink Mohawk', slot: 'head', rarity: 'Street', unlock: { type: 'shop', price: 200 }, desc: 'Shaved sides, lightning attitude.' },
  hockey_mask:   { name: 'Rink Mask', slot: 'head', rarity: 'Rare', unlock: { type: 'shop', price: 450 }, desc: 'Goalie mask, street rules.' },
  puffer_hood:   { name: 'Rust Puffer Hood', slot: 'head', rarity: 'Rare', unlock: { type: 'shop', price: 450 }, desc: 'Rust-belt winter armor.' },
  hoodvest:      { name: 'Hooded Vest', slot: 'head', rarity: 'Rare', unlock: { type: 'shop', price: 400 }, desc: 'Sleeveless. Arms stay free.' },
  locs_long:     { name: 'Long Locs', slot: 'head', rarity: 'Rare', unlock: { type: 'shop', price: 400 }, desc: 'Crown weight, worn long.' },
  fade_design:   { name: 'Lightning Fade', slot: 'head', rarity: 'Epic', unlock: { type: 'shop', price: 800 }, desc: 'Fade with the bolt carved in.' },
  lucha_barrio:  { name: 'Barrio Lucha', slot: 'head', rarity: 'Epic', unlock: { type: 'shop', price: 900 }, desc: 'Generic lucha pattern — teal and pink diamonds.' },
  wolf_head:     { name: 'Wolf Head', slot: 'head', rarity: 'Epic', unlock: { type: 'season', season: 'halloween' }, desc: 'Halloween season reward. Hunt at full moon.' },
  tiger_head:    { name: 'Tiger Head', slot: 'head', rarity: 'Legendary', unlock: { type: 'boss', boss: 3 }, desc: 'Beat 3 bosses to wear the stripes.' },
  // ---- arms (gloves ride the existing hand/arm slot) ----
  gloves_neon:   { name: 'Neon Synthetics', slot: 'arms', rarity: 'Street', unlock: { type: 'shop', price: 200 }, desc: 'Hot pink / cyan fight synthetics.' },
  gloves_work:   { name: 'Work Leather', slot: 'arms', rarity: 'Street', unlock: { type: 'shop', price: 200 }, desc: 'Industrial leather. Built to last.' },
  gloves_canvas: { name: 'Boardwalk Canvas', slot: 'arms', rarity: 'Rare', unlock: { type: 'shop', price: 450 }, desc: 'Canvas wraps, boardwalk edition.' },
  gloves_gold:   { name: 'Gold-Trim', slot: 'arms', rarity: 'Epic', unlock: { type: 'shop', price: 850 }, desc: 'Black and gold. Championship energy.' },
  gloves_dragon: { name: 'Dragon-Scale', slot: 'arms', rarity: 'Legendary', unlock: { type: 'boss', boss: 5 }, desc: 'Scale plating. Endgame hands.' },
  // ---- boots (kicks ride the existing boots slot) ----
  kicks_canvas:  { name: 'Boardwalk Hi-Tops', slot: 'boots', rarity: 'Street', unlock: { type: 'shop', price: 200 }, desc: 'Canvas hi-tops, pier-tested.' },
  kicks_workboot:{ name: 'Work Boots', slot: 'boots', rarity: 'Street', unlock: { type: 'shop', price: 200 }, desc: 'Steel attitude, leather boots.' },
  kicks_neon:    { name: 'Neon Runners', slot: 'boots', rarity: 'Rare', unlock: { type: 'shop', price: 450 }, desc: 'Downtown after dark.' },
  kicks_gold:    { name: 'Gold Hi-Tops', slot: 'boots', rarity: 'Epic', unlock: { type: 'shop', price: 850 }, desc: 'Black and gold, laced tight.' },
  // ---- accessory (multi-equip: chains on chest, wrist pads on wrists) ----
  chain_dogtags: { name: 'Dog Tags', slot: 'accessory', rarity: 'Street', unlock: { type: 'shop', price: 150 }, desc: 'Stamped steel. Earned, not bought. (Bought.)' },
  wristpad_neon: { name: 'Neon Wrist Pads', slot: 'accessory', rarity: 'Street', unlock: { type: 'shop', price: 150 }, desc: 'Wrap the wrists, protect the money-makers.' },
  chain_curb:    { name: 'Curb Chain', slot: 'accessory', rarity: 'Rare', unlock: { type: 'shop', price: 500 }, desc: 'Chunky gold curb links.' },
  wristpad_leather: { name: 'Leather Wraps', slot: 'accessory', rarity: 'Rare', unlock: { type: 'shop', price: 400 }, desc: 'Old-school leather wrist wraps.' },
  medal_saint:   { name: 'Saint Medallion', slot: 'accessory', rarity: 'Epic', unlock: { type: 'season', season: 'takeover' }, desc: 'Season-pass relic. Blessed by the block.' },
};
// face paint + eyes live as decal planes (separate equip fields, not geometry slots)
export const CD_FACEPAINT = {
  paint_cornerman: { name: 'Cornerman Stripes', rarity: 'Street', unlock: { type: 'shop', price: 150 }, desc: 'Fight-night tape stripes.' },
  paint_war:      { name: 'War Paint', rarity: 'Rare', unlock: { type: 'shop', price: 400 }, desc: 'Black band, red slashes. Business.' },
  paint_tag:      { name: 'Cheek Tag', rarity: 'Rare', unlock: { type: 'shop', price: 400 }, desc: 'Wildstyle CD on the cheek.' },
  paint_sugarskull: { name: 'Sugar Skull', rarity: 'Epic', unlock: { type: 'season', season: 'halloween' }, desc: 'Day of the Dead. Halloween season reward.' },
};
export const CD_EYES = {
  eyes_amber:  { name: 'Amber Eyes', rarity: 'Rare', unlock: { type: 'shop', price: 350 }, desc: 'Predator amber.' },
  eyes_ice:    { name: 'Ice Eyes', rarity: 'Rare', unlock: { type: 'shop', price: 350 }, desc: 'Glacier stare.' },
  eyes_violet: { name: 'Violet Eyes', rarity: 'Epic', unlock: { type: 'shop', price: 750 }, desc: 'Neon-district violet.' },
  eyes_hollow: { name: 'Hollow Glow', rarity: 'Legendary', unlock: { type: 'boss', boss: 7 }, desc: "Hollow Point's glow. Boss-tier eyes." },
};

// ---------- part builders (primitive geometry + painted ink textures) ----------
// rot: [degX, degY, degZ] rigid pre-rotation on the holder (pendant fix tech).
function eyeRings(g, mat, y, z, spread) {
  for (const s of [-1, 1]) {
    pm(g, new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 20), mat), s * spread, y, z);
  }
}
export const CD_PARTS = [
  // ---- head ----
  { id: 'skimask_ink', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#1b1a20', INK, (x) => { x.strokeStyle = 'rgba(255,255,255,0.08)'; x.lineWidth = 3; for (let i = 10; i < 128; i += 16) { x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.168, 18, 14), m), 0, 0.01, 0, 0, 0, 0, 1, 1.08, 1);
      eyeRings(g, new THREE.MeshStandardMaterial({ color: 0xf5f2eb, roughness: 0.6 }), 0.03, 0.155, 0.072); } },
  { id: 'bandana_crimson', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#c62837', INK, (x) => { x.fillStyle = '#f5f2eb'; for (let i = 12; i < 128; i += 26) { x.beginPath(); x.arc(i, 40, 6, 0, 7); x.fill(); } x.fillStyle = '#ffd166'; for (let i = 25; i < 128; i += 26) { x.beginPath(); x.arc(i, 88, 5, 0, 7); x.fill(); } });
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.163, 0.168, 0.09, 18), m), 0, 0.085, 0);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.02), m), 0.16, 0.06, -0.02, 0, 0, 0.5); } },
  { id: 'hoodie_up', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#343a4e', INK);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 14), m), 0, 0.0, -0.045, 0, 0, 0, 1, 1.05, 1);
      const dm = cdMat('#f5f2eb', INK);
      for (const s of [-1, 1]) pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), dm), s * 0.09, -0.12, 0.14); } },
  { id: 'mohawk_ink', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#1a1920', INK);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.05, 0.24), m), 0, 0.185, -0.01);
      for (let i = 0; i < 5; i++) pm(g, new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.07, 6), m), 0, 0.235, -0.1 + i * 0.05); } },
  { id: 'hockey_mask', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#e8e2d2', INK, (x) => { x.fillStyle = '#c62837'; x.fillRect(0, 30, 128, 14); x.fillRect(0, 84, 128, 14); x.fillStyle = '#1e1c22'; for (let yy = 100; yy < 128; yy += 12) for (let xx = 10; xx < 128; xx += 18) { x.beginPath(); x.arc(xx, yy, 3, 0, 7); x.fill(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 14), m), 0, 0.0, 0.035, 0, 0, 0, 0.92, 1.02, 0.82);
      eyeRings(g, new THREE.MeshStandardMaterial({ color: 0x1e1c22, roughness: 0.6 }), 0.03, 0.16, 0.072); } },
  { id: 'puffer_hood', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#b0541e', INK, (x) => { x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 6; for (let i = 0; i < 128; i += 26) { x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.225, 18, 14), m), 0, -0.01, -0.05, 0, 0, 0, 1, 1.02, 1); } },
  { id: 'hoodvest', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#2c2c34', INK);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.195, 18, 14), m), 0, 0.01, -0.04, 0, 0, 0, 1, 1.04, 1); } },
  { id: 'locs_long', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#4a3426', INK, (x) => { x.strokeStyle = 'rgba(0,0,0,0.4)'; x.lineWidth = 3; for (let i = 8; i < 128; i += 16) { x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, 1.5), m), 0, 0.03, 0);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++)
        pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.24 - i * 0.03, 8), m), s * (0.15 + i * 0.02), -0.14, 0.01 - i * 0.012); } },
  { id: 'fade_design', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#1e1c22', INK, (x) => { x.strokeStyle = '#d8cdb8'; x.lineWidth = 8; x.beginPath(); x.moveTo(20, 30); x.lineTo(44, 30); x.lineTo(32, 55); x.lineTo(56, 55); x.lineTo(26, 95); x.lineTo(38, 60); x.lineTo(16, 60); x.closePath(); x.stroke(); });
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.158, 0.06, 18), m), 0, 0.15, 0); } },
  { id: 'lucha_barrio', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#2ec4b6', INK, (x) => { x.fillStyle = '#ff4f98'; x.strokeStyle = INK; x.lineWidth = 4; for (let i = 8; i < 128; i += 26) { x.beginPath(); x.moveTo(i, 18); x.lineTo(i + 13, 36); x.lineTo(i, 54); x.lineTo(i - 13, 36); x.closePath(); x.fill(); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.168, 18, 14), m), 0, 0.01, 0, 0, 0, 0, 1, 1.08, 1);
      eyeRings(g, new THREE.MeshStandardMaterial({ color: 0xf5f2eb, roughness: 0.6 }), 0.03, 0.158, 0.072); } },
  { id: 'wolf_head', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#7a808c', INK, (x) => { x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 3; for (let i = 0; i < 128; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 20, 128); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 14), m), 0, 0.01, 0, 0, 0, 0, 1, 1.06, 1);
      const im = cdMat('#d696a0', INK);
      for (const s of [-1, 1]) { pm(g, new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 6), m), s * 0.1, 0.19, -0.02); pm(g, new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.06, 6), im), s * 0.1, 0.185, 0.005); }
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.09), cdMat('#c8ced8', INK)), 0, -0.07, 0.15);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0x1e1c22 })), 0, -0.045, 0.2);
      eyeRings(g, new THREE.MeshStandardMaterial({ color: 0x464a54, roughness: 0.6 }), 0.035, 0.16, 0.072); } },
  { id: 'tiger_head', slot: 'head', bones: ['head'],
    build(g) { const m = cdMat('#f08c28', INK, (x) => { x.strokeStyle = INK; x.lineWidth = 9; for (let i = 6; i < 128; i += 24) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i - 14, 60); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 14), m), 0, 0.01, 0, 0, 0, 0, 1, 1.06, 1);
      for (const s of [-1, 1]) pm(g, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 6), m), s * 0.105, 0.185, -0.02);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), cdMat('#f6e6c8', INK)), 0, -0.08, 0.135, 0, 0, 0, 1, 0.8, 0.7);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshStandardMaterial({ color: 0x1e1c22 })), 0, -0.055, 0.195);
      eyeRings(g, new THREE.MeshStandardMaterial({ color: 0x1e1c22, roughness: 0.6 }), 0.035, 0.16, 0.072); } },
  // ---- arms: glove sets ride the existing arms slot (handl/handr) ----
  { id: 'gloves_neon', slot: 'arms', bones: ['handl', 'handr'],
    build(g) { const m = cdMat('#ff4f98', INK, (x) => { x.strokeStyle = '#f5f2eb'; x.lineWidth = 5; for (let i = 20; i < 110; i += 18) { x.beginPath(); x.moveTo(30, i); x.lineTo(98, i + 8); x.stroke(); } });
      const c = cdMat('#2ec4b6', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), c), 0, 0.03, 0);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), m), 0, -0.07, 0.01, 0, 0, 0, 1, 1.15, 1); } },
  { id: 'gloves_work', slot: 'arms', bones: ['handl', 'handr'],
    build(g) { const m = cdMat('#8b5e34', INK, (x) => { x.strokeStyle = 'rgba(0,0,0,0.4)'; x.lineWidth = 3; x.beginPath(); x.arc(64, 70, 40, 3.4, 6.0); x.stroke(); });
      const c = cdMat('#46301c', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), c), 0, 0.03, 0);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), m), 0, -0.07, 0.01, 0, 0, 0, 1, 1.15, 1); } },
  { id: 'gloves_canvas', slot: 'arms', bones: ['handl', 'handr'],
    build(g) { const m = cdMat('#d2b48c', INK, (x) => { x.strokeStyle = '#f5f2eb'; x.lineWidth = 5; for (let i = 24; i < 104; i += 16) { x.beginPath(); x.moveTo(34, i); x.lineTo(94, i); x.stroke(); } });
      const c = cdMat('#786446', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), c), 0, 0.03, 0);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), m), 0, -0.07, 0.01, 0, 0, 0, 1, 1.15, 1); } },
  { id: 'gloves_gold', slot: 'arms', bones: ['handl', 'handr'],
    build(g) { const m = cdMat('#242228', INK);
      const c = cdMat('#ffd166', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), c), 0, 0.03, 0);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), m), 0, -0.07, 0.01, 0, 0, 0, 1, 1.15, 1);
      pm(g, new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.012, 8, 20), c), 0, -0.07, 0.01, Math.PI / 2.4); } },
  { id: 'gloves_dragon', slot: 'arms', bones: ['handl', 'handr'],
    build(g) { const m = cdMat('#228a5a', INK, (x) => { x.strokeStyle = '#124a2e'; x.lineWidth = 4; for (let yy = 12; yy < 128; yy += 20) for (let xx = 6; xx < 128; xx += 22) { x.beginPath(); x.arc(xx, yy, 10, Math.PI, 0); x.stroke(); } });
      const c = cdMat('#124a2e', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), c), 0, 0.03, 0);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), m), 0, -0.07, 0.01, 0, 0, 0, 1, 1.15, 1); } },
  // ---- boots: kicks ride the existing boots slot (footl/footr) ----
  { id: 'kicks_canvas', slot: 'boots', bones: ['footl', 'footr'],
    build(g) { const m = cdMat('#d2b48c', INK, (x) => { x.strokeStyle = '#f5f2eb'; x.lineWidth = 5; for (let i = 30; i < 90; i += 14) { x.beginPath(); x.moveTo(44, i); x.lineTo(84, i); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 12), m), 0, 0.08, -0.01);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.27), m), 0, -0.03, 0.04);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.28), cdMat('#f5f2eb', INK)), 0, -0.095, 0.04); } },
  { id: 'kicks_workboot', slot: 'boots', bones: ['footl', 'footr'],
    build(g) { const m = cdMat('#6e4828', INK, (x) => { x.strokeStyle = 'rgba(0,0,0,0.45)'; x.lineWidth = 5; for (let i = 12; i < 128; i += 16) { x.beginPath(); x.moveTo(i, 112); x.lineTo(i + 8, 128); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.16, 12), m), 0, 0.09, -0.01);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.28), m), 0, -0.03, 0.04);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.29), cdMat('#32241a', INK)), 0, -0.1, 0.04); } },
  { id: 'kicks_neon', slot: 'boots', bones: ['footl', 'footr'],
    build(g) { const m = cdMat('#ff4f98', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 12), cdMat('#2ec4b6', INK)), 0, 0.08, -0.01);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.27), m), 0, -0.03, 0.04);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.28), cdMat('#2ec4b6', INK)), 0, -0.095, 0.04); } },
  { id: 'kicks_gold', slot: 'boots', bones: ['footl', 'footr'],
    build(g) { const m = cdMat('#242228', INK);
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 12), m), 0, 0.08, -0.01);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.27), m), 0, -0.03, 0.04);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.28), cdMat('#ffd166', INK)), 0, -0.095, 0.04);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.2), cdMat('#ffd166', INK)), 0, 0.03, 0.05); } },
  // ---- accessory: chains (chest) + wrist pads (wrists); multi-equip ----
  { id: 'chain_dogtags', slot: 'accessory', bones: ['chest'],
    build(g) { const m = new THREE.MeshStandardMaterial({ map: inkTex('#c8ccd6', INK), roughness: 0.35, metalness: 0.7 });
      for (let i = 0; i < 16; i++) { const t = i / 15, a = Math.PI * (0.15 + 0.7 * t);
        pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), m), Math.cos(a) * 0.16, -0.28 - Math.sin(a) * 0.1 + 0.1, 0.13 + Math.sin(t * Math.PI) * 0.03); }
      const tm = cdMat('#d6dae4', INK);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.012), tm), -0.035, -0.36, 0.155);
      pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.012), tm), 0.035, -0.375, 0.155); } },
  { id: 'chain_curb', slot: 'accessory', bones: ['chest'],
    build(g) { const m = new THREE.MeshStandardMaterial({ map: inkTex('#ffd166', INK), roughness: 0.3, metalness: 0.75 });
      for (let i = 0; i < 11; i++) { const t = i / 10, a = Math.PI * (0.12 + 0.76 * t);
        pm(g, new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.013, 8, 14), m), Math.cos(a) * 0.17, -0.3 - Math.sin(a) * 0.12 + 0.12, 0.14, 0, 0, a); } } },
  { id: 'medal_saint', slot: 'accessory', bones: ['chest'], rot: [-12, 0, 0],
    // rot: pendant orientation fix — rigid pre-rotation so the medallion
    // faces forward-down instead of swinging sideways (ported tech).
    build(g) { const gold = new THREE.MeshStandardMaterial({ map: inkTex('#ffd166', INK), roughness: 0.3, metalness: 0.75 });
      for (let i = 0; i < 12; i++) { const t = i / 11;
        pm(g, new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.012), gold), -0.1 + t * 0.2, -0.26 - Math.sin(t * Math.PI) * 0.05, 0.15); }
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 20), gold), 0, -0.36, 0.155, Math.PI / 2);
      const fig = cdMat('#5a6ea0', INK);
      pm(g, new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), cdMat('#c89878', INK)), 0, -0.35, 0.166);
      pm(g, new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.045, 8), fig), 0, -0.385, 0.166); } },
  { id: 'wristpad_neon', slot: 'accessory', bones: ['handl', 'handr'], off: [0, 0.075, 0],
    build(g) { pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.07, 12), cdMat('#ff4f98', INK)), 0, 0, 0);
      pm(g, new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.012, 8, 18), cdMat('#2ec4b6', INK)), 0, 0, 0, Math.PI / 2); } },
  { id: 'wristpad_leather', slot: 'accessory', bones: ['handl', 'handr'], off: [0, 0.075, 0],
    build(g) { const m = cdMat('#6e4828', INK, (x) => { x.strokeStyle = 'rgba(0,0,0,0.4)'; x.lineWidth = 4; for (let i = 20; i < 128; i += 30) { x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); } });
      pm(g, new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.075, 12), m), 0, 0, 0); } },
];

// ---------- face paint: canvas-painted decal planes on the head bone ----------
// (AshLane decal-tech, simplified for the box fighter: a conforming plane
// instead of a raycast grid — the head is a box, so a plane suffices.)
function paintCanvas(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); fn(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const CD_FACEPAINT_TEX = {
  paint_cornerman(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = INK; g.lineCap = 'round';
    for (const s of [0, 1]) for (let i = 0; i < 3; i++) {
      const x = s ? w * 0.78 - i * 18 : w * 0.22 + i * 18, y = h * 0.52 + i * 8;
      g.lineWidth = 13; g.strokeStyle = INK;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (s ? 26 : -26), y + 14); g.stroke();
      g.lineWidth = 8; g.strokeStyle = '#f5f2eb';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (s ? 26 : -26), y + 14); g.stroke();
    }
  },
  paint_war(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#16141a';
    g.beginPath(); g.roundRect(w * 0.14, h * 0.3, w * 0.72, h * 0.2, 18); g.fill();
    g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = '#c62837'; g.lineWidth = 10; g.lineCap = 'round';
    for (const s of [0, 1]) for (let i = 0; i < 2; i++) {
      const x = s ? w * 0.72 : w * 0.28, y = h * 0.62 + i * 22;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (s ? 34 : -34), y + 10); g.stroke();
    }
  },
  paint_tag(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.lineWidth = 14; g.lineCap = 'round';
    g.strokeStyle = INK; g.beginPath(); g.arc(w * 0.3, h * 0.6, 30, 0.7, 5.6); g.stroke();
    g.strokeStyle = '#ff4f98'; g.lineWidth = 9; g.beginPath(); g.arc(w * 0.3, h * 0.6, 30, 0.7, 5.6); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 15; g.beginPath(); g.moveTo(w * 0.52, h * 0.48); g.lineTo(w * 0.52, h * 0.74); g.stroke();
    g.strokeStyle = '#2ec4b6'; g.lineWidth = 10; g.beginPath(); g.moveTo(w * 0.52, h * 0.48); g.lineTo(w * 0.52, h * 0.74); g.stroke();
    g.beginPath(); g.arc(w * 0.52, h * 0.61, 26, -1.57, 1.57); g.stroke();
  },
  paint_sugarskull(g, w, h) {
    g.clearRect(0, 0, w, h);
    const petal = (x, y, col) => { g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 3;
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4;
        g.beginPath(); g.ellipse(x + 34 * Math.cos(a), y + 36 * Math.sin(a), 9, 9, 0, 0, 7); g.fill(); g.stroke(); } };
    for (const s of [0, 1]) {
      const x = s ? w * 0.68 : w * 0.32, y = h * 0.4;
      petal(x, y, '#ff4f98');
      g.fillStyle = '#f0eade'; g.strokeStyle = INK; g.lineWidth = 5;
      g.beginPath(); g.ellipse(x, y, 28, 30, 0, 0, 7); g.fill(); g.stroke();
    }
    g.fillStyle = INK; g.beginPath();
    g.moveTo(w * 0.5, h * 0.62); g.lineTo(w * 0.46, h * 0.56); g.lineTo(w * 0.48, h * 0.53);
    g.lineTo(w * 0.5, h * 0.56); g.lineTo(w * 0.52, h * 0.53); g.lineTo(w * 0.54, h * 0.56); g.closePath(); g.fill();
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.36, h * 0.74); g.lineTo(w * 0.64, h * 0.74); g.stroke();
    g.lineWidth = 4; for (let x = w * 0.39; x < w * 0.63; x += w * 0.045) {
      g.beginPath(); g.moveTo(x, h * 0.7); g.lineTo(x, h * 0.78); g.stroke(); }
  },
};
export const CD_EYE_TEX = {
  eyes_amber: '#d9970d', eyes_ice: '#7ad9ff', eyes_violet: '#9a4dff', eyes_hollow: '#96fff0',
};
function eyeDecalTex(color, glow) {
  return paintCanvas(256, 112, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (const s of [0, 1]) {
      const x = s ? w * 0.7 : w * 0.3, y = h * 0.5;
      if (glow) { const gr = g.createRadialGradient(x, y, 4, x, y, 44);
        gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, 44, 0, 7); g.fill(); }
      g.fillStyle = '#f5f2eb'; g.strokeStyle = INK; g.lineWidth = 7;
      g.beginPath(); g.ellipse(x, y, 30, 33, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = color; g.beginPath(); g.arc(x, y, 17, 0, 7); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(x - 6, y - 7, 5, 0, 7); g.fill();
    }
  });
}

// ---------- attach (with the pendant-orientation `rot` fix) ----------
const _d2r = (d) => d * Math.PI / 180;
export function cdAttach(f, pid) {
  const p = CD_PARTS.find((x) => x.id === pid); if (!p || !f || !f.root) return;
  for (const bn of p.bones) {
    const bone = f.root.getObjectByName(bn); if (!bone) continue;
    const g = new THREE.Group(); g.name = 'cd_' + pid;
    if (p.off) g.position.set(p.off[0], p.off[1], p.off[2]);
    if (p.rot) g.rotation.set(_d2r(p.rot[0]), _d2r(p.rot[1]), _d2r(p.rot[2]));
    if (p.scale) g.scale.setScalar(p.scale);
    p.build(g);
    bone.add(g);
  }
}
function decalPlane(f, tex, w, h, y, z, name) {
  const bone = f.root.getObjectByName('head'); if (!bone) return;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.position.set(0, y, z); m.name = name; m.renderOrder = 5;
  bone.add(m);
}
export function cdApplyFace(f, fid, ctx) {
  const lo = (ctx.save.loadouts && ctx.save.loadouts[fid]) || {};
  if (lo.facePaint && CD_FACEPAINT_TEX[lo.facePaint])
    decalPlane(f, paintCanvas(256, 288, CD_FACEPAINT_TEX[lo.facePaint]), 0.27, 0.3, 0.005, 0.148, 'cd_facepaint');
  if (lo.eyes && CD_EYE_TEX[lo.eyes])
    decalPlane(f, eyeDecalTex(CD_EYE_TEX[lo.eyes], lo.eyes === 'eyes_hollow'), 0.21, 0.092, 0.035, 0.1495, 'cd_eyes');
}
// Apply the full CD cosmetic loadout (parts + face + eyes) to a fighter.
export function cdApplyAll(f, fid, ctx) {
  if (!f || !f.root) return;
  const lo = (ctx.save.loadouts && ctx.save.loadouts[fid]) || {};
  const parts = lo.parts || {};
  for (const slot of Object.keys(parts)) {
    const v = parts[slot];
    const ids = Array.isArray(v) ? v : [v];
    for (const pid of ids) if (pid && pid !== 'none') cdAttach(f, pid);
  }
  cdApplyFace(f, fid, ctx);
}

// ---------- unlock / shop / season rules (mirror the Godot side) ----------
function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function seededPick(arr, seed, n) {
  let t = seed >>> 0;
  const R = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
export function cdShopStock(ctx) {
  const key = todayKey();
  const st = ctx.save.cdStock || {};
  if (st.date === key && st.ids) return st.ids;
  const street = [], rare = [], epic = [];
  for (const [id, it] of Object.entries(Object.assign({}, CD_CATALOG, CD_FACEPAINT, CD_EYES))) {
    if (it.unlock.type !== 'shop') continue;
    ({ Street: street, Rare: rare, Epic: epic })[it.rarity].push(id);
  }
  const seed = [...key].reduce((a, c) => a + c.charCodeAt(0), 0);
  const ids = street.concat(seededPick(rare, seed, 3), seededPick(epic, seed + 7, 2));
  ctx.save.cdStock = { date: key, ids }; ctx.writeSave();
  return ids;
}
export function cdSeasonGate(id, ctx) {
  const it = CD_CATALOG[id] || CD_FACEPAINT[id] || CD_EYES[id];
  if (!it || it.unlock.type !== 'season') return '';
  const sid = it.unlock.season;
  if (sid === 'takeover') return ''; // Season 1 (THE TAKEOVER) is the live season
  if (sid === 'halloween' && ctx.activeSeason() && ctx.activeSeason().id === 'halloween') return '';
  return sid;
}
export function cdLockReason(id, ctx) {
  const it = CD_CATALOG[id] || CD_FACEPAINT[id] || CD_EYES[id];
  if (!it) return 'Unknown item.';
  if ((ctx.save.cosmeticsOwned || {})[id]) return '';
  const u = it.unlock;
  if (u.type === 'boss') {
    const need = u.boss, have = ctx.save.bossesBeaten || 0;
    if (have < need) return 'Beat ' + need + ' bosses (' + have + '/' + need + ').';
    return '';
  }
  const sg = cdSeasonGate(id, ctx);
  if (sg) return 'Season reward — returns with ' + sg + '.';
  return '';
}
export function cdOwn(id, ctx) {
  ctx.save.cosmeticsOwned = ctx.save.cosmeticsOwned || {};
  ctx.save.cosmeticsOwned[id] = true; ctx.writeSave();
}

// ---------- customizer UI section (STREET GEAR) ----------
// ctx: {el, save, writeSave, sfx, refreshShowcase, rerender, activeSeason}
const CD_SLOT_LABEL = { head: 'HEAD', arms: 'GLOVES', boots: 'KICKS', accessory: 'ACCESSORY' };
function rarityBadge(ctx, rarity) {
  const s = ctx.el('span', 'cdRar', rarity.toUpperCase());
  s.style.color = CD_RARITY_COLOR[rarity]; s.style.borderColor = CD_RARITY_COLOR[rarity];
  return s;
}
function cdAcquireRow(ctx, fid, id, it, kind) {
  // kind: 'part' | 'face' | 'eyes'
  const row = ctx.el('div', 'cdItem');
  row.appendChild(ctx.el('span', 'cdName', it.name));
  row.appendChild(rarityBadge(ctx, it.rarity));
  const owned = (ctx.save.cosmeticsOwned || {})[id];
  const lo = (ctx.save.loadouts[fid] = ctx.save.loadouts[fid] || {});
  let equipped = false;
  if (kind === 'part') {
    const v = (lo.parts || {})[it.slot];
    equipped = Array.isArray(v) ? v.includes(id) : v === id;
  } else if (kind === 'face') equipped = lo.facePaint === id;
  else equipped = lo.eyes === id;
  const btn = ctx.el('button', 'partBtn' + (equipped ? ' sel' : ''));
  const lock = cdLockReason(id, ctx);
  if (equipped) btn.textContent = '✓ EQUIPPED';
  else if (!owned && lock) { btn.textContent = '🔒'; btn.title = lock; btn.disabled = true; }
  else if (!owned) {
    const u = it.unlock;
    if (u.type === 'shop') {
      if (!cdShopStock(ctx).includes(id)) { btn.textContent = '↻ ROTATION'; btn.title = 'Not in today\'s shop rotation — check back tomorrow.'; btn.disabled = true; }
      else { btn.textContent = '$' + u.price; btn.disabled = ctx.save.cash < u.price; btn.title = it.desc; }
    } else { btn.textContent = 'CLAIM'; btn.title = it.desc + ' (free ' + u.type + ' reward)'; }
  } else btn.textContent = 'EQUIP';
  if (!btn.disabled) btn.title = (btn.title ? btn.title + ' — ' : '') + it.desc;
  btn.onclick = (e) => {
    e.stopPropagation();
    if (cdLockReason(id, ctx)) { ctx.sfx('deny', 0.8); return; }
    if (!(ctx.save.cosmeticsOwned || {})[id]) {
      const u = it.unlock;
      if (u.type === 'shop') {
        if (!cdShopStock(ctx).includes(id) || ctx.save.cash < u.price) { ctx.sfx('deny', 0.8); return; }
        ctx.save.cash -= u.price; cdOwn(id, ctx); ctx.sfx('coin', 0.9);
      } else { cdOwn(id, ctx); ctx.sfx('bell', 0.9); }
    }
    const L = (ctx.save.loadouts[fid] = ctx.save.loadouts[fid] || {});
    if (kind === 'part') {
      L.parts = L.parts || {};
      if (it.slot === 'accessory') {
        const a = Array.isArray(L.parts.accessory) ? L.parts.accessory : (L.parts.accessory ? [L.parts.accessory] : []);
        L.parts.accessory = a.includes(id) ? a.filter((x) => x !== id) : a.concat([id]);
      } else L.parts[it.slot] = (L.parts[it.slot] === id ? 'none' : id);
    } else if (kind === 'face') L.facePaint = (L.facePaint === id ? null : id);
    else L.eyes = (L.eyes === id ? null : id);
    ctx.writeSave(); ctx.sfx('click', 0.7);
    ctx.refreshShowcase(); ctx.rerender();
  };
  row.appendChild(btn);
  return row;
}
export function renderCDSection(ctx, into, fid) {
  into.appendChild(ctx.el('div', 'czTitle', 'STREET GEAR — UNLOCKS'));
  into.appendChild(ctx.el('div', 'czSub', 'District-flavored cosmetics. Rarity-gated, season + shop rotated. Style only — never power.'));
  for (const slot of ['head', 'arms', 'boots', 'accessory']) {
    const sec = ctx.el('div', 'czRow');
    sec.appendChild(ctx.el('div', 'czLab', CD_SLOT_LABEL[slot]));
    const wrap = ctx.el('div', 'cdGrid');
    for (const [id, it] of Object.entries(CD_CATALOG))
      if (it.slot === slot) wrap.appendChild(cdAcquireRow(ctx, fid, id, it, 'part'));
    sec.appendChild(wrap); into.appendChild(sec);
  }
  for (const [label, table, kind] of [['FACE PAINT', CD_FACEPAINT, 'face'], ['EYES', CD_EYES, 'eyes']]) {
    const sec = ctx.el('div', 'czRow');
    sec.appendChild(ctx.el('div', 'czLab', label));
    const wrap = ctx.el('div', 'cdGrid');
    for (const [id, it] of Object.entries(table)) wrap.appendChild(cdAcquireRow(ctx, fid, id, it, kind));
    sec.appendChild(wrap); into.appendChild(sec);
  }
}

// Merge selected Kenney city-kit-industrial GLBs into one industrial.glb with named
// top-level children (same pattern as tools-ci-merge-roads.mjs: manual JSON-level merge,
// one shared colormap material, BIN concatenation, hand-packed GLB container).
// Run: cd game-3d && node tools-ci-merge-industrial.mjs   (one-off asset prep, not CI)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'node:fs';

const KIT = '/tmp/ind-kit/Models/GLB format/';
const picks = [
  ['building-a.glb', 'ind_building_a'],
  ['building-c.glb', 'ind_building_c'],
  ['building-e.glb', 'ind_building_e'],
  ['building-g.glb', 'ind_building_g'],
  ['building-i.glb', 'ind_building_i'],
  ['building-l.glb', 'ind_building_l'],
  ['building-p.glb', 'ind_building_p'],
  ['building-r.glb', 'ind_building_r'],
  ['chimney-basic.glb', 'ind_chimney_s'],
  ['chimney-medium.glb', 'ind_chimney_m'],
  ['chimney-large.glb', 'ind_chimney_l'],
  ['detail-tank.glb', 'ind_tank'],
  ['detail-tank-large.glb', 'ind_tank_large'],
  ['shipping-container-a.glb', 'ind_container_a'],
  ['shipping-container-b.glb', 'ind_container_b'],
  ['shipping-container-c.glb', 'ind_container_c'],
  ['solar-panel-flat.glb', 'ind_solar'],
  ['solar-panel-landscape.glb', 'ind_solar_l'],
  ['water-tower.glb', 'ind_water_tower'],
  ['windmill-low.glb', 'ind_windmill'],
];

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const docs = [];
for (const [file] of picks) docs.push(await io.writeJSON(await io.read(KIT + file)));

// base = first doc: keep its buffers(images/materials/textures/samplers) wholesale
const J = docs[0].json;
const binOf = (jd) => Buffer.from(jd.resources[jd.json.buffers[0].uri]);
const binParts = [binOf(docs[0])];
let binLen = binParts[0].length;
const origTop = J.scenes[0].nodes.slice(); // capture BEFORE replacing scenes
J.scenes = [{ name: 'Scene', nodes: [] }];

docs.forEach((jd, di) => {
  const json = jd.json;
  const bin = binOf(jd);
  const bBV = J.bufferViews.length, bAC = J.accessors.length, bME = J.meshes.length, bNO = J.nodes.length;
  if (di > 0) {
    const bvs = json.bufferViews.map((bv) => ({ ...bv, byteOffset: (bv.byteOffset || 0) + binLen, buffer: 0 }));
    const acs = json.accessors.map((a) => ({ ...a, bufferView: a.bufferView === undefined ? undefined : a.bufferView + bBV }));
    const mes = json.meshes.map((m) => ({
      ...m,
      primitives: m.primitives.map((p) => {
        const q = { ...p, material: 0 };
        if (q.indices !== undefined) q.indices += bAC;
        q.attributes = Object.fromEntries(Object.entries(q.attributes).map(([k, v]) => [k, v + bAC]));
        return q;
      }),
    }));
    const nodes = json.nodes.map((n) => {
      const q = { ...n };
      delete q.children;
      if (q.mesh !== undefined) q.mesh += bME;
      return q;
    });
    const srcTop = json.scenes[0].nodes.slice();
    J.bufferViews.push(...bvs); J.accessors.push(...acs); J.meshes.push(...mes); J.nodes.push(...nodes);
    json.nodes.forEach((n, i) => { if (n.children) J.nodes[bNO + i].children = n.children.map((c) => c + bNO); });
    binParts.push(bin);
    binLen += bin.length;
  }
  const topNodes = di === 0 ? origTop : json.scenes[0].nodes.map((i) => i + bNO);
  const wrapperIdx = J.nodes.length;
  J.nodes.push({ name: picks[di][1], children: topNodes });
  J.scenes[0].nodes.push(wrapperIdx);
});

const bin = Buffer.concat(binParts);
J.buffers = [{ byteLength: bin.length }];
// embed the colormap PNG (doc0's image kept an external URI — must be a bufferView for single-file GLB)
const pngBytes = fs.readFileSync(KIT + 'Textures/colormap.png');
const pngOff = bin.length;
const pngPadded = pngBytes.length % 4 ? Buffer.concat([pngBytes, Buffer.alloc(4 - (pngBytes.length % 4))]) : pngBytes;
const bin2 = Buffer.concat([bin, pngPadded]);
J.buffers = [{ byteLength: bin2.length }];
const imgBV = J.bufferViews.length;
J.bufferViews.push({ buffer: 0, byteOffset: pngOff, byteLength: pngBytes.length });
J.images = [{ bufferView: imgBV, mimeType: 'image/png', name: 'colormap' }];
// pack GLB by hand
const jsonStr = JSON.stringify(J);
const jsonBytes = Buffer.from(jsonStr, 'utf8');
const pad = (b) => { const r = b.length % 4; return r ? Buffer.concat([b, Buffer.alloc(4 - r, 0x20)]) : b; };
const jb = pad(jsonBytes), bb = pad(bin2);
const total = 12 + 8 + jb.length + 8 + bb.length;
const glb = Buffer.alloc(total);
glb.writeUInt32LE(0x46546c67, 0); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(total, 8);
let o = 12;
glb.writeUInt32LE(jb.length, o); glb.writeUInt32LE(0x4e4f534a, o + 4); jb.copy(glb, o + 8); o += 8 + jb.length;
glb.writeUInt32LE(bb.length, o); glb.writeUInt32LE(0x004e4942, o + 4); bb.copy(glb, o + 8);
fs.writeFileSync('build/assets/industrial.glb', glb);
console.log('wrote build/assets/industrial.glb', (glb.length / 1024).toFixed(0) + 'KB');
console.log('nodes:', J.scenes[0].nodes.map((i) => J.nodes[i].name).join(', '));

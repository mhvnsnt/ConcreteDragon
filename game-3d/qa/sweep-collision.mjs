// OBVIOUS-DEFECT SWEEP (owner 2026-10-09): character-vs-character collision.
// Spawns thugs around the player, lets them walk in, and measures the minimum
// pairwise body distance over time. Also teleports the player exactly onto a
// foe. Screenshots for eyes-on. Run BEFORE and AFTER the collision fix.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-sweep-collision';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
import fs from 'fs';
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
await page.tap('#tapStart'); await sleep(800);
await E('t.skipCine()'); await sleep(400);
const bless = await page.$('.blessCard');
if (bless) { await bless.click(); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(500);
await E('t.skipCine()'); await E('t.ff(30)'); await sleep(300);
const bless2 = await page.$('.blessCard');
if (bless2) { await bless2.click(); await sleep(400); }

const shot = async (n) => { try { await page.screenshot({ path: `${SHOTS}/${n}.png`, timeout: 60000 }); } catch (e) { console.log('shot failed:', n, e.message.slice(0, 80)); } };
const minDist = () => E(`(() => {
  const pts = [];
  const p = t.playerPos(); if (p) pts.push({ x: p.px, z: p.pz, who: 'player' });
  for (const f of t.foes()) { if (f.hp > 0) pts.push({ x: f.px, z: f.pz, who: f.name }); }
  let m = 1e9, pair = null;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z);
    if (d < m) { m = d; pair = pts[i].who + '/' + pts[j].who; }
  }
  return { min: +m.toFixed(3), pair, n: pts.length };
})()`);

const res = { walkIn: [], teleport: null };
// Scenario A: 3 thugs walk into the passive player (5 sim-seconds)
await E('t.clearFoes()');
await E('t.spawnFam("thug")'); await E('t.spawnFam("thug")'); await E('t.spawnFam("thug")');
await E('t.ff(10)'); await sleep(200);
await shot('A-00-start');
for (let i = 0; i < 10; i++) {
  await E('t.ff(30)'); await sleep(150);
  const md = await minDist();
  res.walkIn.push({ t: +((i + 1) * 0.5).toFixed(1), ...md });
  if (i === 4) await shot('A-05-mid');
}
await shot('A-10-end');
console.log('walk-in min distances:', JSON.stringify(res.walkIn.map(r => r.min)));
// Scenario B: teleport player exactly onto a live foe
await E('t.freeze(true)');
const foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
await E(`t.tp2(${foe.px}, ${foe.pz})`);
await E('t.ff(20)'); await sleep(250);
await shot('B-teleport-overlap');
res.teleport = await minDist();
await E('t.freeze(false)');
console.log('teleport min distance:', JSON.stringify(res.teleport));
console.log('errors:', errors.length, errors.slice(0, 6));
fs.writeFileSync(SHOTS + '/results.json', JSON.stringify(res, null, 1));
await browser.close();

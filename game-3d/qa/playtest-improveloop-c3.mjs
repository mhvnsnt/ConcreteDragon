// CYCLE 3 playtest: obvious-defect checklist sweep of the main build.
// Deterministic protocol (per backlog lessons): real KeyboardEvents through the
// same handler path as players, advance with t.ff(n), real sleeps so wall-clock
// hit timeouts resolve before sampling. Eyes on screenshots every cycle.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-improveloop-c3';
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
const KEY = async (type, key) => page.evaluate((ty, k) => { document.dispatchEvent(new KeyboardEvent(ty, { key: k, bubbles: true })); }, type, key);
const shot = async (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });

const report = { checklist: {}, notes: [] };
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
console.log('ff hook present:', await E('typeof t.ff'));
await page.tap('#tapStart'); await sleep(800);
await E('t.skipCine()'); await sleep(400);
let bless = await page.$('.blessCard');
if (bless) { await bless.click(); console.log('blessing dismissed'); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(500);
await E('t.skipCine()'); await E('t.ff(30)'); await sleep(300);
bless = await page.$('.blessCard');
if (bless) { await bless.click(); console.log('blessing2 dismissed'); await sleep(400); }
await shot('01-mission-start');

// CHECK 6: HUD/UI present and correct
const hud = await page.evaluate(() => ({
  hp: !!document.querySelector('#hudHp, .hpBar, [id*=hp i]'),
  score: document.body.innerText.includes('SCORE') || !!document.querySelector('#hudScore'),
  canvas: !!document.querySelector('canvas'),
}));
report.checklist.hudPresent = hud;
console.log('HUD probe:', JSON.stringify(hud));

// CHECK 2+3+5: walk right — feet above ground, facing matches movement, no frozen foes
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
const p0 = await E('t.playerPos()');
await KEY('keydown', 'ArrowRight');
const walkSamples = [];
for (let i = 0; i < 6; i++) {
  await E('t.ff(10)'); await sleep(100);
  walkSamples.push(await E('t.playerPos()'));
}
await KEY('keyup', 'ArrowRight');
const moved = walkSamples[walkSamples.length - 1].px - p0.px;
const minPy = Math.min(...walkSamples.map(s => s.py));
report.checklist.walk = { movedRight: +moved.toFixed(2), minPy: +minPy.toFixed(3), samples: walkSamples.length };
console.log('walk: moved', moved.toFixed(2), 'minPy', minPy.toFixed(3));
await shot('02-walk-right');

// CHECK 1: character-vs-character collision (main lacks c2 fix — expect interpenetration)
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`);
let foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
await E(`t.tp2(${foe.px - 0.3}, ${foe.pz})`); // stand nearly inside the foe
await E('t.setStick(0,0)'); await E('t.ff(10)'); await sleep(200);
const pp = await E('t.playerPos()');
foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
const dist = Math.hypot(pp.px - foe.px, pp.pz - foe.pz);
report.checklist.collision = { minDist: +dist.toFixed(3), interpenetrates: dist < 0.5 };
console.log('collision: minDist', dist.toFixed(3), 'interpenetrates:', dist < 0.5);
await shot('03-collision');

// CHECK 4: hits visibly connect — punch combo, measure hp drops + hit reactions
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`);
await E('t.setStick(0,0)'); await E('t.ff(10)'); await sleep(200);
let hits = 0; const hpTrace = [];
for (let i = 0; i < 6; i++) {
  foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
  if (!foe) break;
  const hp0 = foe.hp;
  await KEY('keydown', 'j');
  await E('t.ff(14)'); await sleep(350);
  const foeAfter = (await E('t.foes()')).filter(f => f.hp > 0)[0];
  const hp1 = foeAfter ? foeAfter.hp : 0;
  if (hp1 < hp0) hits++;
  hpTrace.push({ hp0, hp1 });
  await E('t.ff(20)'); await sleep(150);
  if (i === 2) await shot('04-mid-combo');
}
report.checklist.hitsConnect = { hits, of: 6, hpTrace };
console.log('hits landed:', hits, '/ 6');
await shot('05-after-combo');

// foe behavior sanity: do foes act (windups) while player is passive?
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
let windups = 0; const lastWu = {};
for (let i = 0; i < 24; i++) {
  await E('t.ff(30)'); await sleep(120);
  const foes = (await E('t.foes()')).filter(f => f.hp > 0);
  foes.forEach((f, idx) => { if (f.wu > 0.3 && !(lastWu[idx] > 0.3)) windups++; lastWu[idx] = f.wu; });
}
const hpDmg = (await E('t.playerDbg()')).hp;
report.checklist.foeAggression = { windups, playerHp: hpDmg };
console.log('foe windups in 12 sim-sec:', windups);
await shot('06-foe-aggression');

report.errors = errors.slice(0, 10);
fs.writeFileSync(SHOTS + '/results.json', JSON.stringify(report, null, 1));
console.log('DONE errors:', errors.length);
await browser.close();

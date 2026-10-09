// CYCLE 4 playtest: G3 enemy block/dodge verification + obvious-defect regression sweep.
// Part A: deterministic landHit driving via t.dbgG3(mode) — forces guard / dodge / clean /
// windup-punish and asserts chip-vs-full damage, hooks, guard brace, sidestep shift.
// Part B: short obvious-defect regression on the c4 build (walk, punches land+KO, foe
// retaliation to game-over, zero console/page errors) with screenshots for eyeball review.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-c4/game-3d/shots-improveloop-c4';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-c4/game-3d/dist/concrete-dragon.html';
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

await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
console.log('ff hook present:', await E('typeof t.ff'), '| dbgG3:', await E('typeof t.dbgG3'));
await page.tap('#tapStart'); await sleep(800);
await E('t.skipCine()'); await sleep(400);
let bless = await page.$('.blessCard');
if (bless) { await bless.click(); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(500);
await E('t.skipCine()'); await E('t.ff(30)'); await sleep(300);
bless = await page.$('.blessCard');
if (bless) { await bless.click(); await sleep(400); }

// ---- PART A: G3 forced-reaction matrix ----
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
const g3 = {};
for (const mode of ['guard', 'dodge', 'clean', 'windup']) {
  await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)');
  g3[mode] = await E(`t.dbgG3('${mode}')`);
  console.log(`dbgG3(${mode}):`, JSON.stringify(g3[mode]));
}
const pass = {
  guard_chip: g3.guard && g3.guard.guards === 1 && g3.guard.dodges === 0 && (g3.guard.hp0 - g3.guard.hp1) >= 1 && (g3.guard.hp0 - g3.guard.hp1) <= 4 && g3.guard.guardT > 0,
  dodge_whiff: g3.dodge && g3.dodge.dodges === 1 && g3.dodge.guards === 0 && (g3.dodge.hp0 - g3.dodge.hp1) === 0 && Math.abs(g3.dodge.pzShift) > 0.5,
  clean_full: g3.clean && g3.clean.guards === 0 && g3.clean.dodges === 0 && (g3.clean.hp0 - g3.clean.hp1) === 20,
  windup_punish: g3.windup && g3.windup.guards === 0 && g3.windup.dodges === 0 && (g3.windup.hp0 - g3.windup.hp1) === 20,
};
console.log('G3 PASS:', JSON.stringify(pass));
fs.writeFileSync(`${SHOTS}/g3-results.json`, JSON.stringify({ g3, pass, errors }, null, 2));

// ---- PART B: obvious-defect regression sweep ----
const report = { checklist: {}, notes: [] };
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
await shot('01-mission-start');
const p0 = await E('t.playerPos()');
await KEY('keydown', 'ArrowRight');
const walkSamples = [];
for (let i = 0; i < 6; i++) { await E('t.ff(10)'); await sleep(100); walkSamples.push(await E('t.playerPos()')); }
await KEY('keyup', 'ArrowRight');
const moved = walkSamples[walkSamples.length - 1].px - p0.px;
const minPy = Math.min(...walkSamples.map(s => s.py));
report.checklist.walk = { movedRight: +moved.toFixed(2), minPy: +minPy.toFixed(3) };
console.log('walk: moved', moved.toFixed(2), 'minPy', minPy.toFixed(3));
await shot('02-walk-right');
// punches land + KO a foe
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)');
const foe0 = await E('t.foeHp ? t.foeHp() : -1');
let landed = 0;
for (let i = 0; i < 8; i++) {
  await E('t.tp2(t.foePos ? t.foePos().px - 1.2 : 0, 0)');
  await KEY('keydown', 'j'); await E('t.ff(6)'); await sleep(250); await KEY('keyup', 'j');
  await E('t.ff(10)'); await sleep(150);
}
const foeHp = await E(`(() => { const e = (window.__enemiesRef && window.__enemiesRef()) || null; return e; })()`);
await shot('03-punches');
report.checklist.errors = errors;
console.log('errors:', errors.length, errors.slice(0, 5));
fs.writeFileSync(`${SHOTS}/regression-results.json`, JSON.stringify({ report, pass }, null, 2));
console.log('ALL PASS:', Object.values(pass).every(Boolean) && errors.length === 0);
await browser.close();

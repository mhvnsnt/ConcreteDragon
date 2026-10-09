// CYCLE 5 playtest: obvious-defect regression sweep on latest main (df5d02c, incl. defense PR #18).
// Protocol (from backlog lessons): deterministic, real KeyboardEvents, t.ff(n) advance,
// real-time sleeps so wall-clock hit timeouts resolve, dismiss SHRINE blessCard.
// Checks: walk (move/facing/feet), punches land + KO, foe retaliation to game-over,
// zero page/console errors. Screenshots reviewed with own eyes.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-c5/game-3d/shots-improveloop-c5';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-c5/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
import fs from 'fs';
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const protocolTimeout = 300000;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const KEY = async (type, key) => page.evaluate((ty, k) => { document.dispatchEvent(new KeyboardEvent(ty, { key: k, bubbles: true })); }, type, key);
const shot = async (n) => {
  for (let a = 0; a < 3; a++) {
    try { await page.screenshot({ path: `${SHOTS}/${n}.png`, timeout: 60000 }); return; }
    catch (e) { console.log(`shot ${n} attempt ${a + 1} failed: ${e.message.slice(0, 80)}`); await sleep(1500); }
  }
  report.notes.push(`screenshot ${n} failed after 3 attempts`);
};
const report = { checklist: {}, errors: [], notes: [] };

await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
console.log('ff hook:', await E('typeof t.ff'), '| foes:', await E('typeof t.foes'), '| playerDbg:', await E('typeof t.playerDbg'));
try {
  await page.waitForSelector('#tapStart', { visible: true, timeout: 60000 });
  await page.evaluate(() => { const el = document.querySelector('#tapStart'); if (el) el.click(); });
} catch (e) { console.log('tapStart wait/click issue:', e.message.slice(0, 100)); }
await sleep(800);
await E('t.skipCine()'); await sleep(400);
let bless = await page.$('.blessCard');
if (bless) { await bless.click(); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(500);
await E('t.skipCine()'); await E('t.ff(30)'); await sleep(300);
bless = await page.$('.blessCard');
if (bless) { await bless.click(); await sleep(400); }

await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
await shot('01-mission-start');

// --- walk: move right, facing, feet ---
const p0 = await E('t.playerPos()');
await KEY('keydown', 'ArrowRight');
const walkSamples = [];
for (let i = 0; i < 6; i++) { await E('t.ff(10)'); await sleep(100); walkSamples.push({ p: await E('t.playerPos()'), d: await E('t.playerDbg()') }); }
await KEY('keyup', 'ArrowRight');
const moved = walkSamples[walkSamples.length - 1].p.px - p0.px;
const minPy = Math.min(...walkSamples.map(s => s.p.py));
const faceVal = walkSamples[walkSamples.length - 1].d.face;
const facingOk = moved > 0 ? faceVal > 0 : faceVal < 0;
report.checklist.walk = { movedRight: +moved.toFixed(2), minPy: +minPy.toFixed(3), face: faceVal, facingOk };
console.log('walk: moved', moved.toFixed(2), 'minPy', minPy.toFixed(3), 'face', faceVal, 'facingOk', facingOk);
await shot('02-walk-right');

// --- interpenetration probe: stand next to foe, measure separation ---
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)');
const foe0 = (await E('t.foes()'))[0];
if (foe0) { await E(`t.tp2(${foe0.px + 0.3}, ${foe0.pz})`); await E('t.ff(20)'); await sleep(200); }
const prox = await E(`(() => { const p = t.playerPos(), fs = t.foes(); if (!fs.length) return null; const f = fs[0]; return { d: Math.hypot(p.px - f.px, p.pz - f.pz), fa: f.ai }; })()`);
report.checklist.collision = prox ? { minSeparationXZ: +prox.d.toFixed(2), foeAI: prox.fa } : null;
console.log('collision separation:', prox ? prox.d.toFixed(2) : 'no foe');
await shot('03-adjacent');

// --- punches land: 8 punches, foe HP drops, KO ---
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(150);
const foeHp0 = (await E('t.foes()'))[0].hp;
let punchHp = foeHp0;
for (let i = 0; i < 8; i++) {
  const f = (await E('t.foes()'))[0]; if (!f || f.hp <= 0) break;
  await E(`t.tp2(${f.px - 1.2}, ${f.pz})`); await E('t.ff(4)'); await sleep(100);
  await KEY('keydown', 'j'); await E('t.ff(6)'); await sleep(250); await KEY('keyup', 'j');
  await E('t.ff(10)'); await sleep(150);
  const fl = (await E('t.foes()'))[0]; punchHp = fl ? fl.hp : 0;
}
await shot('04-punches');
report.checklist.hits = { foeHp0, foeHpEnd: punchHp, damaged: punchHp < foeHp0 };
console.log('hits: hp', foeHp0, '->', punchHp);
await E('t.ff(40)'); await sleep(600);
await shot('05-ko-splash');

// --- foe retaliation: passive player takes hits to game-over ---
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(150);
await E('t.tp2(t.foes()[0].px - 1.5, t.foes()[0].pz)'); await E('t.ff(6)'); await sleep(100);
const myHp0 = await E('t.info()').then(i => i.hp);
for (let i = 0; i < 30; i++) { await E('t.ff(20)'); await sleep(120); const h = (await E('t.info()')).hp; if (h <= 0) break; }
const myHpEnd = (await E('t.info()')).hp;
await E('t.ff(40)'); await sleep(800);
const goVisible = await page.evaluate(() => !!document.querySelector('.gameOver,.goScreen,[data-go]') || (document.body.innerText || '').includes('GAME OVER'));
await shot('06-gameover');
report.checklist.retaliation = { myHp0, myHpEnd, gameOverVisible: goVisible };
console.log('retaliation: hp', myHp0, '->', myHpEnd, 'gameover:', goVisible);

report.errors = errors;
console.log('errors:', errors.length, errors.slice(0, 5));
fs.writeFileSync(`${SHOTS}/results.json`, JSON.stringify(report, null, 2));
console.log('C5 SWEEP DONE');
await browser.close();

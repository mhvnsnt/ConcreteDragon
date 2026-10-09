// CONTACT COLLISION verification: drives every attack type into an idle defender,
// measures hurtbox interpenetration (must be ZERO after resolution) and strike
// contact stats. Screenshots at strike moments for eyes-on verification.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux-linux64/chrome';
import fs from 'fs';
const CHROME2 = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: fs.existsSync(CHROME) ? CHROME : CHROME2, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
console.log('boot:', booted ? 'PASS' : 'FAIL');
if (!booted) { console.log(errors.slice(0,5)); await browser.close(); process.exit(1); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
const bless = await page.$('.blessCard'); if (bless) { await bless.click(); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1200);
const bless2 = await page.$('.blessCard'); if (bless2) { await bless2.click(); await sleep(400); }

const results = [];
async function strikeTest(name, setupFn, fireFn, waitMs) {
  await E('t.resetContactStats()');
  await E(setupFn);
  await sleep(300);
  const before = await E('t.contactStats()');
  await E(fireFn);
  await sleep(waitMs);
  // let a few frames run so the per-frame guard + hitstop settle
  await E('t.ff(12)');
  await sleep(200);
  const after = await E('t.contactStats()');
  const info = await E('t.info()');
  results.push({ name, ...after, foes: info.foes, kills: info.kills });
  console.log(name, JSON.stringify(after));
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

// Spawn one idle thug next to the player; freeze its AI so it's a still target.
const spawnIdle = `(() => {
  const e = t.spawnFam('thug');
  e.ai = 'idle'; e.aiT = 999;
  const p = t.playerPos();
  // place enemy just in range, facing the player
  return 'spawned';
})()`;
const placeNear = `(() => {
  const p = t.playerPos();
  const foes = t.foes();
  return JSON.stringify({p, foes: foes.length});
})()`;

console.log('--- player strikes vs idle thug ---');
// jab: put player 1.0 left of enemy
await strikeTest('jab',
  `(() => { const e = t.spawnFam('thug'); e.ai='idle'; e.aiT=999; e.hp=500; t.walkTo(e.px - 1.0); return 1; })()`,
  `(() => { t.zeroBusy(); t.doPunch(); return 1; })()`, 900);
await strikeTest('heavy',
  `(() => { const es = t.foes(); const e = es[es.length-1]; t.walkTo(e.px - 1.2); return 1; })()`,
  `(() => { t.zeroBusy(); t.doHeavy(); return 1; })()`, 1100);
await strikeTest('blitz',
  `(() => { const es = t.foes(); const e = es[es.length-1]; t.walkTo(e.px - 2.0); return 1; })()`,
  `(() => { t.zeroBusy(); t.dbgBlitz(); return 1; })()`, 1100);

console.log('--- enemy strike vs player ---');
await strikeTest('enemy-punch',
  `(() => { const e = t.spawnFam('thug'); e.hp=500; e.px = t.playerPos().px + 1.2; return 1; })()`,
  `(() => 1)()`, 2500); // let the enemy AI attack on its own

console.log('--- chaos: 4 thugs brawling, 20s ---');
await E('t.resetContactStats()');
await E(`(() => { for (let i=0;i<3;i++){ const e=t.spawnFam('thug'); e.hp=500; } return 1; })()`);
for (let i = 0; i < 20; i++) {
  await E('t.ff(30)');
  await E(`(() => { t.zeroBusy(); t.doPunch(); return 1; })()`);
  await sleep(150);
}
const chaos = await E('t.contactStats()');
console.log('chaos', JSON.stringify(chaos));
await page.screenshot({ path: `${SHOTS}/chaos.png` });

console.log('--- boss: kingpin strike ---');
await strikeTest('boss-punch',
  `(() => { const b = t.spawnBoss('kingpin'); b.hp=2000; b.px = t.playerPos().px + 2.0; return 1; })()`,
  `(() => 1)()`, 4000);

console.log('\n=== RESULTS ===');
for (const r of results) console.log(r.name, 'maxPen=' + r.maxPen, 'lastStrike=' + r.lastStrike, 'strikes=' + r.strikes);
console.log('chaos maxPen=' + chaos.maxPen, 'strikes=' + chaos.strikes);
console.log('errors:', errors.length, errors.slice(0, 8));
await browser.close();

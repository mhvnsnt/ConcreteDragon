// CYCLE 2 deterministic playtest: real combat verification via the ff() hook.
// Drives the game through the REAL input path (dispatched KeyboardEvents hit the
// same document keydown handler a player uses), then advances the sim with
// ff() — no 2fps time-dilation. Screenshots at key moments for eyes-on.
// Scenarios: (1) neutral punch combo vs a foe, (2) hold-toward lunge displacement
// / overshoot, (3) foe aggression vs a passive player.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-improveloop-c2b';
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
// synchronous key dispatch through the REAL input path
const KEY = async (type, key) => page.evaluate((ty, k) => { document.dispatchEvent(new KeyboardEvent(ty, { key: k, bubbles: true })); }, type, key);
const shot = async (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
console.log('ff hook present:', await E('typeof t.ff'));
await page.tap('#tapStart'); await sleep(800);
await E('t.skipCine()'); await sleep(400);
const bless = await page.$('.blessCard');
if (bless) { await bless.click(); console.log('blessing dismissed'); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(500);
await E('t.skipCine()'); await E('t.ff(30)'); await sleep(300);
const bless2 = await page.$('.blessCard');
if (bless2) { await bless2.click(); console.log('blessing2 dismissed'); await sleep(400); }
console.log('info:', JSON.stringify(await E('t.info()')));
await shot('01-mission-start');

const results = { punches: [], lunges: [], aggression: null };
// ---------- scenario 1: neutral punches vs nearest foe ----------
{
  let foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
  console.log('foe0:', JSON.stringify(foe));
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); // stand in jab range, same lane
  await E('t.setStick(0,0)'); await E('t.ff(10)'); await sleep(200);
  await shot('02-in-range');
  let hits = 0;
  for (let i = 0; i < 6; i++) {
    foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
    if (!foe) break;
    const hp0 = foe.hp, px0 = (await E('t.playerDbg()')).px;
    await KEY('keydown', 'j'); // neutral punch (no direction held)
    await E('t.ff(14)'); await sleep(350); // let hit setTimeout resolve
    const foeAfter = (await E('t.foes()')).filter(f => f.hp > 0)[0];
    const hp1 = foeAfter ? foeAfter.hp : 0;
    const px1 = (await E('t.playerDbg()')).px;
    const landed = hp1 < hp0;
    if (landed) hits++;
    results.punches.push({ i, hp0, hp1, landed, dx: +(px1 - px0).toFixed(2) });
    await E('t.ff(20)'); await sleep(150); // let busy clear
  }
  console.log('neutral punches: hits', hits, '/ 6', JSON.stringify(results.punches.map(p => p.landed ? 1 : 0)));
  await shot('03-after-punches');
}
// ---------- scenario 2: hold-toward lunge displacement / overshoot ----------
{
  await E('t.clearFoes()'); await E('t.spawnFam("thug")'); await E('t.ff(20)'); await sleep(200);
  let foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
  await E(`t.tp2(${foe.px - 2.0}, ${foe.pz})`); await E('t.ff(10)'); await sleep(200);
  await KEY('keydown', 'ArrowRight'); // hold toward (natural: walking at foe)
  const moves = [];
  for (let i = 0; i < 5; i++) {
    const px0 = (await E('t.playerDbg()')).px;
    foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
    const fpx0 = foe ? foe.px : null;
    await KEY('keydown', 'j'); // punch while holding toward = LUNGE STRIKE
    await E('t.ff(14)'); await sleep(350);
    const px1 = (await E('t.playerDbg()')).px;
    foe = (await E('t.foes()')).filter(f => f.hp > 0)[0];
    moves.push({ dx: +(px1 - px0).toFixed(2), foePx: fpx0, foeAlive: !!foe, overshoot: foe ? +(px1 - foe.px).toFixed(2) : null });
    await E('t.ff(20)'); await sleep(150);
  }
  await KEY('keyup', 'ArrowRight');
  results.lunges = moves;
  console.log('lunge displacements:', JSON.stringify(moves.map(m => m.dx)), 'overshoots:', JSON.stringify(moves.map(m => m.overshoot)));
  await shot('04-after-lunges');
}
// ---------- scenario 3: foe aggression vs passive player ----------
{
  await E('t.clearFoes()');
  await E('t.spawnFam("thug")'); await E('t.spawnFam("thug")'); await E('t.ff(10)'); await sleep(200);
  const hp0 = (await E('t.playerDbg()')).hp;
  let windups = 0, lastWu = {};
  // 12 sim-seconds, passive player (no inputs at all)
  for (let i = 0; i < 24; i++) {
    await E('t.ff(30)'); await sleep(120);
    const foes = (await E('t.foes()')).filter(f => f.hp > 0);
    foes.forEach((f, idx) => { if (f.wu > 0.3 && !(lastWu[idx] > 0.3)) windups++; lastWu[idx] = f.wu; });
  }
  const hp1 = (await E('t.playerDbg()')).hp;
  results.aggression = { windups, dmgTaken: hp0 - hp1 };
  console.log('aggression: windups', windups, 'dmg taken in 12 sim-sec:', hp0 - hp1);
  await shot('05-aggression');
}
console.log('errors:', errors.length, errors.slice(0, 8));
fs.writeFileSync(SHOTS + '/results.json', JSON.stringify(results, null, 1));
await browser.close();

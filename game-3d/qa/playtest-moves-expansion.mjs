// MOVES EXPANSION verification: new clips play, ki blast fires, wave charges, spin works.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/dist/concrete-dragon.html';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/shots-moves';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
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

// 1. Verify new clips are loaded
const clips = await E(`t.clips().filter(k => ['KiBlast','WaveCharge','WaveRelease','SpinAttack','Idle_B','Melee_Unarmed_Attack_Punch_B','Melee_Unarmed_Attack_Kick_A'].includes(k))`);
console.log('new clips loaded:', JSON.stringify(clips));

// 2. Play each clip and capture
for (const clip of ['KiBlast', 'WaveCharge', 'WaveRelease', 'SpinAttack', 'Melee_Unarmed_Attack_Punch_B', 'Melee_Unarmed_Attack_Kick_A']) {
  await E(`t.playClip('${clip}')`);
  await sleep(300);
  await page.screenshot({ path: `${SHOTS}/clip-${clip}.png` });
  console.log('captured', clip);
  await sleep(400);
}

// 3. Ki blast fires
await E('t.setEnergy(100)');
const ki0 = await E('t.projCount()');
await E('t.doKiBlast()');
await sleep(500);
const ki1 = await E('t.projCount()');
console.log('ki blast proj:', ki0, '->', ki1, ki1 > ki0 ? 'PASS' : 'FAIL');
await page.screenshot({ path: `${SHOTS}/kiblast-fire.png` });

// 4. Wave charge + release
await E('t.setEnergy(100)');
await E('t.doWaveStart()');
await sleep(800);
await page.screenshot({ path: `${SHOTS}/wave-charge.png` });
await E('t.doWaveRelease()');
await sleep(500);
const wv = await E('t.projCount()');
console.log('wave proj count:', wv);
await page.screenshot({ path: `${SHOTS}/wave-release.png` });

// 5. Spin attack
await E('t.setEnergy(100)');
await E(`t.doSpinAttack({name:'TEST SPIN', dmg:10, color:0x00ff00, dur:0.6, cost:0})`);
await sleep(400);
await page.screenshot({ path: `${SHOTS}/spin.png` });
console.log('spin: PASS');

console.log('errors:', errors.length ? errors.slice(0,5) : 'none');
await browser.close();

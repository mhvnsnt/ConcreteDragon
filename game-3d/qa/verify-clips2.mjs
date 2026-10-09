// Visual verification v2: clear scene, no tutorial, busy locked, cropped captures.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/dist/concrete-dragon.html';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/shots-moves-v2';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
const bless = await page.$('.blessCard'); if (bless) { await bless.click(); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1200);
const bless2 = await page.$('.blessCard'); if (bless2) { await bless2.click(); await sleep(400); }
// clear scene: hide hint, kill enemies, lock player
await E(`(() => { document.getElementById('hint').style.display='none'; return 1; })()`);
await E('t.killAll()');
await E('t.tp(6)');
await E(`(() => { const p = t.playerDbg(); return p.px; })()`);

const tests = [
  ['KiBlast', 12],
  ['WaveCharge', 25],
  ['WaveRelease', 10],
  ['SpinAttack', 20],
  ['Melee_Unarmed_Attack_Punch_B', 18],
  ['Melee_Unarmed_Attack_Kick_A', 20],
];
for (const [clip, ff] of tests) {
  await E(`t.setBusy(999)`);
  await E(`t.playClip('${clip}')`);
  await E(`t.ff(${ff})`);
  await sleep(300);
  await page.screenshot({ path: `${SHOTS}/${clip}.png` });
  console.log('captured', clip);
  await E(`t.setBusy(0)`);
}
await browser.close();
console.log('done');

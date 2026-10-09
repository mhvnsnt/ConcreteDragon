// Clip validation: plays the retargeted test_suplex clip on the player, screenshots at intervals.
// Verifies the retarget looks like a humanoid suplex motion, not a broken rig.
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-movesets/game-3d/shots-movesets';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));

await page.goto('file:///home/hatch/workspace/ConcreteDragon-movesets/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
console.log(booted ? 'PASS | boot' : 'FAIL | boot');
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('brick')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E('t.clearFoes()'); await sleep(300);

// check the clip exists
const clipNames = await E(`Object.keys(t.clipNames ? t.clipNames() : [])`);
console.log('clip test_suplex present:', clipNames.includes('test_suplex'), '| total clips:', clipNames.length);

// play the clip on the player, screenshot at 4 points through the motion
await E(`t.playClipOnPlayer('test_suplex')`);
for (let i = 0; i < 4; i++) {
  await sleep(1100);
  await page.screenshot({ path: SHOTS + `/suplex-${i}.png` });
  console.log('shot', i);
}
console.log('errors:', errors.length, errors.slice(0, 3));
await browser.close();

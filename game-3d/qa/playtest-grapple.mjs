import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
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
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
// wait for grab phase with game-time awareness (headless is ~20x slow)
async function waitGrabPhase(phase, timeoutMs = 90000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const g = await E('t.playerGrab()');
    if (g && g.phase === phase) return g;
    if (!g && phase === null) return null;
    await sleep(2000);
  }
  return await E('t.playerGrab()');
}

await page.goto('file:///home/hatch/workspace/ConcreteDragon-movesets/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
check('boot', booted);
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('brick')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E('t.spawnFoeAt(3.5)'); await sleep(1000);

const hpBefore = await E('t.foeHp(0)');
await E('t.doGrapple()');
const g1 = await waitGrabPhase('deliver', 30000);
check('grab started (deliver)', g1 && g1.phase === 'deliver');
await page.screenshot({ path: SHOTS + '/grab-deliver.png' });

const g2 = await waitGrabPhase('recover', 60000);
check('advanced to recover', g2 && g2.phase === 'recover');
await page.screenshot({ path: SHOTS + '/grab-recover.png' });
const hpAfter = await E('t.foeHp(0)');
check('foe took grab damage', hpAfter < hpBefore);
console.log('foe hp', hpBefore, '->', hpAfter);

const g3 = await waitGrabPhase('window', 60000);
check('chain window opened', g3 && g3.phase === 'window');
if (g3 && g3.phase === 'window') {
  await page.screenshot({ path: SHOTS + '/grab-window.png' });
  await E('t.doGrapple()'); // chain to link 1
  const g4 = await waitGrabPhase('deliver', 30000);
  check('chained to link 1', g4 && g4.link === 1);
  await page.screenshot({ path: SHOTS + '/grab-chain1.png' });
}
console.log('errors:', errors.length, errors.slice(0, 5));
await browser.close();

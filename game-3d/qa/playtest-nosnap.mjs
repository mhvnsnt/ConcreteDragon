import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-movesets/game-3d/shots-movesets';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 150)));
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));

await page.goto('file:///home/hatch/workspace/ConcreteDragon-movesets/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('brick')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E('t.spawnFoeAt(3.5)'); await sleep(1000);

// Start grab, capture 6 frames through the sequence (game-time aware)
await E('t.doGrapple()');
// Track victim py over time to detect snaps (sudden jumps)
const pys = [];
for (let i = 0; i < 6; i++) {
  await sleep(2500);
  const py = await E('t.foePy(0)');
  const phase = await E('t.playerGrab()');
  pys.push({ i, py, phase: phase ? phase.phase : null });
  await page.screenshot({ path: SHOTS + `/noseq-${i}.png` });
}
console.log('victim py trace:', JSON.stringify(pys));
// Check for snaps: any py jump > 1.5 between consecutive samples = snap
let snapped = false;
for (let i = 1; i < pys.length; i++) {
  if (pys[i].py !== null && pys[i-1].py !== null && Math.abs(pys[i].py - pys[i-1].py) > 1.5) {
    console.log('SNAP DETECTED between', i-1, 'and', i, ':', pys[i-1].py, '->', pys[i].py);
    snapped = true;
  }
}
console.log(snapped ? 'FAIL | snap detected' : 'PASS | no snaps in py trace');
await browser.close();

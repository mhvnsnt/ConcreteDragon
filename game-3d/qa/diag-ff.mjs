// Test t.ff() specifically
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 60000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 150)));
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon-weapons-items/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
console.log('mission started, px:', (await E('t.info()')).px);
// spawn pipe pickup and ff
await E(`t.spawnPickupAt('wpn_pipe', 0)`);
console.log('pickup spawned, pickups:', await E('t.pickupDbg().length'));
console.log('calling t.ff(40)...');
const ffResult = await Promise.race([
  E('t.ff(40)'),
  sleep(15000).then(() => 'TIMEOUT')
]);
console.log('ff result:', ffResult);
console.log('weapon:', await E('t.playerDbg().weapon ? t.playerDbg().weapon.type : null'));
await browser.close();
console.log('done');

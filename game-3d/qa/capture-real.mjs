// Fresh REAL gameplay captures for itch.io — from the actual current build.
// No mockups: title screen + live combat, straight from dist/concrete-dragon.html.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/concrete-dragon-itch/art/screenshots-real';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 160)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 12; i++) { try { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } } catch(e){} await sleep(2000); }
console.log('booted:', booted);
await sleep(1500);
await page.screenshot({ path: SHOTS + '/real-title.png' });
// start mission
await page.tap('#tapStart'); await sleep(900);
try { await E('t.skipCine()'); } catch(e){}
await sleep(500);
try { await E(`t.setFighter('kidblue')`); } catch(e){}
await sleep(500);
// mission select -> pick first mission if the API exists, else tap through
const st1 = await E('t.simDbg().st').catch(() => 'unknown');
console.log('state after start:', st1);
await page.screenshot({ path: SHOTS + '/real-select.png' });
// try to begin mission 1
try { await E("t.startMission('m1')"); } catch(e) { console.log('startMission(1) failed, tapping'); }
await sleep(4000);
await page.screenshot({ path: SHOTS + '/real-combat1.png' });
// fight: throw some punches for action shots
for (let i = 0; i < 6; i++) {
  try { await E('t.doPunch()'); } catch(e){}
  await sleep(900);
  if (i === 2) await page.screenshot({ path: SHOTS + '/real-combat2.png' });
  if (i === 4) { try { await E('t.doSpecial()'); } catch(e){} await sleep(1200); await page.screenshot({ path: SHOTS + '/real-special.png' }); }
}
await page.screenshot({ path: SHOTS + '/real-combat3.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

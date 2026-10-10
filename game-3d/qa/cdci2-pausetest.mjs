// CDCI2 PAUSE TEST — does the pause button work during real combat?
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-pause';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci2/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1000);
// get to fight via hooks (fast path)
try { await E(`t.setFighter('kidblue')`); await E(`t.startMission('m1')`); await E('t.skipCine()'); } catch(e){}
await sleep(3000);
console.log('fight state:', await E('t.simDbg().st'));
// tap the actual pause button (top center)
const pauseBtn = await page.evaluate(() => {
  const b = document.querySelector('#pauseBtn');
  return b ? { x: b.getBoundingClientRect().x + 10, y: b.getBoundingClientRect().y + 10, vis: getComputedStyle(b).display } : null;
});
console.log('pauseBtn:', JSON.stringify(pauseBtn));
if (pauseBtn) await page.touchscreen.tap(pauseBtn.x, pauseBtn.y);
await sleep(1500);
console.log('after pause tap:', await E('t.simDbg().st'));
const pauseOv = await page.evaluate(() => {
  const o = document.querySelector('#pauseOv');
  return o ? getComputedStyle(o).display : 'no element';
});
console.log('pauseOv display:', pauseOv);
await page.screenshot({ path: SHOTS + '/pause-test.png' });
await browser.close();
console.log('done');

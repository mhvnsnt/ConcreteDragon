// CDCI3 TAP DEBUG — does tapping advance the intro?
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci3/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
console.log('before tap, title hidden?', await page.evaluate(() => document.querySelector('#title').classList.contains('hidden')));
// dispatch a real pointerdown at the tapStart location
const pt = await page.evaluate(() => { const r = document.querySelector('#tapStart').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
console.log('tap point:', JSON.stringify(pt));
await page.touchscreen.tap(pt.x, pt.y);
await sleep(2500);
console.log('after tap: state=', await E('t.simDbg().st').catch(() => '?'),
  'cineCap.on=', await page.evaluate(() => document.querySelector('#cineCap').classList.contains('on')),
  'title hidden=', await page.evaluate(() => document.querySelector('#title').classList.contains('hidden')));
// skip
await page.evaluate(() => document.querySelector('#cineSkip')?.click());
await sleep(2000);
console.log('after skip: state=', await E('t.simDbg().st').catch(() => '?'),
  'select hidden=', await page.evaluate(() => document.querySelector('#select').classList.contains('hidden')));
await page.screenshot({ path: '/tmp/cdci3-tour2/03-select.png' });
await browser.close();
console.log('done');

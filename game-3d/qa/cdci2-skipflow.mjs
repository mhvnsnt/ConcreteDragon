// CDCI2 SKIP FLOW — tap to start, tap to skip intro (like a real user), check select
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-skipflow';
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
await sleep(1500);
await page.tap('#tapStart').catch(() => {});
await sleep(3000);
// tap to skip the cinematic (like a real user)
await page.touchscreen.tap(422, 195).catch(() => {});
await sleep(2500);
console.log('state after skip:', await E('t.simDbg().st').catch(() => '?'));
console.log('showName:', await page.evaluate(() => document.querySelector('#showName')?.textContent));
console.log('cap.on:', await page.evaluate(() => document.querySelector('#cineCap')?.classList.contains('on')));
await page.screenshot({ path: SHOTS + '/s1-select-after-skip.png' });
await browser.close();
console.log('done');

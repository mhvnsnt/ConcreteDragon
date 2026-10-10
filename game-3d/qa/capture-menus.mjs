// MENU CAPTURE — title, select, mission screens after digestibility fixes.
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cd-menus';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
import { mkdirSync } from 'fs';
mkdirSync(SHOTS, { recursive: true });
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(2000);
await page.screenshot({ path: SHOTS + '/m1-title.png' });
// scroll title to bottom to verify no overlap
await page.evaluate(() => { const el = document.getElementById('title'); if (el) el.scrollTop = el.scrollHeight; });
await sleep(500);
await page.screenshot({ path: SHOTS + '/m2-title-scrolled.png' });
// tap start -> select screen
await page.evaluate(() => { const el = document.getElementById('title'); if (el) el.scrollTop = 0; });
await sleep(300);
await page.tap('#tapStart').catch(() => console.log('no tapStart'));
await sleep(1500);
console.log('state:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/m3-select.png' });
// try mission screen
try { await E(`t.setFighter('kidblue')`); } catch(e){}
await sleep(800);
await page.screenshot({ path: SHOTS + '/m4-select-fighter.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

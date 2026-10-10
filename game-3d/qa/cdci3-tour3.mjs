// CDCI3 FULL TOUR v3 — generous waits for slow headless rendering
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci3-tour3';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci3/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
await page.screenshot({ path: SHOTS + '/01-title.png' });
console.log('title ok');
const pt = await page.evaluate(() => { const r = document.querySelector('#tapStart').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await page.touchscreen.tap(pt.x, pt.y);
console.log('tapped, waiting for intro...');
await sleep(6000);
await page.screenshot({ path: SHOTS + '/02-intro-mid.png' });
console.log('mid-intro cineCap:', await page.evaluate(() => document.querySelector('#cineCap').textContent.trim().slice(0, 60)));
// wait for intro to finish naturally -> select
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'select') break; } catch(e){} await sleep(3000); }
console.log('state now:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/03-select.png' });
// mission screen?
const mvis = await page.evaluate(() => !document.querySelector('#mission').classList.contains('hidden'));
console.log('mission visible:', mvis);
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

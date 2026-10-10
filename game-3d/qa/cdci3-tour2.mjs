// CDCI3 FULL TOUR v2 — title shot, tap through to combat
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci3-tour2';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci3/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
await page.screenshot({ path: SHOTS + '/01-title-fixed.png' });
console.log('title shot ok');
// tap to start (should work now)
await page.tap('#tapStart');
await sleep(2000);
console.log('after tap:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/02-intro.png' });
// skip the intro
await page.evaluate(() => document.querySelector('#cineSkip')?.click());
await sleep(2500);
console.log('after skip:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/03-select.png' });
// find and click the fight/start button
const btns = await page.evaluate(() => [...document.querySelectorAll('#select button')].map(b => ({ id: b.id, text: b.textContent.trim().slice(0, 24), vis: b.offsetParent !== null })));
console.log('select buttons:', JSON.stringify(btns));
await browser.close();
console.log('done errors:', errors.length ? errors : 'none');

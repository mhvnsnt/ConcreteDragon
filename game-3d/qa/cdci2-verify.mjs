// CDCI2 VERIFY FIXES — intro HUD hidden + select logo smaller
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-verify';
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
await sleep(4000);
// FIX 1: HUD + touch should be hidden during intro
const hudDisplay = await page.evaluate(() => document.querySelector('#hud')?.style.display);
const touchOn = await page.evaluate(() => document.querySelector('#touch')?.classList.contains('on'));
console.log('intro: hud.display=' + hudDisplay, 'touch.on=' + touchOn);
await page.screenshot({ path: SHOTS + '/v1-intro-clean.png' });
// skip to select
await page.touchscreen.tap(422, 195).catch(() => {});
await sleep(2500);
console.log('select state:', await E('t.simDbg().st'));
await page.screenshot({ path: SHOTS + '/v2-select-logo.png' });
// logo size check
const logoW = await page.evaluate(() => document.querySelector('#select #logo img')?.getBoundingClientRect().width);
console.log('select logo width:', logoW);
await browser.close();
console.log('done');

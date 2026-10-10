// CDCI2 REAL FLOW — tap, wait for intro to complete naturally, check select
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-realflow';
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
// wait for intro cinematic to complete naturally (7.5s + buffer)
await sleep(9000);
console.log('state after intro:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/r1-select-natural.png' });
// check for leftover cine layer
const cineVisible = await page.evaluate(() => {
  const cap = document.querySelector('#cineCap');
  const skip = document.querySelector('#tapSkip, .tap-skip');
  return 'cap.on=' + (cap && cap.classList.contains('on')) + ' skip=' + (skip ? getComputedStyle(skip).display : 'n/a');
});
console.log('cine layer:', cineVisible);
console.log('showName:', await page.evaluate(() => document.querySelector('#showName')?.textContent));
await browser.close();
console.log('done');

// CDCI2 FOCUSED — select screen + pause verification
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-focused';
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
// What does tapStart do? Check state machine + visible elements
console.log('title state:', await E('t.simDbg().st'));
const tapStartVisible = await page.evaluate(() => !!document.querySelector('#tapStart'));
console.log('#tapStart visible:', tapStartVisible);
// List the hook names available
const hooks = await E('Object.keys(t).slice(0,60).join(",")').catch(e => 'ERR ' + e.message.slice(0,100));
console.log('hooks:', hooks);
await page.tap('#tapStart').catch(() => {});
await sleep(2000);
console.log('after tap state:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/f1-after-tap.png' });
// Check if select screen exists in DOM
const selectInfo = await page.evaluate(() => {
  const el = document.querySelector('#selectScreen, .select-screen, [id*=select]');
  return el ? ('found: ' + el.id + ' display=' + getComputedStyle(el).display) : 'no select element';
});
console.log('select element:', selectInfo);
// Try showSelect if it exists
try { await E('t.showSelect()'); await sleep(1500); console.log('after showSelect:', await E('t.simDbg().st')); } catch(e){ console.log('showSelect failed:', e.message.slice(0,80)); }
await page.screenshot({ path: SHOTS + '/f2-select-attempt.png' });
await browser.close();
console.log('done');

// CDCI3 PLAYTEST TOUR — boot, title, tap start, intro, select, mission, combat. Screenshots at every step.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci3-tour';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci3/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(2000);
await page.screenshot({ path: SHOTS + '/01-title.png' });
console.log('title ok');
await page.tap('#tapStart').catch(async () => { await page.evaluate(() => document.querySelector('#tapStart')?.click()); });
await sleep(3000);
await page.screenshot({ path: SHOTS + '/02-intro.png' });
console.log('intro state:', await E('t.simDbg().st').catch(() => '?'));
// skip intro if a skip exists
await page.evaluate(() => document.querySelector('#tapSkip, .tap-skip')?.click()).catch(() => {});
await sleep(2500);
console.log('after skip state:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/03-select.png' });
// start a mission if a start button exists
const started = await page.evaluate(() => {
  const b = document.querySelector('#startMission, .start-mission, #btnFight, .btn-fight');
  if (b) { b.click(); return b.id || b.className; }
  return null;
});
console.log('start button:', started);
await sleep(4000);
console.log('mission state:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/04-mission.png' });
// spawn a foe and fight
await E('t.spawnFoeAt(3)').catch(() => {});
await sleep(1500);
await E('t.dbgStrike(4)').catch(() => {});
await sleep(800);
await page.screenshot({ path: SHOTS + '/05-combat.png' });
console.log('foes:', await E('t.foeCount()').catch(() => '?'), 'player:', JSON.stringify(await E('t.playerDbg()').catch(() => '?')));
console.log('js errors:', errors.length ? errors.slice(0, 10) : 'none');
await browser.close();
console.log('done');

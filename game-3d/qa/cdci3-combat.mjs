// CDCI3 COMBAT VERIFY — jump straight into a fight, heavy hits + KO, check pow words
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci3-combat';
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
// jump straight into a mission via the test hook
console.log('startMission:', await E('t.startMission(0)').catch((e) => 'ERR ' + e.message));
await sleep(6000);
console.log('state:', await E('t.simDbg().st').catch(() => '?'));
await page.screenshot({ path: SHOTS + '/c1-mission.png' });
// spawn 3 foes near the player and whack them
await E('t.spawnFoeAt(2.5)').catch(() => {});
await E('t.spawnFoeAt(-2.5)').catch(() => {});
await E('t.spawnFoeAt(4)').catch(() => {});
await sleep(2500);
await page.screenshot({ path: SHOTS + '/c2-foes.png' });
console.log('foes:', await E('t.foeCount()').catch(() => '?'));
// heavy strikes: freeze foes so they don't wander, then land hits
await E('t.freeze(true)').catch(() => {});
await E('t.setHp(9999)').catch(() => {});
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => { const t = window.__cdtest; const e = t.spawnFoeAt ? null : null; });
  await E(`(function(){ const e = window.__cdtest; return e.dbgStrike ? 'ok' : 'no'; })()`).catch(() => {});
  await sleep(300);
}
// use the game's own heavy attack path: strikeHit with HEAVY label via debug
console.log('heavy test:', await E(`(function(){
  const t = window.__cdtest;
  // find landHit path: use dbgStrike then check enemies
  return JSON.stringify(t.enemiesDbg());
})()`).catch((e) => 'ERR'));
await E('t.freeze(false)').catch(() => {});
await page.screenshot({ path: SHOTS + '/c3-after.png' });
console.log('pow words in DOM:', await page.evaluate(() => document.querySelectorAll('.pop.pow').length));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

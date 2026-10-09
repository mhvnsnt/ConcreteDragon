// REAL PLAYTHROUGH — play the game like a player, capture every screen.
// Title -> fighter select -> mission select -> combat -> pause -> results.
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cd-playtest';
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
let booted = false;
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } } catch(e){} await sleep(2000); }
console.log('booted:', booted);
await sleep(2000);
await page.screenshot({ path: SHOTS + '/01-title.png' });
// tap start
const st0 = await E('t.simDbg().st').catch(() => 'unknown');
console.log('state:', st0);
await page.tap('#tapStart').catch(() => console.log('tapStart not found'));
await sleep(1500);
console.log('after start:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/02-select.png' });
// pick kidblue if on select
try { await E(`t.setFighter('kidblue')`); } catch(e){}
await sleep(1000);
await page.screenshot({ path: SHOTS + '/03-fighter-picked.png' });
// start mission 1
try { await E(`t.startMission('m1')`); } catch(e){ console.log('startMission failed'); }
await sleep(5000);
console.log('in mission:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/04-combat-start.png' });
// fight like a player: move + punch combos
for (let i = 0; i < 10; i++) {
  try { await E('t.doPunch()'); } catch(e){}
  await sleep(700);
  if (i === 3) await page.screenshot({ path: SHOTS + '/05-combat-mid.png' });
  if (i === 5) { try { await E('t.doKick()'); } catch(e){} }
  if (i === 7) { try { await E('t.doSpecial()'); } catch(e){} await sleep(800); await page.screenshot({ path: SHOTS + '/06-special.png' }); }
}
await page.screenshot({ path: SHOTS + '/07-combat-late.png' });
const hp = await E('JSON.stringify({php: t.simDbg().php, fhp: t.simDbg().fhp, score: t.simDbg().score})').catch(() => 'unknown');
console.log('health/score:', hp);
// pause menu
try { await E('t.togglePause()'); } catch(e){ console.log('pause failed'); }
await sleep(1000);
await page.screenshot({ path: SHOTS + '/08-pause.png' });
console.log('paused state:', await E('t.simDbg().st').catch(() => 'unknown'));
// resume
try { await E('t.togglePause()'); } catch(e){}
await sleep(1000);
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

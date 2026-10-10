// REAL COMBAT PLAYTEST — skip cinematics, fight real enemies, verify combat.
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cd-combat';
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
await sleep(1000);
// go to select
await page.tap('#tapStart').catch(() => {});
await sleep(1500);
try { await E(`t.setFighter('kidblue')`); } catch(e){}
await sleep(500);
// start mission and SKIP the cinematic
try { await E(`t.startMission('m1')`); } catch(e){}
await sleep(2000);
try { await E('t.skipCine()'); } catch(e){ console.log('skipCine failed'); }
await sleep(3000);
const st = await E('t.simDbg().st').catch(() => 'unknown');
console.log('state after skip:', st);
await page.screenshot({ path: SHOTS + '/c1-fight-start.png' });
// count foes
const foes = await E('t.simDbg().foes').catch(() => 'unknown');
console.log('foes:', foes);
// fight for real — punch combos with movement
for (let i = 0; i < 15; i++) {
  try { await E('t.doPunch()'); } catch(e){}
  await sleep(600);
  if (i === 5) await page.screenshot({ path: SHOTS + '/c2-fight-mid.png' });
  if (i === 8) { try { await E('t.doKick()'); } catch(e){} }
  if (i === 10) { try { await E('t.doSpecial()'); } catch(e){} await sleep(800); await page.screenshot({ path: SHOTS + '/c3-special.png' }); }
}
await page.screenshot({ path: SHOTS + '/c4-fight-late.png' });
const dbg = await E('JSON.stringify({st: t.simDbg().st, php: t.simDbg().php, fhp: t.simDbg().fhp, foes: t.simDbg().foes, score: t.simDbg().score, combo: t.simDbg().combo})').catch(() => 'unknown');
console.log('debug:', dbg);
// now try pause during real combat
try { await E('t.togglePause()'); } catch(e){}
await sleep(800);
console.log('after pause:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/c5-pause.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

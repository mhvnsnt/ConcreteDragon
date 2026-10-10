// CDCI2 PLAYTEST — play current main build for real, capture every screen.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-playtest';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci2/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
await page.screenshot({ path: SHOTS + '/p1-title.png' });
// select screen
await page.tap('#tapStart').catch(() => {});
await sleep(1500);
await page.screenshot({ path: SHOTS + '/p2-select.png' });
try { await E(`t.setFighter('kidblue')`); } catch(e){}
await sleep(800);
await page.screenshot({ path: SHOTS + '/p3-select-kidblue.png' });
// mission + skip cine
try { await E(`t.startMission('m1')`); } catch(e){}
await sleep(2500);
try { await E('t.skipCine()'); } catch(e){}
await sleep(3000);
console.log('state:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/p4-combat-start.png' });
// real fight: combos, movement, special, block, dodge
for (let i = 0; i < 20; i++) {
  try { await E('t.doPunch()'); } catch(e){}
  await sleep(500);
  if (i === 4) await page.screenshot({ path: SHOTS + '/p5-combat-mid.png' });
  if (i === 7) { try { await E('t.doKick()'); } catch(e){} }
  if (i === 9) { try { await E('t.doDodge()'); } catch(e){} await sleep(300); await page.screenshot({ path: SHOTS + '/p6-dodge.png' }); }
  if (i === 11) { try { await E('t.doSpecial()'); } catch(e){} await sleep(600); await page.screenshot({ path: SHOTS + '/p7-special.png' }); }
  if (i === 13) { try { await E('t.doKiBlast()'); } catch(e){} await sleep(600); await page.screenshot({ path: SHOTS + '/p8-kiblast.png' }); }
  if (i === 15) { try { await E('t.doSpinAttack()'); } catch(e){} await sleep(600); await page.screenshot({ path: SHOTS + '/p9-spin.png' }); }
}
await page.screenshot({ path: SHOTS + '/p10-combat-late.png' });
const dbg = await E('JSON.stringify({st: t.simDbg().st, php: t.simDbg().php, fhp: t.simDbg().fhp, foes: t.simDbg().foes, score: t.simDbg().score, combo: t.simDbg().combo})').catch(() => 'unknown');
console.log('debug:', dbg);
// pause
try { await E('t.togglePause()'); } catch(e){}
await sleep(800);
await page.screenshot({ path: SHOTS + '/p11-pause.png' });
console.log('after pause:', await E('t.simDbg().st').catch(() => 'unknown'));
try { await E('t.togglePause()'); } catch(e){}
await sleep(800);
// results screen attempt — kill remaining foes via debug
try { await E('t.dbgKillFoes()'); } catch(e){ console.log('dbgKillFoes n/a'); }
await sleep(4000);
console.log('after kill:', await E('t.simDbg().st').catch(() => 'unknown'));
await page.screenshot({ path: SHOTS + '/p12-results.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

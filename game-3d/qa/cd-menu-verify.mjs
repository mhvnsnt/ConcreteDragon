// Watchdog in-game verify for cd-menu-redesign: tabs switch, selectBackBtn -> title,
// pause quitTitleBtn -> title. Reports PASS/FAIL, screenshots to /tmp/cd-menu-verify.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cd-menu-verify';
mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok) => { results.push([name, ok]); console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errs = [];
page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errs.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const vis = (id) => page.evaluate((x) => {
  const el = document.getElementById(x); if (!el) return 'missing';
  return getComputedStyle(el).display + '|' + (el.classList.contains('hidden') ? 'hidden' : 'shown');
}, id);

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'load', timeout: 60000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch (e) {} await sleep(2000); }
check('booted to title', (await E('t.simDbg().st')) === 'title');

// tap start -> intro cine -> skip -> select
await page.tap('#tapStart');
await sleep(1500);
console.log('cine after tap:', await E('t.cine()').catch(() => 'n/a'));
try { await E('t.skipCine()'); } catch (e) {}
await sleep(1000);
check('tapStart -> intro -> select state', (await E('t.simDbg().st')) === 'select');
const selVis = await vis('select');
check('select screen shown', selVis.includes('shown') && selVis.split('|')[0] !== 'none');
await page.screenshot({ path: SHOTS + '/v2-select.png' });

// tabs switch (select must be visible for this to be meaningful)
for (const [labelFor, pane] of [['tabMoves','paneMoves'],['tabStyle','paneStyle'],['tabStats','paneStats'],['tabFighter','paneFighter']]) {
  await page.evaluate((f) => { document.querySelector(`label[for="${f}"]`).click(); }, labelFor);
  await sleep(300);
  const disp = await page.evaluate((p) => getComputedStyle(document.getElementById(p)).display, pane);
  check(`tab ${pane} visible after click`, disp === 'flex');
  const selOK = (await vis('select')).includes('shown');
  check(`select still shown on ${pane}`, selOK);
}
await page.evaluate(() => { document.getElementById('tabFighter').checked = true; });
await page.screenshot({ path: SHOTS + '/v2-select-fighter.png' });

// selectBackBtn -> title
await page.tap('#selectBackBtn').catch((e) => console.log('backBtn tap err:', e.message.slice(0, 120)));
await sleep(900);
check('selectBackBtn -> title state', (await E('t.simDbg().st')) === 'title');
check('title shown after back', (await vis('title')).includes('shown'));
await page.screenshot({ path: SHOTS + '/v2-title-back.png' });

// mission -> pause -> quitTitleBtn -> title
await page.tap('#tapStart'); await sleep(1200);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(800);
await E(`t.setFighter('kidblue')`); await sleep(300);
await E(`t.startMission('m1')`); await sleep(800);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(1200);
console.log('in-mission state:', await E('t.simDbg().st'));
await page.tap('#pauseBtn').catch((e) => console.log('pauseBtn tap err:', e.message.slice(0, 120)));
await sleep(700);
check('pauseOv shown after pauseBtn', (await vis('pauseOv')).includes('shown'));
await page.screenshot({ path: SHOTS + '/v2-pause.png' });
await page.tap('#quitTitleBtn').catch((e) => console.log('quitTitleBtn tap err:', e.message.slice(0, 120)));
await sleep(900);
check('quitTitleBtn -> title state', (await E('t.simDbg().st')) === 'title');
check('pauseOv hidden after quit', (await vis('pauseOv')).includes('hidden'));
await page.screenshot({ path: SHOTS + '/v2-final-title.png' });

console.log('page errors:', errs.length ? errs : 'none');
await browser.close();
const fails = results.filter((r) => !r[1]);
console.log(`RESULT: ${results.length - fails.length}/${results.length} checks passed`);
process.exit(fails.length ? 1 : 0);

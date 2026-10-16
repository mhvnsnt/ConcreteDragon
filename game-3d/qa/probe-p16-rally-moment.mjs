// P16b focused probe: prove the 'RALLY RECOVERED!' moment fires on true full conversion,
// and identify the single resource-load console error (with URL) seen in the main run.
// Deterministic: small 2-HP bank (setHp(20) -> doDesperation), 2 jabs, foe never dies
// (no OLD BLOOD lifesteal to top HP off and forfeit the bank).
import { createRequire } from 'module';
const require = createRequire('/tmp/p15qa/package.json');
const puppeteer = require('puppeteer-core');
import { mkdirSync } from 'fs';

const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-p16-rally';
const URL = 'file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html';
mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) pass++; else fail++; console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name + (extra !== undefined ? ' | ' + extra : '')); };

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', protocolTimeout: 240000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errs = [];
page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (t.includes('manifest.webmanifest')) return;
  const loc = m.location();
  errs.push('[console.error] ' + t.slice(0, 160) + ' @ ' + (loc && loc.url ? loc.url.slice(-80) : '?'));
});
page.on('requestfailed', (r) => errs.push('[requestfailed] ' + r.url().slice(-100) + ' :: ' + (r.failure() && r.failure().errorText)));
const Eraw = (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const E = async (expr) => { try { return await Eraw(expr); } catch (e) { await sleep(3000); return await Eraw(expr); } };
const shot = async (n) => { await E('t.stepRender(1/60)'); await page.screenshot({ path: `${SHOTS}/${n}.png` }); };

await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch (e) {} await sleep(2000); }
check('booted to title', (await E('t.simDbg().st')) === 'title');
await page.tap('#tapStart'); await sleep(1500);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(1000);
await E(`t.setFighter('kidblue')`); await sleep(300);
await E(`t.startMission('m1')`); await sleep(800);
try { await E('t.skipCine()'); } catch (e) {}
try { const b = await page.$('.blessCard'); if (b) { await b.click(); await sleep(500); } } catch (e) {}
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'fight') break; } catch (e) {} await sleep(1000); }
check('in fight', (await E('t.simDbg().st')) === 'fight');
await E('t.unpause()'); await E('t.capHold(true)'); await E('t.ff(5)');
await E('t.clearFoes()');

// small deterministic bank: hp 20 -> desperation costs 2 -> rally 2
await E('t.setHp(20)'); await E('t.setBusy(0)'); await E('t.doDesperation()'); await E('t.ff(5)');
let r = await E('t.rallyDbg()');
check('small bank: hp 18 rally 2', r.hp === 18 && r.rally === 2, `hp=${r.hp} rally=${r.rally}`);
const px = await E('t.playerDbg().px');
await E(`t.spawnFoeAt(${px + 0.65})`); await E('t.dbgFoePassive()'); await E('t.setBusy(0)'); await E('t.ff(5)');
await E(`t.dbgG3('clean')`); await E('t.ff(3)');
r = await E('t.rallyDbg()');
check('jab 1 converts 1 (hp 19 rally 1)', r.hp === 19 && r.rally === 1, `hp=${r.hp} rally=${r.rally}`);
check('foe alive (no lifesteal interference)', (await E('t.foeHp(0)')) > 0, `foeHp=${await E('t.foeHp(0)')}`);
await E(`t.dbgG3('clean')`); await E('t.ff(3)');
r = await E('t.rallyDbg()');
check('jab 2 empties bank (hp 20 rally 0)', r.hp === 20 && r.rally === 0, `hp=${r.hp} rally=${r.rally}`);
const evts = await E('t.dbgEvents()');
check("'rallyfull' event fired", evts.includes('rallyfull'));
const popCount = await page.evaluate(() => [...document.querySelectorAll('.pop')].filter((d) => d.textContent.includes('RALLY RECOVERED')).length);
check("'RALLY RECOVERED!' popup in DOM", popCount > 0, `found=${popCount}`);
await shot('07-rally-moment'); // eyes: popup + all-blue full bar
console.log('console/page errors:', errs.length ? errs : 'none');
await browser.close();
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);

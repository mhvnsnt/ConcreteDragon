// P15 focused part 2: string combos (P15d), launcher finisher (P15e), KO/popups (P15f).
// Hardened: synchronous logging (no lost output on crash), best-effort screenshots.
import { createRequire } from 'module';
const require = createRequire('/tmp/p15qa/package.json');
const puppeteer = require('puppeteer-core');
import { mkdirSync, appendFileSync } from 'fs';

const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-p15';
const URL = 'file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html';
const LOGF = '/tmp/p15qa/test2.log';
mkdirSync(SHOTS, { recursive: true });
try { (await import('fs')).writeFileSync(LOGF, ''); } catch (e) {}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (s) => { appendFileSync(LOGF, s + '\n'); };
const results = [];
const check = (name, ok, extra) => { results.push([name, !!ok]); log((ok ? 'PASS' : 'FAIL') + ' | ' + name + (extra !== undefined ? ' | ' + extra : '')); };
process.on('uncaughtException', (e) => { log('UNCAUGHT: ' + (e && e.message || e).toString().slice(0, 300)); process.exit(2); });

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
  if (t.includes('manifest.webmanifest')) { errs.push('[file-only-manifest]'); return; }
  errs.push('[console.error] ' + t.slice(0, 200));
});
const Eraw = (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const E = async (expr) => { try { return await Eraw(expr); } catch (e) { await sleep(3000); return await Eraw(expr); } };
const shot = async (n) => {
  try {
    await E('t.stepRender(1/60)');
    await Promise.race([page.screenshot({ path: `${SHOTS}/${n}.png` }), sleep(45000).then(() => { throw new Error('shot-timeout'); })]);
    log('shot ' + n + ' ok');
  } catch (e) { log('shot ' + n + ' FAILED: ' + e.message.slice(0, 100)); }
};

await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch (e) {} await sleep(2000); }
check('booted to title', (await E('t.simDbg().st')) === 'title');
await page.tap('#tapStart'); await sleep(1500);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(1000);
await E(`t.setFighter('kidblue')`); await sleep(300);
await E(`t.startMission('m1')`); await sleep(800);
try { await E('t.skipCine()'); } catch (e) {}
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'fight') break; } catch (e) {} await sleep(1000); }
check('mission m1 -> fight', (await E('t.simDbg().st')) === 'fight');
await E('t.unpause()'); await E('t.capHold(true)'); await E('t.healPlayer()'); await E('t.ff(10)');

const stageFoe = async () => {
  await E('t.clearFoes()');
  const px = await E('t.playerDbg().px');
  await E(`t.spawnFoeAt(${px + 0.65})`);
  await E('t.dbgFoePassive()');
  await E('t.setBusy(0)'); await E('t.healPlayer()'); await E('t.hsMaxClear()');
};
const punchOnce = async () => {
  const taps0 = await E('t.tapsDbg()'), hits0 = (await E('t.counterDbg()')).hits;
  await E('t.doPunch()');
  await sleep(400);
  const hs = await E('t.simDbg().hs');
  const hits1 = (await E('t.counterDbg()')).hits;
  return { taps0, hits0, hits1, hs, connected: hits1 === hits0 + 1 };
};

// ---- P15d: string jab->cross, predicted by atkIdx ----
await E('t.playClipOnPlayer("Melee_Unarmed_Idle")');
await E('t.ff(10)');
const expHs = (idx) => (idx % 3 === 2 ? 0.14 : [0.10, 0.12, 0.16][idx % 3]);
const res = [];
for (let k = 0; k < 2; k++) {
  const idx = await E('t.atkIdxDbg()');
  await stageFoe();
  const conn = await E('t.dbgStrike(2.7)');
  log(`punch ${k + 1}: atkIdx=${idx} predicted_hs=${expHs(idx).toFixed(2)} preverify=${conn ? 'HIT' : 'MISS'}`);
  const r = await punchOnce();
  res.push({ exp: expHs(idx), got: r.hs, ok: r.connected });
  await E('t.ff(20)');
}
check('string punches both connect', res.every(p => p.ok), res.map(p => p.ok).join(','));
check('string hitstops match ATK table', res.every(p => Math.abs(p.got - p.exp) <= 0.025),
  res.map(p => `exp ${p.exp.toFixed(2)} got ${p.got.toFixed(3)}`).join(' | '));
await shot('04-combat');

// ---- P15e: launcher finisher via real doFinisher ----
await stageFoe();
const finRes = await E('t.dbgFinisher()');
await sleep(200);
const finHs = await E('t.simDbg().hs');
const finVib = (await E('t.enemiesDbg()'))[0].vibT;
check('doFinisher LAUNCHER hitstop ~= 0.14s (was 0.08)', finRes === 'LAUNCHER' && Math.abs(finHs - 0.14) <= 0.02, 'hs=' + finHs.toFixed(3));
check('launcher vibrates defender', finVib > 0.05, 'vibT=' + (+finVib).toFixed(3));
await shot('05-launcher');

// ---- P15f: KO, popups, cash ----
const cash0 = await page.evaluate(() => (document.getElementById('cash') || {}).textContent || '');
await E('t.powTest("HEAVY", true)');
await sleep(600);
await E('t.ff(15)');
const pops = await page.evaluate(() => document.querySelectorAll('.pop').length);
const cash1 = await page.evaluate(() => (document.getElementById('cash') || {}).textContent || '');
const deadFoe = (await E('t.enemiesDbg()')).some(e => e.dead || e.hp <= 0);
check('enemy KO triggers', deadFoe);
check('KO popups render', pops > 0, 'pops=' + pops);
check('cash HUD updates on KO', cash0 !== cash1 && /[0-9]/.test(cash1), `"${cash0}" -> "${cash1.slice(0, 30)}"`);
await shot('06-ko');

// ---- defect sweep ----
const cs = await E('t.contactStats()');
check('no hurtbox interpenetration blowout', cs.maxPen < 0.6, 'maxPen=' + cs.maxPen);
const hudVis = await page.evaluate(() => { const el = document.getElementById('hud'); return el && getComputedStyle(el).display !== 'none'; });
check('HUD visible', !!hudVis);
check('state still fight', (await E('t.simDbg().st')) === 'fight');

const realErrs = errs.filter((e) => !e.startsWith('[file-only-manifest]'));
log('errors: ' + (errs.length ? errs.join(' // ') : 'none'));
check('zero page/console errors (excl. file://-only manifest)', realErrs.length === 0, realErrs.slice(0, 2).join(' // '));
try { await E('t.capHold(false)'); } catch (e) {}
const fails = results.filter((r) => !r[1]);
log(`\n${results.length - fails.length}/${results.length} checks passed`);
try { await browser.close(); } catch (e) { log('browser.close issue (non-fatal)'); }
process.exit(fails.length ? 1 : 0);

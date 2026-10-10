// P16 playtest: SoR4-style health rally on desperation.
// Verifies: (1) desperation banks 10% HP as rallyHp (green HUD segment),
// (2) landed hits convert rally -> real HP (~1/5 of pool per hit, ~5 hits to full),
// (3) incoming damage drains rally BEFORE real HP (lost-first-on-damage),
// (4) zeroing HP still KOs even with rally pending (bank cleared on death),
// (5) OBVIOUS-DEFECT checklist: no interpenetration, feet on ground, facing,
//     hits connect, no T-pose, HUD correct. Zero page/console errors.
// Deterministic: t.unpause() + t.capHold(true) + t.ff(n); wall-clock sleeps only
// for doPunch-style setTimeout delays and the KO missionComplete timeout.
import { createRequire } from 'module';
const require = createRequire('/tmp/p15qa/package.json');
const puppeteer = require('puppeteer-core');
import { mkdirSync, writeFileSync } from 'fs';

const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-p16-rally';
const URL = 'file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html';
mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra) => {
  results.push([name, !!ok]);
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name + (extra !== undefined ? ' | ' + extra : ''));
};

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
  if (t.includes('manifest.webmanifest')) return; // file://-only artifact
  errs.push('[console.error] ' + t.slice(0, 200));
});
const Eraw = (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const E = async (expr) => {
  try { return await Eraw(expr); } catch (e) { await sleep(3000); return await Eraw(expr); }
};
const shot = async (n) => { await E('t.stepRender(1/60)'); await page.screenshot({ path: `${SHOTS}/${n}.png` }); };

// ---- boot: title -> select -> mission ----
await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch (e) {} await sleep(2000); }
check('booted to title', (await E('t.simDbg().st')) === 'title');
await page.tap('#tapStart'); await sleep(1500);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(1000);
check('tapStart -> select', (await E('t.simDbg().st')) === 'select');
await E(`t.setFighter('kidblue')`); await sleep(300);
await E(`t.startMission('m1')`); await sleep(800);
try { await E('t.skipCine()'); } catch (e) {}
// dismiss SHRINE blessing overlay if it appeared (pauses the sim otherwise)
try { const b = await page.$('.blessCard'); if (b) { await b.click(); await sleep(500); } } catch (e) {}
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'fight') break; } catch (e) {} await sleep(1000); }
check('mission m1 -> fight', (await E('t.simDbg().st')) === 'fight');
await E('t.unpause()');
await E('t.capHold(true)');
await E('t.healPlayer()');
await E('t.ff(10)');

const rally = async () => E('t.rallyDbg()');
const doDesp = async () => { await E('t.setBusy(0)'); await E('t.doDesperation()'); await E('t.ff(5)'); };
const stageFoe = async () => {
  await E('t.clearFoes()');
  const px = await E('t.playerDbg().px');
  await E(`t.spawnFoeAt(${px + 0.65})`);
  await E('t.dbgFoePassive()');
  await E('t.setBusy(0)');
  await E('t.ff(5)');
};

// ---- P16a: desperation banks cost as rally ----
await E('t.clearFoes()'); // no foes: the blast must not rally its own cost
let r0 = await rally();
await doDesp();
let r1 = await rally();
check('desperation reduces real HP by 10%', r1.hp === Math.round(r0.hp * 0.9), `hp ${r0.hp} -> ${r1.hp}`);
check('desperation banks cost as rally', r1.rally === r0.hp - r1.hp && r1.rally > 0, `rally=${r1.rally}`);
check('blast hits do not rally own cost', r1.rally === r0.hp - r1.hp, `rally still ${r1.rally}`);
await shot('01-rally-banked'); // HUD: blue fill + green rally segment past it

// ---- P16b: landed hits convert rally -> HP (~1/5 of pool per hit) ----
await stageFoe();
let prev = await rally();
let landed = 0, guard = 0;
for (let i = 0; i < 14; i++) {
  const foeAlive = (await E('t.foeHp(0)')) > 0;
  if (!foeAlive) { await stageFoe(); }
  const before = await rally();
  await E(`t.dbgG3('clean')`); // one real 20-dmg jab via landHit
  await E('t.ff(3)');
  const after = await rally();
  landed++;
  const conv = before.hp < before.maxHp ? Math.min(before.rally, Math.max(1, Math.ceil(before.rally / 5))) : 0;
  if (before.rally > 0 && before.hp < before.maxHp) {
    check(`hit ${landed}: rally converts ~1/5 (rally ${before.rally}->${after.rally}, hp ${before.hp}->${after.hp})`,
      after.rally === before.rally - conv && after.hp === Math.min(before.maxHp, before.hp + conv),
      `conv=${conv}`);
    guard++;
    if (guard >= 3) break;
  }
  if (after.rally === 0) break;
}
// keep hitting until the bank is empty
for (let i = 0; i < 14; i++) {
  const cur = await rally();
  if (cur.rally === 0) break;
  if ((await E('t.foeHp(0)')) <= 0) { await stageFoe(); }
  await E(`t.dbgG3('clean')`);
  await E('t.ff(3)');
  if (i === 1) await shot('02-rally-mid'); // green segment shrunk, blue grown
}
const rFull = await rally();
check('rally fully recovered via attacking', rFull.rally === 0, `rally=${rFull.rally} hp=${rFull.hp}/${rFull.maxHp}`);
check('rallyRecovered counter > 0', rFull.recovered > 0, `recovered=${rFull.recovered}`);
const evts = await E('t.dbgEvents()');
check("'RALLY RECOVERED!' moment fired", evts.includes('rallyfull'), 'ev rallyfull present');
check('hp never exceeded maxHp', rFull.hp <= rFull.maxHp, `hp=${rFull.hp}`);
await shot('03-rally-full'); // HUD: all-blue bar, no green

// ---- P16c: incoming damage drains rally BEFORE real HP ----
await E('t.healPlayer()');
await E('t.clearFoes()');
await doDesp();
const b0 = await rally(); // hp=maxHp-cost, rally=cost
await E('t.dbgHurt(20)');
await E('t.ff(5)');
const b1 = await rally();
check('hit drains rally first', b1.rally === 0 && b1.hp === b0.hp - (20 - b0.rally),
  `rally ${b0.rally}->${b1.rally}, hp ${b0.hp}->${b1.hp} (20 dmg, ${b0.rally} absorbed)`);
check('rallyAbsorbed counter == banked cost', b1.absorbed === b0.rally, `absorbed=${b1.absorbed}`);
await shot('04-rally-drained'); // HUD: green gone, blue reduced by remainder only

// ---- P16d: zeroing HP KOs even with rally pending ----
await E('t.healPlayer()');
await doDesp();
await E('t.setHp(5)');
const k0 = await rally();
await E('t.dbgHurt(50)'); // 50 dmg: rally absorbs 10, hp 5-40 -> dead
await sleep(2200); // wall-clock: missionComplete(false) fires at +1400ms
const kd = await E('t.dbg()');
const k1 = await rally();
check('lethal hit with rally pending still KOs', kd.mo === true, `missionOver=${kd.mo} state=${kd.st}`);
check('rally cleared on death', k1.rally === 0, `rally=${k1.rally}`);
check('hp zeroed', k1.hp === 0, `hp=${k1.hp}`);
await shot('05-ko-screen'); // game-over screen renders

// ---- OBVIOUS-DEFECT checklist (automated part; eyes on shots for the rest) ----
await E('t.startMission(\'m1\')'); await sleep(800);
try { await E('t.skipCine()'); } catch (e) {}
try { const b = await page.$('.blessCard'); if (b) { await b.click(); await sleep(500); } } catch (e) {}
await E('t.unpause()'); await E('t.capHold(true)'); await E('t.healPlayer()');
await E('t.clearFoes()');
const ppx = await E('t.playerDbg().px');
await E(`t.spawnFoeAt(${ppx + 0.5})`); await E(`t.spawnFoeAt(${ppx - 0.5})`); // overlapping: body collision must separate
await E('t.dbgFoePassive()');
await E('t.ff(60)'); // let body collision + AI settle
const foes = await E('t.enemiesDbg()');
const pd = await E('t.playerDbg()');
let minDist = 1e9;
const pts = [{ px: pd.px, pz: 0 }, ...foes.map((f) => ({ px: f.px, pz: 0 }))];
for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++)
  minDist = Math.min(minDist, Math.hypot(pts[i].px - pts[j].px, (pts[i].pz || 0) - (pts[j].pz || 0)));
check('no interpenetration (bodies >= 0.85 apart)', minDist >= 0.85, `minDist=${minDist.toFixed(2)}`);
const pyd = await E('t.dbg()');
const ppy = pyd.py || 0;
check('player feet on ground (py >= 0)', ppy >= 0 && ppy < 2, `py=${ppy}`);
const foePy = await E('t.foePy(0)');
check('foe feet on ground', foePy !== null && foePy >= 0 && foePy < 2, `foePy=${foePy}`);
// facing follows real movement input (same handler path as players)
const px0 = pd.px;
await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })));
await E('t.ff(20)');
const f1 = await E('t.playerDbg()');
check('facing matches movement (right)', f1.face === 1 && f1.px > px0, `face=${f1.face} px ${px0} -> ${f1.px}`);
await page.evaluate(() => { document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); });
await E('t.ff(20)');
const f2 = await E('t.playerDbg()');
check('facing matches movement (left)', f2.face === -1 && f2.px < f1.px, `face=${f2.face} px ${f1.px} -> ${f2.px}`);
await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' })));
const fhp0 = await E('t.foeHp(0)');
await E(`t.dbgG3('clean')`);
const fhp1 = await E('t.foeHp(0)');
check('hits visibly connect (foe HP drops)', fhp1 < fhp0, `foe ${fhp0} -> ${fhp1}`);
await shot('06-fight-defects'); // eyes: no T-pose, HUD correct, bodies separated

// ---- error sweep ----
check('zero page/console errors', errs.length === 0, errs.length ? errs.slice(0, 5).join(' ;; ') : 'clean');
writeFileSync(SHOTS + '/results.json', JSON.stringify({ results, errors: errs }, null, 2));
const fails = results.filter((r) => !r[1]).length;
console.log(`\n${results.length - fails}/${results.length} checks passed`);
await browser.close();
process.exit(fails ? 1 : 0);

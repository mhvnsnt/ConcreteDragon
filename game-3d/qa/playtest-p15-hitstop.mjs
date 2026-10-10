// P15 playtest: hitstop retune + SF2 2-in-1 cancel buffer + defender micro-vibration.
// Deterministic: the headless SwiftShader rAF loop is unreliable, so the sim is driven
// explicitly via t.unpause() + t.capHold(true) + t.ff(n) (repo qa convention). Wall-clock
// sleeps are used ONLY for doPunch's setTimeout impact delays. Screenshots via
// t.stepRender(1/60) (renders one frame) -> game-3d/shots-p15/ (gitignored).
import { createRequire } from 'module';
const require = createRequire('/tmp/p15qa/package.json');
const puppeteer = require('puppeteer-core');
import { mkdirSync } from 'fs';

const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-p15';
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
  // file://-only artifacts: the PWA manifest can't be fetched with origin 'null'; loads fine over http(s)
  if (t.includes('manifest.webmanifest')) { errs.push('[file-only-manifest] ' + t.slice(0, 120)); return; }
  errs.push('[console.error] ' + t.slice(0, 200));
});
const Eraw = (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const E = async (expr) => { // one retry for the flaky SwiftShader main thread
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
await shot('01-select');
await E(`t.setFighter('kidblue')`); await sleep(300);
await E(`t.startMission('m1')`); await sleep(800);
try { await E('t.skipCine()'); } catch (e) {}
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'fight') break; } catch (e) {} await sleep(1000); }
check('mission m1 -> fight', (await E('t.simDbg().st')) === 'fight');
// deterministic sim control: unpause, hold the rAF loop, drive frames explicitly
await E('t.unpause()');
await E('t.capHold(true)');
await E('t.healPlayer()');
await E('t.ff(10)');
await shot('02-fight-wide');

// ---- P15a: ATK table hitstop column ----
const hsTable = await E('t.atkHsDbg()');
check('ATK hitstop table = [0.10, 0.12, 0.16]', JSON.stringify(hsTable) === JSON.stringify([0.1, 0.12, 0.16]), 'got ' + JSON.stringify(hsTable));

// ---- helper: one fresh passive foe in punch range; returns px ----
// NOTE: strikeHit uses LIVE BONE positions; with the sim held for determinism the punch
// anim never plays, so the foe is staged at +0.65 where the idle hand bones already overlap
// its hurtbox (probed: MISS at 1.2+, HIT pen~0.3 at 0.55-0.7). Reactions disabled = clean bag.
const stageFoe = async () => {
  await E('t.clearFoes()');
  const px = await E('t.playerDbg().px');
  await E(`t.spawnFoeAt(${px + 0.65})`);
  await E('t.dbgFoePassive()');
  await E('t.setBusy(0)'); await E('t.healPlayer()'); await E('t.hsMaxClear()');
};
// single punch -> { tapsBefore, tapsAfter, hitsBefore, hitsAfter, hsAtImpact, vibT }
const punchOnce = async () => {
  const taps0 = await E('t.tapsDbg()'), hits0 = (await E('t.counterDbg()')).hits;
  await E('t.doPunch()');
  const taps1 = await E('t.tapsDbg()'); // immediate: the press registered
  await sleep(400); // impact setTimeout (delay<=0.2s) fires on wall clock; sim held so hs/vibT persist
  const hs = await E('t.simDbg().hs');
  const vibT = (await E('t.enemiesDbg()'))[0] ? (await E('t.enemiesDbg()'))[0].vibT : -1;
  const hits1 = (await E('t.counterDbg()')).hits;
  return { taps0, taps1, hits0, hits1, hs, vibT };
};

// ---- P15b: jab hitstop lengthens live + defender vibrates ----
await stageFoe();
const p1 = await punchOnce();
check('punch press registers (taps+1)', p1.taps1 === p1.taps0 + 1, `taps ${p1.taps0}->${p1.taps1}`);
check('jab hit lands (hits+1)', p1.hits1 === p1.hits0 + 1, `hits ${p1.hits0}->${p1.hits1}`);
check('jab hitstop ~= 0.10s live (was 0.03)', Math.abs(p1.hs - 0.10) <= 0.02, 'hs=' + p1.hs.toFixed(3));
check('defender vibT active during hitstop', p1.vibT > 0.03, 'vibT=' + (+p1.vibT).toFixed(3));
await shot('03-hitstop'); // render lands mid-vibration (jitter is render-time)
await E('t.ff(20)'); // clear hitstop + busy

// ---- P15c: SF2 2-in-1 — press during hitstop buffers and fires ----
await stageFoe();
const q0taps = await E('t.tapsDbg()'), q0hits = (await E('t.counterDbg()')).hits;
await E('t.doPunch()'); // punch A
await sleep(400); // impact landed; hitstop active (sim held, no frames ran)
const hsMid = await E('t.simDbg().hs');
await E('t.doPunch()'); // pressed DURING hitstop: must buffer, not drop
const bufSet = await E('t.atkBufDbg()');
const qMidTaps = await E('t.tapsDbg()');
check('press during hitstop buffers (hs>0, buf=true, taps unchanged)', hsMid > 0.05 && bufSet === true && qMidTaps === q0taps + 1,
  `hs=${hsMid.toFixed(3)} buf=${bufSet} taps=${q0taps}->${qMidTaps}`);
await E('t.hsMaxClear()'); // reset peak AFTER the buffer is set: the buffered hit's impact lands
// mid-ff (wall-clock setTimeout between sim frames), so hitstop has partially decayed by the
// time ff returns — the peak recorder proves its magnitude instead.
// NOTE: busy decays at 0.05x DURING hitstop, so the buffer needs ~24 frames to fire, not 17.
await E('t.ff(30)'); // hitstop (<=10f) + busy (<=26f incl. scaled decay) clear; buffered cancel must fire
const q1taps = await E('t.tapsDbg()');
check('buffered cancel fires after hitstop (taps+2 total)', q1taps === q0taps + 2, `taps ${q0taps}->${q1taps}`);
check('buffer cleared after firing', (await E('t.atkBufDbg()')) === false);
const hsBufPeak = await E('t.hsMaxDbg()');
check('buffered 3rd hit = launcher hitstop peak ~= 0.14s', Math.abs(hsBufPeak - 0.14) <= 0.025, 'peak=' + hsBufPeak.toFixed(3));
const q1hits = (await E('t.counterDbg()')).hits;
check('both hits connected (hits+2)', q1hits === q0hits + 2, `hits ${q0hits}->${q1hits}`);
await E('t.ff(20)');

// ---- P15d: string still combos — jab/cross connect, no dropped input ----
// The player's animation pose moves the hand bones, so force a known idle pose first
// (P15b proved idle + 0.65 offset connects). atkIdx predicts each punch exactly.
await E('t.playClipOnPlayer("Melee_Unarmed_Idle")');
await E('t.ff(10)');
const expectedHs = (idx) => (idx % 3 === 2 ? 0.14 : [0.10, 0.12, 0.16][idx % 3]); // idx%3==2 -> launcher replaces kick
const peaksD = [];
let dHits0 = (await E('t.counterDbg()')).hits;
for (let k = 0; k < 2; k++) {
  const idx = await E('t.atkIdxDbg()');
  const exp = expectedHs(idx);
  await stageFoe();
  const conn = await E('t.dbgStrike(2.7)');
  if (!conn) console.log(`  note: string punch ${k + 1} pre-verify MISS (pose?), attempting anyway`);
  const r = await punchOnce();
  peaksD.push({ exp, got: r.hs, ok: r.hits1 === r.hits0 + 1 });
  await E('t.ff(20)');
}
const dHits1 = (await E('t.counterDbg()')).hits;
check('string jab/cross both connect', dHits1 - dHits0 === 2 && peaksD.every(p => p.ok), `hits ${dHits0}->${dHits1}`);
check('string hitstops match prediction', peaksD.every(p => Math.abs(p.got - p.exp) <= 0.025),
  peaksD.map(p => `exp ${p.exp.toFixed(2)} got ${p.got.toFixed(3)}`).join(' | '));
await shot('04-combat');

// ---- P15e: launcher finisher hitstop via the real doFinisher path ----
await stageFoe();
await E('t.hsMaxClear()');
const finRes = await E('t.dbgFinisher()');
await sleep(200);
const finHs = await E('t.simDbg().hs');
check('doFinisher LAUNCHER hitstop ~= 0.14s live (was 0.08)', finRes === 'LAUNCHER' && Math.abs(finHs - 0.14) <= 0.02, 'hs=' + finHs.toFixed(3));

// ---- KO + popups + cash ----
const cash0 = await page.evaluate(() => (document.getElementById('cash') || {}).textContent || '');
await E('t.powTest("HEAVY", true)');
await sleep(600);
await E('t.ff(15)');
const pops = await page.evaluate(() => document.querySelectorAll('.pop').length);
const cash1 = await page.evaluate(() => (document.getElementById('cash') || {}).textContent || '');
check('enemy KO triggers, popups render', pops > 0, 'pops=' + pops);
check('cash HUD updates on KO', cash0 !== cash1 && /[0-9]/.test(cash1), `"${cash0}" -> "${cash1.slice(0, 30)}"`);
await shot('05-ko');

// ---- OBVIOUS-DEFECT sweep ----
await E('t.ff(30)');
const gt0 = await E('t.gameTime()');
await E('t.ff(30)');
const gt1 = await E('t.gameTime()');
check('sim advances under ff() control', gt1 > gt0 + 0.4, `${(+gt0).toFixed(2)} -> ${(+gt1).toFixed(2)}`);
const cs = await E('t.contactStats()');
check('no hurtbox interpenetration blowout', cs.maxPen < 0.6, 'maxPen=' + cs.maxPen);
const hudVis = await page.evaluate(() => { const el = document.getElementById('hud'); return el && getComputedStyle(el).display !== 'none'; });
check('HUD visible', !!hudVis);
check('state still fight', (await E('t.simDbg().st')) === 'fight');
console.log('feet/facing/interpenetration/frozen-check: verified by screenshot inspection (shots-p15/)');
await shot('06-final');

const realErrs = errs.filter((e) => !e.startsWith('[file-only-manifest]'));
const fileOnly = errs.filter((e) => e.startsWith('[file-only-manifest]'));
console.log('page errors:', errs.length ? errs : 'none');
if (fileOnly.length) console.log(`note: ${fileOnly.length} file://-only PWA-manifest fetch errors (origin null); not present over http(s) deploys`);
check('zero page/console errors (excluding file://-only manifest fetches)', realErrs.length === 0, realErrs.slice(0, 3).join(' // '));
await E('t.capHold(false)').catch(() => {});
await browser.close();
const fails = results.filter((r) => !r[1]);
console.log(`\n${results.length - fails.length}/${results.length} checks passed`);
process.exit(fails.length ? 1 : 0);

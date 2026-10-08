// Headless playtest: S5 COUNTER SFX tranche (TIER 3 item 12, owner 2026-10-07, wave 12).
// Verifies: boot, counter.mp3 decodes to an AudioBuffer, a NORMAL hit does NOT fire the
// counter SFX (T.counterSfx stays 0, T.counters stays 0), a real counter resolution
// (foe staged mid-windup in range, neutral stick, doPunch) fires the dedicated counter
// crack/chime (T.counterSfx >= 1, T.counters >= 1). Zero page/console errors required.
// Screenshots -> game-3d/shots-countersfx/
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-countersfx';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
async function waitIdle() {
  for (let i = 0; i < 60; i++) {
    const p = await E('t.playerDbg()');
    if (p && p.busy <= 0 && p.hp > 0) return true;
    await sleep(500);
  }
  return false;
}

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);
await page.screenshot({ path: SHOTS + '/1-boot.png' });

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('2. m1 mission started', (await E('t.info()')).px === 2);
await page.screenshot({ path: SHOTS + '/2-m1-start.png' });

// 3. NORMAL hit must NOT fire the counter SFX: fresh foe in 'walk' (no windup), punch at close range
await E('t.clearFoes()'); await sleep(200);
await E('t.healPlayer()'); await E('t.counterClear()');
await E(`t.spawnFam('thug')`); await sleep(800);
let foe = (await E('t.foes()'))[0] || null;
must('3. foe spawned', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(150);
  foe = (await E('t.foes()'))[0] || null;
  must('3a. foe not winding up (normal hit conditions)', foe && foe.wu === 0);
  must('3b idle before punch', await waitIdle());
  await E('t.doPunch()'); await sleep(2000); // swing + real-time resolution
  let cd = await E('t.counterDbg()');
  console.log('   normal-hit counterDbg:', JSON.stringify(cd));
  must('3c. normal hit landed (T.hits >= 1)', cd.hits >= 1);
  must('3d. normal hit did NOT count as counter (T.counters == 0)', cd.counters === 0);
  must('3e. normal hit did NOT fire counter SFX (T.counterSfx == 0)', cd.counterSfx === 0);
  await page.screenshot({ path: SHOTS + '/3-normal-hit.png' });
}

// 4. Real COUNTER: stage foe mid-windup in counter range, neutral stick, doPunch
await E('t.healPlayer()'); await E('t.counterClear()');
foe = (await E('t.foes()'))[0] || null;
if (!foe || foe.hp <= 0) { await E(`t.spawnFam('thug')`); await sleep(800); }
const staged = await E('t.forceCounterWindup()');
must('4. foe staged mid-windup in counter range', staged === true);
foe = (await E('t.foes()'))[0] || null;
console.log('   staged foe:', JSON.stringify(foe));
must('4a. staged foe windup > 0', foe && foe.wu > 0);
must('4b idle before counter punch', await waitIdle());
await E('t.doPunch()'); await sleep(700);
await page.screenshot({ path: SHOTS + '/4-counter-popup.png' }); // catch the COUNTER! popup
await sleep(1500);
const cd2 = await E('t.counterDbg()');
console.log('   counter counterDbg:', JSON.stringify(cd2));
must('4c. counter resolution counted (T.counters >= 1)', cd2.counters >= 1);
must('4d. counter SFX fired (T.counterSfx >= 1)', cd2.counterSfx >= 1);
await page.screenshot({ path: SHOTS + '/5-counter-after.png' });

// 5. counter.mp3 decoded to a real AudioBuffer
const ad = await E(`t.audioDbg(['counter'])`);
console.log('   audioDbg:', JSON.stringify(ad));
must('5. counter.mp3 decoded to AudioBuffer', Array.isArray(ad) && ad.length === 1 && ad[0].ok);

// 6. zero errors
console.log('   errors:', errors.length ? JSON.stringify(errors) : 'none');
must('6. zero page/console errors', errors.length === 0);

console.log(allOk ? 'RESULT: ALL PASS' : 'RESULT: FAILURES PRESENT');
await browser.close();
process.exit(allOk ? 0 : 1);

// Headless playtest: F8 EDGE-BOUNCE tranche (TIER 2 item 7, owner 2026-10-07, wave 9).
// Verifies: boot, mission start, launcher gives horizontal knock velocity, wall bounce fires
// with reflected velocity (back into juggle range), enemy stays in-bounds and airborne.
// Zero page/console errors required. Screenshots -> game-3d/shots-edgebounce/
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-edgebounce';
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

// 3. Deterministic bounce drill via edgeBounceTest hook
let foe = null;
for (let i = 0; i < 24; i++) { const f = await E('t.foes()'); if (f.length) { foe = f[0]; break; } await sleep(500); }
must('3a. enemy present for bounce drill', !!foe);
if (foe) {
  const eb = await E('t.edgeBounceTest()');
  console.log('   edgeBounceTest:', JSON.stringify(eb));
  must('3b. edgeBounceTest hook ran', eb.ok === 1);
  must('3c. wall bounce fired', eb.ok === 1 && eb.bounced === true);
  must('3d. velocity reflected back into arena (+x)', eb.ok === 1 && eb.bounced && eb.kvx > 0);
  must('3e. enemy clamped in-bounds after bounce', eb.ok === 1 && eb.bounced && eb.px >= 0.5);
  must('3f. still airborne (juggle stays alive)', eb.ok === 1 && eb.bounced && eb.stillAirborne === true);
}

// 4. Live visual: launch a foe toward the left wall in real time and catch the bounce FX
let liveOk = false, evBounce = false;
for (let i = 0; i < 24; i++) { const f = await E('t.foes()'); if (f.length) { foe = f[0]; break; } await sleep(500); }
if (foe) {
  const setup = await E('t.launchFoeAt(3.0, 0, -12, 0.5)');
  if (setup.ok === 1) {
    await sleep(260); // ~2.5 units at 12 u/s = hits the wall right about here
    await page.screenshot({ path: SHOTS + '/3-edge-bounce-live.png' });
    const evs = await E('t.dbgEvents()');
    evBounce = evs.includes('edgebounce');
    const st = await E('t.foeAir()');
    console.log('   live bounce:', JSON.stringify(st));
    liveOk = evBounce && st && st.px >= 0.5;
    await page.screenshot({ path: SHOTS + '/3b-after-bounce.png' });
  }
}
must('4a. live launch-toward-wall scenario ran', liveOk);
must('4b. edgebounce event fired in live play', evBounce);

// 5. Launcher wiring intact: DUST LAUNCHER (doHeavy -> landHit launcher) still pops foes airborne
//    with horizontal knock velocity. Poll fast: a launch only lasts ~0.58s of airtime.
let launchOk = false, launchState = null;
for (let i = 0; i < 24; i++) { const f = await E('t.foes()'); if (f.length) { foe = f[0]; break; } await sleep(500); }
if (foe) {
  await E(`t.tp2(${foe.px - 1.5}, ${foe.pz})`); await sleep(200);
  await E('t.setStick(0, 1)'); // hold DOWN: HVY becomes DUST LAUNCHER (universal launcher)
  await E('t.doHeavy()'); // hit lands at +200ms via setTimeout
  for (let i = 0; i < 25 && !launchOk; i++) {
    await sleep(60);
    launchState = await E('t.foeAir()');
    if (launchState && launchState.air && Math.abs(launchState.kvx || 0) > 1) launchOk = true;
  }
  await E('t.setStick(0, 0)');
  console.log('   launch state:', JSON.stringify(launchState));
  await page.screenshot({ path: SHOTS + '/4-launcher-kvx.png' });
}
must('5. launcher sets horizontal knock velocity', launchOk);

must('6. zero console/page errors', errors.length === 0);
if (errors.length) console.log('   errors:', JSON.stringify(errors.slice(0, 8), null, 1));
console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

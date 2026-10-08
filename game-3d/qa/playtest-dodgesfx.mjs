// Headless playtest: S3 DODGE SFX tranche (TIER 2 item 5 dodge SFX, owner 2026-10-07).
// Verifies: boot, mission start, dodge fires SFX hook + i-frames, near-miss bonus still works.
// Zero page/console errors required. Screenshots -> game-3d/shots-dodgesfx/
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-dodgesfx';
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

// 3. Dodge mechanic: deterministic via dodgeTest hook
let foe = null;
for (let i = 0; i < 24; i++) { const f = await E('t.foes()'); if (f.length) { foe = f[0]; break; } await sleep(500); }
must('3a. enemy present for dodge drill', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.4}, ${foe.pz})`); await sleep(300);
  const dt = await E('t.dodgeTest()');
  console.log('   dodgeTest:', JSON.stringify(dt));
  must('3b. dodge fires SFX hook', dt.ok === 1 && dt.sfxFired === true);
  must('3c. dodge grants i-frames', dt.ok === 1 && dt.iFrames === true);
  // screenshot mid-dodge: dodge again and capture the dust-kick VFX inside the 0.35s i-frame window
  await E('t.dbgDodgeFresh ? t.dbgDodgeFresh() : 0').catch(() => {});
  await E(`t.doDodge()`); await sleep(120);
  await page.screenshot({ path: SHOTS + '/3-dodge-iframes.png' });
}

// 4. Near-miss bonus still works: dodge through an enemy attack, expect 'nearmiss' event
let nearMissOk = false;
for (let i = 0; i < 24; i++) { const f = await E('t.foes()'); if (f.length) { foe = f[0]; break; } await sleep(500); }
if (foe) {
  await E(`t.tp2(${foe.px - 1.0}, ${foe.pz})`); await sleep(200);
  const ev0 = (await E('t.dbgEvents()')).length;
  for (let t = 0; t < 14 && !nearMissOk; t++) {
    // force the foe into an attack, dodge right as it should land
    await E(`t.forceFoeSigBy ? t.forceFoeSigBy('${foe.famId || 'thug'}') : 0`).catch(() => {});
    await E('t.doDodge()'); await sleep(700);
    const evs = await E('t.dbgEvents()');
    if (evs.slice(ev0).includes('nearmiss')) nearMissOk = true;
    else { await E('t.healPlayer()'); await sleep(400); }
  }
  if (nearMissOk) await page.screenshot({ path: SHOTS + '/4-nearmiss.png' });
}
must('4. near-miss bonus fires on i-frame dodge', nearMissOk);

must('5. zero console/page errors', errors.length === 0);
if (errors.length) console.log('   errors:', JSON.stringify(errors.slice(0, 8), null, 1));
console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

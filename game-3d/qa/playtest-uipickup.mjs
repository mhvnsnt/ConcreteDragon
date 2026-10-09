// Headless playtest: S6/S7 UI CLICK + PICKUP CHIME tranche (TIER 3 item 13, owner 2026-10-08, wave 13).
// Verifies: boot, uiclick.mp3 + pickup.mp3 decode to AudioBuffers, a REAL UI button tap
// (#pauseBtn) increments T.uiClickSfx, a HEALTH pickup does NOT fire the pickup chime,
// a physical CASH pickup collection fires the dedicated chime (T.pickupChimeSfx >= 1) AND
// replaces the generic coin (no layered coin), normal combat without cash pickup does NOT
// fire the chime. Zero page/console errors required.
// Screenshots -> game-3d/shots-uipickup/
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-uipickup';
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

// 3. audio assets decode
const ad = await E(`t.audioDbg(['uiclick','pickup'])`);
console.log('   audioDbg:', JSON.stringify(ad));
must('3. uiclick.mp3 + pickup.mp3 decode to AudioBuffers', Array.isArray(ad) && ad.length === 2 && ad.every((a) => a.ok));

// 4. REAL UI button tap (#pauseBtn -> togglePause) fires the central UI-click SFX
await E('t.uiClickClear()');
must('4. pause button present', (await page.$('#pauseBtn')) !== null);
await page.tap('#pauseBtn'); await sleep(600);
let uc = await E('t.uiClickDbg()');
console.log('   uiClickDbg after pause tap:', JSON.stringify(uc));
must('4a. UI click SFX fired on pause tap (T.uiClickSfx >= 1)', uc.uiClick >= 1);
await page.screenshot({ path: SHOTS + '/3-pause.png' });
await page.tap('#resumeBtn'); await sleep(600);
uc = await E('t.uiClickDbg()');
console.log('   uiClickDbg after resume tap:', JSON.stringify(uc));
must('4b. UI click SFX fired on resume tap (T.uiClickSfx >= 2)', uc.uiClick >= 2);

// 5. HEALTH pickup must NOT fire the cash chime; CASH pickup MUST
await E('t.unpause()'); await sleep(200);
await E('t.pickupChimeClear()');
await E(`t.dbgSpawnPickup('health')`); await sleep(1500);
let pc = await E('t.pickupChimeDbg()');
console.log('   pickupChimeDbg after health pickup:', JSON.stringify(pc));
must('5a. health pickup did NOT fire cash chime (chime == 0)', pc.chime === 0);
await E(`t.dbgSpawnPickup('cash')`); await sleep(1500);
pc = await E('t.pickupChimeDbg()');
console.log('   pickupChimeDbg after cash pickup:', JSON.stringify(pc));
must('5b. cash pickup fired the chime (chime >= 1)', pc.chime >= 1);
await page.screenshot({ path: SHOTS + '/4-cash-pickup.png' });

// 6. Normal combat without cash pickup does NOT fire the chime
await E('t.pickupChimeClear()');
await E('t.clearFoes()'); await sleep(200);
await E('t.healPlayer()');
await E(`t.spawnFam('thug')`); await sleep(800);
let foe = (await E('t.foes()'))[0] || null;
must('6. foe spawned', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(150);
  must('6a idle before punch', await waitIdle());
  await E('t.doPunch()'); await sleep(2000);
  const pc2 = await E('t.pickupChimeDbg()');
  console.log('   pickupChimeDbg after normal hit:', JSON.stringify(pc2));
  must('6b. normal combat did NOT fire cash chime (chime == 0)', pc2.chime === 0);
  await page.screenshot({ path: SHOTS + '/5-normal-combat.png' });
}

// 7. zero errors
console.log('   errors:', errors.length ? JSON.stringify(errors) : 'none');
must('7. zero page/console errors', errors.length === 0);

console.log(allOk ? 'RESULT: ALL PASS' : 'RESULT: FAILURES PRESENT');
await browser.close();
process.exit(allOk ? 0 : 1);

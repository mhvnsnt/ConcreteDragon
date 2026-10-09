// Headless playtest: S15 MIXING tranche (TIER 3 item 15, owner 2026-10-08, wave 15).
// Verifies: boot, music/crowd AudioBuffers decode, music rides a dedicated musicGain bus at
// full level (1.0), SFX ride a dedicated sfxGain bus (T.sfxCount fires), light punches do NOT
// duck music, real doHeavy / real ↓+HVY dust launcher / KO DO duck the music bus (level dips
// to ~0.4 / ~0.35) and it ramps back to full (~1.0) within ~1s, zero page/console errors.
// Screenshots -> game-3d/shots-mixing/
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-mixing';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
// screenshots are evidence, not assertions: retry once, never crash the run on CDP flakiness
async function shot(path) {
  for (let i = 0; i < 2; i++) {
    try { await page.screenshot({ path }); return; }
    catch (e) { console.log('   shot retry ' + path.split('/').pop() + ': ' + String(e.message).slice(0, 80)); await sleep(1000); }
  }
}
// headless game-time is slow: wait until the player is actionable before each attack
async function waitIdle() {
  for (let i = 0; i < 60; i++) {
    const p = await E('t.playerDbg()');
    if (p && p.busy <= 0 && p.hp > 0) return true;
    await sleep(500);
  }
  return false;
}
// poll the music bus level for up to 2.5s and return the lowest observed value
async function minLevelOver(ms) {
  let min = 1;
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const l = await E('t.musicBusLevel()');
    if (l < min) min = l;
    await sleep(100);
  }
  return +min.toFixed(3);
}

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);
await shot(SHOTS + '/1-boot.png');

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('2. m1 mission started', (await E('t.info()')).px === 2);
await shot(SHOTS + '/2-m1-start.png');

// 3. music/crowd decode to AudioBuffers; music bus exists at full level (1.0)
const ad = await E(`t.audioDbg(['music','crowd'])`);
console.log('   audioDbg:', JSON.stringify(ad));
must('3a. music+crowd decoded to AudioBuffers', Array.isArray(ad) && ad.length === 2 && ad.every(x => x.ok));
const lvl0 = await E('t.musicBusLevel()');
console.log('   musicBusLevel at start:', lvl0);
must('3b. music bus present at full level (1.0)', lvl0 === 1);

// 4. Light punches on a passive foe: SFX fire (sfx bus alive) but music does NOT duck
await E('t.clearFoes()'); await sleep(200);
await E(`t.spawnFam('thug')`); await sleep(800);
await E('t.dbgFoePassive()');
let foe = (await E('t.foes()'))[0] || null;
must('4a. spawned foe present for drill', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.healPlayer()'); await E('t.mixClear()');
  must('4 idle before punches', await waitIdle());
  await E('t.doPunch()'); await sleep(1500);
  await E('t.doPunch()'); await sleep(1500);
  const md = await E('t.mixDbg()');
  console.log('   after light punches:', JSON.stringify(md));
  must('4b. SFX fired on light punches (sfx bus alive)', md.sfx >= 2);
  must('4c. light punches do NOT duck the music bus', md.ducks === 0 && md.level === 1);
}

// 5. Real doHeavy connecting: music bus dips (~0.4) then recovers to full
foe = (await E('t.foes()'))[0] || null;
if (foe) {
  if (foe.hp <= 0) { await E('t.clearFoes()'); await sleep(200); await E(`t.spawnFam('thug')`); await sleep(800); foe = (await E('t.foes()'))[0]; }
  await E('t.dbgFoePassive()');
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.healPlayer()'); await E('t.mixClear()');
  must('5 idle before heavy', await waitIdle());
  await E('t.doHeavy()');
  const min5 = await minLevelOver(2500);
  console.log('   heavy min level:', min5);
  must('5a. real heavy ducks the music bus (min level <= 0.5)', min5 <= 0.5);
  must('5b. heavy dip never mutes (min level >= 0.3)', min5 >= 0.3);
  await shot(SHOTS + '/3-heavy-duck.png');
  await sleep(1400);
  const rec5 = await E('t.musicBusLevel()');
  const md5 = await E('t.mixDbg()');
  console.log('   heavy recovered level:', rec5, JSON.stringify(md5));
  must('5c. music bus ramps back to full after heavy (level >= 0.9)', rec5 >= 0.9);
  must('5d. SFX still fired around the heavy', md5.sfx >= 1);
}

// 6. Real DUST LAUNCHER (stick down + HVY): launcher ducks the music bus
foe = (await E('t.foes()'))[0] || null;
if (foe) {
  if (foe.hp <= 0) { await E('t.clearFoes()'); await sleep(200); await E(`t.spawnFam('thug')`); await sleep(800); foe = (await E('t.foes()'))[0]; }
  await E('t.dbgFoePassive()');
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.healPlayer()'); await E('t.mixClear()');
  must('6 idle before launcher', await waitIdle());
  await E('t.dbgStickDown(1)');
  await E('t.doHeavy()');
  const min6 = await minLevelOver(2500);
  await E('t.dbgStickDown(0)');
  console.log('   launcher min level:', min6);
  must('6a. real dust launcher ducks the music bus (min level <= 0.5)', min6 <= 0.5);
  must('6b. launcher dip never mutes (min level >= 0.3)', min6 >= 0.3);
  await shot(SHOTS + '/4-launcher-duck.png');
  await sleep(1400);
  const rec6 = await E('t.musicBusLevel()');
  console.log('   launcher recovered level:', rec6);
  must('6c. music bus ramps back to full after launcher (level >= 0.9)', rec6 >= 0.9);
}

// 7. KO: deeper duck (~0.35), still recovers, SFX still fire
await E('t.clearFoes()'); await sleep(200);
await E(`t.spawnFam('thug')`); await sleep(800);
await E('t.dbgFoePassive()');
foe = (await E('t.foes()'))[0] || null;
must('7a. spawned foe present for KO drill', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.healPlayer()'); await E('t.mixClear()');
  const kr = await E('t.forceKOHit()');
  console.log('   forceKOHit:', JSON.stringify(kr));
  must('7b. KO landed (foe dead)', kr.ok === 1 && kr.dead === true);
  const min7 = await minLevelOver(1500);
  console.log('   KO min level:', min7);
  must('7c. KO ducks the music bus (min level <= 0.45)', min7 <= 0.45);
  must('7d. KO dip never mutes (min level >= 0.3)', min7 >= 0.3);
  await shot(SHOTS + '/5-ko-duck.png');
  await sleep(1500);
  const md7 = await E('t.mixDbg()');
  console.log('   KO recovered:', JSON.stringify(md7));
  must('7e. music bus ramps back to full after KO (level >= 0.9)', md7.level >= 0.9);
  must('7f. SFX fired through the KO (sfx bus untouched)', md7.sfx >= 1);
  must('7g. duck counter fired on big hits', md7.ducks >= 1);
}

// 8. zero errors
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('8. zero page/console errors', errors.length === 0);

console.log(allOk ? 'MIXING-PLAYTEST: ALL PASS' : 'MIXING-PLAYTEST: FAILURES PRESENT');
await browser.close();
process.exit(allOk ? 0 : 1);

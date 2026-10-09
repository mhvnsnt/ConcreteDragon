// Headless playtest: Y8 DAILY SEEDED RUN tranche (TIER 5 item 21, owner 2026-10-06, wave 16).
// Verifies: (a) dailySeed() deterministic across fresh page loads for a fixed date,
// (b) two dailyBuild() calls from the same daily seed produce identical spawn tables +
//     identical street layout hashes, (c) a different date -> a different seed,
// DAILY RUN menu button + mission-intro date banner + gameplay screenshots,
// dailyBest record write + Records screen line. Zero page/console errors required.
// Screenshots -> game-3d/shots-dailyrun/
// NOTE: all screenshots happen BEFORE the heavy dailyBuild determinism section —
// rebuilding the 220-unit street 3x wedges the swiftshader compositor for screenshots.
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-dailyrun';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 240000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
async function waitTitle() {
  for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') return true; await sleep(2000); }
  return false;
}

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
must('1. boot: title screen ready', await waitTitle());
await page.screenshot({ path: SHOTS + '/1-title.png' });

// (a) dailySeed() deterministic across fresh page loads for a fixed date
const s1 = await E(`t.dailySeed('2026-10-09')`);
await page.reload({ waitUntil: 'networkidle0', timeout: 120000 });
must('2. reload: title screen ready again', await waitTitle());
const s2 = await E(`t.dailySeed('2026-10-09')`);
console.log('   dailySeed 2026-10-09: load1=' + s1 + ' load2=' + s2);
must('2a. dailySeed(fixed date) deterministic across fresh page loads', s1 === 20261009 && s2 === 20261009);
const s3 = await E(`t.dailySeed('2026-10-10')`);
console.log('   dailySeed 2026-10-10: ' + s3);
must('2b. different date -> different seed', s3 === 20261010 && s3 !== s1);

// 3. mission menu: unlock m1, show the DAILY RUN button
await E(`t.dbgUnlockMission('m1')`);
await E('t.showMission()'); await sleep(1500);
const menuTxt = await page.evaluate(() => document.getElementById('mission').textContent);
must('3a. mission menu shows the DAILY RUN button', /⚡ DAILY RUN/.test(menuTxt));
must('3b. mission menu shows the daily tag with seed + date', /DAILY SEED 20\d{6}/.test(menuTxt));
// the mission list scrolls horizontally; the daily card is in the last zone (SIDE HUSTLES)
await page.evaluate(() => { const ml = document.getElementById('mList'); if (ml) ml.scrollLeft = ml.scrollWidth; });
await sleep(1000);
await page.screenshot({ path: SHOTS + '/2-dailyrun-menu.png' });

// 4. start the daily mission: verify wiring, catch the intro date banner
await E(`t.startMission('daily')`);
// headless game-time runs slow: poll the letterbox caption until the date cap appears
let sawDateCap = false;
for (let i = 0; i < 40; i++) {
  const cap = await page.evaluate(() => document.getElementById('cineCap').textContent || '');
  if (/SEED/.test(cap)) { sawDateCap = true; break; }
  await sleep(1000);
}
must('4. intro card shows the DAILY RUN date caption', sawDateCap);
await page.screenshot({ path: SHOTS + '/3-intro-date.png' });
const md = await E('t.missionDbg()');
console.log('   missionDbg:', JSON.stringify(md));
must('4a. daily mission: len 220 circuit', md && md.len === 220);
must('4b. daily mission: district = today rotation', md && md.district === (await E('t.dailyDistrict()')));
must('4c. daily mission: stamped with start date + seed', md && md.daily && /^\d{4}-\d{2}-\d{2}$/.test(md.dailyDate) && md.dailySeed === (await E('t.dailySeed()')));
must('4d. daily mission: spawn queue covers the circuit', md && md.nSpawns > 5);

// 5. gameplay: skip intro, walk into the block, screenshot mid-run
await E('t.skipCine()'); await sleep(1000);
for (let i = 0; i < 20; i++) { if ((await E('t.simDbg().st')) === 'fight') break; await sleep(1000); }
must('5a. fight state reached', (await E('t.simDbg().st')) === 'fight');
await E('t.tp(14)'); await sleep(2500);
await page.screenshot({ path: SHOTS + '/4-gameplay.png' });

// 6. dailyBest record: complete the mission, check the record + Records screen
await E('t.missionComplete(true)'); await sleep(2500); // results screen after 1400ms timeout
const sv = await E('t.saveDbg()');
console.log('   saveDbg:', JSON.stringify(sv.dailyBest));
must('6a. dailyBest written for today (YYYY-MM-DD)', sv.dailyBest && /^\d{4}-\d{2}-\d{2}$/.test(sv.dailyBest.date) && typeof sv.dailyBest.score === 'number' && typeof sv.dailyBest.cash === 'number');
await E('t.showMission()'); await sleep(800);
await page.evaluate(() => document.getElementById('boardBtn').click()); await sleep(600);
const boardTxt = await page.evaluate(() => document.getElementById('boardOv').textContent);
must('6b. Records screen shows DAILY BEST line', /DAILY BEST/.test(boardTxt));
await page.screenshot({ path: SHOTS + '/5-records.png' });

// 7. determinism builds on a fresh page (heavy — no screenshots after this point)
await page.reload({ waitUntil: 'networkidle0', timeout: 120000 });
must('7. reload: title ready for determinism builds', await waitTitle());
console.log('   building daily street (1/2)...');
const b1 = await E(`t.dailyBuild('2026-10-09')`);
console.log('   building daily street (2/2)...');
const b2 = await E(`t.dailyBuild('2026-10-09')`);
console.log('   build1: district=' + b1.district + ' seed=' + b1.seed + ' spawns=' + b1.spawns.length + ' hashLen=' + b1.hash.length);
must('7a. same-seed builds: identical district', b1.district === b2.district);
must('7b. same-seed builds: identical spawn tables (deep-equal)', JSON.stringify(b1.spawns) === JSON.stringify(b2.spawns));
must('7c. same-seed builds: identical street layout hash', b1.hash === b2.hash && b1.hash.length > 1000);
must('7d. spawn table covers the 220-unit circuit', b1.spawns.length > 5 && b1.spawns[b1.spawns.length - 1].at > 150);
const st = await E(`t.dailySpawnTable('2026-10-09')`);
must('7e. dailySpawnTable matches dailyBuild spawns', JSON.stringify(st) === JSON.stringify(b1.spawns));
console.log('   building daily street for a different date...');
const b3 = await E(`t.dailyBuild('2026-10-12')`);
must('7f. different date -> different seed + different layout hash', b3.seed !== b1.seed && b3.hash !== b1.hash);
console.log('   district rotation: 10-09=' + b1.district + ' 10-10=' + (await E(`t.dailyDistrict('2026-10-10')`)) + ' 10-11=' + (await E(`t.dailyDistrict('2026-10-11')`)) + ' 10-12=' + b3.district);

// 8. zero errors
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('8. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

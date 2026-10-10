// Headless playtest: Y11 ACHIEVEMENTS tranche (docs/IMPROVE_LOOP_BACKLOG.md P5, TIER 5).
// Drives every achievement path through the REAL game code (landHit/killEnemy/
// destroyDestructible/missionComplete/director tier-up) via __cdtest hooks —
// no direct unlockAch() calls. Screenshots -> game-3d/shots-y11/, eyes-on verified.
// Zero page/console errors required.
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const WT = '/home/hatch/workspace/ConcreteDragon-wt-y11/game-3d';
const SHOTS = WT + '/shots-y11';
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
const achIds = async () => (await E('t.achDbg()')).unlocked;
const has = async (id) => (await achIds()).includes(id);
async function waitTitle() { for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') return true; await sleep(2000); } return false; }
async function waitFight() { for (let i = 0; i < 40; i++) { if ((await E('t.simDbg().st')) === 'fight') return true; await sleep(1000); } return false; }
async function waitResults() { for (let i = 0; i < 20; i++) { if (await page.evaluate(() => !document.getElementById('results').classList.contains('hidden'))) return true; await sleep(1000); } return false; }
async function dismissBlessings() { // like a player: pick the first blessing card
  for (let i = 0; i < 10; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('.blessCard').length);
    if (!n) return true;
    await page.evaluate(() => document.querySelector('.blessCard').click());
    await sleep(800);
  }
  return false;
}
async function startFight(id) {
  await E(`t.startMission('${id}')`);
  await E('t.skipCine()');
  return waitFight();
}

await page.goto('file://' + WT + '/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
must('1. boot: title ready', await waitTitle());
await E('t.unpause()'); // headless safety: make sure the sim loop is not paused

// ---- A. ko1 (first KO) + toast screenshot ----
// spawn+kill in ONE evaluate: atomic, the rAF loop can't interleave between them
must('2. m1 fight state', await startFight('m1'));
const koHp = await E('(t.spawnFoeAt(6), t.hitFoe(t.foes().length - 1, 99999))');
console.log('   foe hp after kill hit:', koHp);
// read the toast BEFORE the (slow) screenshot — it shows for 4s
const toastTxt = await page.evaluate(() => document.getElementById('achBanner').textContent);
const toastShown = await page.evaluate(() => document.getElementById('achBanner').classList.contains('show'));
must('3. ko1 unlocked via real killEnemy', await has('ko1'));
must('3a. unlock toast shows ACHIEVEMENT banner text', /ACHIEVEMENT/.test(toastTxt));
must('3b. toast banner is actually visible (show class, top-level overlay)', toastShown);
await page.screenshot({ path: SHOTS + '/1-ko1-toast.png' });
await sleep(1500); // let the corpse clear from the enemies list

// ---- B. juggle (hit a launched foe mid-air) ----
// both hits in ONE evaluate: launcher sets airborne at the end of landHit,
// the follow-up hit sees it — atomic, no rAF interleave
await E('(t.spawnFoeAt(6), t.hitFoe(t.foes().length - 1, 5, true), t.hitFoe(t.foes().length - 1, 5))');
await sleep(400);
const airCheck = await E('t.foes().length > 0 ? 1 : 0');
must('4. foe present for juggle', airCheck === 1);
must('4a. juggle unlocked via real landHit airborne branch', await has('juggle'));
await page.screenshot({ path: SHOTS + '/2-juggle-toast.png' });

// ---- C. combo50 (50-hit combo on a sturdy boss dummy) ----
{
  const nm = await E(`t.spawnBossT('kingpin')`);
  must('5. test boss spawned', nm === 'KINGPIN');
  const ok = await page.evaluate(() => {
    const t = window.__cdtest;
    const fs = t.foes(); const bi = fs.findIndex((f) => f.name === 'KINGPIN');
    if (bi < 0) return false;
    for (let k = 0; k < 400 && !t.achDbg().unlocked.includes('combo50'); k++) t.hitFoe(bi, 0);
    return t.achDbg().unlocked.includes('combo50');
  });
  must('5a. combo50 unlocked via 50 real landHit calls', ok);
  await E('t.hitFoe(0, 99999)'); // clean up a foe (does not affect combo50)
}
await page.screenshot({ path: SHOTS + '/3-combo50-toast.png' });

// ---- D. bowling (thrown foe plows into another) ----
must('6. endless fight state', await startFight('endless'));
await E('t.spawnFoeAt(6)'); // spawn the pair directly: the endless director only
await E('t.spawnFoeAt(7.0)'); // spawns on the rAF loop, which headless throttles
await E('t.ff(30)'); // (pair starts inside the 1.3px contact radius — first tick connects)
const nF = (await E('t.foes()')).length;
must('6a. 2 foes present via real spawnEnemy', nF >= 2);
{
  const idx = await page.evaluate(() => {
    const t = window.__cdtest; const fs = t.foes();
    let bi = 0; for (let i = 1; i < fs.length; i++) if (fs[i].px < fs[bi].px) bi = i;
    t.throwFoeT(bi); return bi;
  });
  console.log('   threw foe index', idx);
  for (let i = 0; i < 12 && !(await has('bowling')); i++) { await E('t.ff(30)'); await sleep(300); }
  must('6b. bowling unlocked via real thrown-body contact code', await has('bowling'));
}
await page.screenshot({ path: SHOTS + '/4-bowling.png' });

// ---- E. smash25 (25 breakables, one run) ----
must('7. daily fight state', await startFight('daily'));
const nProps = await E('t.props().length');
console.log('   destructibles in daily:', nProps);
must('7a. >=25 destructibles available', nProps >= 25);
await E('t.tp(210)'); // stand clear of TNT chains
await page.evaluate(() => { const t = window.__cdtest; const n = t.props().length; for (let i = 0; i < n; i++) t.smash(i); });
await sleep(1200); // TNT chain timeouts (wall-clock)
await E('t.healPlayer()'); // TNT chains hurt — stay alive for the rest of the run
const smashed = await E('t.smashedT()');
console.log('   smashed this run:', smashed);
must('7b. smash25 unlocked via real destroyDestructible', smashed >= 25 && await has('smash25'));
await page.screenshot({ path: SHOTS + '/5-smash25.png' });

// ---- F. wave10 (endless tier 10 = wave 10) ----
must('8. endless fight state (2)', await startFight('endless'));
await E('t.setDistT(305)');
await E('t.ff(150)');
must('8a. wave10 unlocked via real director tier-up', await has('wave10'));
const muts = await E('t.muts()');
console.log('   endless tier:', JSON.stringify(muts));
must('8b. endless tier reached 10', muts.tier >= 10);
await page.screenshot({ path: SHOTS + '/6-wave10.png' });

// ---- G. all 9 bosses -> KING OF THE BLOCK ----
const BOSS_IDS = ['kingpin', 'sledge', 'viper', 'rust', 'dragon', 'pumpkinking', 'carmilla', 'foreman', 'warden'];
for (const bid of BOSS_IDS) {
  const nm = await E(`t.spawnBossT('${bid}')`);
  const idx = await page.evaluate((n) => { const t = window.__cdtest; return t.foes().findIndex((f) => f.name === n); }, nm);
  if (idx < 0) { must('9. boss ' + bid + ' spawned+found', false); continue; }
  await E(`t.hitFoe(${idx}, 999999)`);
  await sleep(350);
}
const ab = await E('t.achDbg()');
console.log('   bosses defeated:', JSON.stringify(ab.bosses));
must('9a. all 9 static bosses recorded', BOSS_IDS.every((id) => ab.bosses.includes(id)));
must('9b. bosses (KING OF THE BLOCK) unlocked', await has('bosses'));
await page.screenshot({ path: SHOTS + '/7-bosses-toast.png' });
// farm 100 real KOs inside this same endless run (real spawnEnemy + killEnemy paths)
let farmed = (await E('t.info()')).kills;
for (let c = 0; c < 25 && farmed < 100; c++) {
  await page.evaluate(() => { const t = window.__cdtest; for (let k = 0; k < 8; k++) t.spawnFoeAt(6 + k * 1.6); t.healPlayer(); });
  await E('t.ff(90)');
  await E('t.killAll()');
  await E('t.healPlayer()');
  farmed = (await E('t.info()')).kills;
}
console.log('   run kills farmed:', farmed);
must('9c. 100+ real KOs in the run', farmed >= 100);
await E('t.missionComplete(true)'); // endless win banks lifetimeKills -> ko100
must('9d. endless results screen', await waitResults());
must('9e. blessings dismissed like a player', await dismissBlessings());
must('9f. ko100 via real lifetimeKills tally', await has('ko100'));
console.log('   lifetimeKills:', (await E('t.achDbg()')).lifetimeKills);
await E('t.showMission()'); await sleep(800);

// ---- H. m1..m6 clears + flawless + cash10k ----
const prev = { m1: 'm1', m2: 'm1', m3: 'm2', m4: 'm3', m5: 'm4', m6: 'm5' };
for (const id of ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']) {
  await E(`t.dbgUnlockMission('${prev[id]}')`);
  must('10. ' + id + ' fight', await startFight(id));
  if (id === 'm1') { await E('t.addCashRunT(30000)'); } // cash10k via real missionComplete accumulation
  await E('t.missionComplete(true)');
  must('10a. ' + id + ' results screen', await waitResults());
  must('10b. blessings dismissed like a player', await dismissBlessings());
  must('10c. ' + id + ' clear achievement', await has(id));
  await E('t.showMission()'); await sleep(800);
}
must('11. flawless (no-damage clear) via real dmgTaken stat', await has('flawless'));
must('12. cash10k via real lifetimeCash tally', await has('cash10k'));
console.log('   lifetimeCash:', (await E('t.achDbg()')).lifetimeCash);

// ---- I. daily (ko100 already banked in the endless run above) ----
must('13. daily fight', await startFight('daily'));
await E('t.missionComplete(true)');
must('13a. daily results', await waitResults());
must('13b. blessings dismissed like a player', await dismissBlessings());
must('14. daily (DAILY GRIND) via real daily win', await has('daily'));
await E('t.showMission()'); await sleep(800);

// ---- J. Records screen shows the achievement list ----
await E('t.showMission()'); await sleep(800);
await page.evaluate(() => document.getElementById('boardBtn').click()); await sleep(600);
await page.screenshot({ path: SHOTS + '/8-records.png' });
const boardTxt = await page.evaluate(() => document.getElementById('boardOv').textContent);
must('16. Records shows ACHIEVEMENTS section', /ACHIEVEMENTS \(1[0-9]\/17\)/.test(boardTxt));
must('16a. Records lists unlocked DRAW FIRST BLOOD', /DRAW FIRST BLOOD/.test(boardTxt));
const finalAch = await achIds();
console.log('   unlocked (' + finalAch.length + '/17):', JSON.stringify(finalAch));

// ---- K. persistence: reload keeps achievements ----
await page.reload({ waitUntil: 'networkidle0', timeout: 120000 });
must('17. reload: title ready', await waitTitle());
const after = await achIds();
must('17a. achievements persist in localStorage', after.length === finalAch.length && finalAch.every((id) => after.includes(id)));

// ---- zero errors ----
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('18. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

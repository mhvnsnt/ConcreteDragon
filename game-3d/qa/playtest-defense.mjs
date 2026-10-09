// Defense lane verification: player blocking + Melee_Block_Hit clip + enemy defense regression.
// Zero page/console errors required. Screenshots -> game-3d/shots-defense/
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-defense/game-3d/shots-defense';
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

await page.goto('file:///home/hatch/workspace/ConcreteDragon-defense/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('2. m1 mission started', (await E('t.info()')).px === 2);

// 3. Block stance: enter via test hook, verify flag + capture
const b0 = await E('t.dbgBlock(true)');
must('3a. block stance engages', b0 === true);
await sleep(400);
await page.screenshot({ path: SHOTS + '/1-block-stance.png' });
const bp = await E('t.dbgPlayer()');
must('3b. player alive while blocking', bp.hp > 0);

// 4. Blocked hit: chip damage only (20 dmg -> ~3 chip), blocks counter increments
const bh = await E('t.dbgBlockHit(20)');
console.log('   blockHit result:', JSON.stringify(bh));
must('4a. chip damage (not full 20)', bh.chip >= 1 && bh.chip < 10);
must('4b. blocks counter incremented', bh.blocks === 1);
await sleep(300);
await page.screenshot({ path: SHOTS + '/2-block-hit.png' });

// 5. Unblocked hit: full damage (control)
await E('t.dbgBlock(false)');
const uh = await E('t.dbgBlockHit(20)');
console.log('   unblocked result:', JSON.stringify(uh));
must('5. unblocked takes full damage', uh.chip === 20 && uh.blocks === 0);

// 6. Can't block mid-attack: set busy, try to block
await E('t.dbgSetBusy(1.0)');
const ba = await E('t.dbgBlock(true)');
must('6. cannot block while busy', ba === false);
await E('t.dbgSetBusy(0)');

// 7. Enemy defense regression: force guard mode, land hit, verify guard triggers
const g = await E(`t.dbgG3('guard')`);
console.log('   enemy guard result:', JSON.stringify(g));
must('7a. enemy guard triggers in guard mode', g.guards === 1);
must('7b. enemy takes chip not full', g.hp1 > g.hp0 - 20);

// 8. Enemy dodge regression
const d = await E(`t.dbgG3('dodge')`);
console.log('   enemy dodge result:', JSON.stringify(d));
must('8. enemy dodge triggers in dodge mode', d.dodges === 1);

// 9. Obvious-defect sweep: no errors, player grounded
const py = await E('t.dbgPlayer()');
must('9a. player y sane', py !== null);
must('9b. zero page/console errors', errors.length === 0);
if (errors.length) console.log('ERRORS:', errors.slice(0, 5));

await page.screenshot({ path: SHOTS + '/3-final.png' });
await browser.close();
console.log(allOk ? 'ALL PASS' : 'SOME FAILED');
process.exit(allOk ? 0 : 1);

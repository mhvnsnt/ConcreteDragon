// Headless playtest: m6 FACTORY FLOOR (A5 district 3 industrial tranche).
// Verifies: boot, mission start, combat hits, destructible smash + cash pickup, boss spawn.
// Zero page/console errors required. Screenshots -> game-3d/shots-industrial/
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-industrial';
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

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
await sleep(3000);
check('1. boot: title screen ready', (await E('t.simDbg().st')) === 'title');
await page.screenshot({ path: SHOTS + '/1-boot.png' });

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m6')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
const info0 = await E('t.info()');
const layout = await E('t.layoutInfo()');
check('2. m6 FACTORY FLOOR started (industrial district)', info0.px === 2 && layout.destruct > 0 && layout.colliders > 20);
console.log('   layout:', JSON.stringify(layout));
await page.screenshot({ path: SHOTS + '/2-m6-start.png' });

let foe = null;
for (let i = 0; i < 24; i++) { const f = await E('t.foes()'); if (f.length) { foe = f[0]; break; } await sleep(500); }
let combatOk = false;
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  const hpBefore = (await E('t.foes()'))[0].hp;
  await E('t.doPunch()'); await sleep(800);
  await E('t.doPunch()'); await sleep(800);
  const after = await E('t.foes()');
  const hpAfter = after.length ? after[0].hp : hpBefore;
  combatOk = hpAfter < hpBefore;
  console.log('   foe "' + foe.name + '" hp', hpBefore, '->', hpAfter);
}
check('3. combat hits deal damage', combatOk);
await page.screenshot({ path: SHOTS + '/3-combat.png' });

await E('t.clearFoes()'); await E('t.healPlayer()'); await sleep(300);
const evBefore = (await E('t.dbgEvents()')).length;
const nDestr = await E('t.layoutInfo().destruct');
const smashed = [];
for (const i of [nDestr - 1, nDestr - 2, nDestr - 3]) { await E(`t.smash(${i})`); await sleep(300); }
const evs = await E('t.dbgEvents()');
for (let k = evBefore; k < evs.length; k++) smashed.push(evs[k]);
check('4. destructibles smashed (' + smashed.join(', ') + ')', smashed.length >= 3);
await sleep(400);
await page.screenshot({ path: SHOTS + '/4-smash.png' });

const spawned = await E('t.pickupDbg()');
console.log('   pickups spawned:', spawned.length);
const cashBefore = await E('t.info().cash');
for (const pk of spawned) { await E(`t.tp2(${pk.px}, ${pk.pz})`); await sleep(450); }
// second pass for stragglers (magnet can drag pickups off their snapshot spots)
for (const pk of (await E('t.pickupDbg()'))) { await E(`t.tp2(${pk.px}, ${pk.pz})`); await sleep(450); }
await sleep(800);
const cashAfter = await E('t.info().cash');
const remaining = await E('t.pickupDbg()');
console.log('   cashRun', cashBefore, '->', cashAfter, '| pickups remaining:', remaining.length);
check('5. cash pickup collected', cashAfter > cashBefore);
await page.screenshot({ path: SHOTS + '/5-pickup.png' });

await E('t.tp2(14, 0)'); await sleep(200);
await E(`t.spawnBoss('foreman')`); await sleep(1800);
const bossHp = await E('t.info().boss');
const bossDef = await E(`t.dbgBoss('foreman')`);
console.log('   boss def:', JSON.stringify(bossDef), '| live hp:', bossHp);
check('6. THE FOREMAN boss spawned and alive', bossHp > 0 && bossDef && bossDef.name === 'THE FOREMAN');
await E('t.tp2(17, 0)'); await sleep(600);
await page.screenshot({ path: SHOTS + '/6-boss.png' });

console.log('CONSOLE/PAGE ERRORS:', errors.length);
[...new Set(errors)].slice(0, 12).forEach((e) => console.log('  ' + e));
await browser.close();
process.exit(errors.length ? 2 : 0);

// Focused test: throw, breakables, turkey (faster than full playtest)
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 60000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 480, height: 270 });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 150)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 150)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };

await page.goto('file:///home/hatch/workspace/ConcreteDragon-weapons-items/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 60000 });
for (let i = 0; i < 8; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`); await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E('t.ff(1)');

// THROW: equip bat, spawn thug at distance, GRP (no stagger) -> throw
await E(`t.spawnPickupAt('wpn_bat', 0)`); await E('t.ff(40)'); await sleep(300);
must('T1. bat equipped', (await E('t.playerDbg().weapon.type')) === 'bat');
await E('t.clearFoes()'); await sleep(200);
await E(`t.spawnFam('thug')`); await sleep(400);
await E('t.tp(t.enemiesDbg()[0].px - 6)'); await E('t.ff(10)'); await sleep(200);
const thp0 = await E('t.enemiesDbg()[0].hp');
await E('t.doGrapple()'); await sleep(1500);
const thp1 = await E('t.enemiesDbg()[0].hp');
const disarmed = await E('!t.playerDbg().weapon');
console.log(`   throw: enemy hp ${thp0} -> ${thp1}, disarmed: ${disarmed}`);
must('T2. thrown bat damages distant enemy', thp1 < thp0);
must('T3. weapon leaves hand on throw', disarmed === true);
must('T4. no missing clips', (await E('t.missingClip || null')) === null);

// BREAKABLES: spawn barrel + phonebooth, verify, smash
await E(`t.spawnPropAt('barrel', 2)`); await E(`t.spawnPropAt('phonebooth', 4)`); await sleep(400);
const dd = await E('t.destructDbg().filter(d => d.name === "OIL DRUM" || d.name === "PHONE BOOTH").length');
must('B1. barrel + phonebooth spawn', dd === 2);
const pk0 = await E('t.pickupDbg().length');
await E('t.smashNearestDestruct()'); await sleep(800);
const pk1 = await E('t.pickupDbg().length');
const types = await E('t.pickupDbg().map(p => p.type).join(",")');
console.log(`   spill: ${pk0} -> ${pk1} pickups: ${types}`);
must('B2. smash spills pickups', pk1 > pk0);
must('B3. spill includes weapon', /wpn_/.test(types));

// TURKEY: hurt player, eat turkey
await E('t.setHp(20)'); await sleep(200);
await E(`t.spawnPickupAt('turkey', 0)`); await E('t.ff(40)'); await sleep(400);
const php = await E('t.playerDbg().hp');
const pmax = await E('t.playerDbg().maxHp');
console.log(`   turkey: hp 20 -> ${php} (max ${pmax})`);
must('F1. turkey heals 75%', php >= pmax * 0.7);

console.log('errors:', errors.length ? errors.slice(0, 3) : 'none');
must('E1. zero page errors', errors.length === 0);
console.log(allOk ? 'FOCUSED TESTS ALL PASS' : 'SOME FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

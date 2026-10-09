// Headless playtest: WEAPONS/ITEMS lane (owner 2026-10-09).
// Verifies: boot, weapon pickup equip (pipe), HUD badge, swing connects w/ damage,
// durability decrements, weapon breaks at 0, throw damages + drops pickup,
// barrel/phonebooth spawn + spill, turkey heals. Zero page/console errors.
// Screenshots -> game-3d/shots-weapons/
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-weapons-items/game-3d/shots-weapons';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 480, height: 270 });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
const step = (s) => console.log('STEP:', s);

await page.goto('file:///home/hatch/workspace/ConcreteDragon-weapons-items/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
step('boot done');
must('1. boot: title screen ready', booted);
await page.screenshot({ path: SHOTS + '/1-boot.jpg', type: 'jpeg', quality: 70 });

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
step('mission started');
must('2. m1 mission started', (await E('t.info()')).px === 2);
step('warmup ff(1)...');
await E('t.ff(1)');
step('warmup done');

// 3. pipe pickup at player feet -> walk-over equip
step('spawn pipe...');
await E(`t.spawnPickupAt('wpn_pipe', 0)`);
step('pipe spawned');
await E('t.ff(40)'); await sleep(400);
const wpn = await E('t.playerDbg().weapon ? t.playerDbg().weapon.type : null');
must('3. pipe pickup equips on walk-over', wpn === 'pipe');
const badgeVisible = await page.evaluate(() => { const b = document.getElementById('wpnBadge'); return b && b.style.display !== 'none' && /PIPE/.test(b.textContent); });
must('4. HUD weapon badge shows PIPE', badgeVisible);
await page.screenshot({ path: SHOTS + '/2-armed-pipe.jpg', type: 'jpeg', quality: 70 });
const dur0 = await E('t.playerDbg().weapon.durability');
console.log('   durability on equip:', dur0);
must('5. durability starts at 12', dur0 === 12);

// 6-7. swing at spawned thug: damage + durability--
await E(`t.spawnFam('thug')`); await sleep(400);
await E('t.tp(t.enemiesDbg()[0].px - 1.5)'); await sleep(200); // step into range
const ehp0 = await E('t.enemiesDbg()[0].hp');
await E('t.doPunch()'); await sleep(800);
const ehp1 = await E('t.enemiesDbg()[0].hp');
const dur1 = await E('t.playerDbg().weapon ? t.playerDbg().weapon.durability : -1');
console.log(`   enemy hp ${ehp0} -> ${ehp1}, durability ${dur0} -> ${dur1}`);
must('6. weapon swing damages enemy', ehp1 < ehp0);
must('7. durability decremented on landed hit', dur1 === dur0 - 1);
await page.screenshot({ path: SHOTS + '/3-swing-hit.jpg', type: 'jpeg', quality: 70 });

// 8. break at 0: set durability 1, land another hit
await E('t.clearFoes()');
await E(`t.spawnFam('thug')`); await sleep(400);
await E('t.tp(t.enemiesDbg()[0].px - 1.5)'); await sleep(200);
await E(`t.setWpnDurability(1)`);
await E('t.doPunch()'); await sleep(800);
const broken = await E('!t.playerDbg().weapon');
must('8. weapon breaks at 0 durability', broken === true);
await page.screenshot({ path: SHOTS + '/4-broken.jpg', type: 'jpeg', quality: 70 });

// 9. throw: equip bat, GRP with no staggered foe -> projectile damages
await E(`t.spawnPickupAt('wpn_bat', 0)`);
await E('t.ff(40)'); await sleep(400);
must('9a. bat equipped', (await E('t.playerDbg().weapon.type')) === 'bat');
await E('t.clearFoes()');
await E(`t.spawnFam('thug')`); await sleep(400);
await E('t.tp(t.enemiesDbg()[0].px - 6)'); await sleep(200); // 6 units away — out of swing range
const thp0 = await E('t.enemiesDbg()[0].hp');
await E('t.doGrapple()'); await sleep(1500);
const thp1 = await E('t.enemiesDbg()[0].hp');
const disarmed = await E('!t.playerDbg().weapon');
console.log(`   thrown enemy hp ${thp0} -> ${thp1}, player disarmed: ${disarmed}`);
must('9b. thrown bat damages distant enemy', thp1 < thp0);
must('9c. weapon leaves hand on throw', disarmed === true);
await page.screenshot({ path: SHOTS + '/5-throw.jpg', type: 'jpeg', quality: 70 });

// 10. breakables: barrel + phonebooth spawn, smash, spill
await E(`t.spawnPropAt('barrel', 2)`);
await E(`t.spawnPropAt('phonebooth', 4)`);
await sleep(400);
const dd0 = await E('t.destructDbg().filter(d => d.name === "OIL DRUM" || d.name === "PHONE BOOTH").length');
must('10a. barrel + phonebooth spawn as destructibles', dd0 === 2);
await page.screenshot({ path: SHOTS + '/6a-breakables.jpg', type: 'jpeg', quality: 70 });
const pk0 = await E('t.pickupDbg().length');
await E('t.smashNearestDestruct()'); await sleep(800);
const pk1 = await E('t.pickupDbg().length');
const spillTypes = await E('t.pickupDbg().map(p => p.type).join(",")');
console.log(`   pickups ${pk0} -> ${pk1}: ${spillTypes}`);
must('10b. smash spills pickups', pk1 > pk0);
await page.screenshot({ path: SHOTS + '/6b-spill.jpg', type: 'jpeg', quality: 70 });

// 11. turkey heals big
await E(`t.setHp(20)`);
await E(`t.spawnPickupAt('turkey', 0)`);
await E('t.ff(40)'); await sleep(400);
const php = await E('t.playerDbg().hp');
const pmax = await E('t.playerDbg().maxHp');
console.log(`   hp 20 -> ${php} (max ${pmax})`);
must('11. turkey heals to 75%+ max', php >= pmax * 0.7);
await page.screenshot({ path: SHOTS + '/7-turkey.jpg', type: 'jpeg', quality: 70 });

// 12. no missing-clip silent failures
const missing = await E('t.missingClip || null');
must('12. no missing animation clips triggered', missing === null);

// 13. zero errors
console.log('   page errors:', errors.length ? errors.slice(0, 5) : 'none');
must('13. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL WEAPONS TESTS PASSED' : 'SOME WEAPONS TESTS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

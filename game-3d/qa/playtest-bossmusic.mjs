// Boss music lane verification: per-boss track switching, zero console errors.
// Drives the REAL trigger paths: spawnBoss -> musicBoss, dbgKillBoss -> killEnemy -> musicStage.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
console.log('boot:', booted ? 'PASS' : 'FAIL');
if (!booted) { await browser.close(); process.exit(1); }
await page.tap('#tapStart'); await sleep(900);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(500);
const bless = await page.$('.blessCard'); if (bless) { await bless.click(); await sleep(400); }
try { await E(`t.setFighter('kidblue')`); } catch (e) {}
await E(`t.startMission('m1')`); await sleep(600);
try { await E('t.skipCine()'); } catch (e) {}
await sleep(1500);
const bless2 = await page.$('.blessCard'); if (bless2) { await bless2.click(); await sleep(400); }
// hard gate: mission must be in fight state with a live player before spawning
let ready = false;
for (let i = 0; i < 10; i++) {
  const s = await E(`({ st: t.simDbg().st, p: !!t.playerDbg() })`);
  if (s.st === 'fight' && s.p) { ready = true; break; }
  await sleep(1500);
}
console.log('mission ready:', ready ? 'PASS' : 'FAIL');
if (!ready) { await browser.close(); process.exit(1); }

const results = [];
const check = (name, cond, extra='') => { results.push([cond ? 'PASS' : 'FAIL', name, extra]); };

// 1. stage loop on mission start, all 10 boss buffers decoded
let m = await E('t.musicDbg()');
check('stage loop playing on mission start', m.key === 'music', JSON.stringify(m));
check('all 10 boss tracks decoded', m.decoded === 10, 'decoded=' + m.decoded);

// 2. every static boss -> its own track -> back to stage on kill
const bosses = ['kingpin','sledge','viper','rust','dragon','pumpkinking','carmilla','foreman','warden'];
for (const b of bosses) {
  await E(`t.clearFoes()`);
  await E(`t.spawnBoss('${b}')`); await sleep(700);
  m = await E('t.musicDbg()');
  check(`spawn ${b} -> boss-${b}`, m.key === 'boss-' + b && m.playing, JSON.stringify(m));
  const killed = await E('t.dbgKillBoss()'); await sleep(700);
  m = await E('t.musicDbg()');
  check(`kill ${b} -> stage loop`, m.key === 'music' && m.playing, 'killed=' + killed);
  await E(`t.clearFoes()`);
}

// 3. proc/endless boss -> boss-endless fallback
await E(`t.spawnBoss('pb7')`); await sleep(700);
m = await E('t.musicDbg()');
check('proc boss pb7 -> boss-endless', m.key === 'boss-endless' && m.playing, JSON.stringify(m));
await E('t.dbgKillBoss()'); await sleep(700);
m = await E('t.musicDbg()');
check('kill proc boss -> stage loop', m.key === 'music', JSON.stringify(m));

console.log('\n--- results ---');
let fails = 0;
for (const [s, n, x] of results) { if (s === 'FAIL') fails++; console.log(s, n, x); }
console.log(`\n${results.length - fails}/${results.length} checks passed`);
console.log('console errors:', errors.length ? errors : 'none (0)');
await browser.close();
process.exit(fails || errors.length ? 1 : 0);

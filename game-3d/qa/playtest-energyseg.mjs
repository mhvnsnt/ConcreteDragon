// Headless playtest: TIER 2 item 9 SEGMENTED ENERGY BAR (wave 18, owner 2026-10-09).
// Verifies: boot, m1 start, ENERGY meter renders as 10 segment cells (.spcSeg), lit count
// tracks player.energy (0/30/65/100 -> 0/3/7/10 lit), #spcWrap.ready toggles at 60+,
// zero page/console errors. Screenshots -> game-3d/shots-energyseg/
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-wave18/game-3d/shots-energyseg';
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

await page.goto('file:///home/hatch/workspace/ConcreteDragon-wave18/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
// dismiss SHRINE blessing overlay like a player would (it pauses the sim)
try { const c = await page.$('.blessCard'); if (c) { await c.click(); await sleep(400); } } catch (e) {}
must('2. m1 mission started', (await E('t.info()')).px === 2);

// energy-bar segment checks: [energy, expected lit]
const cases = [[0, 0], [30, 3], [65, 7], [100, 10], [45, 5]];
let idx = 3;
for (const [en, want] of cases) {
  await E(`t.setEnergy(${en})`); await sleep(400);
  const segs = await E(`Array.from(document.querySelectorAll('.spcSeg')).length`);
  const lit = await E(`Array.from(document.querySelectorAll('.spcSeg.lit')).length`);
  const wrapReady = await E(`document.getElementById('spcWrap').classList.contains('ready')`);
  const btnReady = await E(`document.getElementById('btnSpc').classList.contains('ready')`);
  const counter = await E('t.energySegDbg()');
  console.log(`   energy=${en}: segs=${segs} lit=${lit} wrapReady=${wrapReady} btnReady=${btnReady} counter=${counter}`);
  must(`${idx}. energy ${en} -> ${want} lit segments (got ${lit})`, segs === 10 && lit === want && counter === want);
  must(`${idx}b. ready classes ${en >= 60 ? 'ON' : 'OFF'} at ${en}`, (wrapReady === (en >= 60)) && (btnReady === (en >= 60)));
  // HUD crop: energy bar lives top-right
  await page.screenshot({ path: `${SHOTS}/energy-${en}.png`, clip: { x: 520, y: 40, width: 324, height: 60 } });
  idx++;
}

await page.screenshot({ path: SHOTS + '/hud-full.png' });
must('8. zero page/console errors', errors.length === 0);
if (errors.length) console.log('ERRORS:', errors.slice(0, 10));
console.log(allOk ? 'ALL CHECKS PASS' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

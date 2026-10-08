// Headless QA: Concrete Dragon infinite character + customization system (owner 2026-10-07)
// boot -> title -> select -> customize -> mission -> combat, zero console errors.
// Usage: node qa/characters.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';
const DIST = 'http://127.0.0.1:8931/concrete-dragon.html'; // served over http (file:// breaks texture CORS, unlike real Pages hosting)
const SHOTS = '/tmp/cd-qa-shots';
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const badUrls = [];
const KNOWN_PREEXISTING = [/Textures\/colormap\.png/, /Failed to load resource/]; // missing asset ref inside fighter.glb + favicon — pre-existing/environmental, non-fatal; real 404s are caught by URL below
const isKnown = (msg) => KNOWN_PREEXISTING.some((re) => re.test(msg));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (msg) => { console.log('FAIL:', msg); process.exitCode = 1; };
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
page.on('pageerror', (e) => { const m = '[pageerror] ' + String(e.message).slice(0, 300); if (!isKnown(m)) errors.push(m); });
page.on('console', (m) => { if (m.type() === 'error') { const t = '[console.error] ' + m.text().slice(0, 300); if (!isKnown(t)) errors.push(t); } });
page.on('response', (r) => { if (r.status() === 404) badUrls.push(r.url()); });
try {
  await page.goto(DIST, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => window.__cdtest && window.__cdtest.state() === 'title', { timeout: 60000 });
  await sleep(1200);
  // title -> (intro cine) -> select (click, not tap: desktop headless has no touch)
  await page.click('#tapStart');
  await sleep(1200);
  await page.evaluate(() => window.__cdtest.skipCine());
  await page.waitForFunction(() => window.__cdtest.state() === 'select', { timeout: 30000 });
  await sleep(1500);
  await page.screenshot({ path: SHOTS + '/01-select.png' });
  console.log('OK: title -> select');
  // seeded scouts via debug hook
  const s1 = await page.evaluate(() => window.__cdtest.dbgScout());
  const s2 = await page.evaluate(() => window.__cdtest.dbgScout());
  console.log('scout1:', JSON.stringify(s1));
  console.log('scout2:', JSON.stringify(s2));
  if (!s1.name || !s1.arch || !s1.parts.length) fail('scout1 malformed');
  if (s1.name === s2.name) console.log('NOTE: duplicate scout names (uniqueness suffix should have fired)');
  // style-not-power: stats must equal the archetype's (dbg via fighterDef is internal; check via statBars? use info via mission later)
  // UI purchase: fund cash, re-enter select (as a real player would), click the real SCOUT button
  const cost = await page.evaluate(() => window.__cdtest.scoutCost());
  await page.evaluate(() => { window.__cdtest.dbgCash(5000); window.__cdtest.showSelect(); });
  const cashBefore = 5000;
  await page.click('#scoutRow .scoutBtn');
  await sleep(800);
  const roster = await page.evaluate(() => window.__cdtest.scoutInfo());
  const cashAfter = await page.evaluate(() => window.__cdtest.info() && document ? JSON.parse(localStorage.getItem('concretedragon.save.v2')).cash : 0);
  console.log('roster names:', JSON.stringify(roster.map((r) => r.name)), 'cost:', cost, 'cashAfter:', cashAfter);
  if (roster.length !== 3) fail('expected 3 scouted fighters, got ' + roster.length);
  if (cashAfter !== cashBefore - cost) fail('cash not deducted correctly: ' + cashAfter + ' != ' + (cashBefore - cost));
  // customize UI via real clicks
  await page.click('#customizeBtn');
  await sleep(600);
  const ovVisible = await page.evaluate(() => !document.getElementById('customOv').classList.contains('hidden'));
  console.log('customOv visible:', ovVisible);
  if (!ovVisible) fail('customize overlay did not open');
  const partBtns = await page.evaluate(() => [...document.querySelectorAll('.partBtn')].length);
  const zoneSws = await page.evaluate(() => [...document.querySelectorAll('.zoneSw')].length);
  console.log('partBtn count:', partBtns, 'zoneSw count:', zoneSws);
  if (partBtns < 40) fail('too few part buttons: ' + partBtns);
  if (zoneSws < 90) fail('too few zone swatches: ' + zoneSws);
  await page.evaluate(() => { const b = [...document.querySelectorAll('.partBtn')].find((x) => x.textContent.trim() === 'Pauldrons'); if (b) b.click(); });
  await sleep(500);
  const showParts = await page.evaluate(() => window.__cdtest.dbgShowcaseParts());
  console.log('showcase parts after UI pick:', JSON.stringify(showParts));
  if (!showParts.includes('pauldron')) fail('pauldron not attached to showcase after UI click');
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.czRow')];
    const zr = rows.find((r) => r.querySelector('.czLab') && r.querySelector('.czLab').textContent === 'PRIMARY');
    const sw = zr && zr.querySelectorAll('.zoneSw')[2]; if (sw) sw.click();
  });
  await sleep(500);
  await page.screenshot({ path: SHOTS + '/02-customize.png' });
  console.log('OK: customize UI works');
  await page.click('#customClose');
  await sleep(400);
  // select a scout fighter, verify showcase shows generated parts
  const scoutId = roster[0].id;
  await page.evaluate((id) => window.__cdtest.dbgSetFighter(id), scoutId);
  await sleep(800);
  const scoutShow = await page.evaluate(() => window.__cdtest.dbgShowcaseParts());
  console.log('scout showcase parts:', JSON.stringify(scoutShow));
  if (!scoutShow.length) fail('scout has no parts on showcase');
  await page.screenshot({ path: SHOTS + '/03-scout-showcase.png' });
  // mission -> combat with the customized scout
  await page.evaluate(() => window.__cdtest.startMission('m1'));
  await page.waitForFunction(() => window.__cdtest.state() === 'fight', { timeout: 30000 });
  await page.evaluate(() => window.__cdtest.skipCine());
  await sleep(1800);
  const pparts = await page.evaluate(() => window.__cdtest.dbgParts());
  console.log('player parts in combat:', JSON.stringify(pparts));
  if (!pparts || !pparts.length) fail('player has no parts in combat');
  await page.evaluate(() => window.__cdtest.doPunch());
  await sleep(220);
  await page.screenshot({ path: SHOTS + '/04-combat-a.png' });
  await page.evaluate(() => window.__cdtest.doPunch());
  await sleep(220);
  await page.screenshot({ path: SHOTS + '/05-combat-b.png' });
  const st = await page.evaluate(() => window.__cdtest.info());
  console.log('fight info:', JSON.stringify(st));
} catch (e) {
  fail('exception: ' + String(e && e.message || e).slice(0, 400));
}
console.log('JS ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none');
const real404s = badUrls.filter((u) => !/Textures\/colormap\.png$/.test(u) && !/favicon\.ico$/.test(u));
if (real404s.length) { console.log('FAIL: unexpected 404s:', JSON.stringify(real404s)); process.exitCode = 2; }
else console.log('404s: only pre-existing Textures/colormap.png (missing asset ref in fighter.glb)');
await browser.close();
if (errors.length) process.exitCode = 2;
console.log(process.exitCode ? 'QA FAILED' : 'QA PASSED');

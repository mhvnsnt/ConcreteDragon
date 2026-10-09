// QA: throws-air lane — 4-beat throw, air kick, taunt. Captures frames for eye verification.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const D = '/tmp/qa-throwsair-' + Date.now();
fs.mkdirSync(D, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
await page.goto('file:///home/hatch/workspace/ConcreteDragon-throws-air/game-3d/dist/concrete-dragon.html', { waitUntil: 'load', timeout: 60000 });
for (let i = 0; i < 30; i++) {
  const s = await page.evaluate(`window.__cdtest ? window.__cdtest.state() : 'none'`).catch(() => 'none');
  if (s === 'title') break;
  await new Promise((r) => setTimeout(r, 1000));
}
await page.evaluate(`window.__cdtest.startMission('circuit')`);
await new Promise((r) => setTimeout(r, 6000));

const t = async (fn) => await page.evaluate(fn).catch((e) => ({ ok: 0, why: 'eval-' + e.message.slice(0, 40) }));
const snap = async (n) => { try { await page.screenshot({ path: `${D}/${n}.png` }); } catch (e) { console.log('snap fail', n); } };

// spawn a deterministic foe
console.log('spawn:', JSON.stringify(await t(`window.__cdtest.spawnFoeTest()`)));
await new Promise((r) => setTimeout(r, 1000));

// --- TEST 1: walk-in grab ---
console.log('T1: grab...');
let r = await t(`window.__cdtest.grabTest()`);
console.log('grab:', JSON.stringify(r));
await new Promise((r) => setTimeout(r, 600));
await snap('t1-grab-hold');

// --- TEST 2: 4-beat throw with phase sampling ---
console.log('T2: throw...');
r = await t(`window.__cdtest.throwTest()`);
console.log('throw start:', JSON.stringify(r));
const phases = [];
for (let i = 0; i < 14; i++) {
  await new Promise((r) => setTimeout(r, 120));
  const s = await t(`window.__cdtest.throwSeqTest()`);
  phases.push(s);
  if (i === 3) await snap('t2-throw-lift');
  if (i === 7) await snap('t2-throw-release');
}
const okPhases = phases.filter(p => p.ok);
console.log('phase count:', okPhases.length);
if (okPhases.length) {
  console.log('first:', JSON.stringify(okPhases[0]), 'last:', JSON.stringify(okPhases[okPhases.length - 1]));
  console.log('victim Y trajectory:', JSON.stringify(okPhases.map(p => p.vy)));
}
await new Promise((r) => setTimeout(r, 800));
await snap('t2-throw-aftermath');

// --- TEST 3: air kick ---
console.log('T3: air kick...');
await new Promise((r) => setTimeout(r, 1500));
r = await t(`window.__cdtest.airKickTest()`);
console.log('airkick:', JSON.stringify(r));
await new Promise((r) => setTimeout(r, 250));
await snap('t3-airkick');

// --- TEST 4: taunt ---
console.log('T4: taunt...');
await new Promise((r) => setTimeout(r, 1500));
r = await t(`window.__cdtest.tauntBuffTest()`);
console.log('taunt:', JSON.stringify(r));
await new Promise((r) => setTimeout(r, 400));
await snap('t4-taunt');

console.log('ERRORS:', errs.length ? errs.slice(0, 5).join('\n') : 'none');
console.log('SHOTS:', D);
await browser.close();

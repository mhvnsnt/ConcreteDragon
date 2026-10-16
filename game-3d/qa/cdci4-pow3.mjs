// CDCI4 POW REAL-SHOT v3 — skip the mission card FIRST, then verify words in real combat
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci4-pow';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci4/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const D = async (expr) => page.evaluate(new Function('return (' + expr + ')'));
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
await E("t.startMission('m1')");
await sleep(3000); // let the mission card cine start
// SKIP THE CARD — the whole point of v3
const skipped = await E('t.skipCine()').catch((e) => 'ERR ' + e.message);
console.log('skipCine:', skipped);
await sleep(1000);
// VERIFY we're in real combat: card gone, HUD visible, state fight
const verify = await D(`({
  cardOn: !!document.querySelector('#cineCap.on'),
  hudVisible: document.getElementById('hud').style.display,
  touchOn: document.getElementById('touch').classList.contains('on'),
  st: window.__cdtest.simDbg().st
})`).catch((e) => 'ERR ' + e.message);
console.log('verify combat:', JSON.stringify(verify));
await page.screenshot({ path: SHOTS + '/p0-combat-ready.png' });

// HEAVY (non-lethal) -> POW word. Freeze it in the same JS turn.
const freeze = await E(`(() => {
  const r = t.powTest('HEAVY', false);
  const d = document.querySelector('.pop.pow');
  if (!d) return { ok: false, r };
  d.remove = () => {};
  d.style.animationPlayState = 'paused';
  d.style.animationDelay = '-0.28s';
  const cs = getComputedStyle(d);
  return { ok: true, word: d.textContent, fontSize: cs.fontSize, color: cs.color, r };
})()`).catch((e) => 'ERR ' + e.message);
console.log('heavy freeze:', JSON.stringify(freeze));
await sleep(300);
await page.screenshot({ path: SHOTS + '/p1-heavy-word.png' });

// KO (lethal heavy) -> KRAKOOM word (CDCI4: KO word wins on lethal hits)
await sleep(800); // rate limiter reset (400ms)
const freezeKO = await E(`(() => {
  const r = t.powTest('HEAVY', true);
  const words = [...document.querySelectorAll('.pop.pow')].map(d => d.textContent);
  const d = document.querySelector('.pop.pow');
  if (d) { d.remove = () => {}; d.style.animationPlayState = 'paused'; d.style.animationDelay = '-0.28s'; }
  return { ok: !!d, words, r };
})()`).catch((e) => 'ERR ' + e.message);
console.log('ko freeze:', JSON.stringify(freezeKO));
await sleep(300);
await page.screenshot({ path: SHOTS + '/p2-ko-word.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

// CDCI4 POW REAL-SHOT — freeze the 900ms hit word in place, screenshot it for real
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
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
await E("t.startMission('m1')");
await sleep(8000);
console.log('state:', await E('t.simDbg().st').catch(() => '?'));

// Trigger a HEAVY hit and FREEZE the word in the same JS turn
const freeze = await E(`(() => {
  const r = t.powTest('HEAVY', false);
  const d = document.querySelector('.pop.pow');
  if (!d) return { ok: false, r };
  d.remove = () => {};                       // shadow prototype: the 900ms cleanup becomes a no-op
  d.style.animationPlayState = 'paused';      // freeze wherever it is
  d.style.animationDelay = '-0.28s';          // rewind to the settled overshoot pose (~40% of .7s)
  return { ok: true, word: d.textContent, x: d.style.left, y: d.style.top, r };
})()`).catch((e) => 'ERR ' + e.message);
console.log('freeze:', JSON.stringify(freeze));
await sleep(400);
await page.screenshot({ path: SHOTS + '/p1-heavy-frozen.png' });

// Same for a KO word
await sleep(1200);
const freezeKO = await E(`(() => {
  const r = t.powTest('HEAVY', true);
  const d = document.querySelector('.pop.pow');
  if (!d) return { ok: false, r };
  d.remove = () => {};
  d.style.animationPlayState = 'paused';
  d.style.animationDelay = '-0.28s';
  return { ok: true, word: d.textContent, r };
})()`).catch((e) => 'ERR ' + e.message);
console.log('freezeKO:', JSON.stringify(freezeKO));
await sleep(400);
await page.screenshot({ path: SHOTS + '/p2-ko-frozen.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

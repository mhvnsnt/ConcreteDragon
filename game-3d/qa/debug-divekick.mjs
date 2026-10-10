// Focused dive-kick debug: log foot vs hurtbox per frame during the fall.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390 });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1200);
// isolate: kill all foes except one, freeze it
await E(`(() => {
  const es = t.foes();
  for (let i = 0; i < es.length - 1; i++) { /* keep */ }
  const e = t.spawnFam('thug'); e.hp = 900; e.ai = 'idle'; e.aiT = 999;
  window._dke = e;
  t.walkTo(e.px - 0.6);
  return { foePx: e.px, px: t.playerPos().px };
})()`);
await E('t.ff(3)');
console.log('setup:', JSON.stringify(await E('t.playerPos()')));
await E(`(() => { t.zeroBusy(); t.doJump(); return t.playerPos(); })()`);
await E('t.ff(8)');
console.log('after jump+ff8:', JSON.stringify(await E('t.playerPos()')));
console.log('airT check:', await E(`(() => { return typeof player !== 'undefined' ? 'has player' : 'no'; })()`));
await E(`(() => { t.zeroBusy(); t.doPunch(); return 1; })()`);
// sample per frame during the fall
for (let i = 0; i < 25; i++) {
  const s = await E(`(() => {
    const dk = (typeof player !== 'undefined' && player.diveKick) ? { t: +player.diveKick.t.toFixed(2) } : null;
    const pp = t.playerPos();
    return { dk, pp, stats: t.contactStats() };
  })()`);
  console.log(i, JSON.stringify(s));
  await E('t.ff(2)');
  await sleep(50);
  if (!s.dk) { console.log('diveKick cleared'); break; }
}
await browser.close();

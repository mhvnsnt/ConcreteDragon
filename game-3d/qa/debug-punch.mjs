// Trace why doPunch doesn't trigger doJumpAttack.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
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
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=999; t.walkTo(e.px-0.6); return 1; })()`);
await E('t.ff(3)');
const r = await E(`(() => {
  t.zeroBusy(); t.doJump();
  // step manually without real-time gaps
  t.ff(8);
  const before = { airT: null, busy: null, taps: null };
  // read internals via dbg
  const d = t.dbg();
  before.busy = d.busy; before.airT = d.airT;
  const tapsBefore = (window.__tapsMark = (window.__tapsMark || 0));
  t.doPunch();
  const d2 = t.dbg();
  return { before, after: { busy: d2.busy, airT: d2.airT }, taps: d2.frames };
})()`);
console.log(JSON.stringify(r, null, 1));
// check if diveKick got set synchronously
console.log('diveKick set?', await E(`(() => { return !!(typeof player !== 'undefined' && player.diveKick); })()`));
await browser.close();

// Isolated dive-kick test: one enemy, log per-frame.
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
// remove all foes, spawn one frozen at known spot
await E(`(() => {
  // kill existing via debug? just spawn and use the new one
  const e = t.spawnFam('thug'); e.hp = 900; e.ai = 'idle'; e.aiT = 999;
  e.px = 8; e.pz = 0;
  t.walkTo(7.4);
  return { epx: e.px, px: t.playerPos().px };
})()`);
await E('t.ff(5)');
await E('t.resetContactStats()');
console.log('start pos:', JSON.stringify(await E('t.playerPos()')), JSON.stringify(await E('t.foes().map(f=>({px:f.px,hp:f.hp}))')));
await E(`(() => { t.zeroBusy(); t.doJump(); t.ff(8); t.zeroBusy(); t.doPunch(); return 1; })()`);
for (let i = 0; i < 30; i++) {
  const s = await E(`(() => ({ pp: t.playerPos(), stats: t.contactStats(), foes: t.foes().map(f=>({px:+f.px.toFixed(2),hp:Math.round(f.hp)})) }))()`);
  console.log(i, 'py=' + s.pp.py, 'px=' + s.pp.px, 'stats=' + JSON.stringify(s.stats), 'foes=' + JSON.stringify(s.foes));
  if (s.stats.strikes > 0) { console.log('HIT!'); break; }
  await E('t.ff(2)');
}
await browser.close();

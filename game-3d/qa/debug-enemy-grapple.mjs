// Isolated enemy-punch and grapple tests.
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

console.log('--- enemy punch: thug at 1.0, wait for AI attack ---');
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.px = t.playerPos().px + 1.0; e.pz = 0; window._ep = e; return 1; })()`);
await E('t.resetContactStats()');
const php0 = (await E('t.info()')).hp;
for (let i = 0; i < 40; i++) {
  await E('t.ff(15)');
  await sleep(100);
  const st = await E('t.contactStats()');
  const php = (await E('t.info()')).hp;
  if (st.strikes > 0 || php < php0) {
    console.log('enemy hit! iter', i, JSON.stringify(st), 'php', php0, '->', php);
    break;
  }
  if (i === 39) console.log('no enemy hit in 40 iters', JSON.stringify(st), 'php', php);
}

console.log('--- grapple: staggered thug at 1.2 ---');
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.stagger = 5; e.ai='idle'; e.aiT=999; e.px = t.playerPos().px + 1.2; e.pz = 0; window._ge = e; return 1; })()`);
await E('t.ff(3)');
await E('t.resetContactStats()');
await E(`(() => { t.zeroBusy(); t.doGrapple(); return 1; })()`);
await sleep(1500);
await E('t.ff(10)');
console.log('grapple stats:', JSON.stringify(await E('t.contactStats()')));
console.log('grapple foes:', JSON.stringify(await E('t.foes().map(f=>({px:+f.px.toFixed(2),hp:Math.round(f.hp)}))')));
await browser.close();

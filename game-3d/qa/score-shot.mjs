import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = 'file:///home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 12; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await sleep(1000);
await page.tap('#tapStart'); await sleep(1200);
await E('t.skipCine()'); await sleep(800);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=99999; e.px=8; t.walkTo(7.0); return 1; })()`);
await E('t.ff(10)');
await E('t.forceBigHit()'); await sleep(400);
await E('t.forceBigHit()'); await sleep(400);
await page.screenshot({ path: '/home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/shots-artui2/17-score.png' });
await browser.close();
console.log('done');

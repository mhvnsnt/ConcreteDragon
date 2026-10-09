// 45s soak: auto-play with hitbox system, track errors, fps, maxPen.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 160)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1200);
await E('t.resetContactStats()');
// fps counter
await page.evaluate(() => { window.__fpsc = 0; const loop = () => { window.__fpsc++; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
const T0 = Date.now();
let attacks = 0;
await page.keyboard.down('ArrowRight');
while (Date.now() - T0 < 45000) {
  const s = await E(`(() => { const p = t.playerPos(); const foes = t.foes().filter(f=>f.hp>0); const near = foes.map(f=>Math.abs(f.px-p.px)).sort((a,b)=>a-b)[0]; return { st: t.simDbg().st, near: near == null ? 99 : +near.toFixed(2), stats: t.contactStats(), info: t.info() }; })()`);
  if (s.st !== 'fight') { console.log('state:', s.st); break; }
  if (s.near < 2.0) {
    const r = Math.random();
    await E(`(() => { t.zeroBusy(); return 1; })()`);
    if (r < 0.5) await page.keyboard.press('j');
    else if (r < 0.7) await page.keyboard.press('k');
    else if (r < 0.8) await page.keyboard.press('l');
    else await page.keyboard.press('u');
    attacks++;
  }
  await page.evaluate(() => { window.__fpsc = 0; });
  await sleep(400);
  const fps = await page.evaluate(() => window.__fpsc * 2.5);
  if (Math.random() < 0.2) console.log('t=' + ((Date.now()-T0)/1000).toFixed(0) + 's fps=' + fps + ' near=' + s.near + ' maxPen=' + s.stats.maxPen + ' strikes=' + s.stats.strikes);
}
await page.keyboard.up('ArrowRight');
const fin = await E(`(() => ({ stats: t.contactStats(), info: t.info() }))()`);
console.log('FINAL attacks=' + attacks, JSON.stringify(fin));
console.log('errors:', errors.length, errors.slice(0, 8));
await browser.close();

// Before/after capture: punch at the exact strike moment (140ms after doPunch).
// Run twice: BEFORE_HTML=/tmp/before-collision.html vs AFTER (dist).
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = process.env.COLLISION_HTML || 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const TAG = process.env.COLLISION_TAG || 'after';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1200);
// one frozen thug at punch range
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=999; e.px=8; t.walkTo(7.0); return 1; })()`);
await E('t.ff(10)');
// capture at multiple moments around the strike: 100ms (windup), 160ms (strike), 300ms (recover)
await E(`(() => { t.zeroBusy(); t.doPunch(); return 1; })()`);
await sleep(100);
await page.screenshot({ path: `/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact/${TAG}-punch-100ms.png` });
await sleep(60);
await page.screenshot({ path: `/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact/${TAG}-punch-160ms.png` });
await sleep(140);
await page.screenshot({ path: `/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact/${TAG}-punch-300ms.png` });
console.log(TAG, 'captured');
await browser.close();

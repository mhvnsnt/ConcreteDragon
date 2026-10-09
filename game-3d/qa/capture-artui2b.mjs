// Round 2 UI verification part 2: low-HP HUD, boss bar, pause overlay, title logo plate.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = 'file:///home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/dist/concrete-dragon.html';
const OUT = '/home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/shots-artui2';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errs = [];
page.on('pageerror', (e) => errs.push('PAGE: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 160)); });
await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 12; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await sleep(1200);
// title logo plate: scroll title to top
await page.evaluate(() => { document.getElementById('title').scrollTop = 0; });
await sleep(400);
await page.screenshot({ path: `${OUT}/08-title-logo.png` });
await page.tap('#tapStart'); await sleep(1200);
await E('t.skipCine()'); await sleep(800);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=999; e.px=8; t.walkTo(7.0); return 1; })()`);
await E('t.ff(10)');
// low HP: hurt to ~20% (not dead)
await E('t.dbgHurt(99999)'); // get maxHp scale first via playerDbg
await E('t.healPlayer()'); await sleep(200);
const php = await E(`(() => { const p = t.playerDbg(); return p.hp / p.maxHp; })()`);
await E(`t.dbgHurt(t.playerDbg().maxHp * 0.85)`);
await sleep(700);
await page.screenshot({ path: `${OUT}/09-hud-lowhp2.png` });
await E('t.healPlayer()'); await sleep(300);
// boss bar with boss alive
await E(`t.spawnBoss('kingpin')`); await sleep(1800);
await page.screenshot({ path: `${OUT}/10-hud-boss2.png` });
// pause via JS click
await page.evaluate(() => document.getElementById('pauseBtn').click());
await sleep(800);
await page.screenshot({ path: `${OUT}/11-pause2.png` });
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
console.log('done');

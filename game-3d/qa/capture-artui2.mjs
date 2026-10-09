// Round 2 UI verification: capture every screen touched.
// Title, select, mission, HUD combat, boss bar, pause, touch controls.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = 'file:///home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/dist/concrete-dragon.html';
const OUT = '/home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/shots-artui2';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });
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
await sleep(1500);
await page.screenshot({ path: `${OUT}/01-title.png` });
// select screen
await page.tap('#tapStart'); await sleep(1200);
await E('t.skipCine()'); await sleep(800);
await page.screenshot({ path: `${OUT}/02-select.png` });
// mission screen
await E(`t.setFighter('kidblue')`); await sleep(400);
await page.tap('#fightBtn'); await sleep(1000);
await page.screenshot({ path: `${OUT}/03-mission.png` });
// start mission -> combat HUD with real hits + combo
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=999; e.px=8; t.walkTo(7.0); return 1; })()`);
await E('t.ff(10)');
await E('t.forceBigHit()'); await sleep(300);
await E('t.forceBigHit()'); await sleep(300);
await E('t.forceBigHit()'); await sleep(400);
await page.screenshot({ path: `${OUT}/04-hud-combat.png` });
// low HP state on player
await E('t.dbgHurt(9999)'); await sleep(700);
await page.screenshot({ path: `${OUT}/05-hud-lowhp.png` });
await E('t.healPlayer()'); await sleep(300);
// boss bar
await E(`t.spawnBoss('kingpin')`); await sleep(1500);
await page.screenshot({ path: `${OUT}/06-hud-boss.png` });
// pause overlay
await page.tap('#pauseBtn'); await sleep(800);
await page.screenshot({ path: `${OUT}/07-pause.png` });
await page.tap('#resumeBtn'); await sleep(500);
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
console.log('done');

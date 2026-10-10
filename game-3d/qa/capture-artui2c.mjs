// Round 2 UI verification part 3: low-HP HUD (alive), boss bar (alive), pause overlay.
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
await sleep(1000);
await page.tap('#tapStart'); await sleep(1200);
await E('t.skipCine()'); await sleep(800);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
// passive thug nearby, player walks into range
await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=99999; e.px=8; t.walkTo(7.0); return 1; })()`);
await E('t.ff(10)');
// hurt to 20% in ONE shot using measured maxHp (no death)
await E(`t.dbgHurt(t.playerDbg().maxHp * 0.8)`);
await sleep(900);
await page.screenshot({ path: `${OUT}/13-hud-lowhp3.png` });
const st = await E(`t.playerDbg().hp / t.playerDbg().maxHp`);
console.log('hp frac:', st.toFixed(2));
// heal, then boss
await E('t.healPlayer()'); await sleep(300);
await E(`t.spawnBoss('kingpin')`); await sleep(2000);
await page.screenshot({ path: `${OUT}/14-hud-boss3.png` });
// pause via JS click
await page.evaluate(() => document.getElementById('pauseBtn').click());
await sleep(800);
await page.screenshot({ path: `${OUT}/15-pause3.png` });
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
console.log('done');

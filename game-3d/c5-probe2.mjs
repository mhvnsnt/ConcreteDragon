import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-c5/game-3d/shots-improveloop-c5';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await b.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const KEY = async (type, key) => page.evaluate((ty, k) => { document.dispatchEvent(new KeyboardEvent(ty, { key: k, bubbles: true })); }, type, key);
await page.goto('file:///home/hatch/workspace/ConcreteDragon-c5/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
await page.waitForSelector('#tapStart', { visible: true, timeout: 60000 });
await page.evaluate(() => { document.querySelector('#tapStart').click(); });
await sleep(800);
await E('t.skipCine()'); await sleep(400);
let bless = await page.$('.blessCard'); if (bless) { await bless.click(); await sleep(400); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(500);
await E('t.skipCine()'); await E('t.ff(30)'); await sleep(300);
bless = await page.$('.blessCard'); if (bless) { await bless.click(); await sleep(400); }
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(200);
// punch to combo 4 like the original script
let foe = (await E('t.foes()'))[0];
await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await E('t.ff(4)'); await sleep(100);
await KEY('keydown', 'j'); await E('t.ff(6)'); await sleep(250); await KEY('keyup', 'j');
await E('t.ff(10)'); await sleep(150);
// dump anything overlapping the #combo rect
const overlap = await page.evaluate(() => {
  const c = document.getElementById('combo');
  const cr = c.getBoundingClientRect();
  const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
  const els = document.elementsFromPoint(cx, cy).slice(0, 6).map(el => ({
    tag: el.tagName, id: el.id, cls: el.className && el.className.baseVal !== undefined ? String(el.className) : el.className,
    text: (el.textContent || '').slice(0, 40), color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor
  }));
  return { comboText: c.textContent, comboRect: {x:cr.x,y:cr.y,w:cr.width,h:cr.height}, els };
});
console.log('OVERLAP:', JSON.stringify(overlap, null, 1));
await page.screenshot({ path: `${SHOTS}/04b-probe.png` });
// now game-over step
await E('t.clearFoes()'); await E(`t.spawnFam("thug")`); await E('t.ff(10)'); await sleep(150);
const f0 = (await E('t.foes()'))[0];
console.log('foe for retaliation:', f0 ? 'ok' : 'MISSING');
if (f0) { await E(`t.tp2(${f0.px - 1.5}, ${f0.pz})`); await E('t.ff(6)'); await sleep(100); }
const myHp0 = await E('t.info()').then(i => i.hp);
console.log('player hp start:', myHp0);
for (let i = 0; i < 30; i++) { await E('t.ff(20)'); await sleep(120); const h = (await E('t.info()')).hp; if (h <= 0) { console.log('player down at iter', i); break; } }
const myHpEnd = (await E('t.info()')).hp;
console.log('player hp end:', myHpEnd);
await E('t.ff(40)'); await sleep(800);
const goVisible = await page.evaluate(() => !!document.querySelector('.gameOver,.goScreen,[data-go]') || (document.body.innerText || '').includes('GAME OVER'));
await page.screenshot({ path: `${SHOTS}/06-gameover.png` });
console.log('gameover visible:', goVisible, '| errors:', errors.length, JSON.stringify(errors.slice(0,5)));
fs.writeFileSync(`${SHOTS}/results-c5.json`, JSON.stringify({ overlap, myHp0, myHpEnd, goVisible, errors }, null, 2));
console.log('PROBE DONE');
await b.close();

// CYCLE 1b: fast-forward LOGIC playtest — 120 game-seconds of m1.
// Uses t.ff() (sim fast-forward, no render) + direct combat hooks (same fns
// input calls). Movement approximated via small tp() steps toward the nearest
// foe — documented approximation for pacing/difficulty measurement only.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const OUT = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-improveloop-c1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 480, height: 270 });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
if (!booted) { console.log('BOOT FAIL'); await browser.close(); process.exit(1); }
await page.tap('#tapStart'); await sleep(500);
await E('t.skipCine()');
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(300);
await E('t.skipCine()');
await E('t.ff(60)'); // 1 game-sec settle
const log = [];
let punchN = 0;
for (let tick = 0; tick < 240; tick++) { // 240 x 0.5s = 120 game-sec
  const s = await E('({ info: t.info(), p: t.playerDbg(), foes: t.foes(), en: t.energy(), st: t.simDbg().st })');
  if (s.st !== 'fight') { log.push({ tick, t: tick * 0.5, event: 'state=' + s.st }); break; }
  const live = s.foes.filter(f => f.hp > 0);
  const near = live.map(f => ({ ...f, d: Math.hypot(f.px - s.p.px, (f.pz || 0)) })).sort((a, b) => a.d - b.d)[0];
  if (near && near.d < 2.4) {
    if (near.wu > 0.3 && Math.random() < 0.7) await E('t.doDodge()');
    else if (punchN % 4 === 3) { await E('t.doHeavy()'); }
    else await E('t.doPunch()');
    punchN++;
    if (s.en > 70 && Math.random() < 0.3) await E('t.doSpecial()');
  } else if (near) {
    const dx = Math.sign(near.px - s.p.px) * 1.5;
    await E(`t.tp(${s.p.px + dx})`);
  } else {
    await E(`t.tp(${s.p.px + 1.5})`); // walk right toward next wave
  }
  await E('t.ff(30)'); // advance 0.5 game-sec
  const s2 = await E('t.info()');
  log.push({ tick, t: +((tick + 1) * 0.5).toFixed(1), hp: s2.hp, kills: s2.kills, foes: s2.foes, px: s2.px, cash: s2.cash, boss: s2.boss });
}
fs.writeFileSync(OUT + '/logic-c1.json', JSON.stringify(log, null, 1));
const L = log.filter(x => x.hp !== undefined);
// analysis
const dmgTaken = L[0].hp - L[L.length - 1].hp;
console.log('game-sec simulated:', L.length * 0.5);
console.log('hp start/end:', L[0].hp, L[L.length - 1].hp, 'dmg taken:', dmgTaken);
console.log('kills:', L[L.length - 1].kills, 'cash:', L[L.length - 1].cash, 'px:', L[L.length - 1].px);
const dead = []; let ds = null;
for (const x of L) { if (x.foes === 0) { if (ds === null) ds = x.t; } else { if (ds !== null && x.t - ds >= 4) dead.push([ds, x.t]); ds = null; } }
console.log('dead stretches (>=4s no foes):', JSON.stringify(dead));
// damage rate per 10s window
for (let w = 0; w < L.length; w += 20) {
  const a = L[w], b = L[Math.min(w + 19, L.length - 1)];
  console.log(`t=${a.t}-${b.t}s hp ${a.hp}->${b.hp} kills ${b.kills - a.kills}`);
}
console.log('errors:', errors.length, errors.slice(0, 8));
await browser.close();

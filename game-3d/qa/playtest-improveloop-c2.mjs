// CYCLE 2 playtest: scripted real playthrough of m1, ~100s of actual play.
// Keyboard-driven only (like a player). Rich instrumentation to find real
// defects/feel issues: foe aggression, hurt events, pacing dead-stretches,
// wave clear cadence, special economy, fps. Screenshots every 3s for eyes-on.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-improveloop-c2';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
import fs from 'fs';
fs.mkdirSync(SHOTS, { recursive: true });
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
console.log('boot:', booted ? 'PASS' : 'FAIL');
if (!booted) { await browser.close(); process.exit(1); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
// dismiss blessing overlay if it appears (it pauses the sim)
const bless = await page.$('.blessCard');
if (bless) { await bless.click(); console.log('blessing dismissed'); await sleep(500); }
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
const bless2 = await page.$('.blessCard');
if (bless2) { await bless2.click(); console.log('blessing2 dismissed'); await sleep(500); }
console.log('mission info:', JSON.stringify(await E('t.info()')));

let frames = 0;
await page.evaluate(() => { window.__fpsc = 0; const loop = () => { window.__fpsc++; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });

const T0 = Date.now();
const samples = [];
let shotN = 0;
let lastHp = null, hurtEvents = 0, lastKills = 0, koTimes = [];
let windupSeen = new Set();
await page.keyboard.down('ArrowRight');
while (Date.now() - T0 < 100000) {
  const s = await E(`({ p: t.playerDbg(), dbg: t.dbgPlayer(), foes: t.foes().map(f => ({ hp: Math.round(f.hp), px: +f.px.toFixed(1), pz: +f.pz.toFixed(1), ai: f.ai, wu: f.wu, name: f.name })), info: t.info(), st: t.simDbg().st })`);
  const now = +((Date.now() - T0) / 1000).toFixed(1);
  samples.push({ t: now, ...s });
  const p = s.p, live = s.foes.filter(f => f.hp > 0);
  // hurt tracking
  if (lastHp !== null && p && p.hp < lastHp) { hurtEvents++; }
  if (p) lastHp = p.hp;
  // KO tracking
  if (s.info.kills > lastKills) { for (let k = lastKills; k < s.info.kills; k++) koTimes.push(now); lastKills = s.info.kills; }
  // foe aggression: which AI states appear
  for (const f of live) { if (f.ai === 'windup' || f.ai === 'attack') windupSeen.add(f.ai + ':' + now.toFixed(0)); }
  if (s.st === 'fight' && p) {
    const near = live.map(f => ({ ...f, d: Math.abs(f.px - p.px) })).sort((a, b) => a.d - b.d)[0];
    if (near && near.d < 2.2) {
      if (near.wu > 0.4) { await page.keyboard.press('l'); }
      else if (Math.random() < 0.25) { await page.keyboard.press('k'); }
      else { await page.keyboard.press('j'); }
    }
    if (Math.random() < 0.06) await page.keyboard.press('u');
  }
  if (s.st !== 'fight') { console.log('state changed:', s.st, 'at', now + 's'); if (s.st === 'win' || s.st === 'gameover') break; }
  await page.evaluate(() => { window.__fpsc = 0; });
  await sleep(500);
  const fps = await page.evaluate(() => window.__fpsc * 2);
  samples[samples.length - 1].fps = fps;
  if (now > shotN * 3) { shotN++; await page.screenshot({ path: `${SHOTS}/play-${String(shotN).padStart(2, '0')}.png` }); }
}
await page.keyboard.up('ArrowRight');
console.log('final:', JSON.stringify(await E('t.playerDbg()')));
console.log('kills:', lastKills, 'koTimes:', JSON.stringify(koTimes.slice(0, 20)));
console.log('hurtEvents:', hurtEvents);
console.log('errors:', errors.length, errors.slice(0, 10));
fs.writeFileSync(SHOTS + '/samples.json', JSON.stringify(samples, null, 1));
// analysis
const dead = [];
let deadStart = null;
for (const s of samples) {
  const live = s.foes.filter(f => f.hp > 0).length;
  if (live === 0 && s.st === 'fight') { if (deadStart === null) deadStart = s.t; }
  else { if (deadStart !== null && s.t - deadStart > 3) dead.push([+deadStart.toFixed(1), +s.t.toFixed(1)]); deadStart = null; }
}
console.log('dead stretches (>3s, no live foes):', JSON.stringify(dead));
const hps = samples.filter(s => s.p).map(s => s.p.hp);
console.log('hp start/end/min:', hps[0], hps[hps.length - 1], Math.min(...hps));
const fpss = samples.map(s => s.fps).filter(Boolean);
console.log('fps avg/min:', (fpss.reduce((a, b) => a + b, 0) / fpss.length).toFixed(1), Math.min(...fpss));
// foe AI state distribution
const aiCounts = {};
for (const s of samples) for (const f of s.foes) { if (f.hp > 0) aiCounts[f.ai] = (aiCounts[f.ai] || 0) + 1; }
console.log('foe AI state distribution:', JSON.stringify(aiCounts));
console.log('foe windup/attack moments:', windupSeen.size);
const ens = samples.filter(s => s.dbg).map(s => s.dbg.energy);
console.log('energy start/end/max:', ens[0], ens[ens.length - 1], Math.max(...ens));
await browser.close();

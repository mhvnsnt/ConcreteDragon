// CYCLE 1 playtest: scripted real playthrough of m1, ~75s of actual play.
// Drives the game ONLY via keyboard input (like a player), samples state,
// screenshots every 3s, logs errors. No test-API cheats during the play phase.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-improveloop-c1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
import fs from 'fs';
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
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
console.log('mission info:', JSON.stringify(await E('t.info()')));

// FPS sampler
let frames = 0;
await page.evaluate(() => { window.__fpsc = 0; const loop = () => { window.__fpsc++; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });

// --- play phase: 75 seconds of scripted play ---
const T0 = Date.now();
const samples = [];
let shotN = 0;
await page.keyboard.down('ArrowRight');
while (Date.now() - T0 < 75000) {
  const s = await E(`({ p: t.playerDbg(), foes: t.foes().map(f => ({ hp: Math.round(f.hp), px: +f.px.toFixed(1), wu: +(f.wu||0).toFixed(1) })), st: t.simDbg().st, fps: window.__fpsc })`);
  samples.push({ t: +((Date.now() - T0) / 1000).toFixed(1), ...s });
  // simple AI: find nearest live foe
  const p = s.p, live = s.foes.filter(f => f.hp > 0);
  if (s.st === 'fight' && p) {
    const near = live.map(f => ({ ...f, d: Math.abs(f.px - p.px) })).sort((a, b) => a.d - b.d)[0];
    if (near && near.d < 2.2) {
      // in range: punch; dodge if foe winding up; heavy sometimes
      if (near.wu > 0.4) { await page.keyboard.press('l'); }
      else if (Math.random() < 0.25) { await page.keyboard.press('k'); }
      else { await page.keyboard.press('j'); }
    } else if (near && near.d < 6) {
      // walk toward (ArrowRight already held)
    } else if (live.length === 0) {
      // keep walking right to trigger next wave
    }
    if (Math.random() < 0.06) await page.keyboard.press('u'); // special sometimes
  }
  if (s.st !== 'fight') { console.log('state changed:', s.st, 'at', +((Date.now() - T0) / 1000).toFixed(1) + 's'); }
  await page.evaluate(() => { window.__fpsc = 0; });
  await sleep(500);
  const fps = await page.evaluate(() => window.__fpsc * 2);
  samples[samples.length - 1].fps = fps;
  if ((Date.now() - T0) / 1000 > shotN * 3) { shotN++; await page.screenshot({ path: `${SHOTS}/play-${String(shotN).padStart(2, '0')}.png` }); }
}
await page.keyboard.up('ArrowRight');
console.log('final:', JSON.stringify(await E('t.playerDbg()')));
console.log('foes left:', JSON.stringify((await E('t.foes()')).length));
console.log('errors:', errors.length, errors.slice(0, 10));
// summarize
fs.writeFileSync(SHOTS + '/samples.json', JSON.stringify(samples, null, 1));
const dead = [];
let deadStart = null;
for (const s of samples) {
  const live = s.foes.filter(f => f.hp > 0).length;
  if (live === 0 && s.st === 'fight') { if (deadStart === null) deadStart = s.t; }
  else { if (deadStart !== null && s.t - deadStart > 3) dead.push([deadStart, s.t]); deadStart = null; }
}
console.log('dead stretches (>3s, no live foes):', JSON.stringify(dead));
const hps = samples.filter(s => s.p).map(s => s.p.hp);
console.log('hp start/end/min:', hps[0], hps[hps.length - 1], Math.min(...hps));
const fpss = samples.map(s => s.fps).filter(Boolean);
console.log('fps avg/min:', (fpss.reduce((a, b) => a + b, 0) / fpss.length).toFixed(1), Math.min(...fpss));
await browser.close();

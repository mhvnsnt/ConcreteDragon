// Video capture harness for Concrete Dragon — deterministic frame stepping.
// Usage: node qa/cap-shot.mjs <shotName> — reads shot def from qa/shots.js
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = 'file:///home/hatch/workspace/ConcreteDragon-video/game-3d/dist/concrete-dragon.html';
const OUTBASE = '/home/hatch/workspace/concrete-dragon-launch/videos/raw';
const W = 960, H = 540, FPS = 30, CAP_FPS = 15; // capture at 15fps, minterpolate to 30 in assembly
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const shotName = process.argv[2] || 'smoke';
const { SHOTS } = await import('./shots.js');
const shot = SHOTS[shotName];
if (!shot) { console.error('unknown shot', shotName); process.exit(1); }

const OUT = path.join(OUTBASE, shotName);
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errs = [];
page.on('pageerror', (e) => errs.push('PAGE: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 120)); });

await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
// wait for title state
for (let i = 0; i < 30; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(1000); }
await sleep(1500);

// run the shot's setup
await shot.setup(E, page, sleep);

// capture frames: stepRender(2/30) per capture = 15fps source, minterpolate to 30 in assembly
const frames = shot.frames;
const step = 2; // sim frames per capture
const captures = Math.ceil(frames / step);
console.log(`capturing ${captures} frames (15fps source) for ${shotName}...`);
const t0 = Date.now();
for (let f = 0; f < captures; f++) {
  const simF = f * step;
  if (shot.onFrame) await shot.onFrame(E, simF);
  await E(`t.stepRender(${step}/30)`);
  try {
    await page.screenshot({ path: path.join(OUT, `f${String(f).padStart(5,'0')}.jpg`), type: 'jpeg', quality: 85 });
  } catch (e) {
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT, `f${String(f).padStart(5,'0')}.jpg`), type: 'jpeg', quality: 85 });
  }
  if (f % 40 === 0) console.log(`  frame ${f}/${captures} (${((Date.now()-t0)/1000).toFixed(0)}s)`);
}
console.log(`done ${shotName}: ${captures} captures in ${((Date.now()-t0)/1000).toFixed(0)}s, errors:`, errs.length ? errs.slice(0,5) : 'none');
await browser.close();

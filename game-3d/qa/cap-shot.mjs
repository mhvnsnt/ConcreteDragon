// Video capture harness for Concrete Dragon — deterministic frame stepping.
// Usage: node qa/cap-shot.mjs <shotName> — reads shot def from qa/shots.js
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = 'file:///home/hatch/workspace/ConcreteDragon-video/game-3d/dist/concrete-dragon.html';
const OUTBASE = '/home/hatch/workspace/concrete-dragon-launch/videos/raw';
const W = 1280, H = 720, FPS = 30;
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

// capture frames: stepRender(1/30) + screenshot per frame
const frames = shot.frames;
console.log(`capturing ${frames} frames for ${shotName}...`);
const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  if (shot.onFrame) await shot.onFrame(E, f);
  await E('t.stepRender(1/30)');
  // periodic wall-clock settle for hit-resolution timeouts
  if (f % 30 === 0 && f > 0) await sleep(120);
  await page.screenshot({ path: path.join(OUT, `f${String(f).padStart(5,'0')}.png`) });
  if (f % 60 === 0) console.log(`  frame ${f}/${frames} (${((Date.now()-t0)/1000).toFixed(0)}s)`);
}
console.log(`done ${shotName}: ${frames} frames in ${((Date.now()-t0)/1000).toFixed(0)}s, errors:`, errs.length ? errs.slice(0,5) : 'none');
await browser.close();

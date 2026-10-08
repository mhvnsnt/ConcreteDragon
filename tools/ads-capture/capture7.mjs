#!/usr/bin/env node
// capture7: full-length real-gameplay capture for Concrete Dragon ads.
// In-page rAF frame grab (game canvas -> 2D canvas -> jpeg dataURL), batch-pulled
// to disk every 8s. 1280x720 so ffmpeg can assemble trailer + vertical crops + stills.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright-core';

const SEC = parseFloat(process.argv[2] || '75');
const OUT = process.argv[3] || '/home/hatch/workspace/concrete-dragon-ads/frames2';
const DIR = '/home/hatch/workspace/street-brawl-cicd/game-3d/dist';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
fs.mkdirSync(OUT, { recursive: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(path.join(DIR, 'concrete-dragon.html')).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

let page = null, browser = null;
for (let attempt = 1; attempt <= 6 && !page; attempt++) {
  try {
    browser = await chromium.launch({
      executablePath: CHROME, headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader',
             '--enable-unsafe-swiftshader', '--disable-gpu-shader-disk-cache', '--mute-audio',
             '--autoplay-policy=no-user-gesture-required'],
    });
    const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 60000 });
    await p.waitForTimeout(12000);
    page = p;
    console.log('launch ok on attempt', attempt);
  } catch (e) {
    console.log('launch attempt', attempt, 'failed:', String(e).split('\n')[0].slice(0, 120));
    try { await browser.close(); } catch (_) {}
    await new Promise((r) => setTimeout(r, 5000));
  }
}
if (!page) { console.log('ALL LAUNCHES FAILED'); server.close(); process.exit(2); }
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 160)));

try { await page.evaluate(() => { try { if (typeof save !== 'undefined') save.quality = 'low'; if (typeof applyQuality !== 'undefined') applyQuality(); } catch (e) {} }); } catch (_) {}
await page.mouse.click(200, 600);
await page.waitForTimeout(1500);
await page.evaluate(() => document.getElementById('fightBtn').click());
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector('#mList .mcard:not(.locked) button.go').click());
await page.waitForTimeout(2500);
for (let i = 0; i < 3; i++) { await page.mouse.click(640, 360); await page.waitForTimeout(700); }
console.log('navigated');

// install frame grabber: copy game canvas -> 2D canvas -> jpeg dataURL every rAF
await page.evaluate(() => {
  window.__frames = [];
  window.__dropped = 0;
  const gc = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const c2 = document.createElement('canvas'); c2.width = gc.width; c2.height = gc.height;
  const x2 = c2.getContext('2d');
  const loop = () => {
    try {
      x2.drawImage(gc, 0, 0);
      if (window.__frames.length < 1200) window.__frames.push(c2.toDataURL('image/jpeg', 0.78));
      else window.__dropped++;
    } catch (e) {}
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
console.log('grabber installed');

// hype play script: move + attacks + specials + jump
const script = [
  ['down', 'd', 2400], ['up', 'd', 0],
  ['press', 'j', 0], ['press', 'j', 400], ['press', 'j', 400], ['press', 'k', 600],
  ['down', 'd', 1600], ['up', 'd', 0],
  ['press', 'j', 0], ['press', 'j', 400], ['press', 'j', 400], ['press', 'u', 700],
  ['press', ' ', 0], ['down', 'a', 1300], ['up', 'a', 0],
  ['press', 'l', 350],
  ['down', 'd', 2000], ['up', 'd', 0],
  ['press', 'j', 0], ['press', 'k', 450], ['press', 'j', 450], ['press', 'j', 450],
  ['press', 'u', 900],
  ['down', 'd', 2200], ['up', 'd', 0],
  ['press', 'j', 0], ['press', 'j', 400], ['press', 'k', 600], ['press', 'l', 450],
  ['press', ' ', 0], ['down', 'd', 1800], ['up', 'd', 0],
  ['press', 'j', 0], ['press', 'j', 400], ['press', 'j', 400], ['press', 'u', 1000],
  ['down', 'a', 1100], ['up', 'a', 0],
];

const t0 = Date.now(), endAt = t0 + SEC * 1000;
let si = 0, steps = 0, idx = 0, lastPull = Date.now();
while (Date.now() < endAt) {
  const [op, key, wait] = script[si % script.length]; si++; steps++;
  try {
    if (op === 'down') await page.keyboard.down(key);
    else if (op === 'up') await page.keyboard.up(key);
    else await page.keyboard.press(key);
  } catch (e) { console.log('[input err]', String(e).slice(0, 80)); break; }
  await page.waitForTimeout(Math.max(wait, 80));
  if (Date.now() - lastPull > 8000) {
    lastPull = Date.now();
    try {
      const batch = await page.evaluate(() => { const b = window.__frames; window.__frames = []; return b; });
      for (const d of batch) {
        const n = String(idx++).padStart(5, '0');
        fs.writeFileSync(`${OUT}/f${n}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
      }
      const dropped = await page.evaluate(() => window.__dropped).catch(() => -1);
      console.log('pulled', batch.length, 'frames; total', idx, 'dropped', dropped);
    } catch (e) { console.log('[pull err]', String(e).slice(0, 80)); break; }
  }
}
try {
  const batch = await page.evaluate(() => { const b = window.__frames; window.__frames = []; return b; });
  for (const d of batch) {
    const n = String(idx++).padStart(5, '0');
    fs.writeFileSync(`${OUT}/f${n}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
  }
} catch (_) {}
console.log('DONE steps:', steps, 'frames:', idx);
await browser.close();
server.close();

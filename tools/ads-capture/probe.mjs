#!/usr/bin/env node
// probe: measure rAF fps + capture cost at different viewport sizes
import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright-core';

const DIR = '/home/hatch/workspace/street-brawl-cicd/game-3d/dist';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(path.join(DIR, 'concrete-dragon.html')).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader',
         '--enable-unsafe-swiftshader', '--disable-gpu-shader-disk-cache', '--mute-audio',
         '--autoplay-policy=no-user-gesture-required'],
});

for (const [w, h] of [[1280, 720], [960, 540], [640, 360]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(10000);
  await page.mouse.click(w / 2, h - 60);
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById('fightBtn').click());
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('#mList .mcard:not(.locked) button.go').click());
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => new Promise((res) => {
    let rafN = 0, t0 = performance.now();
    const gc = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const c2 = document.createElement('canvas'); c2.width = Math.min(gc.width, 480); c2.height = Math.min(gc.height, 270);
    const x2 = c2.getContext('2d');
    let capN = 0;
    const t1 = performance.now();
    const loop = () => {
      rafN++;
      try { x2.drawImage(gc, 0, 0, c2.width, c2.height); c2.toDataURL('image/jpeg', 0.6); capN++; } catch (e) {}
      if (performance.now() - t1 < 8000) requestAnimationFrame(loop);
      else res({ rafFps: (rafN / ((performance.now() - t0) / 1000)).toFixed(1), capFps: (capN / ((performance.now() - t1) / 1000)).toFixed(1), canvas: gc.width + 'x' + gc.height });
    };
    requestAnimationFrame(loop);
  }));
  console.log(`${w}x${h}:`, JSON.stringify(r));
  await page.close();
}
await browser.close();
server.close();

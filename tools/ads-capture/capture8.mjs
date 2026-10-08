#!/usr/bin/env node
// capture8: FIXED-TIMESTEP gameplay capture. Patches performance.now + rAF via
// addInitScript so every rendered frame advances game time exactly 1/30s.
// Inputs are scheduled by FRAME (synthetic KeyboardEvents), so choreography is
// exact even though real render rate is ~2fps. Frames captured in-page via
// canvas->2D->jpeg, batch-pulled to disk. Output: N real gameplay frames.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright-core';

const FRAMES = parseInt(process.argv[2] || '960', 10);
const OUT = process.argv[3] || '/home/hatch/workspace/concrete-dragon-ads/frames3';
const VW = parseInt(process.argv[4] || '640', 10);
const VH = parseInt(process.argv[5] || '360', 10);
const DIR = '/home/hatch/workspace/street-brawl-cicd/game-3d/dist';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
fs.mkdirSync(OUT, { recursive: true });

// input schedule: [frame, op, key]
function buildSchedule() {
  const S = [];
  const at = (f, op, k) => S.push({ frame: f, op, key: k, done: false });
  at(5, 'down', 'd');
  at(90, 'press', 'j'); at(102, 'press', 'j'); at(114, 'press', 'j');
  at(135, 'press', 'k');
  at(150, 'up', 'd'); at(150, 'down', 'a');
  at(200, 'press', ' ');
  at(220, 'up', 'a'); at(220, 'down', 'd');
  at(250, 'press', 'j'); at(262, 'press', 'j'); at(274, 'press', 'u');
  at(300, 'up', 'd');
  at(310, 'press', 'l');
  at(330, 'down', 'd');
  at(380, 'press', 'k');
  at(400, 'up', 'd'); at(400, 'down', 'a');
  at(450, 'press', 'j'); at(462, 'press', 'j'); at(474, 'press', 'j');
  at(500, 'press', ' ');
  at(520, 'up', 'a'); at(520, 'down', 'd');
  at(560, 'press', 'u');
  at(600, 'up', 'd');
  at(620, 'press', 'j'); at(635, 'press', 'k'); at(650, 'press', 'j');
  at(680, 'down', 'a');
  at(720, 'up', 'a'); at(720, 'down', 'd');
  at(780, 'press', 'l');
  at(800, 'up', 'd'); at(800, 'down', 'd');
  at(860, 'press', 'j'); at(872, 'press', 'j'); at(884, 'press', 'k');
  at(920, 'up', 'd');
  return S;
}

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
const page = await browser.newPage({ viewport: { width: VW, height: VH } });

await page.addInitScript((sched) => {
  window.__cap = { frames: [], frame: 0, schedule: sched, target: 0 };
  const CODE = { d: 'KeyD', a: 'KeyA', j: 'KeyJ', k: 'KeyK', l: 'KeyL', u: 'KeyU', ' ': 'Space' };
  function fire(type, key) {
    const ev = new KeyboardEvent(type, { key, code: CODE[key] || key, bubbles: true, cancelable: true, repeat: false });
    window.dispatchEvent(ev); document.dispatchEvent(ev);
    const cvs = document.querySelector('canvas'); if (cvs) cvs.dispatchEvent(ev);
  }
  const realRAF = window.requestAnimationFrame.bind(window);
  let fakeNow = 0; const DT = 1000 / 30;
  const _pnow = performance.now.bind(performance);
  window.__realNow = _pnow;
  performance.now = () => fakeNow;
  if (performance.timeOrigin !== undefined) { try { Object.defineProperty(performance, 'timeOrigin', { value: _pnow() }); } catch (e) {} }
  let grab = null;
  window.requestAnimationFrame = function (cb) {
    return realRAF(function (t) {
      fakeNow += DT;
      window.__cap.frame++;
      for (const s of window.__cap.schedule) {
        if (!s.done && window.__cap.frame >= s.frame) {
          s.done = true;
          if (s.op === 'down') fire('keydown', s.key);
          else if (s.op === 'up') fire('keyup', s.key);
          else { fire('keydown', s.key); fire('keyup', s.key); }
        }
      }
      let r;
      try { r = cb(fakeNow); } finally {
        try {
          if (!grab) {
            const gc = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
            if (gc && gc.width > 0) {
              grab = document.createElement('canvas'); grab.width = gc.width; grab.height = gc.height;
              grab.getContext('2d');
            }
          }
          if (grab) {
            const gx = grab.getContext('2d');
            const gc = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
            gx.drawImage(gc, 0, 0);
            window.__cap.frames.push(grab.toDataURL('image/jpeg', 0.78));
          }
        } catch (e) {}
      }
      return r;
    });
  };
}, buildSchedule());

page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 160)));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(10000);
try { await page.evaluate(() => { try { if (typeof save !== 'undefined') save.quality = 'low'; if (typeof applyQuality !== 'undefined') applyQuality(); } catch (e) {} }); } catch (_) {}
await page.mouse.click(VW / 2, VH - 60);
await page.waitForTimeout(1500);
await page.evaluate(() => document.getElementById('fightBtn').click());
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector('#mList .mcard:not(.locked) button.go').click());
await page.waitForTimeout(2000);
for (let i = 0; i < 3; i++) { await page.mouse.click(VW / 2, VH / 2); await page.waitForTimeout(700); }
console.log('navigated, starting fixed-step capture of', FRAMES, 'frames');

// reset frame counter now that we're in gameplay
await page.evaluate((n) => { window.__cap.frames = []; window.__cap.frame = 0; window.__cap.target = n;
  for (const s of window.__cap.schedule) s.done = false; }, FRAMES);

let idx = 0, lastHash = null, dupes = 0;
const t0 = Date.now();
while (true) {
  await page.waitForTimeout(12000);
  const st = await page.evaluate(() => {
    const b = window.__cap.frames; window.__cap.frames = [];
    return { batch: b, frame: window.__cap.frame, target: window.__cap.target };
  }).catch(() => null);
  if (!st) { console.log('[poll err] page gone'); break; }
  for (const d of st.batch) {
    const buf = Buffer.from(d.split(',')[1], 'base64');
    const h = buf.length + ':' + buf.subarray(0, 64).toString('hex');
    if (h === lastHash) { dupes++; continue; }
    lastHash = h;
    const n = String(idx++).padStart(5, '0');
    fs.writeFileSync(`${OUT}/f${n}.jpg`, buf);
  }
  const el = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`game frame ${st.frame}/${st.target} | saved ${idx} | dupes ${dupes} | ${el}s real`);
  if (st.frame >= st.target && st.batch.length === 0) break;
  if (Date.now() - t0 > 40 * 60 * 1000) { console.log('TIMEOUT 40min'); break; }
}
console.log('DONE saved frames:', idx, 'dupes skipped:', dupes);
await browser.close();
server.close();

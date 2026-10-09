// Real-time spin verification: play clip, capture 3 frames during real playback.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/dist/concrete-dragon.html';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/shots-spin-rt';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`); await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(800);
await E(`(() => { document.getElementById('hint').style.display='none'; return 1; })()`);
await E('t.setBusy(999)');
await E(`t.playClip('SpinAttack')`);
// capture during real-time playback (clip is 0.62s, game at ~2fps = ~1 frame)
await sleep(100); await page.screenshot({ path: `${SHOTS}/spin-rt-0.png` });
await sleep(250); await page.screenshot({ path: `${SHOTS}/spin-rt-1.png` });
await sleep(250); await page.screenshot({ path: `${SHOTS}/spin-rt-2.png` });
console.log('done');
await browser.close();

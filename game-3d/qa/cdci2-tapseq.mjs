// CDCI2 TAP SEQUENCE — capture 0.3s, 0.8s, 1.5s, 3s after tap
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci2-tapseq';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci2/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
await page.tap('#tapStart').catch(() => {});
for (const [label, wait] of [['t03', 300], ['t08', 500], ['t15', 700], ['t30', 1500]]) {
  await sleep(wait);
  const st = await E('t.simDbg().st').catch(() => '?');
  const cine = await E('!!t.state.cine').catch(() => '?');
  console.log(label, 'state=' + st, 'cine=' + cine);
  await page.screenshot({ path: SHOTS + '/' + label + '.png' });
}
await browser.close();
console.log('done');

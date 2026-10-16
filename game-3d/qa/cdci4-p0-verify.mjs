import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci4-p0';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci4/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 120)));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }

// D-2: mission screen at 390x844
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await E('t.skipCine()'); await sleep(1500);
await E('t.showMission()'); await sleep(2500);
console.log('mission state:', await E('t.simDbg().st').catch(()=>'?'));
await page.screenshot({ path: SHOTS + '/p0-mission-390.png' });
const zh = await page.evaluate(() => {
  const z = document.querySelector('.zoneHead .zn');
  if (!z) return 'no zoneHead';
  const r = z.getBoundingClientRect();
  return { text: z.textContent.trim(), right: Math.round(r.x + r.width), vw: window.innerWidth, clipped: (r.x + r.width) > window.innerWidth + 1 };
});
console.log('zoneHead:', JSON.stringify(zh));

// F-1/F-2: hint in fight at 844x390
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
await E("t.startMission('m1')");
// poll until card clears and we're in real fight
for (let i = 0; i < 40; i++) {
  const s = await page.evaluate(() => ({ cine: document.body.classList.contains('cine'), st: window.__cdtest ? window.__cdtest.simDbg().st : '?' })).catch(()=>({}));
  if (s.st === 'fight' && !s.cine) break;
  await sleep(1000);
}
console.log('fight ready:', await E('t.simDbg().st').catch(()=>'?'));
const hint = await page.evaluate(() => {
  const h = document.getElementById('hint');
  const cs = getComputedStyle(h);
  const r = h.getBoundingClientRect();
  return { opacity: cs.opacity, top: cs.top, left: cs.left, rTop: Math.round(r.top) };
});
console.log('hint css:', JSON.stringify(hint));
await page.screenshot({ path: SHOTS + '/p0-hint-fight.png' });
// wait 7s, verify hint auto-dismissed
await sleep(7000);
const hint2 = await page.evaluate(() => getComputedStyle(document.getElementById('hint')).opacity);
console.log('hint opacity after 7s:', hint2);
await page.screenshot({ path: SHOTS + '/p0-hint-dismissed.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

// CDCI3 DOM CHECK — is tapStart visible in the 844x390 viewport?
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci3/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
const info = await page.evaluate(() => {
  const t = document.querySelector('#tapStart');
  const r = t.getBoundingClientRect();
  const title = document.querySelector('#title');
  return { tapRect: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left) },
    viewportH: innerHeight, titleScrollH: title.scrollHeight, titleClientH: title.clientHeight,
    tapVisible: r.bottom <= innerHeight && r.top >= 0 };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();

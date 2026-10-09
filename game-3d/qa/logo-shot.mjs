import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const HTML = 'file:///home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(HTML, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 12; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await sleep(1000);
// force the title to show from the top: temporarily switch to flex-start
await page.evaluate(() => { const el = document.getElementById('title'); el.style.justifyContent = 'flex-start'; el.scrollTop = 0; });
await sleep(500);
await page.screenshot({ path: '/home/hatch/workspace/ConcreteDragon-art-ui-2/game-3d/shots-artui2/12-title-top.png' });
await browser.close();
console.log('done');

// CDCI2 TAP DEBUG — capture errors + instrument the tap handler
import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci2/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
page.on('console', (m) => { if (m.type() === 'error') console.log('[cerr]', m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
// instrument: wrap playIntro and endCine to log calls
await page.evaluate(() => {
  window.__taplog = [];
  document.addEventListener('pointerdown', () => window.__taplog.push('pointerdown'), true);
  document.addEventListener('pointerup', () => window.__taplog.push('pointerup'), true);
  document.addEventListener('touchstart', () => window.__taplog.push('touchstart'), true);
  document.addEventListener('touchend', () => window.__taplog.push('touchend'), true);
  document.addEventListener('click', () => window.__taplog.push('click'), true);
});
console.log('tapping...');
await page.tap('#tapStart').catch((e) => console.log('tap failed:', e.message.slice(0,100)));
await sleep(1000);
const log = await page.evaluate(() => window.__taplog.join(','));
console.log('events:', log);
console.log('state:', await E('t.simDbg().st').catch(() => '?'));
console.log('cine:', await E('!!t.state.cine').catch(() => '?'));
console.log('title display:', await page.evaluate(() => getComputedStyle(document.querySelector('#title')).display));
console.log('cineCap exists:', await page.evaluate(() => !!document.querySelector('#cineCap')));
await browser.close();
console.log('done');

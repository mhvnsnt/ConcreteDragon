// Quick diagnostic: boot -> mission start, print state at each step
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 60000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 150)));
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
console.log('loading...');
await page.goto('file:///home/hatch/workspace/ConcreteDragon-weapons-items/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
console.log('loaded, waiting for title...');
for (let i = 0; i < 10; i++) { const st = await E('t.simDbg().st').catch(() => '?'); console.log('  state:', st); if (st === 'title') break; await sleep(2000); }
console.log('tapping...');
await page.tap('#tapStart'); await sleep(1000);
console.log('after tap, state:', await E('t.simDbg().st'));
await E('t.skipCine()'); await sleep(500);
console.log('after skipCine, state:', await E('t.simDbg().st'));
await E(`t.setFighter('kidblue')`); console.log('fighter set');
await E(`t.startMission('m1')`); await sleep(600);
console.log('after startMission, state:', await E('t.simDbg().st'));
await E('t.skipCine()'); await sleep(1500);
console.log('after 2nd skipCine, state:', await E('t.simDbg().st'), 'px:', await E('t.info()').catch(e => e.message));
await browser.close();
console.log('done');

import puppeteer from 'puppeteer-core';
const CHROME = '/opt/meta-chromium/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 15; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(2000);
console.log('before tap:', await E('t.simDbg().st'));
console.log('tapStart el:', await page.evaluate(() => { const el = document.getElementById('tapStart'); if(!el) return 'missing'; const r = el.getBoundingClientRect(); return JSON.stringify({w:r.width,h:r.height,x:r.x,y:r.y,hidden:el.classList.contains('hidden'),disp:getComputedStyle(el).display}); }));
await page.evaluate(() => { const el = document.getElementById('title'); if (el) el.scrollTop = 0; });
await sleep(300);
await page.screenshot({ path: '/tmp/dbg-title.png' });
await page.tap('#tapStart').catch((e) => console.log('tap err:', e.message.slice(0,150)));
await sleep(1500);
console.log('after tap:', await E('t.simDbg().st'));
console.log('select vis:', await page.evaluate(() => { const el = document.getElementById('select'); return el ? getComputedStyle(el).display + '|' + el.className : 'missing'; }));
await browser.close();
console.log('done');

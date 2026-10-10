// CDCI3 POW VERIFY — land HEAVY + lethal hits, screenshot the comic words
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci3-pow';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci3/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 20; i++) { try { if ((await E('t.simDbg().st')) === 'title') break; } catch(e){} await sleep(2000); }
await sleep(1500);
console.log('startMission:', await E("t.startMission('m1')").catch((e) => 'ERR'));
await sleep(8000);
console.log('state:', await E('t.simDbg().st').catch(() => '?'));
// HEAVY hit -> POW word
console.log('heavy:', JSON.stringify(await E(`t.powTest('HEAVY', false)`).catch((e) => 'ERR ' + e.message)));
await sleep(400);
await page.screenshot({ path: SHOTS + '/p1-heavy.png' });
// lethal hit -> KO word
await sleep(600);
console.log('ko:', JSON.stringify(await E(`t.powTest('HEAVY', true)`).catch((e) => 'ERR ' + e.message)));
await sleep(400);
await page.screenshot({ path: SHOTS + '/p2-ko.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

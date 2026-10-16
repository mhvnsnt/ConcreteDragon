// CDCI4 POW VERIFY — eyes-on: land HEAVY + lethal hits, screenshot the comic words IMMEDIATELY
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
const CHROME = '/opt/meta-chromium/chrome';
const SHOTS = '/tmp/cdci4-pow';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-cdci4/game-3d/dist/concrete-dragon.html';
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
// HEAVY hit -> POW word — screenshot IMMEDIATELY (word lives 900ms)
const heavy = await E(`t.powTest('HEAVY', false)`).catch((e) => 'ERR ' + e.message);
console.log('heavy:', JSON.stringify(heavy));
await page.screenshot({ path: SHOTS + '/p1-heavy.png' });
console.log('heavy DOM after shot:', await E(`document.querySelectorAll('.pop.pow').length`).catch(() => '?'));
// lethal hit -> KO word — screenshot IMMEDIATELY
await sleep(1200); // let rate limiter reset
const ko = await E(`t.powTest('HEAVY', true)`).catch((e) => 'ERR ' + e.message);
console.log('ko:', JSON.stringify(ko));
await page.screenshot({ path: SHOTS + '/p2-ko.png' });
console.log('ko DOM after shot:', await E(`document.querySelectorAll('.pop.pow').length`).catch(() => '?'));
// Also grab the computed style of a pow word to verify the CSS animation
console.log('pow CSS:', await E(`(() => { const d = document.createElement('div'); d.className = 'pop pow'; d.textContent = 'BAM!'; document.body.appendChild(d); const cs = getComputedStyle(d); const out = { fontSize: cs.fontSize, color: cs.color, animation: cs.animationName, opacity: cs.opacity }; d.remove(); return out; })()`).catch((e) => 'ERR'));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

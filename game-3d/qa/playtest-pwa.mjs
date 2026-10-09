// Headless playtest: M9 PWA INSTALL (wave 19, driver 2026-10-09).
// Served over http://127.0.0.1 (secure context for SW). Flow mirrors real use:
// online first visit -> install -> later visits work offline.
//  1. boot online: title screen ready
//  2. manifest fetches + parses (name, short_name, display, start_url/scope, icons)
//  3. all icons 200 image/png
//  4. SW registers -> installs -> activates (fetch handler present in script)
//  5. online reload populates the runtime shell cache (58MB single-file shell)
//  6. OFFLINE reload: title boots from SW cache, zero errors
// Screenshots -> game-3d/shots-pwa/
import puppeteer from 'puppeteer-core';
import { execSync, exec } from 'node:child_process';
import fs from 'node:fs';
const WT = '/home/hatch/workspace/ConcreteDragon-wt-wave19/game-3d';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const ROOT = '/tmp/cd-pwa-root';
const SHOTS = WT + '/shots-pwa';
const PORT = 8931;
const PIDF = '/tmp/cd-pwa-http.pid';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
fs.mkdirSync(SHOTS, { recursive: true });
// (re)start server, pidfile so cleanup can't match our own cmdline
try { execSync(`kill $(cat ${PIDF}) 2>/dev/null || true`); } catch (e) {}
exec(`python3 -m http.server ${PORT} --directory ${ROOT} >/tmp/cd-pwa-http.log 2>&1 & echo $! > ${PIDF}`);
await sleep(1500);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 240000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const check = (label, ok) => { console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label); return ok; };
let allOk = true;
const must = (label, ok) => { if (!check(label, ok)) allOk = false; };
const E = async (expr) => page.evaluate(new Function('return (' + expr + ')'));
const waitTitle = async () => {
  for (let i = 0; i < 15; i++) { try { if ((await E(`window.__cdtest && window.__cdtest.simDbg().st`)) === 'title') return true; } catch (e) {} await sleep(2000); }
  return false;
};

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0', timeout: 180000 });
must('1. boot online: title screen ready', await waitTitle());
await page.screenshot({ path: SHOTS + '/pwa-title-online.png' });

const man = await E(`fetch('./manifest.webmanifest').then(r => r.json()).catch(e => null)`);
must('2a. manifest fetches + parses', !!man);
must('2b. manifest name/short_name', man && man.name === 'Concrete Dragon' && man.short_name === 'Concrete Dragon');
must('2c. manifest display=standalone, start_url+scope cover page', man && man.display === 'standalone' && man.start_url === './' && man.scope === './');
const sizes = ((man && man.icons) || []).map((i) => i.sizes + ':' + (i.purpose || 'any'));
must('2d. manifest icons 192+512 any, 512 maskable', sizes.includes('192x192:any') && sizes.includes('512x512:any') && sizes.includes('512x512:maskable'));
for (const ic of ((man && man.icons) || []).concat([{ src: './icons/apple-touch-icon-180.png' }])) {
  const st = await E(`fetch('${ic.src}').then(r => r.status + ' ' + r.headers.get('content-type')).catch(e => 'ERR')`);
  must(`3. icon ${ic.src} -> 200 image/png (got ${st})`, String(st).startsWith('200') && String(st).includes('image/png'));
}

let swState = '';
for (let i = 0; i < 20; i++) {
  swState = await E(`navigator.serviceWorker.getRegistrations().then(rs => rs.map(r => (r.active && r.active.state) || (r.installing && r.installing.state) || '?').join(','))`);
  if (swState.includes('activated')) break;
  await sleep(3000);
}
must('4a. service worker activated (got: ' + swState + ')', swState.includes('activated'));
const hasFetch = await E(`navigator.serviceWorker.getRegistrations().then(rs => rs[0] ? fetch(rs[0].active.scriptURL).then(r => r.text()) : '').then(t => t.includes("addEventListener('fetch'"))`);
must('4b. SW script has a fetch handler', hasFetch === true);

// online reload -> active SW fetch handler runtime-caches the 58MB shell
await page.reload({ waitUntil: 'networkidle0', timeout: 180000 });
must('5a. online reload boots (title)', await waitTitle());
const cached = await E(`caches.keys().then(ks => Promise.all(ks.map(k => caches.open(k).then(c => c.keys()).then(reqs => reqs.map(r => r.url))))).then(a => a.flat().join(' '))`);
must('5b. shell cached for offline (' + (cached.includes(`:${PORT}/`) ? 'root cached' : 'MISSING') + ')', cached.includes(`:${PORT}/`));

// OFFLINE: the real test — airplane mode reload must boot the game from SW cache
await page.setOfflineMode(true);
await page.reload({ waitUntil: 'networkidle0', timeout: 180000 });
must('6a. OFFLINE reload: title boots from SW cache', await waitTitle());
await page.screenshot({ path: SHOTS + '/pwa-title-offline.png' });
await page.setOfflineMode(false);

must('7. zero page/console errors across online+offline', errors.length === 0);
if (errors.length) console.log('ERRORS:\n' + errors.slice(0, 10).join('\n'));
console.log(allOk ? 'RESULT: ALL PASS' : 'RESULT: FAILURES PRESENT');
await browser.close();
try { execSync(`kill $(cat ${PIDF}) 2>/dev/null || true`); } catch (e) {}
process.exit(allOk ? 0 : 1);

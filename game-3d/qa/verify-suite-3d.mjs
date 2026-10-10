// QA (in-page): verify the CD suite wiring inside the real built game.
// No screenshots (headless-shell hangs on capture for this heavy page).
// Verifies via DOM + evaluates: section renders, buy/equip through the real
// UI, parts attach to the right bones at sane positions, no console errors.
import puppeteer from 'puppeteer-core';
import { execSync } from 'node:child_process';

const CHROME = execSync('ls /home/hatch/.cache/puppeteer/chrome-headless-shell/linux-*/chrome-headless-shell-linux64/chrome-headless-shell')
  .toString().trim().split('\n').pop();
const DIST = '/home/hatch/workspace/ConcreteDragon-suite/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const stepLog = [];
const step = async (name, fn, ms = 30000) => {
  const t0 = Date.now();
  try {
    const r = await Promise.race([
      fn(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms)),
    ]);
    stepLog.push(`${name}: ok (${Date.now() - t0}ms) -> ${JSON.stringify(r)?.slice(0, 200)}`);
    return r;
  } catch (e) { stepLog.push(`${name}: FAIL ${e.message}`); throw e; }
};

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', protocolTimeout: 60000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));

try {
  await step('goto', () => page.goto('file://' + DIST, { waitUntil: 'domcontentloaded', timeout: 60000 }), 90000);
  await step('boot', async () => {
    for (let i = 0; i < 20; i++) { try { if (await E('!!t')) return true; } catch (e) {} await sleep(1500); }
    return false;
  });
  await step('settle', () => sleep(3000));
  await step('dbgCash', () => E('t.dbgCash(99999)'));
  await step('dbgCustomize', () => E('t.dbgCustomize()'));
  await step('settle2', () => sleep(2000));
  await step('street-gear-present', () => page.evaluate(
    () => [...document.querySelectorAll('.czTitle')].some((e) => e.textContent.includes('STREET GEAR'))));
  await step('item-row-count', () => page.evaluate(
    () => document.querySelectorAll('.cdItem').length));
  const buy = (name) => page.evaluate((nm) => {
    const it = [...document.querySelectorAll('.cdItem')]
      .find((d) => d.querySelector('.cdName')?.textContent === nm);
    if (!it) return 'not-found';
    const btn = it.querySelector('button');
    if (!btn || btn.disabled) return 'disabled:' + (btn ? btn.textContent : '?');
    btn.click();
    return 'clicked:' + btn.textContent;
  }, name);
  for (const nm of ['Neon Synthetics', 'Dog Tags']) {
    await step('buy ' + nm, () => buy(nm).then(async (r) => { await sleep(15000); return r; }), 120000);
  }
  // re-click an owned item: should now show EQUIPPED (toggle path)
  await step('equip-state', () => buy('Ink Ski Mask').then(async (r) => { await sleep(15000); return r; }), 120000);
  await step('button-labels', () => page.evaluate(() =>
    [...document.querySelectorAll('.cdItem')].slice(0, 6).map((d) =>
      d.querySelector('.cdName').textContent + '=' + d.querySelector('button').textContent)));
  await step('cd-parts', () => E('t.dbgCDParts()'));
  // numeric attach sanity: each cd_ group's world pos within 2m of fighter origin,
  // and parent chain leads to a known bone
  await step('attach-positions', () => E('t.dbgCDAttachInfo()'));
} catch (e) {
  stepLog.push('ABORTED: ' + e.message);
}
console.log(stepLog.join('\n'));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
console.log('done');

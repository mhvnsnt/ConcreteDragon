import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const D = '/tmp/vthrow3-' + Date.now();
fs.mkdirSync(D, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540 });
await page.goto('file:///home/hatch/workspace/ConcreteDragon-throws-air/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 90000 });
for (let i = 0; i < 40; i++) {
  const s = await page.evaluate(`window.__cdtest ? window.__cdtest.state() : 'none'`).catch(() => 'none');
  if (s === 'title') break;
  await new Promise((r) => setTimeout(r, 1000));
}
await page.evaluate(`window.__cdtest.startMission('circuit')`);
await new Promise((r) => setTimeout(r, 6000));
const t = async (fn) => await page.evaluate(fn).catch((e) => null);
await t(`window.__cdtest.spawnFoeTest()`);
await new Promise((r) => setTimeout(r, 1000));
await t(`window.__cdtest.grabTest()`);
await new Promise((r) => setTimeout(r, 500));
await t(`window.__cdtest.throwTest()`);
// sample rapidly
for (let i = 0; i < 8; i++) {
  await new Promise((r) => setTimeout(r, 120));
  await page.screenshot({ path: `${D}/s${i}.png` }).catch(() => {});
}
console.log('done', D);
await browser.close();

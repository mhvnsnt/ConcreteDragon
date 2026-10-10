import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const D = '/tmp/vthrow-' + Date.now();
fs.mkdirSync(D, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540 });
await page.goto('file:///home/hatch/workspace/ConcreteDragon-throws-air/game-3d/dist/concrete-dragon.html', { waitUntil: 'load', timeout: 60000 });
for (let i = 0; i < 30; i++) {
  const s = await page.evaluate(`window.__cdtest ? window.__cdtest.state() : 'none'`).catch(() => 'none');
  if (s === 'title') break;
  await new Promise((r) => setTimeout(r, 1000));
}
await page.evaluate(`window.__cdtest.startMission('circuit')`);
await new Promise((r) => setTimeout(r, 5000));
const t = async (fn) => await page.evaluate(fn).catch((e) => ({ err: 1 }));
await t(`window.__cdtest.spawnFoeTest()`);
await new Promise((r) => setTimeout(r, 800));
await t(`window.__cdtest.grabTest()`);
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${D}/grab.png` }).catch(() => {});
await t(`window.__cdtest.throwTest()`);
await new Promise((r) => setTimeout(r, 450)); // mid-lift
await page.screenshot({ path: `${D}/lift.png` }).catch(() => {});
await new Promise((r) => setTimeout(r, 500)); // release
await page.screenshot({ path: `${D}/release.png` }).catch(() => {});
console.log('done', D);
await browser.close();

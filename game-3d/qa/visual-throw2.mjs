import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const D = '/tmp/vthrow2-' + Date.now();
fs.mkdirSync(D, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage',
         '--run-all-compositor-stages-before-draw', '--disable-threaded-animation', '--disable-threaded-scrolling'],
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
// move camera back for a wider view if possible
await t(`window.__cdtest.grabTest()`);
await new Promise((r) => setTimeout(r, 300));
await t(`window.__cdtest.throwTest()`);
// take rapid screenshots to catch the lift
for (let i = 0; i < 6; i++) {
  await new Promise((r) => setTimeout(r, 150));
  await page.screenshot({ path: `${D}/f${i}.png` }).catch(() => {});
}
const hashes = [];
for (let i = 0; i < 6; i++) {
  try {
    const h = fs.readFileSync(`${D}/f${i}.png`).slice(0, 100).toString('hex').slice(0, 20);
    hashes.push(h);
  } catch (e) {}
}
console.log('done', D, 'hashes:', [...new Set(hashes)].length, 'unique');
await browser.close();

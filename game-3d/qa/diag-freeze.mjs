import puppeteer from 'puppeteer-core';
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
console.log('1: state =', await page.evaluate(`window.__cdtest.state()`).catch(() => 'DEAD'));
await page.evaluate(`window.__cdtest.spawnFoeTest()`);
await new Promise((r) => setTimeout(r, 800));
console.log('2: state =', await page.evaluate(`window.__cdtest.state()`).catch(() => 'DEAD'));
console.log('2: info =', JSON.stringify(await page.evaluate(`window.__cdtest.info()`).catch(() => 'DEAD')));
await page.evaluate(`window.__cdtest.grabTest()`);
await new Promise((r) => setTimeout(r, 400));
console.log('3: state =', await page.evaluate(`window.__cdtest.state()`).catch(() => 'DEAD'));
console.log('3: grabVictim =', await page.evaluate(`(() => { const c = window.__cdtest; return c.grabInfo ? c.grabInfo() : 'no-hook'; })()`).catch(() => 'DEAD'));
await browser.close();

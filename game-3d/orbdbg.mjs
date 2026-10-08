import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)));
await page.goto('file:///home/hatch/workspace/street-brawl-cicd/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 60000 });
await sleep(2500);
await page.tap('#title');
await sleep(800);
await page.evaluate(() => window.__cdtest.skipCine());
await sleep(600);
await page.evaluate(() => { window.__cdtest.setFighter('kingpin'); window.__cdtest.startMission('m1'); });
await sleep(700);
await page.evaluate(() => window.__cdtest.skipCine());
await sleep(400);
for (let i = 0; i < 20; i++) {
  const n = await page.evaluate(() => window.__cdtest.foes().length);
  if (n > 0) break;
  await sleep(500);
}
await page.evaluate(() => {
  const t = window.__cdtest;
  const f = t.foes()[0];
  if (f) t.tp2(f.px - 1.2, f.pz);
  t.setEnergy(100);
});
await sleep(300);
await page.evaluate(() => window.__cdtest.doMotion('qcf'));
for (let i = 0; i < 4; i++) {
  await sleep(400);
  const s = await page.evaluate(() => ({ sim: window.__cdtest.simDbg(), projs: window.__cdtest.projDbg(), foe: window.__cdtest.foes()[0] }));
  console.log(`t+${(i+1)*400}ms:`, JSON.stringify(s));
}
await browser.close();

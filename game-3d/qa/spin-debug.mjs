import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/dist/concrete-dragon.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 60000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`); await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(800);
await E('t.setBusy(999)');
console.log('hips before:', await E(`t.boneQuat('hips')`));
await E(`t.playClip('SpinAttack')`);
await E('t.ff(20)'); // 0.33s, should be ~180deg
console.log('hips at 0.33s:', await E(`t.boneQuat('hips')`));
await E('t.ff(20)'); // 0.66s, clip done (0.62s), should be back to idle
console.log('hips at 0.66s:', await E(`t.boneQuat('hips')`));
await browser.close();

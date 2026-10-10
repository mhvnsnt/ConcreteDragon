// CONTACT COLLISION verification v2: robust, incremental results to file.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const OUT = '/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact/results.json';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { tests: [], errors: [] };
const save = () => fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
let browser = null;
try {
  browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
  page.on('pageerror', (e) => { results.errors.push('[pageerror] ' + e.message.slice(0, 200)); save(); });
  page.on('console', (m) => { if (m.type() === 'error') { results.errors.push('[console.error] ' + m.text().slice(0, 200)); save(); } });
  const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
  await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
  let booted = false;
  for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
  results.boot = booted ? 'PASS' : 'FAIL'; save();
  if (!booted) throw new Error('no boot');
  await page.tap('#tapStart'); await sleep(900);
  await E('t.skipCine()'); await sleep(500);
  const bless = await page.$('.blessCard'); if (bless) { await bless.click(); await sleep(400); }
  await E(`t.setFighter('kidblue')`);
  await E(`t.startMission('m1')`); await sleep(600);
  await E('t.skipCine()'); await sleep(1200);
  const bless2 = await page.$('.blessCard'); if (bless2) { await bless2.click(); await sleep(400); }

  async function strikeTest(name, setupFn, fireFn, waitMs) {
    const r = { name };
    try {
      await E('t.resetContactStats()');
      await E(setupFn);
      await E('t.ff(3)');
      await sleep(200);
      await E(fireFn);
      await sleep(waitMs);
      await E('t.ff(10)');
      await sleep(150);
      Object.assign(r, await E('t.contactStats()'));
      const info = await E('t.info()');
      r.foes = info.foes; r.kills = info.kills; r.php = info.hp;
    } catch (e) { r.error = String(e).slice(0, 120); }
    results.tests.push(r); save();
    console.log(name, JSON.stringify(r));
    try { await page.screenshot({ path: `${SHOTS}/${name}.png` }); } catch (e) {}
  }

  console.log('--- player strikes ---');
  await strikeTest('jab',
    `(() => { const e = t.spawnFam('thug'); e.ai='idle'; e.aiT=999; e.hp=500; t.walkTo(e.px - 1.0); return 1; })()`,
    `(() => { t.zeroBusy(); t.doPunch(); return 1; })()`, 900);
  await strikeTest('heavy',
    `(() => { const es=t.foes().filter(f=>f.hp>0); const e=es[es.length-1]; if(e){e.ai='idle';e.aiT=999;} t.walkTo(e.px-1.2); return 1; })()`,
    `(() => { t.zeroBusy(); t.doHeavy(); return 1; })()`, 1100);
  await strikeTest('blitz',
    `(() => { const es=t.foes().filter(f=>f.hp>0); const e=es[es.length-1]; if(e){e.ai='idle';e.aiT=999;} t.walkTo(e.px-2.2); return 1; })()`,
    `(() => { t.zeroBusy(); t.dbgBlitz(); return 1; })()`, 1100);
  await strikeTest('divekick',
    `(() => { const es=t.foes().filter(f=>f.hp>0); const e=es[es.length-1]; if(e){e.ai='idle';e.aiT=999;e.hp=500;} t.walkTo(e.px-0.6); return 1; })()`,
    `(() => { t.zeroBusy(); t.doJump(); t.ff(8); t.doPunch(); return 1; })()`, 1500);

  console.log('--- enemy strikes ---');
  await strikeTest('enemy-punch',
    `(() => { const e=t.spawnFam('thug'); e.hp=500; e.px=t.playerPos().px+1.4; return 1; })()`,
    `(() => 1)()`, 3000);
  await strikeTest('boss-slam',
    `(() => { const b=t.spawnBoss('kingpin'); b.hp=3000; b.px=t.playerPos().px+2.2; return 1; })()`,
    `(() => 1)()`, 5000);

  console.log('--- grapple ---');
  await strikeTest('grapple',
    `(() => { const e=t.spawnFam('thug'); e.hp=800; e.stagger=2; e.ai='idle'; e.aiT=999; t.walkTo(e.px-1.2); return 1; })()`,
    `(() => { t.zeroBusy(); t.doGrapple(); return 1; })()`, 1200);

  results.done = true; save();
  console.log('DONE');
} catch (e) {
  results.fatal = String(e).slice(0, 300); save();
  console.log('FATAL', results.fatal);
}
if (browser) await browser.close().catch(() => {});

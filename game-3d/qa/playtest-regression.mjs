// Regression: combos, counters, specials, boss sigs still work with hitboxes.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const DIST = 'file:///home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/dist/concrete-dragon.html';
const OUT = '/home/hatch/workspace/ConcreteDragon-contact-collision/game-3d/shots-contact/regression.json';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { tests: [], errors: [] };
const save = () => fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
let browser = null;
try {
  browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
  page.on('pageerror', (e) => { results.errors.push('[pageerror] ' + e.message.slice(0, 160)); save(); });
  const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
  await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 120000 });
  for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') break; await sleep(2000); }
  await page.tap('#tapStart'); await sleep(900);
  await E('t.skipCine()'); await sleep(500);
  await E(`t.setFighter('kidblue')`);
  await E(`t.startMission('m1')`); await sleep(600);
  await E('t.skipCine()'); await sleep(1200);

  // COMBO: 3 jabs in rhythm vs idle thug — combo counter should rise
  await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=999; e.px=8; t.walkTo(7.0); return 1; })()`);
  await E('t.ff(5)'); await E('t.resetContactStats()');
  for (let i = 0; i < 3; i++) { await E(`(() => { t.zeroBusy(); t.doPunch(); return 1; })()`); await sleep(700); await E('t.ff(5)'); }
  const comboInfo = await E(`(() => ({ info: t.info(), stats: t.contactStats(), foes: t.foes().map(f=>Math.round(f.hp)) }))()`);
  results.tests.push({ name: 'combo-3-jabs', ...comboInfo });
  console.log('combo:', JSON.stringify(comboInfo.info), 'foeHp:', comboInfo.foes);

  // COUNTER: enemy in windup + player punch -> COUNTER should land
  await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.px = t.playerPos().px + 1.5; e.windup = 1.0; window._ce = e; return 1; })()`);
  await E('t.ff(2)');
  const countersBefore = await E(`(() => (window.__counters = window.__counters || 0))()`);
  await E(`(() => { t.zeroBusy(); t.doPunch(); return 1; })()`);
  await sleep(1200); await E('t.ff(5)');
  const counterFoe = await E(`(() => ({ hp: Math.round(window._ce.hp), stats: t.contactStats() }))()`);
  results.tests.push({ name: 'counter', ...counterFoe });
  console.log('counter foe hp:', counterFoe.hp, JSON.stringify(counterFoe.stats));

  // SPECIAL (Dragon Fury AOE): should still hit
  await E(`(() => { const e = t.spawnFam('thug'); e.hp = 900; e.ai='idle'; e.aiT=999; e.px = t.playerPos().px + 2.0; window._se = e; t.setEnergy(100); return 1; })()`);
  await E('t.ff(3)');
  await E(`(() => { t.zeroBusy(); t.doSpecial(); return 1; })()`);
  await sleep(1500); await E('t.ff(5)');
  const specFoe = await E(`(() => ({ hp: Math.round(window._se.hp) }))()`);
  results.tests.push({ name: 'special-aoe', ...specFoe });
  console.log('special foe hp:', specFoe.hp);

  // BOSS: kingpin sig (force via spawnBoss + wait for windup attack)
  await E(`(() => { const b = t.spawnBoss('kingpin'); b.hp = 5000; b.px = t.playerPos().px + 2.5; window._boss = b; return 1; })()`);
  await E('t.resetContactStats()');
  const bphp0 = (await E('t.info()')).hp;
  for (let i = 0; i < 60; i++) {
    await E('t.ff(15)'); await sleep(80);
    const st = await E('t.contactStats()');
    const php = (await E('t.info()')).hp;
    if (st.strikes > 0) { results.tests.push({ name: 'boss-strike', strikes: st.strikes, maxPen: st.maxPen, lastStrike: st.lastStrike, php0: bphp0, php }); console.log('boss hit!', JSON.stringify(st), 'php', bphp0, '->', php); break; }
    if (i === 59) { results.tests.push({ name: 'boss-strike', strikes: 0, note: 'no boss attack in 60 iters' }); console.log('boss: no attack'); }
  }

  results.done = true; save();
  console.log('errors:', results.errors.length, results.errors.slice(0, 5));
} catch (e) { results.fatal = String(e).slice(0, 200); save(); console.log('FATAL', results.fatal); }
if (browser) await browser.close().catch(() => {});

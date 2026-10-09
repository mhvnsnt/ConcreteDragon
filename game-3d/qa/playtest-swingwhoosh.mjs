// Headless playtest: S2 SWING WHOOSHES tranche (TIER 3 item 10, owner 2026-10-07, wave 10).
// Verifies: boot, swing1-3 mp3s decode to AudioBuffers, doPunch/doHeavy/doBlitz fire the swing
// whoosh on the swing, whiff whoosh fires when the attack hits NO enemy, no whiff when it hits.
// Headless game-time runs slower than real time: poll playerDbg().busy for idle before attacks.
// Zero page/console errors required. Screenshots -> game-3d/shots-swingwhoosh/
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-swingwhoosh';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
// headless game-time is slow: wait until the player is actionable before each attack
async function waitIdle() {
  for (let i = 0; i < 60; i++) {
    const p = await E('t.playerDbg()');
    if (p && p.busy <= 0 && p.hp > 0) return true;
    await sleep(500);
  }
  return false;
}

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);
await page.screenshot({ path: SHOTS + '/1-boot.png' });

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('2. m1 mission started', (await E('t.info()')).px === 2);
await page.screenshot({ path: SHOTS + '/2-m1-start.png' });

// 3. Clear foes, then punch at empty air: swing fires on the swing, whiff fires on the miss
await E('t.clearFoes()'); await sleep(300);
await E('t.healPlayer()'); await E('t.swingClear()');
must('3 idle before punch', await waitIdle());
await E('t.doPunch()'); await sleep(1500); // swing + resolution (game-time is slow headless)
let sd = await E('t.swingDbg()');
console.log('   punch-at-air:', JSON.stringify(sd));
must('3a. doPunch fired a swing whoosh', sd.swing >= 1);
must('3b. doPunch at empty air fired a WHIFF whoosh (missed attack)', sd.whiff >= 1);
const ad = await E(`t.audioDbg(['swing1','swing2','swing3'])`);
console.log('   audioDbg:', JSON.stringify(ad));
must('3c. swing1-3 decoded to AudioBuffers', Array.isArray(ad) && ad.length === 3 && ad.every(x => x.ok));
await page.screenshot({ path: SHOTS + '/3-whiff.png' });

// 4. doHeavy at empty air: swing + whiff
await E('t.swingClear()');
must('4 idle before heavy', await waitIdle());
await E('t.doHeavy()'); await sleep(1500);
sd = await E('t.swingDbg()');
console.log('   heavy-at-air:', JSON.stringify(sd));
must('4a. doHeavy fired a swing whoosh', sd.swing >= 1);
must('4b. doHeavy at empty air fired a WHIFF whoosh', sd.whiff >= 1);

// 5. doBlitz at empty air: swing + whiff
await E('t.swingClear()');
must('5 idle before blitz', await waitIdle());
await E('t.dbgBlitz()'); await sleep(1500);
sd = await E('t.swingDbg()');
console.log('   blitz-at-air:', JSON.stringify(sd));
must('5a. doBlitz fired a swing whoosh', sd.swing >= 1);
must('5b. doBlitz at empty air fired a WHIFF whoosh', sd.whiff >= 1);

// 6. Punch WITH a foe in range: swing fires, whiff does NOT (hit landed)
await E('t.clearFoes()'); await sleep(200);
await E(`t.spawnFam('thug')`); await sleep(800); // spawns at player.px + 3
let foe = (await E('t.foes()'))[0] || null;
must('6a. spawned foe present for hit drill', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.swingClear()');
  must('6 idle before punch', await waitIdle());
  await E('t.doPunch()'); await sleep(1500);
  sd = await E('t.swingDbg()');
  console.log('   punch-at-foe:', JSON.stringify(sd));
  must('6b. swing whoosh fired with foe in range', sd.swing >= 1);
  must('6c. NO whiff when the punch connected', sd.whiff === 0);
  await page.screenshot({ path: SHOTS + '/4-hit.png' });
}

// 7. Zero errors
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('7. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

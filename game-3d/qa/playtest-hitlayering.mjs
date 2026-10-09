// Headless playtest: S1 HIT LAYERING tranche (TIER 3 item 14, owner 2026-10-08, wave 14).
// Verifies: boot, hitlayer1-3 mp3s decode to AudioBuffers, punching/heavy attacks that CONNECT
// on enemies fire the layer sample (hitLayerDbg().layer) AND the original synth hits still
// resolve (hitLayerDbg().synth) — layer is 1:1 under synth hits, never replaces/mutes them.
// Whiffed attacks (no enemy hit) fire NO layer — the layer only plays under real hit resolutions.
// Headless game-time runs slower than real time: poll playerDbg().busy for idle before attacks.
// Zero page/console errors required. Screenshots -> game-3d/shots-hitlayering/
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-hitlayering';
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
// screenshots are evidence, not assertions: retry once, never crash the run on CDP flakiness
async function shot(path) {
  for (let i = 0; i < 2; i++) {
    try { await page.screenshot({ path }); return; }
    catch (e) { console.log('   shot retry ' + path.split('/').pop() + ': ' + String(e.message).slice(0, 80)); await sleep(1000); }
  }
}
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
await shot(SHOTS + '/1-boot.png');

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('2. m1 mission started', (await E('t.info()')).px === 2);
await shot(SHOTS + '/2-m1-start.png');

// 3. hitlayer samples decode to AudioBuffers
const ad = await E(`t.audioDbg(['hitlayer1','hitlayer2','hitlayer3'])`);
console.log('   audioDbg:', JSON.stringify(ad));
must('3. hitlayer1-3 decoded to AudioBuffers', Array.isArray(ad) && ad.length === 3 && ad.every(x => x.ok));

// 4. Whiff: punch at empty air -> NO synth hit, NO layer (layer only fires under real hit resolutions).
// Keep the window tight: m1 spawns foes over time, so verify zero foes immediately before the punch
// (no long waitIdle — headless game-time lets a foe wander into range mid-wait).
await E('t.clearFoes()'); await sleep(300);
await E('t.healPlayer()'); await E('t.hitLayerClear()');
must('4a. zero foes on screen right before whiff punch', (await E('t.foes()')).length === 0);
await E('t.doPunch()'); await sleep(1500);
let hd = await E('t.hitLayerDbg()');
console.log('   punch-at-air:', JSON.stringify(hd));
must('4b. whiffed punch fires NO synth hit', hd.synth === 0);
must('4c. whiffed punch fires NO hit layer', hd.layer === 0);

// 5. Punch connecting on a foe: synth hit resolves AND layer fires underneath it.
// dbgFoePassive() makes the spawned thug a passive punching bag (real enemy, real hits,
// no counter-attacks) so player-idle timing is deterministic.
await E('t.clearFoes()'); await sleep(200);
await E(`t.spawnFam('thug')`); await sleep(800);
await E('t.dbgFoePassive()');
let foe = (await E('t.foes()'))[0] || null;
must('5a. spawned foe present for hit drill', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.healPlayer()'); await E('t.hitLayerClear()');
  must('5 idle before punch', await waitIdle());
  foe = (await E('t.foes()'))[0] || null;
  must('5a2. foe still present before punch', !!foe);
  if (foe) {
    await E('t.dbgFoePassive()');
    await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(200);
    await E('t.doPunch()'); await sleep(1500);
    hd = await E('t.hitLayerDbg()');
    console.log('   punch-at-foe:', JSON.stringify(hd));
    must('5b. connected punch fires the ORIGINAL synth hit', hd.synth >= 1);
    must('5c. connected punch fires the hit layer', hd.layer >= 1);
    must('5d. layer is 1:1 under synth hits (never replaces)', hd.layer === hd.synth);
    await shot(SHOTS + '/3-punch-hit.png');
  }
}

// 6. Heavy attack connecting: layer + synth both fire again (heavy = different hit call path)
foe = (await E('t.foes()'))[0] || null;
if (foe) {
  if (foe.hp <= 0) { await E('t.clearFoes()'); await sleep(200); await E(`t.spawnFam('thug')`); await sleep(800); foe = (await E('t.foes()'))[0]; }
  await E('t.dbgFoePassive()');
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.healPlayer()'); await E('t.hitLayerClear()');
  must('6 idle before heavy', await waitIdle());
  await E('t.doHeavy()'); await sleep(2000);
  hd = await E('t.hitLayerDbg()');
  console.log('   heavy-at-foe:', JSON.stringify(hd));
  must('6a. connected heavy fires the ORIGINAL synth hit', hd.synth >= 1);
  must('6b. connected heavy fires the hit layer', hd.layer >= 1);
  must('6c. layer is 1:1 under synth hits on heavy', hd.layer === hd.synth);
  await shot(SHOTS + '/4-heavy-hit.png');
}

// 7. Zero errors
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('7. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

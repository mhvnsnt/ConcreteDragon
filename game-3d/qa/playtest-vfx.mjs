// Headless playtest: WAVE 17 VFX VARIETY tranche (TIER 6 item 25, owner 2026-10-06).
// Verifies: boot, all 12 Kenney particle-pack sprites decode, hit-impact pops fire on a
// landed punch, KO burst fires on a kill, BURST combo-breaker fires special VFX, edge-bounce
// wall thud fires dust puffs, lowFx halves burst counts, zero page/console errors.
// Headless game-time runs slower than real time: poll playerDbg().busy for idle before attacks,
// and poll vfxDbg() counters instead of fixed sleeps before screenshots.
// Screenshots -> game-3d/shots-vfx/
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-vfx';
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
async function waitIdle() {
  for (let i = 0; i < 60; i++) {
    const p = await E('t.playerDbg()');
    if (p && p.busy <= 0 && p.hp > 0) return true;
    await sleep(500);
  }
  return false;
}
async function waitVfx(key, min, tries) {
  for (let i = 0; i < (tries || 40); i++) {
    const d = await E('t.vfxDbg()');
    if (d && d[key] >= min) return d;
    await sleep(400);
  }
  return await E('t.vfxDbg()');
}

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);
await page.screenshot({ path: SHOTS + '/1-boot.png' });

// 2. All 12 Kenney sprite textures decoded
let vd = await E('t.vfxDbg()');
console.log('   vfxDbg:', JSON.stringify({ texOk: vd.texOk, live: vd.live, pool: vd.pool }));
must('2a. all 12 Kenney particle sprites decoded', vd.texOk === 12);
must('2b. texture set matches the 12 staged families', JSON.stringify(vd.tex) === JSON.stringify(['circle','dirt','fire','flame','flare','light','magic','muzzle','smoke','spark','star','twirl']));

// 3. lowFx halves burst counts (cap path)
let lq = await E('t.vfxLowFx(true)');
must('3a. lowFx=true halves burst counts (q=0.45)', lq.lowFx === true && lq.q === 0.45);
lq = await E('t.vfxLowFx(false)');
must('3b. lowFx=false restores full counts (q=1)', lq.lowFx === false && lq.q === 1);

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('4. m1 mission started', (await E('t.info()')).px === 2);
await page.screenshot({ path: SHOTS + '/2-m1-start.png' });

// 5. Hit-impact pops: punch a foe in range -> vfxHit >= 1, sprites live on screen
await E('t.clearFoes()'); await sleep(200);
await E(`t.spawnFam('thug')`); await sleep(800);
let foe = (await E('t.foes()'))[0] || null;
must('5a. spawned foe present for hit drill', !!foe);
if (foe) {
  await E(`t.tp2(${foe.px - 1.2}, ${foe.pz})`); await sleep(300);
  await E('t.vfxClear()'); await E('t.healPlayer()');
  must('5 idle before punch', await waitIdle());
  await E('t.doPunch()');
  vd = await waitVfx('hit', 1, 30);
  console.log('   after punch:', JSON.stringify({ hit: vd.hit, live: vd.live }));
  must('5b. landed punch fired hit-impact pops (muzzle/star/flare)', vd.hit >= 1);
  must('5c. sprites alive on screen at pop time', vd.live > 0);
  await page.screenshot({ path: SHOTS + '/3-hit-impact.png' });
}

// 6. BURST special VFX: dbgBurst sets up jugN/energy, doSpecial fires the combo breaker
await E('t.dbgBurst()'); await sleep(200);
must('6 idle before special', await waitIdle());
await E('t.doSpecial()');
vd = await waitVfx('spc', 1, 30);
console.log('   after BURST:', JSON.stringify({ spc: vd.spc, live: vd.live }));
must('6a. BURST combo-breaker fired special VFX (magic)', vd.spc >= 1);
must('6b. magic sprites alive on screen', vd.live > 0);
await page.screenshot({ path: SHOTS + '/4-burst-special.png' });

// 7. KO burst: punch the thug until it dies -> vfxKo >= 1
await E('t.healPlayer()');
let koOk = false;
for (let i = 0; i < 10 && !koOk; i++) {
  if (!(await waitIdle())) break;
  await E('t.doPunch()');
  vd = await waitVfx('ko', 1, 25);
  if (vd.ko >= 1) koOk = true;
}
console.log('   after KO drill:', JSON.stringify({ ko: vd.ko, live: vd.live }));
must('7a. KO fired the ring+smoke+spark burst', koOk);
must('7b. KO sprites alive on screen', vd.live > 0);
await page.screenshot({ path: SHOTS + '/5-ko-burst.png' });

// 8. Edge-bounce dust: launch a fresh foe at the left wall -> vfxDust >= 1
await E('t.clearFoes()'); await sleep(300);
await E(`t.spawnFam('thug')`); await sleep(800);
const setup = await E('t.launchFoeAt(3.0, 0, -12, 0.5)');
must('8a. launchFoeAt setup ran', setup && setup.ok === 1);
vd = await waitVfx('dust', 1, 30);
console.log('   after edge-bounce:', JSON.stringify({ dust: vd.dust, live: vd.live }));
must('8b. edge-bounce wall thud fired smoke/dirt dust puffs', vd.dust >= 1);
await page.screenshot({ path: SHOTS + '/6-edge-bounce-dust.png' });

// 9. Zero errors
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('9. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

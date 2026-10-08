// Headless playtest: S8 FOOTSTEPS tranche (TIER 3 item 11, owner 2026-10-07, wave 11).
// Verifies: boot, step1-5 MP3s decode to AudioBuffers, real locomotion fires player
// footstep SFX (stride-tracked on the walk/run cycle), idle is SILENT, a near enemy's
// approach fires enemy footsteps, a far enemy's approach stays silent (distance cull),
// district pitch wiring is real (m1 = neon = 1.0), zero page/console errors.
// Movement is driven through the real input path (puppeteer keyboard -> stick.dx/dy),
// so every counted footfall comes from actual game locomotion — no fake audio.
// Headless game-time runs slower than real time under swiftshader: poll positions and
// counters instead of fixed sleeps. Screenshots -> game-3d/shots-footsteps/
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME_PATH || '/home/hatch/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-footsteps';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
// screenshot helper: let the compositor settle first, retry once on transient CDP failure
async function shot(name) {
  await sleep(400);
  try { await page.screenshot({ path: SHOTS + '/' + name }); }
  catch (e) { await sleep(1500); await page.screenshot({ path: SHOTS + '/' + name }); }
}
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };

await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot: title screen ready', booted);
await shot('1-boot.png');

await page.tap('#tapStart'); await sleep(900);
await E('t.skipCine()'); await sleep(500);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(600);
await E('t.skipCine()'); await sleep(1500);
must('2. m1 mission started', (await E('t.info()')).px === 2);
await shot('2-m1-start.png');

// 3. step1-5 decoded to AudioBuffers (proves the manifest wiring embedded real audio)
const ad = await E(`t.audioDbg(['step1','step2','step3','step4','step5'])`);
console.log('   audioDbg:', JSON.stringify(ad));
must('3. step1-5 decoded to AudioBuffers', Array.isArray(ad) && ad.length === 5 && ad.every(x => x.ok));
const sd0 = await E('t.stepDbg()');
console.log('   stepDbg:', JSON.stringify(sd0));
must('3b. district pitch wiring real (m1 neon -> rate 1.0)', sd0.district === 'neon' && sd0.rate === 1.0);

// 4. WALK: hold ArrowRight through the real input path; stride-tracked footfalls must fire.
// Poll until the player stalls against the m1-start collider (~px 5.75) or 16s elapse.
await E('t.clearFoes()'); await sleep(200);
await E('t.healPlayer()'); await E('t.stepClear()');
const px0 = (await E('t.playerDbg()')).px;
await page.keyboard.down('ArrowRight');
let lastPx = px0, stallN = 0, shotTaken = false;
for (let i = 0; i < 32; i++) {
  await sleep(500);
  const p = await E('t.playerDbg()');
  if (!shotTaken && p && p.px - px0 >= 1.5) { await shot('3-walking.png'); shotTaken = true; }
  if (Math.abs(p.px - lastPx) < 0.01) { if (++stallN >= 4) break; } else stallN = 0;
  lastPx = p.px;
}
if (!shotTaken) await shot('3-walking.png');
await page.keyboard.up('ArrowRight');
const pWalk = await E('t.playerDbg()');
const sd1 = await E('t.stepDbg()');
const walkDist = pWalk.px - px0;
console.log(`   walked ${walkDist.toFixed(2)} units, steps=${sd1.step} (stride 1.9 -> expect ${Math.floor(walkDist / 1.9)} ± 1)`);
must('4a. player actually moved under real keyboard input', walkDist >= 1.5);
must('4b. footsteps are stride-tracked on real displacement: steps == floor(dist/1.9) ± 1',
  Math.abs(sd1.step - Math.floor(walkDist / 1.9)) <= 1);

// 5. IDLE: release everything — the counter must stay flat (idle is silent)
const idleBase = sd1.step;
await sleep(2500);
const sd2 = await E('t.stepDbg()');
must('5. idle is silent: no steps fired while standing still', sd2.step === idleBase);
await shot('4-idle.png');

// 6. NEAR ENEMY: a thug gets a 14-unit approach walk toward the idle player —
// near/on-screen approach steps must fire (a 3-unit spawn never covers a full 1.9-unit
// stride before windup, so the drill gives the enemy real runway).
await E('t.healPlayer()');
await E(`t.spawnFam('thug')`); await sleep(500);
const foe = (await E('t.foes()'))[0] || null;
must('6a. spawned thug present for approach drill', !!foe);
if (foe) {
  const fx0 = foe.px;
  await E(`t.tp2(${(foe.px - 8).toFixed(1)}, 0)`); // player retreats: 8-unit approach, all inside the 10-unit audible range
  await E('t.stepClear()');
  // Deterministic approach: each estepN chunk = 1.2 game-sec ≈ one 1.9-unit stride;
  // 500ms real gaps respect the 380ms anti-stampede voice cap. Steps fire from the real
  // enemyAI walk branch with real stride accumulation + real distance culling.
  for (let i = 0; i < 5; i++) { await E('t.estepN(72, 1/60)'); await sleep(500); }
  const foe2 = (await E('t.foes()'))[0] || null;
  console.log('   foe walked:', foe2 ? (fx0 - foe2.px).toFixed(2) + ' units' : 'gone');
  const sd3 = await E('t.stepDbg()');
  console.log('   after approach:', JSON.stringify(sd3));
  must('6b. near enemy approach fired footstep SFX (enemy >= 1)', sd3.enemy >= 1);
  await shot('5-enemy-approach.png');
}

// 7. FAR ENEMY: silent approach — enemy walks 4 game-seconds at 42 units distance,
// must stay silent (distance cull > 10 units). Driven deterministically via t.estep().
await E('t.clearFoes()'); await sleep(200);
await E('t.tp2(5, 0)');
await E(`t.spawnFam('thug')`); await sleep(400); // foe spawns at player.px + 3 = 8
await E('t.tp2(50, 0)'); // player retreats: 42 units away
await E('t.stepClear()');
await E(`t.estepN(240, 1/60)`); // 4 game-seconds of enemy walking
const sd4 = await E('t.stepDbg()');
console.log('   after far walk:', JSON.stringify(sd4));
must('7. far enemy approach is silent (enemy === 0 at >10 units)', sd4.enemy === 0);
await shot('6-far-enemy.png');

// 8. zero errors
console.log('   errors:', errors.length ? errors.slice(0, 8) : 'none');
must('8. zero page/console errors', errors.length === 0);

console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

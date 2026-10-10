// PRESENTATION lane verification: arcade score, combo heat, slow-mo final blow, boss intro camera.
// Verifies: score accrues per hit, combo multiplier applies, KO grants bonus,
// final-blow slow-mo is deeper, boss spawn pushes camera in. Zero errors.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon-presentation/game-3d/shots-presentation';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 480, height: 270 });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
async function dismissShrine() {
  const n = await page.evaluate(() => {
    const c = document.querySelector('.blessCard');
    if (c && c.offsetParent) { c.click(); return 1; }
    return 0;
  });
  if (n) await sleep(200);
  return n;
}
import fs from 'node:fs';
fs.mkdirSync(SHOTS, { recursive: true });

await page.goto('file:///home/hatch/workspace/ConcreteDragon-presentation/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot', booted);
await page.tap('#tapStart'); await sleep(500);
await E('t.skipCine()'); await sleep(300);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(300);
await E('t.skipCine()'); await E('t.ff(60)');
await dismissShrine();

// 2. score accrues per hit (deterministic heavy = 25 pts base)
await E('t.clearFoes()'); await E('t.spawnFam("thug")'); await E('t.ff(30)');
const s0 = (await E('t.scoreDbg()')).score;
await E('t.forceBigHit()'); await E('t.ff(30)');
const s1 = (await E('t.scoreDbg()')).score;
must('2. score accrues on hit (' + s0 + ' -> ' + s1 + ')', s1 > s0);

// 3. score HUD visible
const scoreTxt = await page.evaluate(() => document.getElementById('score')?.textContent || '');
must('3. score HUD shows (' + scoreTxt.trim() + ')', /SCORE/.test(scoreTxt));

// 4. combo multiplier: 10 hits -> 1.5x (build combo with repeated heavies)
await E('t.clearFoes()'); await E('t.spawnFam("thug")'); await E('t.ff(20)');
const sb = (await E('t.scoreDbg()')).score;
for (let i = 0; i < 10; i++) { await E('t.forceBigHit()'); await E('t.ff(12)'); }
const sa = (await E('t.scoreDbg()'));
const gained = sa.score - sb;
must('4. combo multiplier applies (gained=' + gained + ', combo=' + sa.combo + ')', gained > 280 && sa.combo >= 10);

// 5. KO grants bonus + slow-mo fires
await E('t.clearFoes()'); await E('t.spawnFam("thug")'); await E('t.ff(20)');
const sk0 = (await E('t.scoreDbg()')).score;
await E('t.forceKOHit()'); await E('t.ff(20)');
const sk1 = (await E('t.scoreDbg()')).score;
must('5. KO grants score bonus (' + sk0 + ' -> ' + sk1 + ')', sk1 - sk0 >= 100);
const sm = await E('t.slowmoDbg()');
must('6. slow-mo fires on KO (slowmo=' + sm.slowmo + ')', sm.slowmo < 1);
await page.screenshot({ path: SHOTS + '/ko-slowmo.png' });

// 7. final blow: single foe -> deeper slow-mo (0.15, >=1.3s)
await E('t.clearFoes()'); await E('t.spawnFam("thug")'); await E('t.ff(20)');
await E('t.forceKOHit()'); await E('t.ff(10)');
const sm2 = await E('t.slowmoDbg()');
must('7. final-blow slow-mo deeper (slowmo=' + sm2.slowmo + ', t=' + (+sm2.slowmoT).toFixed(2) + ')', sm2.slowmo <= 0.2 && sm2.slowmoT >= 1.3);

// 8. boss intro: camera pushes in (pushT > 0)
await E('t.clearFoes()'); await E('t.ff(20)');
await E(`t.spawnBoss('kingpin')`); await E('t.ff(10)');
const sm3 = await E('t.slowmoDbg()');
must('8. boss intro camera push (pushT=' + (+sm3.pushT).toFixed(2) + ')', sm3.pushT > 0);
await sleep(400);
await page.screenshot({ path: SHOTS + '/boss-intro.png' });

// 9. defect checklist on live frame
const fr = await E('t.foes()');
const pp = await E('t.playerDbg()');
let minD = 99;
for (const f of fr) { const d = Math.hypot(pp.px - f.px, (pp.pz || 0) - f.pz); if (d < minD) minD = d; }
must('9. fighters separated (minDist=' + minD.toFixed(2) + ')', minD >= 0.5 || fr.length === 0);
await page.screenshot({ path: SHOTS + '/final-frame.png' });

must('10. zero page/console errors', errors.length === 0);
if (errors.length) console.log('   errors:', errors.slice(0, 5));
console.log(allOk ? 'ALL PASS' : 'SOME FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

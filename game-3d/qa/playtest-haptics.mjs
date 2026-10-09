// IMPROVE-LOOP CYCLE 1: F10 haptics verification.
// Verifies: buzz() counter fires on heavy-hit, counter, KO, player-hurt; the
// navigator.vibrate call path (stubbed) respects the settings toggle; the
// settings button flips ON/OFF. Zero page/console errors required.
import puppeteer from 'puppeteer-core';
const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const SHOTS = '/home/hatch/workspace/ConcreteDragon/game-3d/shots-improveloop-c1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const vibCalls = [];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 480, height: 270 });
// stub navigator.vibrate to record calls (headless has no real vibrator)
await page.evaluateOnNewDocument(() => {
  window.__vibCalls = [];
  Object.defineProperty(navigator, 'vibrate', { value: (p) => { window.__vibCalls.push(p); return true; }, configurable: true });
});
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console.error] ' + m.text().slice(0, 200)); });
const E = async (expr) => page.evaluate(new Function('const t = window.__cdtest; return (' + expr + ')'));
const check = (label, ok) => console.log((ok ? 'PASS' : 'FAIL') + ' | ' + label);
let allOk = true;
const must = (label, ok) => { check(label, ok); if (!ok) allOk = false; };
async function attack(fn) {
  await E(`t.${fn}()`); await sleep(450); await E('t.ff(90)'); await sleep(150);
  await dismissShrine();
}
// SHRINE node (Hades-style mid-mission blessing) pauses the sim until the player
// picks a card — do the player-honest thing and click the first card.
async function dismissShrine() {
  const n = await page.evaluate(() => {
    const c = document.querySelector('.blessCard');
    if (c && c.offsetParent) { c.click(); return 1; }
    return 0;
  });
  if (n) { console.log('   (shrine blessing dismissed)'); await sleep(200); }
  return n;
}
await page.goto('file:///home/hatch/workspace/ConcreteDragon/game-3d/dist/concrete-dragon.html', { waitUntil: 'networkidle0', timeout: 120000 });
let booted = false;
for (let i = 0; i < 10; i++) { if ((await E('t.simDbg().st')) === 'title') { booted = true; break; } await sleep(2000); }
must('1. boot', booted);
await page.tap('#tapStart'); await sleep(500);
await E('t.skipCine()'); await sleep(300);
await E(`t.setFighter('kidblue')`);
await E(`t.startMission('m1')`); await sleep(300);
await E('t.skipCine()'); await E('t.ff(60)');
await dismissShrine();
await E('t.buzzClear()');
must('2. buzz counter starts at 0', (await E('t.buzzDbg()')).buzzN === 0);

// 3. heavy hit on a foe fires buzz
await E('t.clearFoes()'); await E('t.spawnFam("thug")'); await E('t.ff(30)');
let foe = (await E('t.foes()'))[0];
await E(`t.tp2(${foe.px - 1.0}, ${foe.pz})`); await E('t.ff(20)');
const b0 = (await E('t.buzzDbg()')).buzzN;
await attack('doHeavy');
const b1 = (await E('t.buzzDbg()')).buzzN;
foe = (await E('t.foes()'))[0];
console.log('   heavy: foe hp', foe && foe.hp, 'buzz', b0, '->', b1);
must('3. heavy hit fires buzz', b1 > b0);
must('3b. vibrate stub called (haptics ON)', (await page.evaluate(() => window.__vibCalls.length)) > 0);

// 4. counter fires buzz (hermetic: fresh foe, like the tranche scripts)
await E('t.clearFoes()'); await E('t.healPlayer()'); await E('t.buzzClear()');
await E('t.spawnFam("thug")'); await E('t.ff(30)');
const staged4 = await E('t.forceCounterWindup()');
must('4a. foe staged for counter', staged4 === true);
await sleep(200);
const b2 = (await E('t.buzzDbg()')).buzzN;
await attack('doPunch');
const b3 = (await E('t.buzzDbg()')).buzzN;
console.log('   counter: buzz', b2, '->', b3, 'counters:', JSON.stringify(await E('t.counterDbg()')));
must('4b. counter fires buzz', b3 > b2);

// 5. KO fires buzz: fresh foe, beat it down (one evaluate per round = fewer round-trips)
await E('t.clearFoes()'); await E('t.buzzClear()'); await E('t.healPlayer()');
await E('t.spawnFam("thug")'); await E('t.ff(30)');
let kills0 = (await E('t.info()')).kills, lastBuzz = 0, lastKills = kills0;
for (let i = 0; i < 8; i++) {
  const useHeavy = i % 2 === 1;
  const r = await E(`(async () => {
    const t = window.__cdtest;
    const foe = t.foes().find(f => f.hp > 0);
    if (!foe) return { dead: true, kills: t.info().kills, buzz: t.buzzDbg().buzzN };
    t.tp2(foe.px - 1.0, foe.pz); t.ff(15);
    ${useHeavy ? 't.doHeavy();' : 't.doPunch();'}
    await new Promise(r => setTimeout(r, 450));
    t.ff(90); t.healPlayer();
    const f2 = t.foes().find(f => f.hp > 0);
    return { hp: f2 && f2.hp, kills: t.info().kills, buzz: t.buzzDbg().buzzN };
  })()`);
  console.log('   ko round', i, JSON.stringify(r));
  if (r.dead) break;
  lastBuzz = r.buzz; lastKills = r.kills;
}
const kills1 = lastKills;
// kills++ lands 1200ms (wall) after the KO via setTimeout — give it time
await sleep(1600);
const killsFinal = (await E('t.info()')).kills;
console.log('   ko: kills', kills0, '->', killsFinal, 'buzzN', lastBuzz);
must('5. KO happened and buzz fired', killsFinal > kills0 && lastBuzz > 0);
await page.screenshot({ path: SHOTS + '/haptics-ko.png' });

// 6. player hurt fires buzz
await E('t.buzzClear()');
const b5 = (await E('t.buzzDbg()')).buzzN;
await E('t.hurt(10)'); await E('t.ff(30)');
const b6 = (await E('t.buzzDbg()')).buzzN;
must('6. player hurt fires buzz', b6 > b5);

// 7. settings toggle OFF suppresses vibrate calls (counter still counts)
await page.evaluate(() => document.querySelector('#hapticsBtn').click());
await sleep(300);
const btnText = await page.evaluate(() => document.querySelector('#hapticsBtn').textContent);
must('7a. settings button flips to OFF', btnText === 'OFF');
await page.evaluate(() => { window.__vibCalls.length = 0; });
await E('t.hurt(10)'); await E('t.ff(30)');
const vibAfterOff = await page.evaluate(() => window.__vibCalls.length);
must('7b. vibrate NOT called when haptics OFF', vibAfterOff === 0);
// flip back on
await page.evaluate(() => document.querySelector('#hapticsBtn').click());
await sleep(300);
must('7c. settings button flips back to ON', (await page.evaluate(() => document.querySelector('#hapticsBtn').textContent)) === 'ON');

must('8. zero page/console errors', errors.length === 0);
if (errors.length) console.log(errors.slice(0, 8));
console.log(allOk ? 'ALL PASS' : 'SOME FAILED');
await browser.close();
process.exit(allOk ? 0 : 1);

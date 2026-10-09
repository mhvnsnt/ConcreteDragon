// QA: throws-air lane — deterministic logic test via __cdtest.step(), no render loop dependency.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/home/hatch/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 450 });
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
await page.goto('file:///home/hatch/workspace/ConcreteDragon-throws-air/game-3d/dist/concrete-dragon.html', { waitUntil: 'load', timeout: 60000 });
for (let i = 0; i < 30; i++) {
  const s = await page.evaluate(`window.__cdtest ? window.__cdtest.state() : 'none'`).catch(() => 'none');
  if (s === 'title') break;
  await new Promise((r) => setTimeout(r, 1000));
}
await page.evaluate(`window.__cdtest.startMission('circuit')`);
await new Promise((r) => setTimeout(r, 4000));

const t = async (fn) => await page.evaluate(fn).catch((e) => ({ ok: 0, why: 'eval-' + e.message.slice(0, 50) }));

console.log('spawn:', JSON.stringify(await t(`window.__cdtest.spawnFoeTest()`)));
console.log('grab:', JSON.stringify(await t(`window.__cdtest.grabTest()`)));
console.log('throw:', JSON.stringify(await t(`window.__cdtest.throwTest()`)));

// drive the sequence deterministically: 120 steps of 1/60 = 2s
const traj = [];
for (let i = 0; i < 120; i++) {
  await t(`window.__cdtest.step(1/60)`);
  if (i % 6 === 0) {
    const s = await t(`window.__cdtest.throwSeqTest()`);
    traj.push(s.ok ? `${s.phase}@${s.t.toFixed(2)}:y=${s.vy}` : 'done');
  }
}
console.log('trajectory:', traj.join(' | '));

// after sequence, victim should be airborne projectile
const after = await t(`(() => { const c = window.__cdtest; const e = c.info(); return e; })()`);
console.log('info after:', JSON.stringify(after));
console.log('ERRORS:', errs.length ? errs.slice(0, 5).join(' | ') : 'none');
await browser.close();

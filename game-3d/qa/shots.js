// Shot definitions for Concrete Dragon video production.
// Each shot: setup(E, page, sleep) then frames count + optional onFrame(E, f).
// All footage is REAL game captures from the current main build.
const FIGHTERS = ['kidblue', 'ghost', 'brick', 'kingpin', 'sledge', 'viper', 'dust', 'jack'];
const FIGHTER_NAMES = { kidblue: 'KID BLUE', ghost: 'GHOST', brick: 'BRICK', kingpin: 'KINGPIN', sledge: 'SLEDGE', viper: 'VIPER', dust: 'DUST', jack: 'JACK' };

// shared: get into a mission with a fighter, skip cinematics, hold the rAF loop
async function toMission(E, page, sleep, fighter) {
  await page.tap('#tapStart'); await sleep(1200);
  try { await E('t.skipCine()'); } catch(e){}
  await sleep(600);
  await E(`t.setFighter('${fighter}')`); await sleep(300);
  await page.tap('#fightBtn'); await sleep(1000);
  await E(`t.startMission('m1')`); await sleep(600);
  try { await E('t.skipCine()'); } catch(e){}
  await sleep(800);
  await E('t.capHold(true)');
}
// spawn a passive thug near the player for action
async function spawnThug(E, px = 8, hp = 900) {
  await E(`(() => { const e = t.spawnFam('thug'); e.hp = ${hp}; e.ai='idle'; e.aiT=999; e.px=${px}; return 1; })()`);
}
// camera helpers (fight state)
async function camSide(E) { await E('t.clearCam()'); } // default follow cam
async function camLow(E) {
  const p = await E('t.playerPos()');
  await E(`t.setCam(${p.px + 1.5}, 1.1, 5.2, ${p.px + 0.5}, 1.6, 0)`);
}
async function camClose(E) {
  const p = await E('t.playerPos()');
  await E(`t.setCam(${p.px + 2.2}, 2.0, 4.2, ${p.px}, 1.3, 0)`);
}
async function camWide(E) {
  const p = await E('t.playerPos()');
  await E(`t.setCam(${p.px}, 4.6, 12.5, ${p.px}, 1.0, 0)`);
}

export const SHOTS = {
  // ---- title card (trailer open/close) ----
  title: {
    frames: 150,
    setup: async (E, page, sleep) => { await E('t.capHold(true)'); },
    onFrame: async (E, f) => {
      // slow drift: subtle zoom feel via tiny cam moves on title state
      if (f % 30 === 0) await E(`t.setCam(0, ${1.0 + f/150*0.25}, ${5.2 - f/150*0.4}, 0, 0.1, 0)`);
    },
  },

  // ---- character showcase: one shot per fighter ----
  ...Object.fromEntries(FIGHTERS.map((f) => [`char-${f}`, {
    frames: 90,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, f);
      await E('t.clearFoes()');
      await spawnThug(E, 9, 5000);
      await E('t.walkTo(7.2)');
      await camClose(E);
    },
    onFrame: async (E, f2) => {
      // fighter does their thing mid-shot: punch combo at 1s, special at 2s
      if (f2 === 30) await E('t.dbgStrike("jab")').catch(()=>{});
      if (f2 === 60) await E('t.doKiBlast()').catch(()=>{});
    },
  }])),

  // ---- gameplay: 3 angles ----
  'combat-side': {
    frames: 360,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await spawnThug(E, 8, 900); await spawnThug(E, 11, 900);
      await E('t.walkTo(7.0)'); await camSide(E);
    },
    onFrame: async (E, f) => {
      if (f === 40) await E('t.dbgStrike("jab")').catch(()=>{});
      if (f === 90) await E('t.dbgStrike("jab")').catch(()=>{});
      if (f === 150) await E('t.doKiBlast()').catch(()=>{});
      if (f === 220) await E('t.dbgStrike("heavy")').catch(()=>{});
      if (f === 290) await E('t.doSpinAttack()').catch(()=>{});
    },
  },
  'combat-low': {
    frames: 300,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await spawnThug(E, 8, 1200); await spawnThug(E, 11, 1200);
      await E('t.walkTo(7.0)'); await camLow(E);
    },
    onFrame: async (E, f) => {
      if (f === 30) await E('t.doSpinAttack()').catch(()=>{});
      if (f === 110) await E('t.doWaveStart()').catch(()=>{});
      if (f === 170) await E('t.doWaveRelease()').catch(()=>{});
      if (f === 230) await E('t.dbgStrike("jab")').catch(()=>{});
      if (f % 60 === 0) await camLow(E); // re-anchor as player moves
    },
  },
  'combat-wide': {
    frames: 300,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'brick');
      await spawnThug(E, 7, 1500); await spawnThug(E, 10, 1500); await spawnThug(E, 13, 1500);
      await E('t.walkTo(6.0)'); await camWide(E);
    },
    onFrame: async (E, f) => {
      if (f === 40) await E('t.doSpinAttack()').catch(()=>{});
      if (f === 130) await E('t.dbgStrike("heavy")').catch(()=>{});
      if (f === 210) await E('t.doKiBlast()').catch(()=>{});
      if (f % 60 === 0) await camWide(E);
    },
  },

  // ---- boss showcase ----
  'boss-kingpin': {
    frames: 270,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await E('t.clearFoes()');
      await E(`t.spawnBoss('kingpin')`);
      await E('t.walkTo(6.0)');
      // let the intro card play in real time first (cine path), then hold
      await E('t.capHold(false)'); await sleep(3500); await E('t.capHold(true)');
      await camClose(E);
    },
    onFrame: async (E, f) => {
      if (f === 60) await E('t.dbgStrike("jab")').catch(()=>{});
      if (f === 150) await E('t.doKiBlast()').catch(()=>{});
    },
  },
  'boss-dragon': {
    frames: 270,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await E('t.clearFoes()');
      await E(`t.spawnBoss('dragon')`);
      await E('t.walkTo(6.0)');
      await E('t.capHold(false)'); await sleep(3500); await E('t.capHold(true)');
      await camWide(E);
    },
    onFrame: async (E, f) => {
      if (f === 60) await E('t.doSpinAttack()').catch(()=>{});
      if (f % 60 === 0) await camWide(E);
    },
  },
  'boss-foreman': {
    frames: 270,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'ghost');
      await E('t.clearFoes()');
      await E(`t.spawnBoss('foreman')`);
      await E('t.walkTo(6.0)');
      await E('t.capHold(false)'); await sleep(3500); await E('t.capHold(true)');
      await camSide(E);
    },
    onFrame: async (E, f) => {
      if (f === 80) await E('t.doWaveStart()').catch(()=>{});
      if (f === 140) await E('t.doWaveRelease()').catch(()=>{});
    },
  },

  // ---- moves showcase ----
  'moves-ki': {
    frames: 150,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await spawnThug(E, 9, 5000); await E('t.walkTo(7.0)'); await camClose(E);
    },
    onFrame: async (E, f) => {
      if (f === 30) await E('t.doKiBlast()').catch(()=>{});
      if (f === 90) await E('t.doKiBlast()').catch(()=>{});
    },
  },
  'moves-wave': {
    frames: 210,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'viper');
      await spawnThug(E, 10, 5000); await E('t.walkTo(7.0)'); await camSide(E);
    },
    onFrame: async (E, f) => {
      if (f === 20) await E('t.doWaveStart()').catch(()=>{});
      if (f === 110) await E('t.doWaveRelease()').catch(()=>{});
    },
  },
  'moves-spin': {
    frames: 150,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'sledge');
      await spawnThug(E, 7, 2000); await spawnThug(E, 10, 2000);
      await E('t.walkTo(6.5)'); await camLow(E);
    },
    onFrame: async (E, f) => {
      if (f === 30) await E('t.doSpinAttack()').catch(()=>{});
      if (f === 100) await E('t.doSpinAttack()').catch(()=>{});
    },
  },
  'moves-throw': {
    frames: 270,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'brick');
      await E('t.clearFoes()');
      await E(`(() => { const e = t.spawnFam('thug'); e.hp = 5000; e.ai='idle'; e.aiT=999; e.px=7.5; return 1; })()`);
      await E('t.walkTo(6.9)'); await camClose(E);
    },
    onFrame: async (E, f) => {
      // walk-in grab then throw sequence
      if (f === 40) await E('t.throwTest()').catch(()=>{});
    },
  },
  'moves-weapon': {
    frames: 210,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'jack');
      await E('t.clearFoes()');
      await E(`t.dbgSpawnPickup('wpn_pipe')`);
      await E('t.walkTo(7.5)'); await camClose(E);
    },
    onFrame: async (E, f) => {
      if (f === 60) await E('t.dbgStrike("jab")').catch(()=>{});
      if (f === 130) await E('t.dbgStrike("heavy")').catch(()=>{});
    },
  },
  'moves-block': {
    frames: 180,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await E('t.clearFoes()');
      await E(`(() => { const e = t.spawnFam('thug'); e.hp = 5000; e.px=8.5; return 1; })()`);
      await E('t.walkTo(7.0)'); await camSide(E);
    },
    onFrame: async (E, f) => {
      if (f === 30) await E('t.dbgBlock(true)').catch(()=>{});
      if (f === 120) await E('t.dbgBlock(false)').catch(()=>{});
      if (f === 130) await E('t.dbgStrike("jab")').catch(()=>{});
    },
  },
  'ko-slowmo': {
    frames: 210,
    setup: async (E, page, sleep) => {
      await toMission(E, page, sleep, 'kidblue');
      await E('t.clearFoes()');
      await E(`(() => { const e = t.spawnFam('thug'); e.hp = 30; e.ai='idle'; e.aiT=999; e.px=8; return 1; })()`);
      await E('t.walkTo(7.0)'); await camClose(E);
    },
    onFrame: async (E, f) => {
      if (f === 40) await E('t.dbgStrike("heavy")').catch(()=>{});
    },
  },
};
export const FIGHTER_NAMES_EXPORT = FIGHTER_NAMES;

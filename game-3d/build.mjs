// node build.mjs  -> dist/street-brawl-demo.html (MRAID, for ad networks) + dist/street-brawl-demo.preview.html (no mraid.js tag, for phone/browser)
import * as esbuild from 'esbuild';
import fs from 'node:fs';
const man = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));
const assets = {}; for (const m of man) { const mo = 'build/assets-mo/' + m.file; const f = fs.existsSync(mo) ? mo : 'build/assets/' + m.file; assets[m.file] = fs.readFileSync(f).toString('base64'); m.shippedBytes = fs.statSync(f).size; }
fs.writeFileSync('build/asset-manifest.shipped.json', JSON.stringify(man, null, 2));
const r = await esbuild.build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: ['es2019', 'safari13'], write: false, legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const credits = '<!-- Built by Orion Enterprises LLC playable-kit. Assets (all CC0 1.0, public domain): ' + [...new Set(man.map(m => m.source.split('/').slice(0, 3).join('/')))].join('; ') + ' -->';
const tpl = fs.readFileSync('src/template.html', 'utf8');
const html = tpl.replace('<!--CREDITS-->', () => credits).replace('/*ASSETS*/', () => JSON.stringify(assets)).replace('/*BUNDLE*/', () => js);
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/concrete-dragon.html', html);
const kb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log('js bundle', kb(js.length), '| html', kb(Buffer.byteLength(html)));
// M9 PWA: stamp SW cache version + ship manifest/sw/icons next to the built HTML
// so the deploy step can publish them at the site root (required for SW scope).
let pwaVer = 'dev';
try { pwaVer = fs.readFileSync('../game/version.txt', 'utf8').trim(); } catch (e) {}
try {
  const { execSync } = await import('node:child_process');
  pwaVer += '-' + execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (e) { pwaVer += '-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''); }
const copyDir = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    const s = src + '/' + f.name, d = dst + '/' + f.name;
    if (f.isDirectory()) copyDir(s, d);
    else fs.writeFileSync(d, fs.readFileSync(s));
  }
};
copyDir('pwa', 'dist/pwa');
const swPath = 'dist/pwa/sw.js';
fs.writeFileSync(swPath, fs.readFileSync(swPath, 'utf8').replace(/__CD_PWA_VERSION__/g, () => pwaVer));
console.log('pwa shipped, sw cache version', pwaVer);

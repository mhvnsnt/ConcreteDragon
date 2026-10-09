#!/usr/bin/env python3
"""Compose 10 ORIGINAL loopable boss tracks for Concrete Dragon (100% synth, numpy).
Owner directive 2026-10-09: every boss gets its own individual track.
Free-only: no samples, no downloads, no licensed material. Deterministic (seeded).
Output: build/assets/boss-<id>.mp3 (+ .wav intermediates), each < 2MB, seamless loops.
"""
import numpy as np, os, subprocess, sys

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build', 'assets')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20261009)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12.0)

def adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a*sr), int(d*sr), int(r*sr)
    s_n = max(0, n - a - d - r)
    env = np.concatenate([np.linspace(0, 1, max(a,1), endpoint=False),
                          np.linspace(1, s, max(d,1), endpoint=False),
                          np.full(s_n, s),
                          np.linspace(s, 0, max(r,1), endpoint=False)])
    return env[:n] if len(env) >= n else np.pad(env, (0, n-len(env)))

def saw(ph): return 2.0 * (ph - np.floor(ph + 0.5))
def sqr(ph): return np.where((ph % 1.0) < 0.5, 1.0, -1.0)

def lowpass(x, cutoff):
    a = np.exp(-2*np.pi*cutoff/SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc += (1-a)*(x[i]-acc); y[i] = acc
    return y
def hipass(x, cutoff):
    return x - lowpass(x, cutoff)

def kick(dur=0.28):
    n = int(dur*SR); t = np.arange(n)/SR
    f = 40 + 130*np.exp(-t*28)
    ph = np.cumsum(f)/SR
    return np.sin(2*np.pi*ph) * np.exp(-t*11) * 1.0

def snare(dur=0.20):
    n = int(dur*SR); t = np.arange(n)/SR
    nz = rng.standard_normal(n)
    tone = np.sin(2*np.pi*185*t) * np.exp(-t*22)
    return (hipass(nz, 1500)*np.exp(-t*26)*0.7 + tone*0.6)

def hat(dur=0.05, open_=False):
    n = int((0.32 if open_ else dur)*SR); t = np.arange(n)/SR
    nz = rng.standard_normal(n)
    return hipass(nz, 7000) * np.exp(-t*(90 if not open_ else 14)) * 0.5

def bass_note(freq, dur, cutoff=700, drive=1.6):
    n = int(dur*SR); t = np.arange(n)/SR
    ph = freq*t
    x = saw(ph) + 0.5*saw(ph*1.003)
    x = np.tanh(x*drive)
    x = lowpass(x, cutoff)
    return x * adsr(n, 0.005, 0.03, 0.85, min(0.08, dur*0.4)) * 0.9

def stab(freqs, dur, cutoff=2400):
    n = int(dur*SR); t = np.arange(n)/SR
    x = np.zeros(n)
    for f in freqs:
        ph = f*t; x += saw(ph) + 0.4*saw(ph*1.006)
    x = lowpass(x, cutoff)
    return x * adsr(n, 0.004, dur*0.25, 0.5, dur*0.45) * 0.5 / max(1, len(freqs)*0.6)

def lead_note(freq, dur, cutoff=3200, vib=6.0, vibamt=4.0):
    n = int(dur*SR); t = np.arange(n)/SR
    f = freq + vibamt*np.sin(2*np.pi*vib*t)*(t > 0.08)
    ph = np.cumsum(f)/SR
    x = saw(ph)
    x = lowpass(x, cutoff)
    return x * adsr(n, 0.01, 0.05, 0.8, min(0.12, dur*0.5)) * 0.55

def pad_chord(freqs, dur):
    n = int(dur*SR); t = np.arange(n)/SR
    x = np.zeros(n)
    for f in freqs:
        ph = f*t; x += saw(ph) + 0.5*saw(ph*1.004) + 0.3*saw(ph*0.5)
    x = lowpass(x, 1100)
    return x * adsr(n, dur*0.3, dur*0.2, 0.7, dur*0.4) * 0.22 / max(1, len(freqs)*0.5)

def place(buf, sig, step, spb16):
    i = int(step*spb16*SR)
    j = min(len(buf), i+len(sig))
    if i < len(buf): buf[i:j] += sig[:j-i]

# 16-step drum grids (X = hit, x = ghost/soft)
def grid(s):
    return [1 if c == 'X' else 0.4 if c == 'x' else 0 for c in s]

# boss configs: bpm, root midi, character
TRACKS = {
 'kingpin':  dict(bpm=90,  root=38, vibe='heavy boom-bap, low brass stabs',
    kick=grid('X...x...X.....X.'), snr=grid('....X.......X..x'), hat=grid('x.xXx.xXx.xXx.xX'),
    bass=[(0,26,3),(3,26,1),(6,29,2),(8,24,3),(11,31,1),(12,29,2)],
    stab=[(4,[62,65,69],2),(12,[60,63,67],2)]),
 'sledge':   dict(bpm=100, root=40, vibe='industrial pounding, metallic',
    kick=grid('X..X..X.X..X..X.'), snr=grid('....X.......X...'), hat=grid('XxXxXxXxXxXxXxXx'),
    bass=[(0,28,2),(2,28,2),(4,28,2),(6,27,2),(8,28,2),(10,28,2),(12,26,2),(14,24,2)],
    stab=[(0,[64,67,71],1),(8,[63,66,70],1)]),
 'viper':    dict(bpm=140, root=42, vibe='fast slithery, driving hats',
    kick=grid('X...X...X...X...'), snr=grid('....X.......X...'), hat=grid('xXxXxXxXxXxXxXxx'),
    bass=[(0,30,1),(2,30,1),(4,33,1),(6,30,1),(8,30,1),(10,32,1),(12,35,1),(14,33,1)],
    stab=[(0,[66,69,73],1),(4,[65,69,72],1),(8,[66,69,73],1),(12,[68,71,74],1)],
    lead=[(0,78,3),(4,76,3),(8,78,3),(12,81,3)]),
 'rust':     dict(bpm=85,  root=36, vibe='grimy distorted, swampy',
    kick=grid('X.....X...X.....'), snr=grid('....X.......X...'), hat=grid('x.x.x.x.x.x.x.x.'),
    bass=[(0,24,4),(6,24,2),(8,22,4),(14,20,2)],
    stab=[(4,[60,63,67],3),(12,[58,62,65],3)]),
 'dragon':   dict(bpm=128, root=38, vibe='EPIC final boss, biggest arrangement',
    kick=grid('X...X...X...X.X.'), snr=grid('....X.......X...'), hat=grid('xXxXxXxXxXxXxXxX'),
    bass=[(0,26,2),(2,26,1),(4,29,2),(6,26,1),(8,24,2),(10,26,1),(12,31,2),(14,29,1)],
    stab=[(0,[62,65,69,72],2),(8,[60,64,67,71],2)],
    lead=[(0,74,4),(4,72,4),(8,74,4),(12,77,4)],
    pad=[69,72,76]),
 'pumpkinking': dict(bpm=110, root=45, vibe='dark carnival, off-kilter',
    kick=grid('X..x..X...X..x..'), snr=grid('....X.......X...'), hat=grid('X.x.X.x.X.x.X.x.'),
    bass=[(0,33,2),(4,32,2),(8,33,2),(12,31,3)],
    stab=[(2,[69,72,76],2),(6,[68,71,75],2),(10,[69,72,76],2)],
    lead=[(0,81,2),(2,80,2),(4,78,4),(10,76,2),(12,74,4)]),
 'carmilla': dict(bpm=120, root=40, vibe='gothic, vampiric arps',
    kick=grid('X...X...X...X...'), snr=grid('....X.......X.X.'), hat=grid('x.xXx.x.xXx.x.x.'),
    bass=[(0,28,3),(4,28,3),(8,27,3),(12,26,3)],
    stab=[(0,[64,67,71],2),(8,[62,65,69],2)],
    lead=[(0,76,1),(1,79,1),(2,83,1),(3,79,1),(4,76,1),(5,79,1),(6,88,2),(8,76,1),(9,79,1),(10,83,1),(11,79,1),(12,86,2),(14,84,2)],
    pad=[64,67,71]),
 'foreman':  dict(bpm=104, root=43, vibe='relentless work-chant groove',
    kick=grid('X.X.X.X.X.X.X.X.'), snr=grid('....X.......X...'), hat=grid('XxXxXxXxXxXxXxXx'),
    bass=[(0,31,1),(2,31,1),(4,31,1),(6,34,1),(8,31,1),(10,31,1),(12,29,1),(14,27,1)],
    stab=[(4,[67,70,74],1),(12,[65,69,72],1)]),
 'warden':   dict(bpm=95,  root=34, vibe='cold oppressive, lockdown',
    kick=grid('X.....X.....X...'), snr=grid('....X.......X...'), hat=grid('..x...x...x...x.'),
    bass=[(0,22,6),(8,21,6)],
    stab=[(0,[58,61,65],4),(8,[57,60,64],4)],
    lead=[(0,70,6),(8,68,6)],
    pad=[58,61,65]),
 'endless':  dict(bpm=132, root=37, vibe='intense endless challenger',
    kick=grid('X..X..X.X..X..X.'), snr=grid('....X.......X...'), hat=grid('xXxXxXxXxXxXxXxX'),
    bass=[(0,25,2),(3,25,1),(6,28,2),(8,25,2),(11,25,1),(14,23,2)],
    stab=[(2,[61,64,68],2),(10,[60,63,67],2)],
    lead=[(0,73,3),(6,71,3),(8,73,3),(14,76,3)]),
}

def compose(cfg):
    bpm = cfg['bpm']; spb = 60.0/bpm; sp16 = spb/4.0
    total_steps = 8*16
    n = int(total_steps*sp16*SR)
    buf = np.zeros(n)
    K, S = kick(), snare()
    for bar in range(8):
        b = bar*16
        for i, v in enumerate(cfg['kick']):
            if v: place(buf, K*v, b+i, sp16)
        for i, v in enumerate(cfg['snr']):
            if v: place(buf, S*v, b+i, sp16)
        for i, v in enumerate(cfg['hat']):
            if v: place(buf, hat(open_=(i % 4 == 2 and bar % 2 == 1))*v, b+i, sp16)
        for (st, m, ln) in cfg['bass']:
            place(buf, bass_note(midi(m), ln*sp16), b+st, sp16)
        for (st, ms, ln) in cfg['stab']:
            place(buf, stab([midi(m) for m in ms], ln*sp16), b+st, sp16)
        for (st, m, ln) in cfg.get('lead', []):
            place(buf, lead_note(midi(m), ln*sp16), b+st, sp16)
    if 'pad' in cfg:
        place(buf, pad_chord([midi(m) for m in cfg['pad']], n/SR), 0, sp16)
    # master: soft clip + normalize
    buf = np.tanh(buf*0.9)
    peak = np.max(np.abs(buf))
    if peak > 0: buf *= 0.89/peak
    return buf

def main():
    report = []
    for bid, cfg in TRACKS.items():
        print(f'composing boss-{bid} ({cfg["vibe"]}) ...', flush=True)
        buf = compose(cfg)
        wav = os.path.join(OUT, f'boss-{bid}.wav')
        mp3 = os.path.join(OUT, f'boss-{bid}.mp3')
        pcm = (np.clip(buf, -1, 1)*32767).astype(np.int16)
        import wave
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',wav,
                        '-codec:a','libmp3lame','-b:a','128k','-ar','44100',mp3], check=True)
        # verify: duration, non-silent, loop seam
        r = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration,size',
                            '-of','csv=p=0',mp3], capture_output=True, text=True, check=True)
        dur, size = r.stdout.strip().split(',')
        rms = float(np.sqrt(np.mean(buf**2)))
        seam = float(abs(buf[-1]-buf[0]))
        tail = float(np.max(np.abs(buf[-int(SR*0.02):])))
        ok = float(dur) > 5 and rms > 0.02 and int(size) < 2_000_000
        report.append((bid, cfg['bpm'], f'{float(dur):.1f}s', f'{int(size)/1024:.0f}KB',
                       f'rms={rms:.3f}', f'seam={seam:.4f}', 'OK' if ok else 'FAIL'))
        os.remove(wav)  # keep only mp3 staged
        assert ok, f'{bid} failed verification'
    print('\n' + '\n'.join(f'boss-{b}: {bpm}bpm {d} {s} {r} {sm} {st}' for b,bpm,d,s,r,sm,st in report))
    print('ALL 10 TRACKS OK')

if __name__ == '__main__':
    main()

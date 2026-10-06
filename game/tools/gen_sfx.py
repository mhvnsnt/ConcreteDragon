#!/usr/bin/env python3
"""Procedural SFX generator for Street Brawl M1. 100% synthesized with numpy.
44100 Hz, 16-bit mono WAVs. No samples, no external audio."""
import os, wave
import numpy as np

SR = 44100
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "sfx")
os.makedirs(ROOT, exist_ok=True)
rng = np.random.default_rng(42)

def env(n, attack=0.005, decay_curve=3.0):
    """Quick attack, exponential decay envelope."""
    t = np.arange(n) / SR
    a = int(attack * SR)
    e = np.exp(-t * decay_curve)
    if a > 0:
        e[:a] = np.linspace(0, e[a - 1] if a < n else 1, a)
    return e

def save(name, x):
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1.0
    x = x / peak * 0.9
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(ROOT, name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {name} ({len(pcm)/SR:.3f}s)")

def lowpass(x, window=64):
    k = np.ones(window) / window
    return np.convolve(x, k, mode="same")

def highpass(x, window=64):
    return x - lowpass(x, window)

# ------------------------------------------------------------- hits
def punch_thump():
    n = int(0.15 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 85 * t) * env(n, decay_curve=28)
    snap = lowpass(rng.standard_normal(n), 24) * env(n, attack=0.001, decay_curve=60) * 0.8
    return body + snap

def punch2():  # variant: slightly higher, snappier
    n = int(0.15 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 110 * t) * env(n, decay_curve=32)
    snap = lowpass(rng.standard_normal(n), 18) * env(n, attack=0.001, decay_curve=70) * 0.9
    return body + snap

def kick_whoosh():
    n = int(0.25 * SR)
    noise = rng.standard_normal(n)
    sweep = lowpass(noise, 400) - lowpass(noise, 8)   # crude band sweep widening
    return sweep * env(n, attack=0.09, decay_curve=9) * 1.4

def whiff():
    n = int(0.15 * SR)
    air = highpass(rng.standard_normal(n), 48)
    return air * env(n, attack=0.05, decay_curve=16) * 0.9

def block_clack():  # woody clack: two resonant partials, fast decay
    n = int(0.12 * SR); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 420 * t) * 0.7 + np.sin(2 * np.pi * 840 * t) * 0.4
         + np.sin(2 * np.pi * 1260 * t) * 0.2)
    return x * env(n, attack=0.001, decay_curve=55)

def launcher_whoosh():  # rising sweep
    n = int(0.30 * SR); t = np.arange(n) / SR
    f = 200 + (800 - 200) * (t / 0.30)
    phase = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(phase) * 0.5
    noise = lowpass(rng.standard_normal(n), 60) * 0.7
    return (tone + noise) * env(n, attack=0.12, decay_curve=5)

def hurt():  # synth yelp: downward pitch blip
    n = int(0.20 * SR); t = np.arange(n) / SR
    f = 620 - (620 - 210) * (t / 0.20)
    phase = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(phase)) * 0.35 + np.sin(phase) * 0.65  # square-ish but soft
    return lowpass(x, 24) * env(n, attack=0.01, decay_curve=10)

def ko_bell():  # bell: inharmonic partials
    n = int(0.80 * SR); t = np.arange(n) / SR
    base = 740.0
    partials = [(1.0, 1.0, 6.0), (2.01, 0.55, 9.0), (2.74, 0.35, 12.0),
                (3.76, 0.22, 15.0), (5.40, 0.12, 18.0)]
    x = np.zeros(n)
    for ratio, amp, dec in partials:
        x += amp * np.sin(2 * np.pi * base * ratio * t) * np.exp(-t * dec)
    return x * env(n, attack=0.002, decay_curve=1.0)

def cheer():  # crowd-ish: filtered noise swell + random whistle blips
    n = int(2.0 * SR)
    bed = lowpass(rng.standard_normal(n), 120)
    swell = 0.35 + 0.65 * np.sin(np.pi * np.arange(n) / n) ** 1.5
    x = bed * swell
    for _ in range(14):  # whistle-ish blips
        f0 = rng.uniform(1200, 2600)
        st = rng.integers(0, n - int(0.15 * SR))
        ln = int(rng.uniform(0.06, 0.15) * SR)
        tt = np.arange(ln) / SR
        x[st:st + ln] += 0.12 * np.sin(2 * np.pi * f0 * tt) * np.sin(np.pi * tt / ln)
    return x * env(n, attack=0.4, decay_curve=0.4)

def ui_click():
    n = int(0.06 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1250 * t) * env(n, attack=0.002, decay_curve=80)

def win_jingle():  # happy 4-note arpeggio, square wave: C5 E5 G5 C6
    notes = [523.25, 659.25, 783.99, 1046.50]
    note_dur, total = 0.32, 2.5
    n = int(total * SR); x = np.zeros(n)
    for i, f in enumerate(notes):
        ln = int(note_dur * 1.6 * SR)
        st = int(i * note_dur * SR)
        tt = np.arange(ln) / SR
        tone = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5
        tone = lowpass(tone, 12)
        x[st:st + ln] += tone * np.exp(-tt * 4.5)
    # simple echo for sparkle
    echo = np.zeros(n); dly = int(0.16 * SR)
    echo[dly:] = x[:-dly] * 0.25
    return (x + echo) * env(n, attack=0.005, decay_curve=0.6)

def cash_blip():  # two coin pings
    n = int(0.15 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f, st in [(1567.98, 0.0), (2093.0, 0.07)]:
        s = int(st * SR); ln = n - s
        tt = np.arange(ln) / SR
        x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 30)
    return x

def counter_ding():  # bright alert
    n = int(0.30 * SR); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1568 * t) * 0.6 + np.sin(2 * np.pi * 3136 * t) * 0.3
         + np.sin(2 * np.pi * 2093 * t) * 0.25)
    return x * env(n, attack=0.003, decay_curve=12)

def countdown_beep():
    n = int(0.15 * SR); t = np.arange(n) / SR
    tone = np.sign(np.sin(2 * np.pi * 880 * t)) * 0.55
    return lowpass(tone, 14) * env(n, attack=0.004, decay_curve=14)

def go():  # ascending two-tone
    n = int(0.40 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    half = n // 2
    for f, (a, b) in [(659.25, (0, half)), (987.77, (half, n))]:
        tt = np.arange(a, b) / SR - a / SR
        tone = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5
        x[a:b] = lowpass(tone, 14)
    return x * env(n, attack=0.01, decay_curve=2.2)

for fn in [punch_thump, punch2, kick_whoosh, whiff, block_clack, launcher_whoosh,
           hurt, ko_bell, cheer, ui_click, win_jingle, cash_blip,
           counter_ding, countdown_beep, go]:
    save(fn.__name__ + ".wav", fn())

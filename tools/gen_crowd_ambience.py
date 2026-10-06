#!/usr/bin/env python3
"""Generate a seamless crowd-ambience loop (menu/locker-room bed) — original synthesis.

No samples, no third-party audio: layered FFT-filtered noise (periodic, so the
loop is seamless) with slow crowd-swell modulation. Zero license encumbrance.

Output: game/assets/sfx/crowd_ambience_loop.wav (30s, 44.1kHz, stereo, 16-bit).
"""
import numpy as np
import wave
import os

SR = 44100
DUR = 30.0
OUT = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "sfx", "crowd_ambience_loop.wav")

rng = np.random.default_rng(20261006)
n = int(SR * DUR)
t = np.arange(n) / SR

def fft_filter(x, fn):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X = X * fn(f)
    return np.fft.irfft(X, n)

def lowpass(fc, roll=1.0):
    return lambda f: 1.0 / (1.0 + (f / fc) ** (2 * roll))

def bandpass(lo, hi, roll=1.5):
    return lambda f: (1.0 / (1.0 + (lo / np.maximum(f, 1e-6)) ** (2 * roll))) * (1.0 / (1.0 + (f / hi) ** (2 * roll)))

def make_channel(seed):
    r = np.random.default_rng(seed)
    white = r.standard_normal(n)
    body = fft_filter(white, lowpass(320))            # murmur mass
    voices = fft_filter(white, bandpass(300, 2400))   # voice-band chatter
    air = fft_filter(white, bandpass(2800, 8000))     # room air / hiss
    x = body * 1.0 + voices * 0.35 + air * 0.06
    # Periodic swell envelope (integer cycles over DUR -> seamless)
    env = (0.62
           + 0.22 * np.sin(2 * np.pi * 2 * t / DUR)
           + 0.10 * np.sin(2 * np.pi * 5 * t / DUR + 0.9)
           + 0.06 * np.sin(2 * np.pi * 11 * t / DUR + 2.2))
    return x * env

left = make_channel(7)
right = np.roll(make_channel(21), int(0.012 * SR))  # 12ms decorrelation

stereo = np.stack([left, right], axis=1)
peak = np.max(np.abs(stereo))
stereo = stereo / peak * 0.45  # ~-7 dBFS headroom

os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
with wave.open(os.path.abspath(OUT), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())

print("wrote", os.path.abspath(OUT), f"{DUR}s stereo, peak 0.45")
